"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const general_1 = require("../../types/general");
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_2 = require("../../utils/general");
const schemas_2 = require("../../utils/schemas");
const ModelCrudWithQdrant_1 = require("../../utils/ModelCrudWithQdrant");
const price_1 = require("../../utils/price");
class PostServices extends ModelCrudWithQdrant_1.ModelCrudWithQdrant {
    constructor(userServices, reviewServices, configServices, options) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery, options);
        this.userServices = userServices;
        this.reviewServices = reviewServices;
        this.configServices = configServices;
        this.getPostSlugFromName = (name) => (0, utils_1.getPostSlugFromName)(name);
        this.changeStock = async ({ postId, amount, updatedByShopping, updatedByUser }) => {
            const out = await this.findOneAndUpdate({
                query: {
                    _id: postId
                },
                update: {
                    $inc: {
                        stockAmount: amount
                    },
                    $push: {
                        stockAmountHistory: {
                            amount,
                            updatedAt: new Date(),
                            updatedByUser,
                            updatedByShopping
                        }
                    }
                }
            });
            return out;
        };
        this.getReviewsData = async ({ posts }) => {
            const allReviews = await this.reviewServices.getAll({
                query: {
                    postId: (0, schemas_2.getInArrayQuery)(posts.map(({ _id }) => _id))
                }
            });
            const allReviewers = await this.userServices.getAll({
                query: {
                    _id: (0, schemas_2.getInArrayQuery)(allReviews.map(({ reviewerId }) => reviewerId))
                },
                projection: {
                    name: 1,
                    _id: 1
                }
            });
            return {
                getReviews: (post) => {
                    const postReviews = allReviews.filter((review) => (0, general_2.isEqualIds)(review.postId, post._id));
                    const reviews = postReviews.map((review) => {
                        const { reviewerId } = review;
                        const reviewer = allReviewers.find(({ _id }) => (0, general_2.isEqualIds)(_id, reviewerId));
                        return {
                            ...(0, general_2.deepJsonCopy)(review),
                            reviewerName: reviewer === null || reviewer === void 0 ? void 0 : reviewer.name
                        };
                    });
                    return { reviews };
                }
            };
        };
        this.getReviewSummaryData = async ({ posts }) => {
            const allReviews = await this.reviewServices.getAll({
                query: {
                    postId: (0, schemas_2.getInArrayQuery)(posts.map(({ _id }) => _id))
                }
            });
            return {
                getReviewSummary: (post) => {
                    const postReviews = allReviews.filter((review) => (0, general_2.isEqualIds)(review.postId, post._id));
                    const reviewSummary = {
                        starSummary: [0, 0, 0, 0, 0],
                        reviewerIds: []
                    };
                    postReviews.forEach(({ star, reviewerId }) => {
                        if ((0, general_2.isNumber)(star)) {
                            reviewSummary.starSummary[star - 1] += 1;
                        }
                        reviewSummary.reviewerIds.push(reviewerId.toString());
                    });
                    return { reviewSummary };
                }
            };
        };
        this.useGetCopyAndFlattenPost = async () => {
            const { getEnabledFeature } = await this.configServices.features();
            /**
             * TODO improve this query
             */
            const config = await this.configServices.adminConfigServicesGetOne({
                projection: {
                    exchangeRates: 1
                }
            });
            const getCopyAndFlattenPost = (post, options) => {
                var _a, _b;
                const { transformCurrenciesOfSale, transformCurrencyAndPrice } = options || {};
                const out = {
                    ...(0, general_2.deepJsonCopy)(post),
                    amountInProcess: undefined,
                    reviews: undefined,
                    stockAmountAvailable: undefined,
                    reviewSummary: undefined,
                    businessType: undefined,
                    businessName: undefined,
                    businessAllowedOnlyCUPinCash: undefined
                };
                if (transformCurrenciesOfSale) {
                    /**
                     * ////////////////////////////////////////////////////////////////
                     * Remove USD from currencies of sale if the feature is disabled
                     * ////////////////////////////////////////////////////////////////
                     */
                    if (!getEnabledFeature('ALLOW_PAYMENT_USD') &&
                        ((_a = out.currenciesOfSale) === null || _a === void 0 ? void 0 : _a.includes(general_1.Currency.USD))) {
                        out.currenciesOfSale = out.currenciesOfSale.filter((c) => c !== general_1.Currency.USD);
                    }
                    /**
                     * ////////////////////////////////////////////////////////////////
                     * Remove MLC from currencies of sale if the feature is disabled
                     * ////////////////////////////////////////////////////////////////
                     */
                    if (!getEnabledFeature('ALLOW_PAYMENT_TRANSFERMOVIL_MLC') &&
                        ((_b = out.currenciesOfSale) === null || _b === void 0 ? void 0 : _b.includes(general_1.Currency.MLC))) {
                        out.currenciesOfSale = out.currenciesOfSale.filter((c) => c !== general_1.Currency.MLC);
                    }
                }
                if (transformCurrencyAndPrice) {
                    /**
                     * ////////////////////////////////////////////////////////////
                     * Transform price to the first currency of sale if the feature is enabled
                     * ////////////////////////////////////////////////////////////
                     */
                    if (!getEnabledFeature('ALLOW_PAYMENT_USD') && out.currency === general_1.Currency.USD) {
                        const newCurrency = (() => {
                            var _a, _b;
                            if ((_a = out.currenciesOfSale) === null || _a === void 0 ? void 0 : _a.includes(general_1.Currency.MLC)) {
                                return general_1.Currency.MLC;
                            }
                            if ((_b = out.currenciesOfSale) === null || _b === void 0 ? void 0 : _b.includes(general_1.Currency.CUP)) {
                                return general_1.Currency.CUP;
                            }
                            return null;
                        })();
                        if (newCurrency) {
                            out.price = (0, price_1.getConvertedPrice)({
                                price: out.price || 0,
                                currentCurrency: out.currency,
                                desiredCurrency: newCurrency,
                                exchangeRates: config === null || config === void 0 ? void 0 : config.exchangeRates
                            });
                            out.currency = newCurrency;
                        }
                        else {
                            out.hiddenToCustomers = true;
                        }
                    }
                    if (!getEnabledFeature('ALLOW_PAYMENT_TRANSFERMOVIL_MLC') &&
                        out.currency === general_1.Currency.MLC) {
                        const newCurrency = (() => {
                            var _a, _b;
                            if ((_a = out.currenciesOfSale) === null || _a === void 0 ? void 0 : _a.includes(general_1.Currency.USD)) {
                                return general_1.Currency.USD;
                            }
                            if ((_b = out.currenciesOfSale) === null || _b === void 0 ? void 0 : _b.includes(general_1.Currency.CUP)) {
                                return general_1.Currency.CUP;
                            }
                            return null;
                        })();
                        if (newCurrency) {
                            out.price = (0, price_1.getConvertedPrice)({
                                price: out.price || 0,
                                currentCurrency: out.currency,
                                desiredCurrency: newCurrency,
                                exchangeRates: config === null || config === void 0 ? void 0 : config.exchangeRates
                            });
                            out.currency = newCurrency;
                        }
                        else {
                            out.hiddenToCustomers = true;
                        }
                    }
                }
                /**
                 * ////////////////////////////////////////////////////////////////
                 * ////////////////////////////////////////////////////////////////
                 * ////////////////////////////////////////////////////////////////
                 */
                return out;
            };
            return {
                getCopyAndFlattenPost
            };
        };
        this.getPostDataToShopping = async ({ post }) => {
            const { getCommissionsForProduct } = await this.configServices.adminConfigExangesRatesUtils();
            const { getCopyAndFlattenPost } = await this.useGetCopyAndFlattenPost();
            const { _id, price, images, routeName, name, currency, currenciesOfSale } = getCopyAndFlattenPost(post, {
                transformCurrenciesOfSale: true,
                transformCurrencyAndPrice: true
            });
            const { commissions } = getCommissionsForProduct(post);
            return {
                _id,
                name,
                routeName,
                images,
                //
                salePrice: price || 0,
                currency,
                currenciesOfSale,
                //
                commissions
            };
        };
    }
}
exports.PostServices = PostServices;
