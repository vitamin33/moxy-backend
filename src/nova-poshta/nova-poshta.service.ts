import axios, { AxiosInstance } from 'axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NovaPoshtaService {
  private readonly apiKey = '90603e83773eeb1f59952e4c85a53012';
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

        result = users;
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
