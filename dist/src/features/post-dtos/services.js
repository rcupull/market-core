"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostDtosServices = void 0;
const schemas_1 = require("../../utils/schemas");
class PostDtosServices {
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
        this.getPostsDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData, getReviewSummary, getReviews } = await this.getPostsResources(posts);
            const getPostDto = async (post) => {
                const { stockAmountAvailable } = getOnePostShoppingData(post);
                const { reviewSummary } = getReviewSummary(post);
                const { reviews } = getReviews(post);
                const { businessType, businessName } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: true,
                        transformCurrencyAndPrice: true
                    }),
                    stockAmountAvailable,
                    businessType,
                    businessName,
                    reviewSummary,
                    reviews
                };
            };
            const promises = posts.map(getPostDto);
            const out = await Promise.all(promises);
            return out;
        };
        this.getPostsOwnerDto = async (posts) => {
            const { getCopyAndFlattenPost, getOneBusinessData, getOnePostShoppingData } = await this.getPostsResources(posts);
            const getPostDto = async (post) => {
                const { amountInProcess, stockAmountAvailable, stockAmount } = getOnePostShoppingData(post);
                const { businessType } = getOneBusinessData({
                    routeName: post.routeName
                });
                return {
                    ...getCopyAndFlattenPost(post, {
                        transformCurrenciesOfSale: false,
                        transformCurrencyAndPrice: false
                    }),
                    stockAmount,
                    stockAmountAvailable,
                    amountInProcess,
                    businessType
                };
            };
            const promises = posts.map(getPostDto);
            const out = await Promise.all(promises);
            return out;
        };
    }
}
exports.PostDtosServices = PostDtosServices;
