"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServices = void 0;
const schemas_1 = require("../../utils/schemas");
class SearchServices {
    constructor(configServices, productSimilarityServices, searchServicesNLP, searchServicesEmbeddings) {
        this.configServices = configServices;
        this.productSimilarityServices = productSimilarityServices;
        this.searchServicesNLP = searchServicesNLP;
        this.searchServicesEmbeddings = searchServicesEmbeddings;
        this.searchInMarketplace = async ({ search }) => {
            if (!search) {
                return {
                    productScores: [],
                    similarProductScores: []
                };
            }
            const { getEnabledFeature } = await this.configServices.features();
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                const productScores = await this.searchServicesNLP.searchInMarketplace({ search });
                return {
                    productScores,
                    similarProductScores: await (async () => {
                        if (getEnabledFeature('MAIN_SEARCH_USING_PRODUCT_SIMILARITY')) {
                            const out = await this.productSimilarityServices.getAll({
                                query: {
                                    productName: (0, schemas_1.getInArrayQuery)(productScores.map(({ productName }) => productName))
                                }
                            });
                            return out.map(({ productScores }) => productScores).flat();
                        }
                        return [];
                    })()
                };
            }
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                const products = await this.searchServicesEmbeddings.searchInMarketplace({
                    search,
                    limit: 1
                });
                const similar = await Promise.all(products.map((productScore) => {
                    return this.searchServicesEmbeddings.searchSimilarProducts({
                        productScore,
                        limit: 20
                    });
                }));
                return {
                    productScores: products.map(({ productName, score }) => ({ score, productName })),
                    similarProductScores: similar.flat().map(({ productName, score }) => ({
                        score,
                        productName
                    }))
                };
            }
            return {
                productScores: [],
                similarProductScores: []
            };
        };
        this.getRelatedToProductMapping = async ({ postId }) => {
            const { getEnabledFeature } = await this.configServices.features();
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                const productScores = await this.productSimilarityServices.getOne({
                    query: {
                        productId: postId
                    }
                });
                const similarityProducts = await this.productSimilarityServices.getAll({
                    query: {
                        productName: (0, schemas_1.getInArrayQuery)(((productScores === null || productScores === void 0 ? void 0 : productScores.productScores) || []).map(({ productName }) => productName))
                    }
                });
                const similarProductScores = similarityProducts
                    .map(({ productScores }) => productScores)
                    .flat();
                return {
                    similarProductScores
                };
            }
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                const similar = await this.searchServicesEmbeddings.searchSimilarProducts({
                    productId: postId
                });
                return {
                    similarProductScores: similar.map(({ productName, score }) => ({
                        score,
                        productName
                    }))
                };
            }
            return {
                similarProductScores: []
            };
        };
        this.searchInBusiness = async ({ search, routeName }) => {
            if (!search) {
                return {
                    productScores: [],
                    similarProductScores: []
                };
            }
            const { getEnabledFeature } = await this.configServices.features();
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                const productScores = await this.searchServicesNLP.searchInBusiness({
                    search,
                    routeName
                });
                return {
                    productScores,
                    similarProductScores: []
                };
            }
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                return {
                    productScores: [],
                    similarProductScores: []
                };
                /**
                 * DEVELOPING
                 */
                // const out = await this.productEmbeddingServices.search({ text: search, topK: 5 });
                // const out = await this.embeddingServices.searchProducts({ search });
                // return out.map(({ productName, score }) => ({
                //   score,
                //   productName
                // }));
            }
            return {
                productScores: [],
                similarProductScores: []
            };
        };
        this.trainingMarketplace = async () => {
            const { getEnabledFeature } = await this.configServices.features();
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                return await this.searchServicesNLP.trainingMarketplace();
            }
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                return await this.searchServicesEmbeddings.trainingMarketplace();
            }
            return;
        };
        this.trainingOneBusiness = async (routeName) => {
            const { getEnabledFeature } = await this.configServices.features();
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                return await this.searchServicesNLP.trainingOneBusiness(routeName);
            }
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                //TODO
                return;
            }
            return;
        };
        this.trainingAllBusiness = async () => {
            const { getEnabledFeature } = await this.configServices.features();
            if (getEnabledFeature('MAIN_SEARCH_USING_NLP')) {
                return await this.searchServicesNLP.trainingAllBusiness();
            }
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                //TODO
                return;
            }
            return;
        };
    }
}
exports.SearchServices = SearchServices;
