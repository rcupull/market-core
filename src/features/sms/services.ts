import { Logger } from 'winston';
import { QueryHandle } from '../../types/general';
import axios from 'axios';

const zdBaseUrl = `https://zdsms.cu/api`;
const removePlusFromNumber = (phone: string) => {
  return phone.startsWith('+') ? phone.replace('+', '') : phone;
};

/**
 * Doc: https://zdsms.cu/documentation
 */

export class SmsServices {
  constructor(
    private readonly options: {
      logger: Logger;
      ZD_SMS_SERVER_TOKEN: string;
    }
  ) {}

  send: QueryHandle<
    {
      phone: string;
      text: string;
    },
    void
  > = async ({ text, phone }) => {
    const { ZD_SMS_SERVER_TOKEN, logger } = this.options;
    try {
      await axios({
        method: 'post',
        url: `${zdBaseUrl}/v1/message/send`,
        headers: {
          Authorization: `Bearer ${ZD_SMS_SERVER_TOKEN}`
        },
        data: {
          recipient: removePlusFromNumber(phone),
          mstext: text
        }
      });
    } catch (e) {
      logger.error('Failed call to SMS provider');
      logger.error(e);
    }
  };
}
