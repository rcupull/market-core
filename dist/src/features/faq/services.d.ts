import { Faq, FaqDto } from './types';
import { GetAllFaqsArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { FileServices } from '../files/services';
import { NlpServices } from '../nlp/services';
export declare class FaqServices extends ModelCrudTemplate<Faq, Pick<Faq, 'question' | 'answer' | 'hidden' | 'relatedIds' | 'interestingFor'>, GetAllFaqsArgs> {
    private readonly fileServices;
    private readonly nlpServices;
    constructor(fileServices: FileServices, nlpServices: NlpServices);
    private getNlpKey;
    trainingNlpFaqs: () => Promise<void>;
    getNlpSuggestions: (args: {
        search: string;
    }) => Promise<Array<string>>;
    removeUnusedImages: () => Promise<void>;
    getDto: (faqs: Array<Faq>) => Promise<Array<FaqDto>>;
}
