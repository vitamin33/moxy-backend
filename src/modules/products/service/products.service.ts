import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product, ProductDocument } from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { StorageService } from 'src/modules/storage/storage.service';
import { EditProductDto } from '../dto/edit-product.dto';
import { ImportProductsService } from './import-products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Dimension } from 'src/common/entity/dimension.entity';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { PromosService } from 'src/modules/promos/promos.service';
import { AttributesService } from 'src/modules/attributes/attributes.service';
import {
  Attributes,
  AttributesWithCategories,
} from 'src/modules/attributes/attribute.entity';
import { ProductAttributesDto } from '../dto/attributes.dto';

@Injectable()
export class ProductsService {
  private attributes: AttributesWithCategories;
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
    private importProductsService: ImportProductsService,
    private settingsService: SettingsService,
    private attributesService: AttributesService,
  ) {
    this.initializeAttributes();
  }

  private async initializeAttributes() {
    this.attributes = await this.attributesService.getAttributes();
  }
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

    const dimensions = this.mapDimensionDtosToDimens(dto.dimensions);

    // Create an attributes object with parsed values only if they are present in the DTO
    const parsedAttributes = {
      ...dto.attributes,
      weightInGrams: parseInt(dto.attributes.weightInGrams),
      heightInCm: parseInt(dto.attributes.heightInCm),
      lengthInCm: parseInt(dto.attributes.lengthInCm),
      widthInCm: parseInt(dto.attributes.widthInCm),
      depthInCm: dto.attributes.depthInCm
        ? parseInt(dto.attributes.depthInCm)
        : undefined,
    };

    const product = new this.productModel({
      ...dto,
      dimensions,
      attributes: parsedAttributes,
    });

    return await product.save();
  }

  mapDimensionDtosToDimens(dimensions: DimensionDto[]): Dimension[] {
    return dimensions.map((dimDto) => {
      const dimension: any = {
        quantity: dimDto.quantity,
        images: dimDto.images,
      };
      if (dimDto.color) {
        dimension.color = new mongoose.Types.ObjectId(dimDto.color);
      }
      if (dimDto.size) {
        dimension.size = new mongoose.Types.ObjectId(dimDto.size);
      }
      if (dimDto.material) {
        dimension.material = new mongoose.Types.ObjectId(dimDto.material);
      }
      return dimension;
    });
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
      const dimensions = this.mapDimensionDtosToDimens(dto.dimensions);
      return await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: {
            name: dto.name,
            idName: dto.idName,
            description: dto.description,
            costPriceInUsd: dto.costPriceInUsd,
            salePrice: dto.salePrice,
            dimensions: dimensions,
            attributes: dto.attributes,
            category: dto.category,
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
      const dimensWithAttributes = this.fillAttributes(productObj.dimensions);
      return {
        ...productObj,
        marginValue,
        costPrice,
        dimensions: dimensWithAttributes,
      };
    });
    return mappedProducts;
  }
  fillAttributes(dimensions: Dimension[]) {
    return dimensions.map((dimension) => {
      const color = this.attributes.colors.find((e) => {
        return e._id.toString() === dimension.color.toString();
      });

      // Check if 'size' and 'material' are defined before including them
      const size = dimension.size
        ? this.attributes.sizes.find((e) => {
            return e._id.toString() === dimension.size.toString();
          })
        : undefined;

      const material = dimension.material
        ? this.attributes.materials.find((e) => {
            return e._id.toString() === dimension.material.toString();
          })
        : undefined;

      // Create the object with only defined values
      const dimensionWithAttributes: any = { ...dimension, color };

      // Include 'size' and 'material' if they are defined
      if (size !== undefined) {
        dimensionWithAttributes.size = size;
      }
      if (material !== undefined) {
        dimensionWithAttributes.material = material;
      }

      return dimensionWithAttributes;
    });
  }

  async getProductById(id: string): Promise<any> {
    const product = await await this.productModel.findById(id);

    if (product) {
      // Calculate costPrice and add it to the product object
      const costPrice = this.calculateCostPrice(product);
      const dimensWithAttributes = this.fillAttributes(product.dimensions);
      return {
        ...product,
        costPrice,
        dimensions: dimensWithAttributes,
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

  async getSellingProducts() {
    const products = await this.productModel.find({ forSale: true }).lean();
    return this.fillAttributesForProducts(products);
  }

  async getRecommendedProducts() {
    // TODO change implementation to return random product for now
    const products = await this.productModel.find({ forSale: true }).lean();
    return this.fillAttributesForProducts(products);
  }

  async getResaleProducts() {
    // TODO change implementation to return products from Accessories category for now
    const products = await this.productModel.find({ forSale: true }).lean();
    return this.fillAttributesForProducts(products);
  }

  private fillAttributesForProducts(products: Product[]) {
    return products.map((product) => {
      const productObj = { ...product };
      if (product.dimensions) {
        productObj.dimensions = this.fillAttributes(product.dimensions);
      }
      return productObj;
    });
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
