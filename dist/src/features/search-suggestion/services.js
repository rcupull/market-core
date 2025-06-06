"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSuggestionServices = void 0;
class SearchSuggestionServices {
    constructor(configServices, searchEmbeddingSuggestionServices) {
        this.configServices = configServices;
        this.searchEmbeddingSuggestionServices = searchEmbeddingSuggestionServices;
        this.searchSuggestionProducts = async ({ search }) => {
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
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                const products = await this.searchEmbeddingSuggestionServices.searchSuggestionProducts({
                    search,
                    limit: 1
                });
                const similar = await Promise.all(products.map((productScore) => {
                    return this.searchEmbeddingSuggestionServices.searchSimilarSuggestionProducts({
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
        this.trainingSearchSuggestions = async () => {
            const { getEnabledFeature } = await this.configServices.features();
            if (getEnabledFeature('MAIN_SEARCH_USING_EMBEDDING')) {
                return await this.searchEmbeddingSuggestionServices.trainingSearchSuggestions();
            }
            return;
        };
    }
}
exports.SearchSuggestionServices = SearchSuggestionServices;
