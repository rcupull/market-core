"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEmbeddingSuggestionServices = void 0;
const general_1 = require("../../utils/general");
const allProductsCollectionName = 'allProductsSearchSuggestions';
class SearchEmbeddingSuggestionServices {
    constructor(postServices) {
        this.postServices = postServices;
        this.searchSuggestionProducts = async ({ search, limit }) => {
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
        this.searchSimilarSuggestionProducts = async ({ productScore, limit, productId }) => {
            if (productScore) {
                const { vector } = productScore;
                const out = await this.postServices.qdrantSearch(allProductsCollectionName, {
                    vector,
                    limit
                });
                return out.map((s) => ({
                    score: s.score,
                    vector: s.vector,
                    productName: s.payload.productName,
                    productId: s.payload.productId
                }));
            }
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
                    return (0, general_1.compact)(out).map((s) => ({
                        score: s.score,
                        vector: s.vector,
                        productName: s.payload.productName,
                        productId: s.payload.productId
                    }));
                }
            }
            return [];
        };
        this.trainingSearchSuggestions = async () => {
            await this.postServices.qdrantUpdateAllVectors(allProductsCollectionName, {
                query: {
                    hidden: false,
                    hiddenBusiness: false
                },
                getTextFromDoc: (post) => {
                    const { name } = post;
                    if (!name)
                        return null;
                    let out = `${(0, general_1.line)(5, name).join('.')}`;
                    out = `${out}`;
                    return out;
                }
            });
        };
    }
}
exports.SearchEmbeddingSuggestionServices = SearchEmbeddingSuggestionServices;
