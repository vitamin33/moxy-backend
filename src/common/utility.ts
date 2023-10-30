import { Attributes } from 'src/modules/attributes/attribute.entity';
import { DimensionDto } from './dto/dimension.dto';
import { Dimension } from './entity/dimension.entity';
import mongoose from 'mongoose';

export function compareDimensions(dim1: Dimension, dim2: Dimension): boolean {
  // Check if color, size, and material are defined before comparing
  const colorMatch =
    (!dim1.color && !dim2.color) ||
    (dim1.color instanceof mongoose.Types.ObjectId &&
      dim1.color.equals(dim2.color));
  const sizeMatch =
    (!dim1.size && !dim2.size) ||
    (dim1.size instanceof mongoose.Types.ObjectId &&
      dim1.size.equals(dim2.size));
  const materialMatch =
    (!dim1.material && !dim2.material) ||
    (dim1.material instanceof mongoose.Types.ObjectId &&
      dim1.material.equals(dim2.material));

  // Return true only if all properties match or are undefined
  return colorMatch && sizeMatch && materialMatch;
}
export function compareDimensionWithDto(
  dim: Dimension,
  dimDto: DimensionDto,
): boolean {
  // Check if color, size, and material are defined before comparing
  const colorMatch =
    (!dim.color && !dimDto.color) ||
    dim.color?._id.toString() === dimDto.color?._id.toString();
  const sizeMatch =
    (!dim.size && !dimDto.size) ||
    dim.size?.toString() === dimDto.size?._id.toString();
  const materialMatch =
    (!dim.material && !dimDto.material) ||
    dim.material?.toString() === dimDto.material?._id.toString();

  // Return true only if all properties match or are undefined
  return colorMatch && sizeMatch && materialMatch;
}

// export function fillAttributes(
//   dimensions: Dimension[],
//   fullAttributes: Attributes,
// ) {
//   return dimensions.map((dimension) => {
//     const color = fullAttributes.colors.find((e) => {
//       return e._id.toString() === dimension.color?._id?.toString();
//     });

//     // Check if 'size' and 'material' are defined before including them
//     const size = dimension.size
//       ? fullAttributes.sizes.find((e) => {
//           return e._id.toString() === dimension.size?._id?.toString();
//         })
//       : undefined;

//     const material = dimension.material
//       ? fullAttributes.materials.find((e) => {
//           return e._id.toString() === dimension.material?._id?.toString();
//         })
//       : undefined;

//     // Create the object with only defined values
//     const dimensionWithAttributes: any = { ...dimension, color };

//     // Include 'size' and 'material' if they are defined
//     if (size !== undefined) {
//       dimensionWithAttributes.size = size;
//     }
//     if (material !== undefined) {
//       dimensionWithAttributes.material = material;
//     }

//     return dimensionWithAttributes;
//   });
// }

export function convertToDimension(dto: DimensionDto): Dimension {
  const dimension = new Dimension();
  if (dto.color) {
    dimension.color = new mongoose.Types.ObjectId(dto.color._id);
  }
  if (dto.size) {
    dimension.size = new mongoose.Types.ObjectId(dto.size._id);
  }
  if (dto.material) {
    dimension.material = new mongoose.Types.ObjectId(dto.material._id);
  }
  dimension.quantity = dto.quantity;
  dimension.images = dto.images;

  return dimension;
}
