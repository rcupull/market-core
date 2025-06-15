"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDtosServices = void 0;
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
class SearchDtosServices {
    constructor(businessServices, shoppingServices, postServices) {
        this.businessServices = businessServices;
        this.shoppingServices = shoppingServices;
        this.postServices = postServices;
        this.getPostsResources = async (posts) => {
            const { getOnePostShoppingData } = await this.shoppingServices.getShoppingDataFromPosts({
                posts
            });
            const { getOneBusinessData } = await this.businessServices.getBusinessDataFrom({
                query: {
                    routeName: (0, schemas_1.getInArrayQuery)(posts.map(({ routeName }) => routeName))
                }
            });
            const { getCopyAndFlattenPost } = await this.postServices.useGetCopyAndFlattenPost();
            const { getReviewSummary } = await this.postServices.getReviewSummaryData({
                posts
            });
            const { getReviews } = await this.postServices.getReviewsData({
                posts
            });
            return {
                getOnePostShoppingData,
                getOneBusinessData,
                getCopyAndFlattenPost,
                getReviewSummary,
                getReviews
            };
        };
        this.getSearchDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData, getReviewSummary } = await this.getPostsResources(posts);
            const getSearchPostDto = async (post) => {
                const { stockAmountAvailable } = getOnePostShoppingData(post);
                const { reviewSummary } = getReviewSummary(post);
                const { businessType, businessName, businessAllowedOnlyCUPinCash } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: true,
                        transformCurrencyAndPrice: true
                    }),
                    searchDtoReturnType: types_1.NlpSearchReturnType.POST,
                    stockAmountAvailable,
                    businessType,
                    businessName,
                    businessAllowedOnlyCUPinCash,
                    reviewSummary
                };
            };
            /**
             *  ////////////////////////////////////////////////////////////////
             */
            /**
             * ////////////////////////////////////////////////////////////
             */
            const out = await Promise.all(posts.map(getSearchPostDto));
            return out;
        };
    }
}
exports.SearchDtosServices = SearchDtosServices;
