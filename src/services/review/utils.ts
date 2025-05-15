import { FilterQuery } from 'mongoose';
import { Review } from './types';
import { getFilterQueryFactory } from '../../utils/schemas';

export interface GetAllReviewArgs extends FilterQuery<Review> {}

export const getAllFilterQuery = getFilterQueryFactory<GetAllReviewArgs>(({ ...filterQuery }) => {
  return filterQuery;
});
