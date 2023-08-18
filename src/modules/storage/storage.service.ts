import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'util';

const storage = new Storage({ keyFilename: './google-credentials.json' });

@Injectable()
export class StorageService {
  async uploadFile(file): Promise<string> {
    try {
      const { buffer } = file;
      const bucket = process.env.STORAGE_MEDIA_BUCKET;
      const fileId: string = uuid();
      const blob = storage.bucket(bucket).file(fileId);
      await blob.save(buffer);

      //   const [metadata] = await storage
      //     .bucket(bucket)
      //     .file(fileId)
      //     .getMetadata();
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket}/${blob.name}`,
      );

      return publicUrl;
    } catch (error) {
      throw new HttpException(
        'Error during uploading to GoogleStorage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const imageFileName = fileUrl.split('/').pop();
      if (imageFileName) {
        await storage
          .bucket(process.env.STORAGE_MEDIA_BUCKET)
          .file(imageFileName)
          .delete();
      }
    } catch (error) {
      throw new HttpException(
        'Error during deleting from GoogleStorage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
