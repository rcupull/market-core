import { Classifier } from './types';
import { GetAllClassifiersArgs } from './utils';
import { QueryHandle } from '../../types/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { NlpServices } from '../nlp/services';
import { NplProcessResponse } from '../nlp/types';
export declare class ClassifiersServices extends ModelCrudTemplate<Classifier, Pick<Classifier, 'label' | 'tags' | 'hidden' | 'type'>, GetAllClassifiersArgs> {
    private readonly nlpServices;
    constructor(nlpServices: NlpServices);
    getNlpClassifierKey: () => string;
    process: QueryHandle<{
        text: string;
    }, NplProcessResponse | null>;
    trainning: QueryHandle<{
        dataSets: Array<{
            intent: string;
            utterances: Array<string>;
        }>;
    }>;
}
