import axiosClient, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { isEmpty, isNullOrUndefined } from './general';
import { CreatedDateRangeQueryType } from '../types/general';
import { subMonths } from 'date-fns';

type Query = Record<string, any>;
type UrlParams = Record<string, string | undefined>;

export const paramsSerializer = (query: Query): string => {
  return Object.keys(query).reduce((acc, key, index) => {
    const value = query[key];
    if (value === undefined) return acc;

    return `${acc}${index === 0 ? '' : '&'}${key}=${value}`;
  }, '');
};

export const injectUrlParams = (url: string, urlParams: UrlParams = {}): string => {
  let filledUrl = url;

  Object.entries(urlParams).forEach(([key, value]) => {
    const pattern = `:${key}`;
    if (filledUrl.includes(pattern) && value !== undefined) {
      filledUrl = filledUrl.replace(pattern, value.toString());
    }
  });

  return filledUrl;
};

export const getTestingRoute = ({
  path,
  query,
  urlParams
}: {
  path: string;
  query?: Query;
  urlParams?: UrlParams;
}): string => {
  const flattenPath = injectUrlParams(path, urlParams);

  const getFlattenParams = (value: Query): Query =>
    Object.entries(value).reduce((acc, [k, v]) => {
      if (isNullOrUndefined(v)) return acc;
      return { ...acc, [k]: v };
    }, {});

  const flattenParams = query && getFlattenParams(query);

  if (isEmpty(flattenParams)) {
    return `${flattenPath}`;
  }

  return `${flattenPath}?${paramsSerializer(flattenParams)}`;
};

export const lastUpQuerySort = '-createdAt';

export const getCreatedLastMonthQuery = (): CreatedDateRangeQueryType => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  return {
    createdAt: {
      $gte: lastMonth,
      $lt: now
    }
  };
};
/**
 * Query para ordenar las shopping tendiendo en cuenta la fecha del ultimo mensajero asignado a una shopping
 */
export const lastAssignedMessengerSort = '-requestedDelivery.messengersHistory.lastUpdatedDate';
export const defaultQuerySort = lastUpQuerySort;

export const axios = async (args: AxiosRequestConfig): AxiosPromise => {
  return axiosClient(args)
    .then((response) => response)
    .catch((e) => {
      throw new Error(e);
    });
};
