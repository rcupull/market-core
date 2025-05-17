import { FilterQuery } from 'mongoose';
import { User } from './types';
import { isNumber } from '../../utils/general';
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

export const getUserAddress = (user: User, addressIndex?: number) => {
  /**
   * if addressIndex is not defined, then we return the default address, or the first address if there is no default
   */

  const { addresses, defaultAddressIndex } = user;

  const index = isNumber(addressIndex) ? addressIndex : defaultAddressIndex;

  if (isNumber(index)) {
    return addresses?.[index] || addresses?.[0];
  }

  return addresses?.[0];
};
