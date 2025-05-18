import { Schema } from 'mongoose';
import { ModelDocument, QueryHandle } from '../../types/general';
import { GetAllPostArgs, Post, PostDto, PostReviewDto, PostReviewSummary } from './types';
import { getPostSlugFromName } from './utils';
import { ModelCrudWithQdrant, ModelCrudWithQdrantOptions } from '../../utils/ModelCrudWithQdrant';
import { UserServices } from '../user/services';
import { ReviewServices } from '../review/services';
import { ShoppingPostData } from '../shopping/types';
import { ConfigServices } from '../config/services';
interface PostQdrantPayload {
    productId: string;
    productName: string;
}
export declare class PostServices extends ModelCrudWithQdrant<Post, Pick<Post, 'hidden' | 'hiddenBusiness' | 'description' | 'images' | 'price' | 'currency' | 'currenciesOfSale' | 'routeName' | 'name' | 'postSlug' | 'clothingSizes' | 'colors' | 'details' | 'highlights' | 'createdBy' | 'postCategoriesLabels' | 'categoryIds' | 'postType' | 'postLink' | 'discount'>, GetAllPostArgs, PostQdrantPayload> {
    private readonly userServices;
    private readonly reviewServices;
    private readonly configServices;
    constructor(userServices: UserServices, reviewServices: ReviewServices, configServices: ConfigServices, options: ModelCrudWithQdrantOptions<Post, PostQdrantPayload>);
    getPostSlugFromName: typeof getPostSlugFromName;
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
    useGetCopyAndFlattenPost: () => Promise<{
        getCopyAndFlattenPost: (post: Post, options: {
            transformCurrenciesOfSale: boolean;
            transformCurrencyAndPrice: boolean;
        }) => PostDto;
    }>;
    getPostDataToShopping: QueryHandle<{
        post: Post;
    }, ShoppingPostData>;
}
export {};
