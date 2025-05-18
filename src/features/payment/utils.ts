import { FilterQuery, Schema } from 'mongoose';
import { getFilterQueryFactory, getInArrayQuery } from '../../utils/schemas';
import { Payment } from './types';

export interface GetAllPaymentArgs extends FilterQuery<Payment> {
  paymentIds?: Array<string | Schema.Types.ObjectId>;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllPaymentArgs>(
  ({ paymentIds, ...filterQuery }) => {
    if (paymentIds?.length) {
      filterQuery._id = getInArrayQuery(paymentIds);
    }

    return filterQuery;
  }
);
