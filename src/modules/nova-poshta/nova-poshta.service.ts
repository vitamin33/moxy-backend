import axios, { AxiosInstance } from 'axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NovaPoshtaService {
  // Tkachenko API key
  private readonly tkachenkoApiKey = '50f6bc872ee2ef0ab977264d7ac3a9cc';

  // Hrinchenko API key
  private readonly apiKey = '11b1e08fcb5f09149f5c01041fd1ca97';
  private readonly baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  private readonly polinaRef = '390dc8bf-cd7e-11ed-a60f-48df37b921db';
  private readonly axiosInstance: AxiosInstance;
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.axiosInstance = axios.create();
  }

  async parseNovaPoshtaClients(): Promise<User[]> {
    try {
      const counterparties = await this.getCounterparties();
      let result: User[] = [];

      for (const counterparty of counterparties) {
        let page = 1;
        let allContactPersons: any[] = [];

        while (true) {
          const contactPersonsResult = await this.getContactPersons(
            counterparty.Ref,
            page,
          );
          const contactPersons = contactPersonsResult.data;

          if (contactPersons.length === 0) {
            break; // No more contact persons, exit the loop
          }

          allContactPersons = allContactPersons.concat(contactPersons);
          page++;
        }
        const users: User[] = [];

        for (const item of allContactPersons) {
          const mobile = item.Phones.substring(2);
          const user = new this.userModel({
            firstName: item.FirstName,
            secondName: item.LastName,
            mobileNumber: mobile,
          });
          users.push(user);
        }

        result = result.concat(users);
      }
      return result;
    } catch (error) {
      throw new HttpException(
        'Error during getting Nova Poshta clients.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCounterparties(): Promise<any> {
    const requestBody = {
      apiKey: this.apiKey,
      modelName: 'Counterparty',
      calledMethod: 'getCounterparties',
      methodProperties: {
        CounterpartyProperty: 'Recipient',
        Page: 1,
      },
    };

    const response = await this.axiosInstance.post(this.baseUrl, requestBody);

    return response.data.data;
  }

  async getContactPersons(counterpartyRef: string, page: number): Promise<any> {
    const requestBody = {
      apiKey: this.apiKey,
      modelName: 'Counterparty',
      calledMethod: 'getCounterpartyContactPersons',
      methodProperties: {
        Ref: counterpartyRef,
        Page: page,
      },
    };

    const response = await this.axiosInstance.post(this.baseUrl, requestBody);

    return response.data;
  }
}
