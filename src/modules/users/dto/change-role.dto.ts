import { IsString } from 'class-validator';

export class ChangeRoleDto {
  @IsString({ message: 'Should be string' })
  name: string;
  @IsString({ message: 'Should be string' })
  userId: string;
}
