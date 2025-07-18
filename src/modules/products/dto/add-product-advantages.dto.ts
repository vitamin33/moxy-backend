import { IsNotEmpty, IsUrl } from 'class-validator';

export class AddProductAdvantagesDto {
  @IsNotEmpty()
  header: string;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  productId: string;
}
