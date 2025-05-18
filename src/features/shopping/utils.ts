import { GetAllShoppingArgs } from './types';

import { getCharCode, getNumberCode } from '../../utils/general';
import {
  getFilterQueryFactory,
  getSearchRegexQuery,
  setFilterQueryWithDates
} from '../../utils/schemas';

import { Commission, CommissionMode } from '../../types/commision';

export const getAllFilterQuery = getFilterQueryFactory<GetAllShoppingArgs>(
  ({
    routeNames,
    states,
    deliveryStates,
    dateFrom,
    dateTo,
    shoppingIds,
    excludeShoppingIds,
    routeName,
    search,
    deliveryManId,
    ...filterQuery
  }) => {
    if (shoppingIds?.length) {
      filterQuery.$and.push({ _id: { $in: shoppingIds } });
    }

    if (excludeShoppingIds?.length) {
      filterQuery.$and.push({ _id: { $nin: excludeShoppingIds } });
    }

    if (search) {
      filterQuery.code = getSearchRegexQuery(search);
    }

    if (routeName) {
      filterQuery.routeName = routeName;
    }

    if (routeNames?.length) {
      filterQuery.routeName = { $in: routeNames };
    }

    if (states?.length) {
      filterQuery.state = { $in: states };
    }

    if (deliveryStates?.length) {
      filterQuery['requestedDelivery.state'] = { $in: deliveryStates };
    }

    if (deliveryManId) {
      filterQuery['requestedDelivery.deliveryManId'] = deliveryManId;
    }

    setFilterQueryWithDates({ filterQuery, dateFrom, dateTo });

    return filterQuery;
  }
);

export const getShoppingCode = (): string => {
  const chars = getCharCode(2);
  const numbers = getNumberCode(4);
  return `O-${chars}-${numbers}`;
};

export const getCommissionPrice = (comission: Commission, price: number): number => {
  const { mode, value } = comission;

  if (mode === CommissionMode.PERCENT) {
    return (price * value) / 100;
  }

  /**
   * TODO in the future we can add more modes
   */

  return 0;
};
