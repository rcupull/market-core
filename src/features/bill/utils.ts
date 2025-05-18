import { getFilterQueryFactory } from '../../utils/schemas';
import { GetAllBillArgs } from './types';

export const getAllFilterQuery = getFilterQueryFactory<GetAllBillArgs>(
  ({ routeNames, ...filterQuery }) => {
    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }

    return filterQuery;
  }
);
