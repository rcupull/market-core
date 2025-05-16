export declare const connectDB: (options: {
    MONGO_DB_URL: string;
    loggerInfo: (e: any) => void;
}) => Promise<void>;
