"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const general_1 = require("../../utils/general");
const schemas_2 = require("../../utils/schemas");
const ModelCrudWithQdrant_1 = require("../../utils/ModelCrudWithQdrant");
class PostServices extends ModelCrudWithQdrant_1.ModelCrudWithQdrant {
    constructor(userServices, reviewServices, options) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery, options);
        this.userServices = userServices;
        this.reviewServices = reviewServices;
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
                    const postReviews = allReviews.filter((review) => (0, general_1.isEqualIds)(review.postId, post._id));
                    const reviews = postReviews.map((review) => {
                        const { reviewerId } = review;
                        const reviewer = allReviewers.find(({ _id }) => (0, general_1.isEqualIds)(_id, reviewerId));
                        return {
                            ...(0, general_1.deepJsonCopy)(review),
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
                    const postReviews = allReviews.filter((review) => (0, general_1.isEqualIds)(review.postId, post._id));
                    const reviewSummary = {
                        starSummary: [0, 0, 0, 0, 0],
                        reviewerIds: []
                    };
                    postReviews.forEach(({ star, reviewerId }) => {
                        if ((0, general_1.isNumber)(star)) {
                            reviewSummary.starSummary[star - 1] += 1;
                        }
                        reviewSummary.reviewerIds.push(reviewerId.toString());
                    });
                    return { reviewSummary };
                }
            };
        };
    }
}
exports.PostServices = PostServices;
