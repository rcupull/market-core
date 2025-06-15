import { FilterQuery, Schema } from 'mongoose';
import { BaseIdentity, Currency, Image } from '../../types/general';
import { Review } from '../review/types';

export type PostType = 'product' | 'link'; // el tipo de publicaciones que posee

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
  routeName: string; // routeName from business
  createdBy: Schema.Types.ObjectId;
  description?: string;
  details?: string;
  name: string;
  postSlug: string;
  //
  price?: number;
  currency?: Currency;
  currenciesOfSale?: Array<Currency>;
  //
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
  // clothing
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
