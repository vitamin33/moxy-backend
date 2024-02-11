import { Injectable, Logger } from '@nestjs/common';
import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk';
import { SettingsService } from '../settings/settings.service';
import { getPreviousPeriodDates } from 'src/common/utils';

@Injectable()
export class FacebookService {
  private readonly accessToken = process.env.FB_ACCESS_TOKEN;
  private readonly adAccountId = 'act_210820320875131';
  private readonly logger = new Logger(FacebookService.name);
  private readonly api = FacebookAdsApi.init(this.accessToken);

  constructor(private settingsService: SettingsService) {}
  async getAdsReport(startDate: Date, endDate: Date): Promise<AdData> {
    const showDebuggingInfo = true; // Set this to true for debugging info

    // Format dates to 'YYYY-MM-DD'
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    if (showDebuggingInfo) {
      this.api.setDebug(true);
    }

    const fields = [
      'spend',
      'social_spend',
      'cost_per_action_type',
      'reach',
      'cpm',
      'ctr',
      'cpc',
    ];
    const params = {
      time_range: { since: formattedStartDate, until: formattedEndDate },
      filtering: [],
      level: 'account',
      breakdowns: [],
    };

    try {
      const account = new AdAccount(this.adAccountId);
      const insights = await account.getInsights(fields, params);
      const adData = insights[0]._data;

      const usdToUahRate = this.settingsService.getUsdToUahRate();
      const spendAmount = parseFloat(adData.spend);
      const spending = spendAmount * usdToUahRate;
      adData.spendInUah = spending.toFixed(2);

      adData.cpm = this.roundFloatValue(adData.cpm);
      adData.ctr = this.roundFloatValue(adData.ctr);
      adData.cpc = this.roundFloatValue(adData.cpc);

      return adData;
    } catch (error) {
      this.logger.error(`Error getting FB ads report: ${error}`);
    }
  }

  roundFloatValue(value: string) {
    const numberValue = parseFloat(value);
    return numberValue.toFixed(2);
  }

  async getPreviousPeriodAdsReport(
    currentFromDate: Date,
    currentToDate: Date,
  ): Promise<AdData> {
    const { previousFromDate, previousToDate } = getPreviousPeriodDates(
      currentFromDate,
      currentToDate,
    );

    // Use the getAdsReport method to fetch the report for the previous period
    return this.getAdsReport(previousFromDate, previousToDate);
  }
}

class CostPerActionType {
  action_type: string;
  value: string;
}

export class AdData {
  spendInUah: string;
  spend: string;
  social_spend: string;
  cost_per_action_type: CostPerActionType[];
  reach: string;
  cpm: string;
  ctr: string;
  cpc: string;
  date_start: string;
  date_stop: string;
}

class Cursors {
  before: string;
  after: string;
}

class Paging {
  cursors: Cursors;
}
