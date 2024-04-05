import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class SecretsService {
  private logger = new Logger(SecretsService.name);
  private secretManagerClient = new SecretManagerServiceClient();
  private projectId = 'moxy-384018';

  constructor() {
    let credentials;

    try {
      const credentialsPath = join(
        __dirname,
        '../../../../',
        'google-credentials.json',
      );
      const credentialsJSON = readFileSync(credentialsPath, 'utf8');
      credentials = JSON.parse(credentialsJSON);
    } catch (error) {
      this.logger.error('Failed to load Google credentials from file', error);
    }

    this.secretManagerClient = new SecretManagerServiceClient({
      projectId: this.projectId,
      credentials: credentials,
    });
  }

  async getFacebookAccessToken(): Promise<string> {
    const secretName = `projects/${this.projectId}/secrets/fb_access_token/versions/latest`;
    const [version] = await this.secretManagerClient.accessSecretVersion({
      name: secretName,
    });

    if (!version.payload?.data) {
      return null;
    }

    // Secret payload data is a Buffer. Convert it to a string.
    const accessToken = version.payload.data.toString();
    return accessToken;
  }

  async saveFacebookAccessToken(newAccessToken: string): Promise<void> {
    const secretName = `projects/${this.projectId}/secrets/fb_access_token`;

    try {
      try {
        await this.secretManagerClient.getSecret({ name: secretName });
      } catch (error) {
        if (error.code === 5) {
          // Secret not found, create it
          await this.secretManagerClient.createSecret({
            parent: `projects/${this.projectId}`,
            secretId: 'fb_access_token',
            secret: {
              replication: {
                automatic: {},
              },
            },
          });
        } else {
          // Unknown error, rethrow it
          throw error;
        }
      }

      // Add a new version of the secret
      await this.secretManagerClient.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(newAccessToken, 'utf-8'),
        },
      });
    } catch (error) {
      console.error('Failed to save FB access token:', error);
      throw error;
    }
  }
}
