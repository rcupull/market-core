import { compact, Logger, stringExtract } from '../../utils/general';

import axios from 'axios';
import { NplProcessResponse } from './types';

export class NlpServices {
  constructor(
    private readonly options: {
      logger: Logger;
      NLP_SERVER_URL: string;
      NLP_APP_KEY: string;
    }
  ) {}

  public fetchProcess = async (args: {
    text: string;
    key: string;
  }): Promise<NplProcessResponse | null> => {
    const { key, text } = args;

    const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;

    try {
      const { data } = await axios({
        method: 'post',
        url: `${NLP_SERVER_URL}/process`,
        data: {
          key: `${NLP_APP_KEY}${key}`,
          text
        }
      });

      return data;
    } catch (e) {
      logger.error('error calling nlp server:');
      logger.error(JSON.stringify(e));
      return null;
    }
  };

  public fetchTrain = async (args: {
    data: Array<Record<string, string>>;
    nlpTagsIntents: Array<string>;
    key: string;
  }) => {
    const { data, key, nlpTagsIntents } = args;
    const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;

    try {
      await axios({
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
    } catch (e) {
      logger.error('some error in the nlp train');
      return null;
    }
  };

  public fetchFreeTrain = async (args: {
    dataSets: Array<{ intent: string; utterances: Array<string> }>;
    key: string;
  }) => {
    const { key, dataSets } = args;
    const { NLP_APP_KEY, NLP_SERVER_URL, logger } = this.options;

    try {
      await axios({
        method: 'post',
        url: `${NLP_SERVER_URL}/free-train`,
        data: {
          key: `${NLP_APP_KEY}${key}`,
          dataSets
        }
      });
    } catch (e) {
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

  public getNlpMapping = async (args: {
    text: string;
    key: string;
    intentGetter: string;
  }): Promise<Array<{ value: string; score: number }>> => {
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

    return compact(
      classifications.map((classification) => {
        const { intent, score } = classification;
        if (score === 0) return undefined;

        const value = stringExtract(intentGetter, intent)?.[0];

        if (!value) return undefined;

        return {
          value,
          score
        };
      })
    );
  };
}
