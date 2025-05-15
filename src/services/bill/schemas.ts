import { Schema } from 'mongoose';
import { Bill, BillConceptType } from './types';
import { AddressDefinition, createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { postDataSchemaDefinition } from '../shopping/schemas';
import { Currency } from '../../types/general';
import { PaymentWay } from '../payment/types';

export const BillSchema = new Schema<Bill>({
  ...createdAtSchemaDefinition,
  number: { type: Number, required: true },
  routeName: { type: String, required: true },
  //
  sellerName: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  sellerAddress: { type: AddressDefinition, required: true },
  sellerAccountNumber: { type: String, required: true },
  sellerBankNumber: { type: String, required: true },
  sellerNit: { type: String, required: true },
  //
  customerName: { type: String, required: true },
  customerAddress: { type: AddressDefinition, required: true },
  customerAccountNumber: { type: String, required: true },
  customerBankNumber: { type: String, required: true },
  customerNit: { type: String, required: true },
  customerIdentityNumber: { type: String },
  //
  concepts: {
    type: [
      {
        type: { type: String, enum: Object.values(BillConceptType), required: true },
        productMetaFromShopping: { type: postDataSchemaDefinition }
      }
    ],
    required: true,
    default: []
  },
  totalAmount: { type: Number, required: true },
  detailedAmount: {
    type: [
      {
        _id: false,
        shoppingCode: { type: String, required: true },
        shoppingId: { type: Schema.Types.ObjectId, required: true },
        amount: { type: Number, required: true }
      }
    ],
    required: true,
    default: []
  },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  currency: { type: String, enum: Object.values(Currency), required: true },
  paymentWay: { type: String, enum: Object.values(PaymentWay), required: true }
});

export const BillModel = getMongoModel<Bill>('Bill', BillSchema, 'bills');
