import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import {
  FavoriteProduct,
  Product,
  ProductDocument,
  ProductWithRelatedInfo,
} from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { StorageService } from 'src/modules/storage/storage.service';
import { EditProductDto } from '../dto/edit-product.dto';
import { ImportProductsService } from './import-products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Dimension } from 'src/common/entity/dimension.entity';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { ProductAttributesDto } from '../dto/attributes.dto';
import { convertToDimension } from 'src/common/utility';
import { FavoritesService } from 'src/modules/favorites/favorites.service';
import { ProductAdvantagesService } from 'src/modules/products/service/product-advantages.service';
import { MediaType } from 'src/modules/settings/media.entity';
import { ReviewsService } from 'src/modules/reviews/reviews.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
    private importProductsService: ImportProductsService,
    private settingsService: SettingsService,
    private favoritesService: FavoritesService,
    private productAdvantagesService: ProductAdvantagesService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    images: [any],
  ): Promise<ProductDocument> {
    this.logger.debug(
      `createProduct, dto: ${JSON.stringify(dto)} images size: ${
        images.length
      }`,
    );
    if (images) {
      await this.saveImagesAndUpdateDimensions(
        dto.dimensions,
        dto.numberOfImagesForDimensions,
        images,
        true,
      );
    }

    const dimensions = this.mapDimensionDtosToDimens(dto.dimensions);
    const parsedAttributes = this.createAttributes(dto.attributes);

    const product = new this.productModel({
      ...dto,
      dimensions,
      attributes: parsedAttributes,
    });
    this.logger.debug(`Start saving product...`);

    return await product.save();
  }
  createAttributes(attributes: ProductAttributesDto) {
    return {
      ...attributes,
      weightInGrams: parseInt(attributes.weightInGrams),
      heightInCm: parseInt(attributes.heightInCm),
      lengthInCm: parseInt(attributes.lengthInCm),
      widthInCm: parseInt(attributes.widthInCm),
      depthInCm: attributes.depthInCm
        ? parseInt(attributes.depthInCm)
        : undefined,
    };
  }

  mapDimensionDtosToDimens(dimensions: DimensionDto[]): Dimension[] {
    return dimensions.map((dimDto) => {
      const dimension: any = {
        quantity: dimDto.quantity,
        images: dimDto.images,
      };
      if (dimDto.color) {
        dimension.color = new mongoose.Types.ObjectId(dimDto.color._id);
      }
      if (dimDto.size) {
        dimension.size = new mongoose.Types.ObjectId(dimDto.size._id);
      }
      if (dimDto.material) {
        dimension.material = new mongoose.Types.ObjectId(dimDto.material._id);
      }
      return dimension;
    });
  }

  async saveImagesAndUpdateDimensions(
    dimensions: DimensionDto[],
    numberOfImagesForDimensions: number[],
    images: [any],
    isCreating: boolean,
  ) {
    this.logger.debug(
      `saveImagesAndUpdateDimensions, images size: ${images.length}`,
    );
    let initImageIndex = 0;
    for (let i = 0; i < dimensions.length; i++) {
      const dimen = dimensions[i];
      const numberOfImages = +numberOfImagesForDimensions[i];
      let imagesArr: string[] = [];

      if (!isCreating) {
        if (Array.isArray(dimen.images)) {
          imagesArr = dimen.images;
        } else if (dimen.images) {
          imagesArr = [dimen.images];
        }
      }
      const lastIndex = initImageIndex + numberOfImages;
      for (let j = initImageIndex; j < lastIndex; j++) {
        const image = images[j];
        const imageUrl = await this.storageService.uploadFile(
          image,
          MediaType.Image,
        );

        this.logger.debug(`Saved image url: ${imageUrl}`);
        imagesArr.push(imageUrl);
      }
      initImageIndex = lastIndex;
      dimen.images = imagesArr;
      this.logger.debug(`Saved image array for dimension: ${imagesArr}`);
    }
  }

  async editProduct(id: string, dto: EditProductDto, newImages: [any]) {
    const product = await this.getProductById(id);
    if (product) {
      if (newImages && newImages.length > 0) {
        await this.saveImagesAndUpdateDimensions(
          dto.dimensions,
          dto.numberOfImagesForDimensions,
          newImages,
          false,
        );
      }
      const dimensions = this.mapDimensionDtosToDimens(dto.dimensions);
      const parsedAttributes = this.createAttributes(dto.attributes);
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: {
            name: dto.name,
            idName: dto.idName,
            description: dto.description,
            costPriceInUsd: dto.costPriceInUsd,
            salePrice: dto.salePrice,
            dimensions: dimensions,
            attributes: parsedAttributes,
            category: dto.category,
          },
        },
        { new: true },
      );
      return updatedProduct.toObject();
    } else {
      throw new HttpException(
        'Unable to find such Product',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      // Find the product
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      // Delete product images from Google Cloud Storage
      for (const dimension of product.dimensions) {
        for (const imageUrl of dimension.images) {
          await this.storageService.deleteFile(imageUrl);
        }
      }

      // Delete the product from MongoDB
      await this.productModel.findByIdAndDelete(productId);
    } catch (error) {
      throw new HttpException(
        'Error while deleting the product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllProducts(): Promise<any[]> {
    const products = await this.productModel
      .find()
      .populate('dimensions.color', 'name hexCode')
      .populate('dimensions.size', 'name')
      .populate('dimensions.material', 'name')
      .lean()
      .exec();
    const mappedProducts = products.map((product) => {
      const productObj = product;
      const costPrice = this.calculateCostPrice(productObj);
      const marginValue = product.salePrice - costPrice;
      return {
        ...productObj,
        marginValue,
        costPrice,
        dimensions: productObj.dimensions,
      };
    });
    return mappedProducts;
  }

  async getProductById(
    id: string,
    populateDimensions: boolean = true,
  ): Promise<any> {
    const product = await this.findProductById(id, populateDimensions);

    if (product) {
      // Calculate costPrice and add it to the product object
      const costPrice = this.calculateCostPrice(product);
      const productObj = product;
      return {
        ...productObj,
        costPrice,
      };
    }

    return product;
  }

  async getProductDetailsWithAdvantages(
    id: string,
    populateDimensions: boolean = true,
  ): Promise<ProductWithRelatedInfo> {
    const product = await this.findProductById(id, populateDimensions);

    if (product) {
      let productAdvantages =
        await this.productAdvantagesService.getProductAdvantages(id);
      // Calculate costPrice and add it to the product object
      const costPrice = this.calculateCostPrice(product);
      const productObj = product;
      return {
        ...productObj,
        costPrice,
        productAdvantages,
      };
    }

    return { ...product, costPrice: 0, productAdvantages: [] };
  }

  private async findProductById(
    id: string,
    populateDimensions: boolean,
  ): Promise<Product> {
    let query = this.productModel.findById(id);

    if (populateDimensions) {
      query = query
        .populate('dimensions.color', 'name hexCode')
        .populate('dimensions.size', 'name')
        .populate('dimensions.material', 'name');
    }

    const product = await query.lean().exec();
    return product;
  }

  async getProductbyIdName(idName: string): Promise<ProductDocument> {
    return await this.productModel.findOne({ idName: idName }).exec();
  }

  async getProductDocumentById(id: string): Promise<ProductDocument> {
    return await this.productModel.findById(id);
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .populate('dimensions.color', 'name hexCode')
      .populate('dimensions.size', 'name')
      .populate('dimensions.material', 'name')
      .exec();
    if (!products || products.length === 0) {
      return [];
    }
    return products;
  }

  async importProducts(products: [any]) {
    const parsedProducts =
      await this.importProductsService.parseExelFile(products);

    const productDtos = parsedProducts.map((product) => {
      const dto = new CreateProductDto();
      dto.name = product.name;
      dto.idName = product.idName;
      dto.salePrice = product.price;
      const dimentsionDto = new DimensionDto();
      dimentsionDto.quantity = product.warehouseQuantity;
      dto.dimensions = [dimentsionDto];
      return dto;
    });
    const result = [];
    for (const dto of productDtos) {
      const product = await this.getProductbyIdName(dto.idName);
      if (product) {
        product.name = dto.name;
        product.salePrice = dto.salePrice;
        product.idName = dto.idName;
        const dimentsionDto = new DimensionDto();
        dimentsionDto.quantity = dto.dimensions[0].quantity;
        product.dimensions.push(convertToDimension(dimentsionDto));
        await product.save();
      } else {
        await this.createProduct(dto, null);
      }
      result.push(product);
    }
    return result;
  }

  async setProductForSale(
    productId: string,
    forSale: boolean,
  ): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotAvailableException(productId);
    }

    product.forSale = forSale;
    return product.save();
  }

  async updateProductDiscountPrice(productId: string, discount: number) {
    const product = await this.productModel.findById(productId).exec();
    if (product) {
      if (discount === 0) {
        // If the discount is 0, set the discountPrice to the 0 means no discount
        product.discountPrice = 0;
      } else {
        // Calculate the discountPrice based on salePrice and discount percentage
        product.discountPrice = (product.salePrice * (100 - discount)) / 100;
      }
      await product.save();
    }
  }

  async getSellingProducts(
    userId: string,
    isGuest: boolean,
    category?: string,
  ) {
    let query = this.productModel.find({ forSale: true });

    if (category) {
      query = query.where('category').equals(category);
    }

    const products = await query
      .populate('dimensions.color', 'name hexCode')
      .populate('dimensions.size', 'name')
      .populate('dimensions.material', 'name')
      .lean()
      .exec();

    return this.addIsFavoriteToProducts(userId, products, isGuest);
  }

  async getRecommendedProducts(userId: string, isGuest: boolean) {
    // TODO change implementation to return random product for now
    const products = await this.productModel
      .find({ forSale: true })
      .populate('dimensions.color', 'name hexCode')
      .populate('dimensions.size', 'name')
      .populate('dimensions.material', 'name')
      .lean()
      .exec();
    return this.addIsFavoriteToProducts(userId, products, isGuest);
  }

  async getResaleProducts(userId: string, isGuest: boolean) {
    // TODO change implementation to return products from Accessories category for now
    const products = await this.productModel
      .find({ forSale: true })
      .populate('dimensions.color', 'name hexCode')
      .populate('dimensions.size', 'name')
      .populate('dimensions.material', 'name')
      .lean()
      .exec();
    return this.addIsFavoriteToProducts(userId, products, isGuest);
  }

  calculateCostPrice(product: Product): number {
    const shippingPriceInUsd =
      (product.attributes.weightInGrams / 1000) *
      this.settingsService.getRateForShipping();
    const costPriceInUah =
      (shippingPriceInUsd + product.costPriceInUsd) *
      this.settingsService.getUsdToUahRate();

    if (!costPriceInUah) {
      return 0;
    }
    const roundedCostPrice = Math.round(costPriceInUah);

    return roundedCostPrice;
  }

  async addIsFavoriteToProducts(
    userId: string,
    products: Product[],
    isGuest: boolean,
  ): Promise<FavoriteProduct[]> {
    const favoriteProducts = isGuest
      ? []
      : await this.favoritesService.getFavoriteProducts(userId, null);
    return products.map((product) => {
      const isFavorite = favoriteProducts.some(
        (favProduct) => favProduct._id.toString() === product._id.toString(),
      );
      return { ...product, isFavorite };
    });
  }
}
