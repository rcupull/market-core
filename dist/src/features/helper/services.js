"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_1 = require("../../utils/general");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const ckeditor_1 = require("../../utils/ckeditor");
class HelperServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(fileServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.fileServices = fileServices;
        this.getHelperSlugFromTitle = (title) => (0, utils_1.getHelperSlugFromTitle)(title);
        this.removeUnusedImages = async () => {
            const helpers = await this.getAll({ query: {} });
            const helperImagesSrcInText = (0, ckeditor_1.getAllImageSrcFromRichText)(helpers.map((faq) => faq.content));
            const helperImagesSrcInBucket = await this.fileServices.getAllObjectBucket('images/helpers/');
            this.fileServices.imagesDeleteMany({
                newImages: (0, general_1.compact)(helperImagesSrcInText).map((src) => ({
                    src,
                    height: 0,
                    width: 0
                })),
                oldImages: (0, general_1.compact)(helperImagesSrcInBucket).map((src) => ({
                    src,
                    height: 0,
                    width: 0
                }))
            });
        };
    }
}
exports.HelperServices = HelperServices;
