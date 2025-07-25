import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'util';
import { MediaType } from '../settings/media.entity';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

let parsedCredentials;

const credentials = process.env.GOOGLE_CREDENTIALS;

if (credentials) {
  parsedCredentials = JSON.parse(credentials);
} else {
  try {
    // Constructing the relative path from the storage service to the root directory
    const credentialsFilePath = join(
      __dirname,
      './../../../../google-credentials.json',
    );
    const credentialsFile = readFileSync(credentialsFilePath, 'utf8');
    parsedCredentials = JSON.parse(credentialsFile);
  } catch (error) {
    throw new Error(
      'Failed to load Google credentials from file: ' + error.message,
    );
  }
}
const storage = new Storage({ credentials: parsedCredentials });

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async uploadFile(file, type: MediaType): Promise<string> {
    try {
      const { buffer } = file;
      const bucket = process.env.STORAGE_MEDIA_BUCKET || 'moxy-ua';
      const fileId: string = uuid();
      let fileExtension: string;

      this.logger.debug(`Uploading started, mediaType: ${type}`);

      // Determine the file extension based on the MediaType enum
      switch (type) {
        case MediaType.Image:
        case MediaType.ImageSet:
          fileExtension = 'jpeg';
          break;
        case MediaType.Video:
          fileExtension = 'mp4';
          break;
        default:
          throw new HttpException(
            `Unsupported MediaType for storage into GCS: ${type}`,
            HttpStatus.BAD_REQUEST,
          );
      }

      const fileName: string = `${fileId}.${fileExtension}`;
      const blob = storage.bucket(bucket).file(fileName);
      await blob.save(buffer);

      const publicUrl = format(
        `https://storage.googleapis.com/${bucket}/${blob.name}`,
      );
      this.logger.debug(`Uploaded file: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new HttpException(
        'Error during uploading to GoogleStorage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const imageFileName = fileUrl.split('/').pop();
      if (imageFileName) {
        await storage
          .bucket(process.env.STORAGE_MEDIA_BUCKET)
          .file(imageFileName)
          .delete();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}
