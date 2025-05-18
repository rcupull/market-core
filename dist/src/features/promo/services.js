"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoServices = void 0;
const types_1 = require("./types");
const utils_1 = require("./utils");
const schemas_1 = require("./schemas");
const general_1 = require("../../utils/general");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class PromoServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(postServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.postServices = postServices;
        this.getDtos = async (promos) => {
            const handle = async (promo) => {
                return {
                    ...(0, general_1.deepJsonCopy)(promo),
                    postSlug: undefined,
                    routeName: undefined,
                    ...(await (async () => {
                        const { entityId, entityType } = promo;
                        if (entityType === types_1.PromoEntityType.PRODUCT) {
                            const post = await this.postServices.getOne({
                                query: {
                                    _id: entityId
                                },
                                projection: {
                                    routeName: 1,
                                    postSlug: 1
                                }
                            });
                            if (post) {
                                return {
                                    postSlug: post.postSlug,
                                    routeName: post.routeName
                                };
                            }
                        }
                        return {};
                    })())
                };
            };
            const out = await Promise.all(promos.map(handle));
            return out;
        };
    }
}
exports.PromoServices = PromoServices;
