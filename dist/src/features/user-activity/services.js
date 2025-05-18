"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityServices = void 0;
const schemas_1 = require("./schemas");
const general_1 = require("../../utils/general");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const globalIdentifier = 'globalActivity';
class UserActivityServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(webTrackingServices, postServices) {
        super(schemas_1.modelGetter);
        this.webTrackingServices = webTrackingServices;
        this.postServices = postServices;
        this.getUserActivity = async ({ userId }) => {
            const userActivity = await this.getOne({
                query: {
                    identifier: userId
                }
            });
            if (!userActivity) {
                return await this.addOne({
                    identifier: userId.toString(),
                    products: []
                });
            }
            return userActivity;
        };
        this.getGlobalActivity = async () => {
            const globalActivity = await this.getOne({
                query: {
                    identifier: globalIdentifier
                }
            });
            if (!globalActivity) {
                return await this.addOne({
                    identifier: globalIdentifier,
                    products: []
                });
            }
            return globalActivity;
        };
        this.trainGlobal = async () => {
            const posts = await this.postServices.getAll({ query: {} });
            const reviewScores = await this.getReviewScores({ posts });
            const globalActivity = await this.getGlobalActivity();
            const products = posts.map((post, index) => {
                var _a;
                let score = 0;
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * add to score to product reviews
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                const productReviewScore = ((_a = reviewScores[index]) === null || _a === void 0 ? void 0 : _a.score) || 0;
                score = score + productReviewScore * 0.1;
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * return
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                return {
                    productId: post._id,
                    score
                };
            });
            globalActivity.products = (0, utils_1.normalizeScores)(products);
            await globalActivity.save();
        };
        this.trainUser = async ({ userId }) => {
            const userWebTrackings = await this.webTrackingServices.getAll({
                query: {
                    userId
                }
            });
            const allProducts = await this.postServices.getAll({
                query: {},
                projection: {
                    _id: 1
                }
            });
            const userActivity = await this.getUserActivity({ userId });
            const products = allProducts.map((product) => {
                let score = 0;
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * add to score if user clicked on product card and add to cart
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                score = userWebTrackings.reduce((acc, { type, data }) => {
                    if ((data === null || data === void 0 ? void 0 : data.productId) && (0, general_1.isEqualIds)(data === null || data === void 0 ? void 0 : data.productId, product._id)) {
                        switch (type) {
                            case 'page.main.addToCart.click':
                            case 'page.business.addToCart.click':
                            case 'page.product.addToCart.click':
                            case 'page.product.related.addToCart.click':
                                return acc + 0.4;
                            case 'page.main.productCard.click':
                            case 'page.business.productCard.click':
                            case 'page.product.related.productCard.click':
                                return acc + 0.2;
                            default:
                                return acc;
                        }
                    }
                    return acc;
                }, score);
                /**
                 * //////////////////////////////////////////////////////////////////////////////
                 * return
                 * //////////////////////////////////////////////////////////////////////////////
                 */
                return {
                    productId: product._id,
                    score
                };
            });
            userActivity.products = (0, utils_1.normalizeScores)(products);
            await userActivity.save();
        };
        this.getReviewScores = async ({ posts }) => {
            const { getReviews } = await this.postServices.getReviewsData({ posts });
            const reviewScores = posts.map((post) => {
                const { reviews } = getReviews(post);
                const score = (() => {
                    if (!(reviews === null || reviews === void 0 ? void 0 : reviews.length))
                        return 0;
                    const acc = reviews === null || reviews === void 0 ? void 0 : reviews.reduce((acc, { star = 0 }) => acc + star, 0);
                    const mean = acc / reviews.length;
                    return mean;
                })();
                return {
                    productId: post._id,
                    score
                };
            });
            return (0, utils_1.normalizeScores)(reviewScores);
        };
    }
}
exports.UserActivityServices = UserActivityServices;
