import { GetAllPromoArgs } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export const getAllFilterQuery = getFilterQueryFactory<GetAllPromoArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.name = getSearchRegexQuery(search);
    }

    return filterQuery;
  }
);
