"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServicesEmbeddings = void 0;
const general_1 = require("../../utils/general");
const allProductsCollectionName = 'allProducts';
class SearchServicesEmbeddings {
    constructor(postServices, categoriesServices) {
        this.postServices = postServices;
        this.categoriesServices = categoriesServices;
        /**
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         * Searching
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         */
        this.searchInMarketplace = async ({ search, limit }) => {
            const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
                search,
                limit
            });
            return out.map(({ score, payload, vector }) => ({
                score,
                vector,
                productName: payload.productName,
                productId: payload.productId
            }));
        };
        this.searchSimilarProducts = async ({ productScore, limit, productId }) => {
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * searchin similar producst using vectors
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (productScore) {
                const { productId, vector } = productScore;
                const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
                    vector,
                    limit
                });
                return out
                    .filter((s) => !(0, general_1.isEqualIds)(s.payload.productId, productId))
                    .map((s) => ({
                    score: s.score,
                    vector: s.vector,
                    productName: s.payload.productName,
                    productId: s.payload.productId
                }));
            }
            /**
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             * searchin similar products using postIds
             * //////////////////////////////////////////////////////////////////////
             * //////////////////////////////////////////////////////////////////////
             */
            if (productId) {
                const point = await this.postServices.qdrantSearchOne(allProductsCollectionName, {
                    query: { productId }
                });
                if (point) {
                    const { vector } = point;
                    const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
                        vector,
                        limit
                    });
                    return (0, general_1.compact)(out)
                        .filter((s) => !(0, general_1.isEqualIds)(s.payload.productId, productId))
                        .map((s) => ({
                        score: s.score,
                        vector: s.vector,
                        productName: s.payload.productName,
                        productId: s.payload.productId
                    }));
                }
            }
            return [];
        };
        /**
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         * Training
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         */
        this.trainingMarketplace = async () => {
            const allCategories = await this.categoriesServices.getAll({ query: {} });
            const allSubCategories = allCategories.map(({ subCategories }) => subCategories).flat();
            await this.postServices.qdrantUpdateAllVectors(allProductsCollectionName, {
                query: {
                    hidden: false,
                    hiddenBusiness: false
                },
                getTextFromDoc: (post) => {
                    const { description, name, categoryIds } = post;
                    if (!description)
                        return null;
                    if (description.length < 50)
                        return null;
                    let out = `${(0, general_1.line)(5, name).join('.')}`;
                    out = `${out}. ${description}`;
                    if (categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.length) {
                        const productSubcategories = allSubCategories.filter((sub) => {
                            return categoryIds.some((id) => (0, general_1.isEqualIds)(id, sub._id));
                        });
                        out = `${out}. ${productSubcategories.map(({ label }) => label).join(',')}`;
                    }
                    return out;
                }
            });
        };
    }
}
exports.SearchServicesEmbeddings = SearchServicesEmbeddings;
