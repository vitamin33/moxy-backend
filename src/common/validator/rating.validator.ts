import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidRating(validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      name: 'isValidRating',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return [1, 2, 3, 4, 5].includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be 1, 2, 3, 4, or 5`;
        },
      },
    });
  };
}
