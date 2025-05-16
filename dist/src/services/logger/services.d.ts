import { Logger, LoggerOptions } from 'winston';
import 'winston-daily-rotate-file';
export declare class LoggerServices {
    logger: Logger;
    constructor(options: LoggerOptions);
}
