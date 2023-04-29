export class EditProductDto {
  readonly name: string;
  readonly description: string;
  readonly costPrice: number;
  readonly salePrice: number;
  readonly warehouseQuantity: number;
  readonly color: string;
  readonly currentImages: string[];
}
