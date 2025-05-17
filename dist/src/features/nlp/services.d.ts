import { Logger } from '../../utils/general';
import { NplProcessResponse } from './types';
export declare class NlpServices {
    private readonly options;
    constructor(options: {
        logger: Logger;
        NLP_SERVER_URL: string;
        NLP_APP_KEY: string;
    });
    fetchProcess: (args: {
        text: string;
        key: string;
    }) => Promise<NplProcessResponse | null>;
    fetchTrain: (args: {
        data: Array<Record<string, string>>;
        nlpTagsIntents: Array<string>;
        key: string;
    }) => Promise<null | undefined>;
    fetchFreeTrain: (args: {
        dataSets: Array<{
            intent: string;
            utterances: Array<string>;
        }>;
        key: string;
    }) => Promise<null | undefined>;
    /**
     * @param args.text - text to process, must be a non empty string
     * @param args.key - key to identify the nlp model, must be a non empty string
     * @param args.intentGetter - template to extract the intent value from the response
     * @returns array of objects with value and score
     */
    getNlpMapping: (args: {
        text: string;
        key: string;
        intentGetter: string;
    }) => Promise<Array<{
        value: string;
        score: number;
    }>>;
}
