"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsServices = void 0;
const axios_1 = __importDefault(require("axios"));
const zdBaseUrl = `https://zdsms.cu/api`;
const removePlusFromNumber = (phone) => {
    return phone.startsWith('+') ? phone.replace('+', '') : phone;
};
/**
 * Doc: https://zdsms.cu/documentation
 */
class SmsServices {
    constructor(options) {
        this.options = options;
        this.send = async ({ text, phone }) => {
            const { ZD_SMS_SERVER_TOKEN, logger } = this.options;
            try {
                await (0, axios_1.default)({
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
            }
            catch (e) {
                logger.error('Failed call to SMS provider');
                logger.error(e);
            }
        };
    }
}
exports.SmsServices = SmsServices;
