"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailServices = void 0;
const nodemailer_1 = require("nodemailer");
class EmailServices {
    constructor(options) {
        this.options = options;
        this.send = (args) => {
            const { to, subject, text } = args;
            const { USER } = this.options;
            this.transporter.sendMail({
                from: `"No Responder" <${USER}>`,
                to,
                subject,
                text
            }, (error, info) => {
                if (error) {
                    this.options.logger.error('Error al enviar el correo:');
                    this.options.logger.error(JSON.stringify(error, null, 2));
                    return;
                }
                this.options.logger.info('Mensaje enviado:');
                this.options.logger.info(info.messageId);
            });
        };
        this.transporter = (0, nodemailer_1.createTransport)({
            host: this.options.SMTP_HOST,
            port: this.options.SMTP_PORT,
            secure: this.options.SECURE,
            auth: {
                user: this.options.USER,
                pass: this.options.PASSWORD
            }
        });
    }
}
exports.EmailServices = EmailServices;
