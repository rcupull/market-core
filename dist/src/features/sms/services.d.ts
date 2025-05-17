import { Logger } from 'winston';
import { QueryHandle } from '../../types/general';
/**
 * Doc: https://zdsms.cu/documentation
 */
export declare class SmsServices {
    private readonly options;
    constructor(options: {
        logger: Logger;
        ZD_SMS_SERVER_TOKEN: string;
    });
    send: QueryHandle<{
        phone: string;
        text: string;
    }, void>;
}
