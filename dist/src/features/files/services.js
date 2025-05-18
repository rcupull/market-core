"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileServices = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const https_1 = require("https");
const sharp_1 = __importDefault(require("sharp"));
const general_1 = require("../../utils/general");
const utils_1 = require("./utils");
class FileServices {
    constructor(options) {
        this.options = options;
        this.getAllObjectBucket = async (folderPath) => {
            const { S3_BUCKET_APP, logger } = this.options;
            const command = new client_s3_1.ListObjectsV2Command({ Bucket: S3_BUCKET_APP, Prefix: folderPath });
            try {
                const { Contents = [] } = await this.s3.send(command);
                return Contents.map(({ Key }) => Key);
            }
            catch (error) {
                logger.error('Error fetching objects from S3 bucket:', error);
                return [];
            }
        };
        this.uploadImage = async ({ customKey, postId, routeName, userId, imageBuffer }) => {
            const { S3_BUCKET_APP, logger } = this.options;
            const pathToSave = (0, utils_1.getPathToSave)({
                postId,
                routeName,
                userId,
                customKey
            });
            const transformedImage = await (0, sharp_1.default)(imageBuffer)
                .resize(800)
                .webp({ quality: 80, lossless: false, smartSubsample: true })
                .toBuffer();
            const imageSrc = `/images/${pathToSave}/${Date.now().toString()}.webp`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: S3_BUCKET_APP,
                Key: imageSrc,
                Body: transformedImage,
                ContentType: 'image/webp'
            });
            try {
                await this.s3.send(command);
                return { imageSrc };
            }
            catch (error) {
                logger.error('Error putting objects to S3 bucket:', error);
                return { imageSrc: null };
            }
        };
        this.imagesDeleteMany = async (args) => {
            const { S3_BUCKET_APP, logger } = this.options;
            const oldImages = (0, general_1.compact)(args.oldImages);
            const newImages = (0, general_1.compact)(args.newImages);
            const imagesToDelete = oldImages.filter((oldImage) => !newImages.some((newImage) => (newImage === null || newImage === void 0 ? void 0 : newImage.src) === (oldImage === null || oldImage === void 0 ? void 0 : oldImage.src)));
            if (!imagesToDelete.length) {
                return;
            }
            try {
                const promises = imagesToDelete.map((image) => {
                    return this.s3.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: S3_BUCKET_APP,
                        Key: image.src
                    }));
                });
                await Promise.all(promises);
            }
            catch (e) {
                logger.error('Error deleting images', e);
            }
        };
        const { S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_APP, logger } = this.options;
        this.s3 = new client_s3_1.S3Client({
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
                httpsAgent: new https_1.Agent({
                    rejectUnauthorized: false // ⚠️ Ignore SSL certificate errors
                })
            })
        });
        /**
         * //////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////
         */
        this.middlewareMulterMemoryStorage = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage()
        }).single('upload');
        this.middlewareUploadApk = (0, multer_1.default)({
            storage: (0, multer_s3_1.default)({
                s3: this.s3,
                bucket: S3_BUCKET_APP,
                key: function (req, file, cb) {
                    const { major, minor, patch } = req.query;
                    const ext = file.originalname.split('.').pop();
                    const key = `/apks/eltrapiche_${major}_${minor}_${patch}.${ext}`;
                    cb(null, key);
                }
            })
        }).single('upload');
        /**
         * //////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////
         */
        if (process.env.NODE_ENV !== 'test') {
            this.s3
                .send(new client_s3_1.ListBucketsCommand({
                BucketRegion: S3_REGION
            }))
                .then(() => {
                logger.info('MINIO Connected');
            })
                .catch((e) => {
                logger.info(`MINIO Error: ${JSON.stringify(e)}`);
            });
        }
    }
}
exports.FileServices = FileServices;
