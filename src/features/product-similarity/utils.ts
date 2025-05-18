import { getFilterQueryFactory } from '../../utils/schemas';
import { GetAllProductSimilarityArgs } from './types';

export const getAllFilterQuery = getFilterQueryFactory<GetAllProductSimilarityArgs>(
  ({ ...filterQuery }) => {
    return filterQuery;
  }
);
