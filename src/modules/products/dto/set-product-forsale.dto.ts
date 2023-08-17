import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SetProductForSaleDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsBoolean()
  @IsNotEmpty()
  forSale: boolean;
}
