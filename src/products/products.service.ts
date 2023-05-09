import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto, DimensionDto } from './dto/create-product.dto';
import { Product, ProductDocument } from './product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { EditProductDto } from './dto/edit-product.dto';
import { ImportProductsService } from './import-products.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
    private importProductsService: ImportProductsService,
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
            costPrice: dto.costPrice,
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

  async importProducts(products: [any]) {
    const parsedProducts = await this.importProductsService.parseExelFile(
      products,
    );

    const productDtos = parsedProducts.map((product) => {
      const dto = new CreateProductDto();
      dto.name = product.name;
      dto.costPrice = product.costPrice;
      dto.idName = product.idName;
      dto.salePrice = product.price;
      const dimentsionDto = new DimensionDto();
      dimentsionDto.color = product.color;
      dimentsionDto.quantity = product.warehouseQuantity;
      dto.dimensions = [dimentsionDto];
      return dto;
    });
    productDtos.forEach(async (dto) => {
      await this.createProduct(dto, null);
    });

    console.log(`Parsed products: ${productDtos}`);
    return [];
  }
}
