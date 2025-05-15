import { FilterQuery } from 'mongoose';
import { ProductSimilarity } from './types';
import { getFilterQueryFactory } from '../../utils/schemas';

export interface GetAllClassifiersArgs extends FilterQuery<ProductSimilarity> {}

export const getAllFilterQuery = getFilterQueryFactory<GetAllClassifiersArgs>(
  ({ ...filterQuery }) => {
    return filterQuery;
  }
);
