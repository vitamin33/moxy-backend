import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductDocument } from '../product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttributesService } from 'src/modules/attributes/attributes.service';
import { Dimension } from 'src/common/entity/dimension.entity';
import { Attributes } from 'src/modules/attributes/attribute.entity';
import { DimensionDto } from 'src/common/dto/dimension.dto';

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

    const matchingDimension = product.dimensions.find((dim) => {
      // Check if dimension matches the provided color, size, and material IDs
      return (
        dim.color.equals(dimension.color) &&
        dim.size.equals(dimension.size) &&
        dim.material.equals(dimension.material)
      );
    });

    if (!matchingDimension) {
      return false;
    }

    return matchingDimension.quantity >= dimension.quantity;
  }

  // async mapDimensionDtoToDimension(dto: DimensionDto, attributes: Attributes) {
  //   const color = attributes.colors.find((c) => c._id.equals(dto.colorId));
  //   const size = attributes.sizes.find((s) => s._id.equals(dto.sizeId));
  //   const material = attributes.materials.find((m) =>
  //     m._id.equals(dto.materialId),
  //   );

  //   if (!color || !size || !material) {
  //     // Handle the case where any of the referenced entities is not found
  //     throw new NotFoundException('One or more referenced entities not found');
  //   }

  //   // Create a Dimension object with the resolved entities and quantity from the DTO
  //   const dimension: Dimension = {
  //     color,
  //     size,
  //     material,
  //     quantity: dto.quantity,
  //   };
  //   return dimension;
  // }
}
