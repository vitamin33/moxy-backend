import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'cashAdvanceValueIsValid', async: false })
export class CashAdvanceValueValidator implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const paymentType = args.object['paymentType'];
    const status = args.object['status'];

    if (paymentType === 'FullPayment' && value !== undefined) {
      // Cash advance value should be empty for FullPayment
      return false;
    }

    if (status === 'Reserved' && value < 200) {
      // Cash advance value should be at least 200 for a Reserved status
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const paymentType = args.object['paymentType'];

    if (paymentType === 'FullPayment') {
      return 'Cash advance value should be empty for FullPayment.';
    }

    return 'Cash advance value should be at least 200 for a Reserved status.';
  }
}

export function CashAdvanceValue(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CashAdvanceValueValidator,
    });
  };
}
