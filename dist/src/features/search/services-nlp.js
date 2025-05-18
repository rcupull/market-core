"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServicesNLP = void 0;
const general_1 = require("../../utils/general");
const getBusinessNLPKey = (routeName) => `_business_${routeName}`;
const getMarketPlaceNLPKey = () => '_marketPlaceKey';
const getProductIntent = (productName) => `productName.${productName}`;
const getProductIntentGetter = () => 'productName.{val}';
class SearchServicesNLP {
    constructor(nlpServices, businessServices, postServices) {
        this.nlpServices = nlpServices;
        this.businessServices = businessServices;
        this.postServices = postServices;
        /**
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         * Searching
         * //////////////////////////////////////////////////////////////////////////
         * //////////////////////////////////////////////////////////////////////////
         */
        this.searchInMarketplace = async ({ search }) => {
            const out = await this.nlpServices.getNlpMapping({
                text: search,
                key: getMarketPlaceNLPKey(),
                intentGetter: getProductIntentGetter()
            });
            return out.map(({ score, value }) => ({ productName: value, score }));
        };
        this.searchInBusiness = async ({ search, routeName }) => {
            const out = await this.nlpServices.getNlpMapping({
                text: search,
                key: getBusinessNLPKey(routeName),
                intentGetter: getProductIntentGetter()
            });
            return out.map(({ score, value }) => ({ productName: value, score }));
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
            const allProducts = await this.postServices.getAll({
                query: {
                    hidden: false,
                    hiddenBusiness: false
                }
            });
            await this.nlpServices.fetchFreeTrain({
                key: getMarketPlaceNLPKey(),
                dataSets: allProducts.map((product) => ({
                    intent: getProductIntent(product.name),
                    utterances: (0, general_1.compact)([product.name])
                }))
            });
        };
        this.trainingOneBusiness = async (routeName) => {
            const allProducts = await this.postServices.getAll({
                query: {
                    routeName,
                    hidden: false,
                    hiddenBusiness: false
                }
            });
            await this.nlpServices.fetchFreeTrain({
                key: getBusinessNLPKey(routeName),
                dataSets: allProducts.map((product) => ({
                    intent: getProductIntent(product.name),
                    utterances: (0, general_1.compact)([product.name])
                }))
            });
        };
        this.trainingAllBusiness = async () => {
            const allBusinesses = await this.businessServices.getAll({
                query: {
                    hidden: false
                }
            });
            const promises = allBusinesses.map(({ routeName }) => this.trainingOneBusiness(routeName));
            await Promise.all(promises);
        };
    }
}
exports.SearchServicesNLP = SearchServicesNLP;
