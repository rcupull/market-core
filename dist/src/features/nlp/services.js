"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpServices = void 0;
const general_1 = require("../../utils/general");
const axios_1 = __importDefault(require("axios"));
class NlpServices {
    constructor(options) {
        this.options = options;
        this.fetchProcess = async (args) => {
            const { key, text } = args;
            const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;
            try {
                const { data } = await (0, axios_1.default)({
                    method: 'post',
                    url: `${NLP_SERVER_URL}/process`,
                    data: {
                        key: `${NLP_APP_KEY}${key}`,
                        text
                    }
                });
                return data;
            }
            catch (e) {
                logger.error('error calling nlp server:');
                logger.error(JSON.stringify(e));
                return null;
            }
        };
        this.fetchTrain = async (args) => {
            const { data, key, nlpTagsIntents } = args;
            const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;
            try {
                await (0, axios_1.default)({
                    method: 'post',
                    url: `${NLP_SERVER_URL}/train`,
                    data: {
                        key: `${NLP_APP_KEY}${key}`,
                        dataSets: [
                            {
                                nlpTagsIntents,
                                data
                            }
                        ]
                    }
                });
            }
            catch (e) {
                logger.error('some error in the nlp train');
                return null;
            }
        };
        this.fetchFreeTrain = async (args) => {
            const { key, dataSets } = args;
            const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;
            try {
                await (0, axios_1.default)({
                    method: 'post',
                    url: `${NLP_SERVER_URL}/free-train`,
                    data: {
                        key: `${NLP_APP_KEY}${key}`,
                        dataSets
                    }
                });
            }
            catch (e) {
                logger.error('some error in the nlp train');
                return null;
            }
        };
        /**
         * @param args.text - text to process, must be a non empty string
         * @param args.key - key to identify the nlp model, must be a non empty string
         * @param args.intentGetter - template to extract the intent value from the response
         * @returns array of objects with value and score
         */
        this.getNlpMapping = async (args) => {
            /**
             * intentTemplate should have a value similar to format 'products.name.{val}'
             */
            const { key, text, intentGetter } = args;
            const response = await this.fetchProcess({
                text,
                key
            });
            if (!response) {
                return [];
            }
            const { classifications } = response;
            return (0, general_1.compact)(classifications.map((classification) => {
                var _a;
                const { intent, score } = classification;
                if (score === 0)
                    return undefined;
                const value = (_a = (0, general_1.stringExtract)(intentGetter, intent)) === null || _a === void 0 ? void 0 : _a[0];
                if (!value)
                    return undefined;
                return {
                    value,
                    score
                };
            }));
        };
    }
}
exports.NlpServices = NlpServices;
