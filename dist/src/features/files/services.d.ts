import { Image, QueryHandle, RequestHandler } from '../../types/general';
import { Logger } from 'winston';
export declare class FileServices {
    private readonly options;
    private s3;
    middlewareMulterMemoryStorage: RequestHandler;
    middlewareUploadApk: RequestHandler;
    constructor(options: {
        logger: Logger;
        S3_ACCESS_KEY_ID: string;
        S3_SECRET_ACCESS_KEY: string;
        S3_ENDPOINT: string;
        S3_REGION: string;
        S3_BUCKET_APP: string;
        NODE_ENV: string;
    });
    getAllObjectBucket: (folderPath: string) => Promise<(string | undefined)[]>;
    uploadImage: QueryHandle<{
        routeName?: string;
        postId?: string;
        professionalJobId?: string;
        userId?: string;
        customKey?: string;
        imageBuffer: Buffer;
    }, {
        imageSrc: string | null;
    }>;
    imagesDeleteMany: (args: {
        oldImages: Array<Image | undefined>;
        newImages: Array<Image | undefined>;
    }) => Promise<void>;
}
