import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private readonly usdToUahRate = 37.44;
  private readonly shippingRateInUSD = 17.0;

  getRateForShipping(): number {
    return this.shippingRateInUSD;
  }
  getUsdToUahRate(): number {
    return this.usdToUahRate;
  }
}
