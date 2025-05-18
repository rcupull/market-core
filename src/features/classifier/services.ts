import { modelGetter } from './schemas';
import { Classifier } from './types';
import { GetAllClassifiersArgs, getAllFilterQuery } from './utils';
import { QueryHandle } from '../../types/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { NlpServices } from '../nlp/services';
import { NplProcessResponse } from '../nlp/types';

export class ClassifiersServices extends ModelCrudTemplate<
  Classifier,
  Pick<Classifier, 'label' | 'tags' | 'hidden' | 'type'>,
  GetAllClassifiersArgs
> {
  constructor(private readonly nlpServices: NlpServices) {
    super(modelGetter, getAllFilterQuery);
  }
  getNlpClassifierKey = () => `_classifiers`;

  process: QueryHandle<{ text: string }, NplProcessResponse | null> = async ({ text }) => {
    const response = await this.nlpServices.fetchProcess({
      key: this.getNlpClassifierKey(),
      text
    });

    return response;
  };

  trainning: QueryHandle<{ dataSets: Array<{ intent: string; utterances: Array<string> }> }> =
    async ({ dataSets }) => {
      await this.nlpServices.fetchFreeTrain({
        key: this.getNlpClassifierKey(),
        dataSets
      });
    };
}
