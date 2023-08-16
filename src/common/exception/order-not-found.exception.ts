import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} is not found.`, HttpStatus.BAD_REQUEST);
  }
}
