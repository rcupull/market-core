import { Logger } from '../../utils/general';
export declare class EmailServices {
    private readonly options;
    private transporter;
    constructor(options: {
        logger: Logger;
        SMTP_HOST: string;
        SMTP_PORT: number;
        SECURE: boolean;
        USER: string;
        PASSWORD: string;
    });
    send: (args: {
        to: string;
        subject: string;
        text: string;
    }) => void;
}
