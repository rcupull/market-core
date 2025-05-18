import { FilterQuery, Schema } from 'mongoose';
import { BaseIdentity, Currency, Image } from '../../types/general';
import { Review } from '../review/types';
import { BusinessType } from '../business/types';
export type PostType = 'product' | 'link';
export interface PostReviewSummary {
    starSummary: [number, number, number, number, number];
    reviewerIds: Array<string>;
}
export interface PostReviewDto extends Review {
    reviewerName?: string;
}
export type PostColor = string;
export type PostClothingSize = string;
export interface PostPurshaseNotes {
    interestedByColor?: PostColor;
    interestedByClothingSize?: PostClothingSize;
}
export type PostLinkType = 'business' | 'external';
export interface Post extends BaseIdentity {
    images?: Array<Image>;
    routeName: string;
    createdBy: Schema.Types.ObjectId;
    description?: string;
    details?: string;
    name: string;
    postSlug: string;
    price?: number;
    currency?: Currency;
    currenciesOfSale?: Array<Currency>;
    discount?: number;
    colors?: Array<PostColor>;
    highlights?: Array<string>;
    hidden?: boolean;
    hiddenBusiness?: boolean;
    postCategoriesLabels?: Array<string>;
    stockAmount: number;
    categoryIds?: Array<Schema.Types.ObjectId>;
    stockAmountHistory?: Array<{
        amount: number;
        updatedAt: Date;
        /**
         * when the stock amount was updated by a user
         */
        updatedByUser?: Schema.Types.ObjectId;
        /**
         * when the stock amount was updated by a shopping
         */
        updatedByShopping?: Schema.Types.ObjectId;
    }>;
    clothingSizes?: Array<PostClothingSize>;
    postType?: PostType;
    /**
     * the link when the postType === "link"
     */
    postLink?: {
        type: PostLinkType;
        value: string;
    };
}
export interface PostDto extends Post {
    stockAmountAvailable: number | undefined;
    amountInProcess: number | undefined;
    businessType: BusinessType | undefined;
    businessName: string | undefined;
    businessAllowedOnlyCUPinCash: boolean | undefined;
    reviewSummary: PostReviewSummary | undefined;
    reviews: Array<Review> | undefined;
    hiddenToCustomers?: boolean;
}
export interface DeletePostQuery extends FilterQuery<Post> {
    postIds?: Array<string>;
}
export interface GetAllPostArgs extends FilterQuery<Post> {
    routeNames?: Array<string>;
    postsIds?: Array<string>;
    search?: string;
    postCategoriesLabels?: Array<string>;
    postCategoriesMethod?: 'some' | 'every';
}
