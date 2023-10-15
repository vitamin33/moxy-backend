import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonopayService {
  private readonly baseUrl = 'https://api.monobank.ua/';
  private readonly removeInvoiceUrl = 'api/merchant/invoice/remove';
  private readonly axiosInstance: AxiosInstance;
  private monopayToken: string;
  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create();
    this.monopayToken = this.configService.get<string>('MONOPAY_TOKEN');
  }

  async removeInvoice(invoiceId: string): Promise<boolean> {
    try {
      const headers: AxiosRequestConfig = {
        headers: {
          'X-Token': this.monopayToken,
        },
      };
      const requestBody = {
        invoiceId: invoiceId,
      };

      const response = await this.axiosInstance.post(
        this.baseUrl + this.removeInvoiceUrl,
        requestBody,
        headers,
      );

      if (response.status >= 200 && response.status < 300) {
        return true; // Return true for success status codes
      } else {
        return false; // Return false for other status codes
      }
    } catch (error) {
      return false;
    }
  }
}
