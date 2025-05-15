import 'dotenv/config';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 8088;
//
export const NLP_SERVER_URL = process.env.NLP_SERVER_URL || '';
export const NLP_APP_KEY = process.env.NLP_APP_KEY || '';
//
export const MONGO_DB_URL = process.env.MONGO_DB_URL || '';
export const NLP_SERVER_KEY = process.env.NLP_SERVER_KEY || '';
//
export const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
export const S3_REGION = process.env.S3_REGION || '';
export const S3_BUCKET_APP = process.env.S3_BUCKET_APP || '';

//
export const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || '';
export const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
//
export const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN || '';
export const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN || '';

export const ZD_SMS_SERVER_TOKEN = process.env.ZD_SMS_SERVER_TOKEN || '';

export const HOSTNAME = process.env.HOSTNAME || '';

export const LOGS_DIR = process.env.LOGS_DIR || '';

export const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '';

export const SECRET_AGENDA_TOKEN = process.env.SECRET_AGENDA_TOKEN || '';

export const LOGGER_LEVEL = process.env.LOGGER_LEVEL || '';

export const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED || '';
export const RATE_LIMIT_EXCLUDED_IPS = process.env.RATE_LIMIT_EXCLUDED_IPS || '';

export const QDRANT_HOST = process.env.QDRANT_HOST || '';
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

export const QDRANT_ENV = process.env.QDRANT_ENV || '';
export const EMBEDDING_HOST = process.env.EMBEDDING_HOST || '';
