import { FilterQuery } from 'mongoose';
import { User } from './types';
import { getFilterQueryFactory, getSearchRegexQuery } from '../../utils/schemas';

export interface GetAllUsersArgs extends FilterQuery<User> {
  search?: string;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllUsersArgs>(
  ({ search, ...filterQuery }) => {
    if (search) {
      filterQuery.$or.push({ name: getSearchRegexQuery(search) });
      filterQuery.$or.push({ phone: getSearchRegexQuery(search) });
    }

    return filterQuery;
  }
);

export const MARKET = 'market';
