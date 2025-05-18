import { SchemaDefinition } from 'mongoose';
import {
  AddressDefinition,
  commissionsSchemaDefinition,
  createdAtSchemaDefinition,
  getMongoModel,
  postDataSchemaDefinition
} from '../../utils/schemas';
import { Shopping, ShoppingState, ShoppingDeliveryState } from './types';
import { getShoppingCode } from './utils';
import { getMongoose } from '../../db';
import { PostPurshaseNotes } from '../post/types';
import { BusinessType } from '../business/types';

let ShoppingModel: ReturnType<typeof getMongoModel<Shopping>>;

export const modelGetter = () => {
  if (!ShoppingModel) {
    const { Schema } = getMongoose();

    const shoppingState = {
      type: String,
      enum: Object.values(ShoppingState),
      required: true
    };

    const purshaseNotesSchemaDefinition: SchemaDefinition<PostPurshaseNotes> = {
      interestedByClothingSize: {
        _id: false,
        type: String
      },
      interestedByColor: {
        _id: false,
        type: String
      }
    };

    const ShoppingSchema = new Schema<Shopping>({
      ...createdAtSchemaDefinition,
      posts: {
        type: [
          {
            _id: false,
            postData: { type: postDataSchemaDefinition, required: true },
            count: { type: Number, required: true },
            lastUpdatedDate: { type: Date, required: true },
            purshaseNotes: {
              _id: false,
              type: purshaseNotesSchemaDefinition
            }
          }
        ]
      },
      purchaserId: { type: Schema.Types.ObjectId, ref: 'User' },
      browserFingerprint: { type: String, select: false },
      payOnPickUp: { type: Boolean, default: false },
      //
      routeName: { type: String },
      businessType: { type: String, enum: Object.values(BusinessType) },
      //
      code: { type: String, required: true, default: getShoppingCode },
      state: shoppingState,
      exchangeRates: {
        type: {
          USD_CUP: { type: Number },
          MLC_CUP: { type: Number }
        }
      },
      history: {
        type: [
          {
            _id: false,
            state: shoppingState,
            lastUpdatedDate: {
              type: Date
            },
            reason: { type: String }
          }
        ]
      },
      requestedDelivery: {
        _id: false,
        type: {
          //
          distance: { type: Number },
          fromAddress: AddressDefinition,
          toAddress: AddressDefinition,
          //
          salePrice: { type: Number, required: true },
          commissions: { _id: false, type: commissionsSchemaDefinition, required: true },
          //
          deliveryManId: { type: Schema.Types.ObjectId },
          state: { type: String, enum: Object.values(ShoppingDeliveryState) },
          messengersHistory: {
            _id: false,
            type: [
              {
                messengerId: { type: Schema.Types.ObjectId, required: true },
                lastUpdatedDate: { type: Date, required: true }
              }
            ],
            default: []
          }
        }
      },
      cancellation: {
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User', require: true },
        requestedAt: { type: Date, require: true },

        wasReturnedMoneyBy: { type: Schema.Types.ObjectId, ref: 'User' },
        wasReturnedMoneyAt: { type: Date }
      },

      cashSettlement: {
        createdAt: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    });

    ShoppingModel = getMongoModel<Shopping>('Shopping', ShoppingSchema, 'shopping');
  }

  return ShoppingModel;
};
