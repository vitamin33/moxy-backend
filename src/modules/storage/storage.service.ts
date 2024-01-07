import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'util';
import { MediaType } from '../settings/media.entity';

const storage = new Storage({ keyFilename: './google-credentials.json' });

@Injectable()
export class StorageService {
  async uploadFile(file, type: MediaType): Promise<string> {
    try {
      const { buffer } = file;
      const bucket = process.env.STORAGE_MEDIA_BUCKET || 'moxy-ua';
      const fileId: string = uuid();
      let fileExtension: string;

      console.log(`Uploading started, mediaType: ${type}`);

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

      console.log(`Uploaded file: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
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
