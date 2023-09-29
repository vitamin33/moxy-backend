import { DimensionDto } from './dto/dimension.dto';
import { Dimension } from './entity/dimension.entity';
import mongoose from 'mongoose';

export function compareDimensionWithDto(
  dim1: Dimension,
  dim2: Dimension,
): boolean {
  // Check if color, size, and material are defined before comparing
  const colorMatch =
    (!dim1.color && !dim2.color) ||
    dim1.color?.toString() === dim2.color?.toString();
  const sizeMatch =
    (!dim1.size && !dim2.size) ||
    dim1.size?.toString() === dim2.size?.toString();
  const materialMatch =
    (!dim1.material && !dim2.material) ||
    dim1.material?.toString() === dim2.material?.toString();

  // Return true only if all properties match or are undefined
  return colorMatch && sizeMatch && materialMatch;
}
