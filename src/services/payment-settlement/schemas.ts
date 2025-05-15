import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { PaymentSettlement, PaymentSettlementState, PaymentSettlementType } from './types';

const PaymentSettlementSchema = new Schema<PaymentSettlement>({
  ...createdAtSchemaDefinition,
  state: { type: String, enum: Object.values(PaymentSettlementState), required: true },
  type: { type: String, enum: Object.values(PaymentSettlementType), required: true },
  //
  shoppingRecords: [
    {
      _id: false,
      type: {
        _id: false,
        shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true },
        shoppingCode: { type: String, required: true },
        shoppingDeliveryAmount: { type: Number },
        postsData: {
          _id: false,
          type: [
            {
              _id: false,
              type: {
                _id: false,
                postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
                postName: { type: String, required: true },
                postAmount: { type: Number, required: true }
              }
            }
          ]
        }
      },
      require: true
    }
  ],
  //
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  //
  changedToDoneAt: { type: Date },
  changedToDoneBy: { type: Schema.Types.ObjectId, ref: 'User' },
  settlementCode: { type: String },
  //
  routeName: { type: String },
  messengerId: { type: Schema.Types.ObjectId, ref: 'User' }
  //
});

export const PaymentSettlementModel = getMongoModel<PaymentSettlement>(
  'PaymentSettlement',
  PaymentSettlementSchema,
  'payment_settlement'
);
