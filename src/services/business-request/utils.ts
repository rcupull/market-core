import { FilterQuery } from 'mongoose';
import { BusinessRequest } from './types';
import { getFilterQueryFactory } from '../../utils/schemas';

export interface GetAllBusinessRequestArgs extends FilterQuery<BusinessRequest> {}

export const getAllFilterQuery = getFilterQueryFactory<GetAllBusinessRequestArgs>(
  ({ ...filterQuery }) => {
    return filterQuery;
  }
);
