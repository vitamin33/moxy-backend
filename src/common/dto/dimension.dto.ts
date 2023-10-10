export class DimensionDto {
  color: ColorDto;
  size: SizeDto;
  material: MaterialDto;
  quantity: number;
  images: string[];
}
export class ColorDto {
  _id: string;
  name: string;
  hexCode: string;
}

export class SizeDto {
  _id: string;
  name: string;
}

export class MaterialDto {
  _id: string;
  name: string;
}
