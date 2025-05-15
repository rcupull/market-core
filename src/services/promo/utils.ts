import { FilterQuery } from 'mongoose';
import { Promo } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllPromoArgs extends FilterQuery<Promo> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllPromoArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.name = getSearchRegexQuery(search);
    }

    return filterQuery;
  }
);
