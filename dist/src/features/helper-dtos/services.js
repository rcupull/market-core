"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperDtosServices = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
class HelperDtosServices {
    constructor(helperServices) {
        this.helperServices = helperServices;
        this.getHelperDto = async (helpers) => {
            const allRelated = await this.helperServices.getAll({
                query: {
                    _id: (0, schemas_1.getInArrayQuery)(helpers.map((helper) => helper.relatedIds || []).flat())
                }
            });
            const getDto = (helper) => {
                return {
                    ...(0, general_1.deepJsonCopy)(helper),
                    relatedHelpers: (0, general_1.compact)((helper.relatedIds || []).map((relatedId) => {
                        const relatedHelper = allRelated.find((faq) => (0, general_1.isEqualIds)(faq.id, relatedId));
                        if (!relatedHelper) {
                            return undefined;
                        }
                        if (relatedHelper.hidden) {
                            return undefined;
                        }
                        return {
                            helperSlug: relatedHelper.helperSlug,
                            title: relatedHelper.title
                        };
                    }))
                };
            };
            return helpers.map(getDto);
        };
    }
}
exports.HelperDtosServices = HelperDtosServices;
