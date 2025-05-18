"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSimilarityServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_1 = require("../../utils/general");
const schemas_2 = require("../../utils/schemas");
const mongodb_1 = require("mongodb");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class ProductSimilarityServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(postServices, classifiersServices, nlpServices, businessServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.postServices = postServices;
        this.classifiersServices = classifiersServices;
        this.nlpServices = nlpServices;
        this.businessServices = businessServices;
        /**
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         * Product Similarity
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         */
        this.getSimilarity = async ({ product }) => {
            const similarity = await this.getOne({
                query: {
                    productId: product._id
                }
            });
            if (!similarity) {
                return await this.addOne({
                    productId: product._id,
                    productName: product.name,
                    productScores: [],
                    classfiersScores: []
                });
            }
            return similarity;
        };
        this.updateClassfiersScores = async () => {
            const allPosts = await this.postServices.getAll({ query: {} });
            const handle = async (product) => {
                const text = product.name;
                const response = await this.classifiersServices.process({ text });
                if (!response)
                    return;
                const { classifications } = response;
                const similarity = await this.getSimilarity({ product });
                similarity.classfiersScores = (0, general_1.compact)(classifications.map((classification) => {
                    if (!classification.score)
                        return null;
                    if (!mongodb_1.ObjectId.isValid(classification.intent))
                        return null;
                    //@ts-expect-error this type is correct. Mongo does to right conversion here
                    const classifierId = classification.intent;
                    return {
                        classifierId,
                        score: classification.score
                    };
                }));
                await similarity.save();
            };
            const promises = allPosts.map(handle);
            await Promise.all(promises);
        };
        this.updateProductScores = async () => {
            const allProducts = await this.postServices.getAll({ query: {} });
            const allSimilarities = await this.getAll({
                query: {
                    productId: (0, schemas_2.getInArrayQuery)(allProducts.map((product) => product._id))
                }
            });
            const handle = async (currentSimilarity) => {
                const currentScores = (currentSimilarity === null || currentSimilarity === void 0 ? void 0 : currentSimilarity.classfiersScores) || [];
                const currentProductId = currentSimilarity.productId;
                currentSimilarity.productScores = (0, general_1.compact)(allSimilarities.map((matcherSimilarity) => {
                    const matcherScores = (matcherSimilarity === null || matcherSimilarity === void 0 ? void 0 : matcherSimilarity.classfiersScores) || [];
                    const matcheProductId = matcherSimilarity.productId;
                    if ((0, general_1.isEqualIds)(currentProductId, matcheProductId))
                        return null;
                    const commonScores = currentScores.filter((currentScore) => {
                        return matcherScores.some((matcherScore) => {
                            return (0, general_1.isEqualIds)(currentScore.classifierId, matcherScore.classifierId);
                        });
                    });
                    const score = commonScores === null || commonScores === void 0 ? void 0 : commonScores.reduce((acc, { score }) => acc + score, 0);
                    if (!score)
                        return null;
                    return {
                        productId: matcherSimilarity.productId,
                        productName: matcherSimilarity.productName,
                        score
                    };
                }));
                currentSimilarity.productScores.sort((a, b) => b.score - a.score);
                await currentSimilarity.save();
            };
            const promises = allSimilarities.map(handle);
            await Promise.all(promises);
        };
    }
}
exports.ProductSimilarityServices = ProductSimilarityServices;
