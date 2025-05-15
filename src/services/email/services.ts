import nodemailer from 'nodemailer';

const user = 'aseremarket@gmail.com';
const pass = 'apxb pupn lhex catp';

export class EmailService {
  constructor() {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });

  // sendValidationCodeToEmail = ({ email, code }: { email: string; code: string }): Promise<void> => {
  //   return new Promise((resolve, reject) => {
  //     this.transporter.sendMail(
  //       {
  //         from: user,
  //         to: email,
  //         subject: 'Verificación de la cuenta',
  //         text: `No debe responde a este correo. De click al siguiente link para validar su cuenta en nuestro marketplace ${getValidationCodeRoute(
  //           code
  //         )}`
  //       },
  //       (error: any, info: any) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(info);
  //         }
  //       }
  //     );
  //   });
  // };

  // sendForgotPasswordCodeToEmail = ({
  //   email,
  //   code
  // }: {
  //   email: string;
  //   code: string;
  // }): Promise<void> => {
  //   return new Promise((resolve, reject) => {
  //     this.transporter.sendMail(
  //       {
  //         from: user,
  //         to: email,
  //         subject: 'Recuperación de la cuenta',
  //         text: `No debe responde a este correo. De click al siguiente link para recuperar su cuenta nuestro marketplace ${getForgotPasswordCodeRoute(
  //           code
  //         )}`
  //       },
  //       (error: any, info: any) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(info);
  //         }
  //       }
  //     );
  //   });
  // };
}
