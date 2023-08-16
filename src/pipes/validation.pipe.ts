import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from 'src/common/exception/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.validateMetaType(metatype)) {
      return value;
    }
    const obj = plainToClass(metatype, value);
    const errors = await validate(obj);
    if (errors.length) {
      const messages = errors.map((e) => {
        return `${e.property} - ${Object.values(e.constraints).join(', ')}`;
      });
      throw new ValidationException(messages);
    } else {
      return value;
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private validateMetaType(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
