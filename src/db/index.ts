import { connect } from 'mongoose';
import { Logger } from 'winston';

export const connectCoreDB = async ({
  MONGO_DB_URL,
  logger
}: {
  MONGO_DB_URL: string;
  logger: Logger;
}) => {
  try {
    await connect(MONGO_DB_URL);

    logger.info('DB Connected');
  } catch (e) {
    logger.info(`DB Error: ${JSON.stringify(e)}`);
  }
};
