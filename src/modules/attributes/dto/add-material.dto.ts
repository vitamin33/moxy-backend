import { IsNotEmpty } from 'class-validator';

export class AddMaterialDto {
  description: string;

  @IsNotEmpty()
  name: string;
}
