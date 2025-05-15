import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Payment, PaymentWay } from './types';
import { Currency } from '../../types/general';

const PaymentSchema = new Schema<Payment>({
  ...createdAtSchemaDefinition,
  bankAccountNumberFrom: { type: String },
  saleProductsPrice: { type: Number, required: true },
  saleDeliveryPrice: { type: Number, required: true },
  saleTotalPrice: { type: Number, required: true },
  currency: { type: String, required: true, enum: Object.values(Currency) },
  paymentWay: { type: String, enum: Object.values(PaymentWay), required: true },
  shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionCode: { type: String },
  wasTransactionCodeAutoCompleted: { type: Boolean },
  validation: {
    createdAt: { type: Date, require: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', require: true }
  }
});

export const PaymentModel = getMongoModel<Payment>('Payment', PaymentSchema, 'payments');
