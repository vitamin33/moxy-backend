import { Injectable, NotFoundException } from '@nestjs/common';
import { Dimension, Product, ProductDocument } from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DimensionDto } from '../dto/create-product.dto';

@Injectable()
export class ProductAvailabilityService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async isProductAvailable(
    productId: string,
    dimension: DimensionDto,
  ): Promise<boolean> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const convertedDimension = this.mapDimensionDtoToDimension(dimension);
    const matchingDimension = product.dimensions.find(
      (dim) => dim.color === convertedDimension.color,
    );

    if (!matchingDimension) {
      return false;
    }

    return matchingDimension.quantity >= convertedDimension.quantity;
  }

  mapDimensionDtoToDimension(dto: DimensionDto): Dimension {
    const dimension = new Dimension();
    dimension.color = dto.color;
    dimension.quantity = dto.quantity;
    // Set other properties if needed
    return dimension;
  }
}
