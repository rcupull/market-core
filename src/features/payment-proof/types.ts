import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';
import { FilterQuery } from 'mongoose';

export interface PaymentProof extends BaseIdentity {
  code: string;
  customerId: Schema.Types.ObjectId;
  shoppingId: Schema.Types.ObjectId;
}

export interface GetAllPaymentProofArgs extends FilterQuery<PaymentProof> {
  search?: string;
}
