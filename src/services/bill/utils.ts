import { FilterQuery } from 'mongoose';
import { Bill } from './types';
import { getFilterQueryFactory } from '../../utils/schemas';

export interface GetAllBillArgs extends FilterQuery<Bill> {
  routeNames?: Array<string>;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllBillArgs>(
  ({ routeNames, ...filterQuery }) => {
    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }

    return filterQuery;
  }
);
