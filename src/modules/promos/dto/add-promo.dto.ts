import { IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class AddPromoDto {
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  title: string;

  @IsNumber()
  discount: number;

  @IsNotEmpty()
  productId: string;
}
