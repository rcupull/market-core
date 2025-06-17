import { createTransport } from 'nodemailer';
import { Logger } from '../../utils/general';

export class EmailServices {
  private transporter;

  constructor(
    private readonly options: {
      logger: Logger;
      SMTP_HOST: string;
      SMTP_PORT: number;
      SECURE: boolean;
      USER: string;
      PASSWORD: string;
    }
  ) {
    this.transporter = createTransport({
      host: this.options.SMTP_HOST,
      port: this.options.SMTP_PORT,
      secure: this.options.SECURE,
      auth: {
        user: this.options.USER,
        pass: this.options.PASSWORD
      }
    });
  }

  send = (args: { to: string; subject: string; text: string }) => {
    const { to, subject, text } = args;
    const { USER } = this.options;

    this.transporter.sendMail(
      {
        from: `"No Responder" <${USER}>`,
        to,
        subject,
        text
      },
      (error, info) => {
        if (error) {
          this.options.logger.error('Error al enviar el correo:');
          this.options.logger.error(JSON.stringify(error, null, 2));
          return;
        }
        this.options.logger.info('Mensaje enviado:');
        this.options.logger.info(info.messageId);
      }
    );
  };
}
