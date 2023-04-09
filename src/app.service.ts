import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  test(): string {
    return 'Test Moxy Backend Message!';
  }
}
