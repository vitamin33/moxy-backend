import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product, ProductDocument } from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { StorageService } from 'src/modules/storage/storage.service';
import { EditProductDto } from '../dto/edit-product.dto';
import { ImportProductsService } from './import-products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { Settings } from 'http2';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Dimension } from 'src/common/entity/dimension.entity';
import { DimensionDto } from 'src/common/dto/dimension.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
    private importProductsService: ImportProductsService,
    private settingsService: SettingsService,
  ) {}
  async createProduct(
    dto: CreateProductDto,
    images: [any],
  ): Promise<ProductDocument> {
    if (images) {
      await this.saveImagesAndUpdateDimensions(
        dto.dimensions,
        dto.numberOfImagesForDimensions,
        images,
      );
    }
    const dimensionDto: DimensionDto[] = dto.dimensions;
    const dimensions = dimensionDto.map((dimDto) => {
      return {
        color: new mongoose.Types.ObjectId(dimDto.color), // Convert to ObjectId
        size: new mongoose.Types.ObjectId(dimDto.size), // Convert to ObjectId
        material: new mongoose.Types.ObjectId(dimDto.material), // Convert to ObjectId
        quantity: dimDto.quantity,
        images: dimDto.images,
      };
    });
    const product = new this.productModel({ ...dto, dimensions });
    return await product.save();
  }

  async saveImagesAndUpdateDimensions(
    dimensions: DimensionDto[],
    numberOfImagesForDimensions: number[],
    images: [any],
  ) {
    const initImageIndex = 0;
    for (let i = 0; i < dimensions.length; i++) {
      const dimen = dimensions[i];
      const numberOfImages = +numberOfImagesForDimensions[i];
      const imagesArr = dimen.images ? dimen.images : [];
      const lastIndex = initImageIndex + numberOfImages;
      for (let j = initImageIndex; j < lastIndex; j++) {
        const image = images[j];
        const imageUrl = await this.storageService.uploadFile(image);

        console.log('Saved image url: ', imageUrl);
        imagesArr.push(imageUrl);
      }
      dimen.images = imagesArr;
    }
  }

  async editProduct(id: string, dto: EditProductDto, newImages: [any]) {
    const product = await this.getProductById(id);
    if (product) {
      if (newImages) {
        await this.saveImagesAndUpdateDimensions(
          dto.dimensions,
          dto.numberOfImagesForDimensions,
          newImages,
        );
      }
      const dimensionDto: DimensionDto[] = dto.dimensions;
      const dimensions = dimensionDto.map((dimDto) => {
        return {
          color: new mongoose.Types.ObjectId(dimDto.color), // Convert to ObjectId
          size: new mongoose.Types.ObjectId(dimDto.size), // Convert to ObjectId
          material: new mongoose.Types.ObjectId(dimDto.material), // Convert to ObjectId
          quantity: dimDto.quantity,
          images: dimDto.images,
        };
      });
      return await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: {
            name: dto.name,
            idName: dto.idName,
            description: dto.description,
            weightInGrams: dto.weightInGrams,
            costPriceInUsd: dto.costPriceInUsd,
            salePrice: dto.salePrice,
            dimensions: dimensions,
          },
        },
        { new: true },
      );
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
    const products = await this.productModel.find();
    const mappedProducts = products.map((product) => {
      const productObj = product.toObject();
      const costPrice = this.calculateCostPrice(productObj);
      const marginValue = product.salePrice - costPrice;

      return { ...productObj, marginValue, costPrice };
    });
    return mappedProducts;
  }

  async getProductById(id: string): Promise<any> {
    const product = await this.productModel.findById(id).lean();

    if (product) {
      // Calculate costPrice and add it to the product object
      const costPrice = this.calculateCostPrice(product);
      return {
        ...product,
        costPrice,
      };
    }

    return product;
  }

  async getProductbyIdName(idName: string): Promise<ProductDocument> {
    return await this.productModel.findOne({ idName: idName }).exec();
  }

  async importProducts(products: [any]) {
    const parsedProducts = await this.importProductsService.parseExelFile(
      products,
    );

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
        product.dimensions.push(this.convertToDimension(dimentsionDto));
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

  async getSellingProducts() {
    return await this.productModel.find({ forSale: true }).lean();
  }

  calculateCostPrice(product: Product): number {
    const shippingPriceInUsd =
      (product.weightInGrams / 1000) *
      this.settingsService.getRateForShipping();
    const costPriceInUah =
      (shippingPriceInUsd + product.costPriceInUsd) *
      this.settingsService.getUsdToUahRate();

    if (!costPriceInUah) {
      return 0;
    }
    // Round to 1 decimal place
    const roundedCostPrice = parseFloat(costPriceInUah.toFixed(1));

    return roundedCostPrice;
  }

  convertToDimension(dto: DimensionDto): Dimension {
    const dimension = new Dimension();
    dimension.color = new mongoose.Types.ObjectId(dto.color);
    dimension.size = new mongoose.Types.ObjectId(dto.size);
    dimension.material = new mongoose.Types.ObjectId(dto.material);
    dimension.quantity = dto.quantity;
    return dimension;
  }
}
