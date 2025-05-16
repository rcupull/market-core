import { FilterQuery } from 'mongoose';
import { Category } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllCategoriesArgs extends FilterQuery<Category> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllCategoriesArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.label = getSearchRegexQuery(search);
    }

    return filterQuery;
  }
);
