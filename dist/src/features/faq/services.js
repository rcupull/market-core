"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_1 = require("../../utils/general");
const schemas_2 = require("../../utils/schemas");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const ckeditor_1 = require("../../utils/ckeditor");
const intentGetterFaqQuestion = 'faqs.question.{val}';
const intentFaqQuestion = 'faqs.question.{question}';
class FaqServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(fileServices, nlpServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.fileServices = fileServices;
        this.nlpServices = nlpServices;
        this.getNlpKey = () => `_faqs`;
        this.trainingNlpFaqs = async () => {
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
        this.getNlpSuggestions = async (args) => {
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
        this.removeUnusedImages = async () => {
            const faqs = await this.getAll({ query: {} });
            const faqImagesSrcInText = (0, ckeditor_1.getAllImageSrcFromRichText)(faqs.map((faq) => faq.answer));
            const faqImagesSrcInBucket = await this.fileServices.getAllObjectBucket('images/faqs/');
            this.fileServices.imagesDeleteMany({
                newImages: (0, general_1.compact)(faqImagesSrcInText).map((src) => ({
                    src,
                    height: 0,
                    width: 0
                })),
                oldImages: (0, general_1.compact)(faqImagesSrcInBucket).map((src) => ({
                    src,
                    height: 0,
                    width: 0
                }))
            });
        };
        this.getDto = async (faqs) => {
            const allRelated = await this.getAll({
                query: {
                    _id: (0, schemas_2.getInArrayQuery)(faqs.map((faq) => faq.relatedIds || []).flat())
                }
            });
            const getDto = (faq) => {
                return {
                    ...(0, general_1.deepJsonCopy)(faq),
                    relatedFaqs: (0, general_1.compact)((faq.relatedIds || []).map((relatedId) => {
                        const relatedFaq = allRelated.find((faq) => (0, general_1.isEqualIds)(faq.id, relatedId));
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
                    }))
                };
            };
            return faqs.map(getDto);
        };
    }
}
exports.FaqServices = FaqServices;
