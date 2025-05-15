import { ZD_SMS_SERVER_TOKEN } from '../../config';
import { QueryHandle } from '../../types/general';
import { axios } from '../../utils/api';
import { logger } from '../logger';

const zdBaseUrl = `https://zdsms.cu/api`;

const removePlusFromNumber = (phone: string) => {
  return phone.startsWith('+') ? phone.replace('+', '') : phone;
};

/**
 * Doc: https://zdsms.cu/documentation
 */

export class SmsServices {
  constructor() {}

  send: QueryHandle<
    {
      phone: string;
      text: string;
    },
    void
  > = async ({ text, phone }) => {
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
