import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotAvailableException extends HttpException {
  constructor(productId: string, dimensionColor?: string, quantity?: number) {
    let message = `Product with ID ${productId} is not found`;

    if (dimensionColor && quantity !== undefined) {
      message = `Product with ID ${productId}, dimension color ${dimensionColor}, and quantity ${quantity} is not available in warehouse`;
    } else if (dimensionColor) {
      message = `Product with ID ${productId} and dimension color ${dimensionColor} is not available in warehouse`;
    }

    super(message, HttpStatus.BAD_REQUEST);
  }
}
