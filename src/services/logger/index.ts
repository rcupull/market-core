import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';
import { LOGGER_LEVEL, LOGS_DIR, NODE_ENV } from '../../config';

const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${label} [${level}]: ${message}`;
});

const devLogger = () => {
  return createLogger({
    level: LOGGER_LEVEL || 'debug',
    format: combine(
      colorize(),
      label({ label: 'dev' }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      myFormat
    ),
    transports: [
      new transports.Console() // ONLY PRINTING LOGS IN TERMINAL
    ]
  });
};

const productionsLogger = () => {
  return createLogger({
    level: LOGGER_LEVEL || 'info',
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          label({ label: 'dev' }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          myFormat
        ),
        level: 'debug'
      }),
      new transports.DailyRotateFile({
        filename: `${LOGS_DIR}/%DATE%-info.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        format: format.combine(format.timestamp({ format: 'HH:mm:ss' }), format.json()),
        level: 'info'
      }),
      new transports.DailyRotateFile({
        filename: `${LOGS_DIR}/%DATE%-error.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        level: 'error',
        format: format.combine(format.timestamp({ format: 'HH:mm:ss' }), format.json())
      })
    ]
  });
};

export const logger =
  NODE_ENV === 'production' || NODE_ENV === 'stage' ? productionsLogger() : devLogger();
