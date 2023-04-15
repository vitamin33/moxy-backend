import { IsString } from 'class-validator';

export class ChangeRoleDto {
  @IsString({ message: 'Should be string' })
  readonly name: string;
  @IsString({ message: 'Should be string' })
  readonly userId: string;
}
