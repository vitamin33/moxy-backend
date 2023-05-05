import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductDocument } from './product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { EditProductDto } from './dto/edit-product.dto';

@Injectable()
export class ProductsService {
  importProducts(products: any): Promise<ProductDocument[]> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
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
            description: dto.description,
            color: dto.color,
            costPrice: dto.costPrice,
            salePrice: dto.salePrice,
            warehouseQuantity: dto.warehouseQuantity,
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

  async getAllProducts(): Promise<any[]> {
    const products = await this.productModel.find();
    const mappedProducts = products.map((product) => {
      const marginValue = product.salePrice - product.costPrice;
      const productObj = product.toObject();
      return { ...productObj, marginValue };
    });
    return mappedProducts;
  }

  async getProductbyId(id: string): Promise<ProductDocument> {
    return await this.productModel.findById(id).lean();
  }
}
