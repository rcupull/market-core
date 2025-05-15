import multer from 'multer';
import multerS3 from 'multer-s3';
import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { Request } from 'express';
import { logger } from '../logger';
import {
  S3_ACCESS_KEY_ID,
  S3_BUCKET_APP,
  S3_ENDPOINT,
  S3_REGION,
  S3_SECRET_ACCESS_KEY
} from '../../config';
import { Agent } from 'https';
import sharp from 'sharp';
import { compact } from '../../utils/general';
import { Image, QueryHandle } from '../../types/general';

export class FileServices {
  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.s3
        .send(
          new ListBucketsCommand({
            BucketRegion: S3_REGION
          })
        )
        .then(() => {
          logger.info('MINIO Connected');
        })
        .catch((e: any) => {
          logger.info(`MINIO Error: ${JSON.stringify(e)}`);
        });
    }
  }

  private s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY
    },
    region: S3_REGION,
    forcePathStyle: true,
    /**
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     * TODO this is a security issue to fix
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////
     */
    //eslint-disable-next-line
    requestHandler: new (require('@aws-sdk/node-http-handler').NodeHttpHandler)({
      httpsAgent: new Agent({
        rejectUnauthorized: false // ⚠️ Ignore SSL certificate errors
      })
    })
  });

  getAllObjectBucket = async (folderPath: string) => {
    const command = new ListObjectsV2Command({ Bucket: S3_BUCKET_APP, Prefix: folderPath });

    try {
      const { Contents = [] } = await this.s3.send(command);

      return Contents.map(({ Key }) => Key);
    } catch (error) {
      logger.error('Error fetching objects from S3 bucket:', error);
      return [];
    }
  };

  uploadImage: QueryHandle<{ file: any; pathToSave: string }> = async ({ file, pathToSave }) => {
    const transformedImage = await sharp(file.buffer)
      .resize(800)
      .webp({ quality: 80, lossless: false, smartSubsample: true })
      .toBuffer();

    const Key = `/images/${pathToSave}/${Date.now().toString()}.webp`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_APP,
        Key,
        Body: transformedImage,
        ContentType: 'image/webp'
      })
    );
  };

  imagesDeleteMany = async (args: {
    oldImages: Array<Image | undefined>;
    newImages: Array<Image | undefined>;
  }) => {
    const oldImages = compact(args.oldImages);
    const newImages = compact(args.newImages);

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.some((newImage: Image) => newImage?.src === oldImage?.src)
    );

    if (!imagesToDelete.length) {
      return;
    }

    try {
      const promises = imagesToDelete.map((image) => {
        return this.s3.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_APP,
            Key: image.src
          })
        );
      });

      await Promise.all(promises);
    } catch (e) {
      logger.error('Error deleting images', e);
    }
  };

  uploadApk = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: S3_BUCKET_APP,
      key: function (req: Request, file, cb) {
        const { major, minor, patch } = req.query;
        const ext = file.originalname.split('.').pop();

        const key = `/apks/eltrapiche_${major}_${minor}_${patch}.${ext}`;

        cb(null, key);
      }
    })
  });
}
