import { FilterQuery, Schema } from 'mongoose';
import { Payment } from './types';
import { ModelDocument } from '../../types/general';
import { User } from '../user/types';
import { getFilterQueryFactory, getInArrayQuery } from '../../utils/schemas';

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

export const changePaymentAddValidation = (payment: ModelDocument<Payment>, user: User) => {
  payment.validation = {
    createdAt: new Date(),
    createdBy: user._id
  };

  return payment;
};
