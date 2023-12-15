import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { IsValidRating } from 'src/common/validator/rating.validator';

// Validate rating numbers which allowed
function isValidRating(value: number): boolean {
  return [1, 2, 3, 4, 5].includes(value);
}

export class AddReviewDto {
  @IsOptional()
  @IsUrl()
  avatarImageUrl: string;

  @IsNotEmpty()
  clientName: string;

  @IsNotEmpty()
  reviewText: string;

  @IsNotEmpty({ message: 'Rating number should be present' })
  @IsNumber()
  @Min(1, { message: 'Value must be greater than or equal to 1' })
  @Max(5, { message: 'Value must be less than or equal to 5' })
  rating: number;

  @IsOptional()
  productId: string;
}
