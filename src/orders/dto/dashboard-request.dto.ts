import { IsNotEmpty } from 'class-validator';

export class ChangeOrderDto {
  @IsNotEmpty({ message: 'userId should be present' })
  readonly userId: string;
}
