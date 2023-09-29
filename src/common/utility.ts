import { DimensionDto } from './dto/dimension.dto';
import { Dimension } from './entity/dimension.entity';
import mongoose from 'mongoose';

export function compareDimensionWithDto(
  dim1: Dimension,
  dimDto: DimensionDto,
): boolean {
  // Convert DimensionDto properties to mongoose.Types.ObjectId
  const colorId = new mongoose.Types.ObjectId(dimDto.color);
  const sizeId = new mongoose.Types.ObjectId(dimDto.size);
  const materialId = new mongoose.Types.ObjectId(dimDto.material);

  // Compare the properties
  return (
    dim1.color.equals(colorId) &&
    dim1.size.equals(sizeId) &&
    dim1.material.equals(materialId) &&
    dim1.quantity === dimDto.quantity
  );
}
