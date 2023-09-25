import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto, DimensionDto } from '../dto/create-product.dto';
import { Product, ProductDocument } from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/modules/storage/storage.service';
import { EditProductDto } from '../dto/edit-product.dto';
import { ImportProductsService } from './import-products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { Settings } from 'http2';
import { SettingsService } from 'src/modules/settings/settings.service';

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
    const result = [];
    const product = new this.productModel(dto);
    if (images) {
      for (const image of images) {
        const imageUrl = await this.storageService.uploadFile(image);

        console.log('Saved image url: ', imageUrl);
        result.push(imageUrl);
      }
      product.$set('images', result);
    }
    return await product.save();
  }

  async editProduct(
    id: string,
    dto: EditProductDto,
    newImages: [any],
  ): Promise<Product> {
    const product = await this.getProductbyId(id);
    if (product) {
      const imagesArr = dto.currentImages ? dto.currentImages : [];
      if (newImages) {
        for (const image of newImages) {
          const imageUrl = await this.storageService.uploadFile(image);

          console.log('Saved image url: ', imageUrl);
          imagesArr.push(imageUrl);
        }
      }
      return await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: {
            images: imagesArr,
            name: dto.name,
            idName: dto.idName,
            description: dto.description,
            weightInGrams: dto.weightInGrams,
            costPriceInUsd: dto.costPriceInUsd,
            salePrice: dto.salePrice,
            dimensions: dto.dimensions,
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
      for (const imageUrl of product.images) {
        await this.storageService.deleteFile(imageUrl);
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
      const marginValue = product.salePrice - product.costPrice;
      const productObj = product.toObject();
      const costPrice = this.calculateCostPrice(productObj);
      return { ...productObj, marginValue, costPrice };
    });
    return mappedProducts;
  }

  async getProductbyId(id: string): Promise<ProductDocument> {
    return await this.productModel.findById(id).lean();
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
      dimentsionDto.color = product.color;
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
        dimentsionDto.color = dto.dimensions[0].color;
        dimentsionDto.quantity = dto.dimensions[0].quantity;
        product.dimensions.push(dimentsionDto);
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
      product.weightInGrams * this.settingsService.getRateForShipping();
    const costPriceInUah =
      (shippingPriceInUsd + product.costPriceInUsd) *
      this.settingsService.getUsdToUahRate();
    return costPriceInUah;
  }
}
