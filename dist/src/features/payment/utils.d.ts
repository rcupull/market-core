import { FilterQuery, Schema } from 'mongoose';
import { Payment } from './types';
export interface GetAllPaymentArgs extends FilterQuery<Payment> {
    paymentIds?: Array<string | Schema.Types.ObjectId>;
}
export declare const getAllFilterQuery: (filterQuery: FilterQuery<GetAllPaymentArgs>) => FilterQuery<GetAllPaymentArgs>;
