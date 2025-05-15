import { FilterQuery } from 'mongoose';
import { Classifier } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllClassifiersArgs extends FilterQuery<Classifier> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllClassifiersArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.$or = [
        { label: getSearchRegexQuery(search) },
        { productNames: getSearchRegexQuery(search) }
      ];
    }

    return filterQuery;
  }
);
