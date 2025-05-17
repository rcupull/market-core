import { FilterQuery } from 'mongoose';
import { Review } from './types';
export interface GetAllReviewArgs extends FilterQuery<Review> {
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllReviewArgs>) => FilterQuery<GetAllReviewArgs>;
