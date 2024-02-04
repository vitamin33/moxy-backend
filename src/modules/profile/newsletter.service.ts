import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Subscriber.name)
    private newsletterModel: Model<SubscriberDocument>,
  ) {}

  async subscribeToNewsletter(email: string, firstName: string) {
    const existingSubscriber = await this.newsletterModel
      .findOne({ email })
      .exec();
    if (existingSubscriber) {
      throw new HttpException(
        'Email already subscribed to the newsletter.',
        HttpStatus.CONFLICT,
      );
    }

    const subscriber = new this.newsletterModel({ email });
    await subscriber.save();
    return subscriber;
  }
}
