import { ModelDocument } from '../../types/general';
import { Shopping, ShoppingDeliveryState, ShoppingState } from './types';
import { User } from '../user/types';

import {
  getRandomNumber,
  baseConversion,
  getCharCode,
  isNullOrUndefined,
  getNumberCode
} from '../../utils/general';
import { FilterQuery, Schema } from 'mongoose';
import {
  getFilterQueryFactory,
  getSearchRegexQuery,
  setFilterQueryWithDates
} from '../../utils/schemas';
import { BusinessType, DeliveryConfig, DeliveryConfigType } from '../business/types';

import { MapOlPosition } from '../geolocation/types';
import { Commission, CommissionMode } from '../../types/commision';

export interface GetAllShoppingArgs extends FilterQuery<Shopping> {
  routeNames?: Array<string>;
  states?: Array<ShoppingState>;
  deliveryStates?: Array<ShoppingDeliveryState>;
  deliveryManId?: string | Schema.Types.ObjectId;
  shoppingIds?: Array<string | Schema.Types.ObjectId>;
  excludeShoppingIds?: Array<string | Schema.Types.ObjectId>;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

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

/**
 * Return tru if the shopping is or was approved
 */
export const wasApprovedShopping = (shopping: Shopping): boolean => {
  const { state, history } = shopping;

  return (
    state === ShoppingState.APPROVED ||
    !!history?.find(({ state }) => state === ShoppingState.APPROVED)
  );
};

export const getShoppingCode = (): string => {
  const chars = getCharCode(2);
  const numbers = getNumberCode(4);
  return `O-${chars}-${numbers}`;
};

export const createShoppingValidationCode = (): string => {
  const [c0, c1, c2, c3] = getCharCode(4);
  const [n0, n1, n2, n3] = baseConversion(getRandomNumber(0, 10000), 4, '0123456789');
  return `SV${n0}${c0}${n1}${c1}${n2}${c2}${n3}${c3}`;
};

export const getStrongPassword = (): string => {
  const [c0, c1, c2] = getCharCode(4);
  const [n0, n1, n2] = baseConversion(getRandomNumber(0, 10000), 4, '0123456789');
  return `*${n0}${c0.toUpperCase()}${n1}${c1}${n2}${c2.toLowerCase()}#`;
};

export const changeShoppingState = (
  shopping: ModelDocument<Shopping>,
  state: ShoppingState,
  reason?: string
): ModelDocument<Shopping> => {
  if (!shopping.history) {
    shopping.history = [];
  }

  shopping.history.push({
    state,
    lastUpdatedDate: new Date(),
    reason
  });

  shopping.state = state;

  return shopping;
};

export const changeShoppingAddCancellation = (
  shopping: ModelDocument<Shopping>,
  user: User
): ModelDocument<Shopping> => {
  shopping.cancellation = {
    requestedAt: new Date(),
    requestedBy: user._id
  };

  return shopping;
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

/**
 * //////////////////////////////////////////////////////////////////////////////////////////////////
 * //////////////////////////////////////////////////////////////////////////////////////////////////
 * //////////////////////////////////////////////////////////////////////////////////////////////////
 * //////////////////////////////////////////////////////////////////////////////////////////////////
 * //////////////////////////////////////////////////////////////////////////////////////////////////
 */

/**
 * https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
 */
export const getDistanceBetweenPositions = (
  position1: MapOlPosition,
  position2: MapOlPosition
): number => {
  const lat1 = position1.lat;
  const lat2 = position2.lat;
  const lon1 = position1.lon;
  const lon2 = position2.lon;

  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;

  dist = dist * 1.609344;

  return Number(dist.toFixed(2));
};

export const getDeliveryPrice = (args: {
  distance: number;
  deliveryConfig: DeliveryConfig;
}): number | undefined => {
  const { deliveryConfig, distance } = args;

  const { minPrice = 0, priceByKm = 0 } = deliveryConfig;

  if (isNullOrUndefined(distance)) return undefined;

  const { type } = deliveryConfig || {};

  switch (type) {
    case DeliveryConfigType.OPTIONAL:
    case DeliveryConfigType.REQUIRED: {
      return minPrice + priceByKm * distance;
    }
    default: {
      return 0;
    }
  }
};

export const getDeliveryConfigToUse = (args: {
  businessType: BusinessType | undefined;
  businessDeliveryConfig: DeliveryConfig | undefined;
  adminDeliveryConfig: DeliveryConfig | undefined;
}) => {
  const { businessType, adminDeliveryConfig, businessDeliveryConfig } = args;

  if (businessType === BusinessType.BUSINESS_FULL) {
    return businessDeliveryConfig;
  }

  return adminDeliveryConfig;
};
