import { Schema } from 'mongoose';
import { PaymentProof } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getPaymentProofCode } from './utils';

export const PaymentProofSchema = new Schema<PaymentProof>({
  ...createdAtSchemaDefinition,
  //
  code: { type: String, required: true, default: getPaymentProofCode },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true }
});

export const PaymentProofModel = getMongoModel<PaymentProof>(
  'PaymentProof',
  PaymentProofSchema,
  'payment_proofs'
);
