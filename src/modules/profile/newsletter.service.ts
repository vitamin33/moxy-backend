import { Injectable } from '@nestjs/common';
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
      .findOne({ email, firstName })
      .exec();
    if (existingSubscriber) {
      throw new Error('Email already subscribed to the newsletter.');
    }

    const subscriber = new this.newsletterModel({ email });
    await subscriber.save();
    return subscriber;
  }
}
