import { IsNotEmpty } from 'class-validator';

export class AddSizeDto {
  @IsNotEmpty()
  name: string;
}
