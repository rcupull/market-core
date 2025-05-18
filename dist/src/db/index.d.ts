import { Logger } from 'winston';
export declare const connectCoreDB: ({ MONGO_DB_URL, logger }: {
    MONGO_DB_URL: string;
    logger: Logger;
}) => Promise<void>;
