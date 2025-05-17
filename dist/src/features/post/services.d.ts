import { Schema } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { Post, PostReviewDto, PostReviewSummary } from './types';
import { GetAllPostArgs } from './utils';
import { ModelCrudWithQdrant, ModelCrudWithQdrantOptions } from '../../utils/ModelCrudWithQdrant';
import { UserServices } from '../user/services';
import { ReviewServices } from '../review/services';
interface PostQdrantPayload {
    productId: string;
    productName: string;
}
export declare class PostServices extends ModelCrudWithQdrant<Post, Pick<Post, 'hidden' | 'description' | 'images' | 'price' | 'currency' | 'currenciesOfSale' | 'routeName' | 'name' | 'postSlug' | 'clothingSizes' | 'colors' | 'details' | 'highlights' | 'createdBy' | 'postCategoriesLabels' | 'categoryIds' | 'postType' | 'postLink' | 'discount'>, GetAllPostArgs, PostQdrantPayload> {
    private readonly userServices;
    private readonly reviewServices;
    constructor(userServices: UserServices, reviewServices: ReviewServices, options: ModelCrudWithQdrantOptions<Post, PostQdrantPayload>);
    changeStock: QueryHandle<{
        postId: Schema.Types.ObjectId;
        amount: number;
        updatedByUser?: Schema.Types.ObjectId;
        updatedByShopping?: Schema.Types.ObjectId;
    }, ModelDocument<Post> | null>;
    getReviewsData: QueryHandle<{
        posts: Array<Post>;
    }, {
        getReviews: (post: Post) => {
            reviews: Array<PostReviewDto>;
        };
    }>;
    getReviewSummaryData: QueryHandle<{
        posts: Array<Post>;
    }, {
        getReviewSummary: (post: Post) => {
            reviewSummary: PostReviewSummary;
        };
    }>;
}
export {};
