import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MonobankService {
  private readonly monobankApiKey =
    'uuVUMBj56YDb7kMx87uBvb28IPc6Y4ekVW4Ok3DGytjg';
  private readonly getInvoiceUrl =
    'https://api.monobank.ua/api/merchant/invoice/status?invoiceId=';

  private readonly axiosInstance: AxiosInstance;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.axiosInstance = axios.create();
  }

  async getInvoiceStatus(invoiceId: string, status: string) {
    const cacheKey = `${invoiceId}_${status}`;

    // Check if the result is already cached
    const cachedStatus = await this.cacheManager.get(cacheKey);
    if (cachedStatus) {
      return cachedStatus;
    }

    const headers = {
      'X-Token': this.monobankApiKey,
    };
    const invoiceStatusUrl = this.getInvoiceUrl + invoiceId;
    const response = await this.axiosInstance.get(invoiceStatusUrl, {
      headers,
    });

    // Store the result in cache
    await this.cacheManager.set(cacheKey, response.data, 1000 * 60 * 3);

    return response.data;
  }
}
