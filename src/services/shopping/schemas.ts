import { Schema, SchemaDefinition } from 'mongoose';
import {
  AddressDefinition,
  commissionsSchemaDefinition,
  createdAtSchemaDefinition,
  getMongoModel
} from '../../utils/schemas';
import { Shopping, ShoppingPostData, ShoppingState, ShoppingDeliveryState } from './types';
import { PostPurshaseNotes } from '../post/types';
import { getShoppingCode } from './utils';
import { Currency } from '../../types/general';
import { BusinessType } from '../business/types';

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

export const postDataSchemaDefinition: SchemaDefinition<ShoppingPostData> = {
  _id: { type: String, required: true },
  images: {
    type: [
      {
        src: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
      }
    ]
  },
  name: { type: String, required: true },
  commissions: { _id: false, type: commissionsSchemaDefinition, required: true },
  salePrice: { type: Number, required: true },
  routeName: { type: String, required: true },
  currency: { type: String, enum: Object.values(Currency) },
  currenciesOfSale: {
    _id: false,
    type: [{ type: String, enum: Object.values(Currency) }],
    default: []
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

export const ShoppingModel = getMongoModel<Shopping>('Shopping', ShoppingSchema, 'shopping');
