"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassifiersServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class ClassifiersServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(nlpServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.nlpServices = nlpServices;
        this.getNlpClassifierKey = () => `_classifiers`;
        this.process = async ({ text }) => {
            const response = await this.nlpServices.fetchProcess({
                key: this.getNlpClassifierKey(),
                text
            });
            return response;
        };
        this.trainning = async ({ dataSets }) => {
            await this.nlpServices.fetchFreeTrain({
                key: this.getNlpClassifierKey(),
                dataSets
            });
        };
    }
}
exports.ClassifiersServices = ClassifiersServices;
