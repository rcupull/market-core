import { modelGetter } from './schemas';
import { Faq, FaqDto } from './types';

import { GetAllFaqsArgs, getAllFilterQuery } from './utils';
import { compact, deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { FileServices } from '../files/services';
import { NlpServices } from '../nlp/services';
import { getAllImageSrcFromRichText } from '../../utils/ckeditor';

const intentGetterFaqQuestion = 'faqs.question.{val}';
const intentFaqQuestion = 'faqs.question.{question}';

export class FaqServices extends ModelCrudTemplate<
  Faq,
  Pick<Faq, 'question' | 'answer' | 'hidden' | 'relatedIds' | 'interestingFor'>,
  GetAllFaqsArgs
> {
  constructor(
    private readonly fileServices: FileServices,
    private readonly nlpServices: NlpServices
  ) {
    super(modelGetter, getAllFilterQuery);
  }

  private getNlpKey = () => `_faqs`;

  trainingNlpFaqs = async () => {
    const allFaqs = await this.getAll({
      query: {
        hidden: false
      }
    });

    await this.nlpServices.fetchTrain({
      key: this.getNlpKey(),
      nlpTagsIntents: [intentFaqQuestion],
      data: allFaqs.map(({ question }) => ({
        question
      }))
    });
  };

  getNlpSuggestions = async (args: { search: string }): Promise<Array<string>> => {
    const { search } = args;

    if (!search) {
      return [];
    }

    const questions = await this.nlpServices.getNlpMapping({
      text: search,
      key: this.getNlpKey(),
      intentGetter: intentGetterFaqQuestion
    });

    return questions.map(({ value }) => value);
  };

  removeUnusedImages = async () => {
    const faqs = await this.getAll({ query: {} });

    const faqImagesSrcInText = getAllImageSrcFromRichText(faqs.map((faq) => faq.answer));
    const faqImagesSrcInBucket = await this.fileServices.getAllObjectBucket('images/faqs/');

    this.fileServices.imagesDeleteMany({
      newImages: compact(faqImagesSrcInText).map((src) => ({
        src,
        height: 0,
        width: 0
      })),
      oldImages: compact(faqImagesSrcInBucket).map((src) => ({
        src,
        height: 0,
        width: 0
      }))
    });
  };

  getDto = async (faqs: Array<Faq>): Promise<Array<FaqDto>> => {
    const allRelated = await this.getAll({
      query: {
        _id: getInArrayQuery(faqs.map((faq) => faq.relatedIds || []).flat())
      }
    });

    const getDto = (faq: Faq): FaqDto => {
      return {
        ...deepJsonCopy(faq),
        relatedFaqs: compact(
          (faq.relatedIds || []).map((relatedId) => {
            const relatedFaq = allRelated.find((faq) => isEqualIds(faq.id, relatedId));

            if (!relatedFaq) {
              return undefined;
            }

            if (relatedFaq.hidden) {
              return undefined;
            }

            return {
              _id: relatedFaq._id,
              question: relatedFaq.question
            };
          })
        )
      };
    };

    return faqs.map(getDto);
  };
}
