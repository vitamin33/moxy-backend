import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'crazyded@gmail.com', description: 'Email' })
  readonly email: string;
  @ApiProperty({ example: 'buba', description: 'Password' })
  readonly password: string;
}
