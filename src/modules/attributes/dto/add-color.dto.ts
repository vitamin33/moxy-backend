import { IsNotEmpty } from 'class-validator';

export class AddColorDto {
  @IsNotEmpty()
  hexCode: string;

  @IsNotEmpty()
  name: string;
}
