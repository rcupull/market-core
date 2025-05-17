import {
  BankAccountDefinition,
  commissionsSchemaDefinition,
  createdAtSchemaDefinition,
  getMongoModel
} from '../../utils/schemas';
import { AdminConfig, CommissionsByBusinessType, FeatureKey } from './types';
import { AddressDefinition, DeliveryConfigDefinition } from '../../utils/schemas';
import { SchemaDefinition } from '../../types/general';
import { getMongoose } from '../../db';
import { BusinessType } from '../business/types';

///////////////////////////////////////////////////////////////////////////////

let AdminConfigModel: ReturnType<typeof getMongoModel<AdminConfig>>;

export const modelGetter = () => {
  if (!AdminConfigModel) {
    const { Schema } = getMongoose();

    const commissionsByBusinessTypeSchemaDefinition: SchemaDefinition<CommissionsByBusinessType> =
      Object.values(BusinessType).reduce(
        (acc, type) => ({
          ...acc,
          [type]: { _id: false, type: commissionsSchemaDefinition, required: true, select: false }
        }),
        {} as CommissionsByBusinessType
      );

    const AdminConfigShema = new Schema<AdminConfig>({
      ...createdAtSchemaDefinition,
      bankAccountCUP: {
        _id: false,
        type: BankAccountDefinition
      },
      bankAccountMLC: {
        _id: false,
        type: BankAccountDefinition
      },
      termsAndConditions: { type: String },
      termsAndConditionsRecord: [
        {
          _id: false,
          value: { type: String },
          savedAt: { type: Date }
        }
      ],
      businessContract: { type: String },
      businessContractRecords: [
        {
          _id: false,
          value: { type: String },
          savedAt: { type: Date }
        }
      ],
      apkUploadHistory: [
        {
          _id: false,
          filename: { type: String },
          savedAt: { type: Date },
          major: { type: Number },
          minor: { type: Number },
          patch: { type: Number }
        }
      ],
      ///////////////////////////////////////
      privacyPolicy: { type: String },
      privacyPolicyRecord: [
        {
          _id: false,
          value: { type: String },
          savedAt: { type: Date }
        }
      ],
      ////////////////////////////////////////
      price: { type: String },
      priceRecord: [
        {
          _id: false,
          value: { type: String },
          savedAt: { type: Date }
        }
      ],
      ////////////////////////////////////////
      features: {
        type: [
          {
            _id: false,
            key: { type: String, enum: Object.values(FeatureKey), unique: true },
            enabled: { type: Boolean },
            description: { type: String }
          }
        ]
      },
      ////////////////////////////////////////
      exchangeRates: {
        _id: false,
        type: {
          USD_CUP: { type: Number },
          MLC_CUP: { type: Number }
        }
      },

      addresses: [AddressDefinition],
      deliveryConfig: DeliveryConfigDefinition,

      commissions: {
        _id: false,
        type: {
          products: {
            _id: false,
            type: commissionsByBusinessTypeSchemaDefinition
          },
          delivery: {
            _id: false,
            type: commissionsByBusinessTypeSchemaDefinition
          }
        },
        select: false
      },
      billing: {
        accountNumber: { type: String },
        bankNumber: { type: String },
        nit: { type: String },
        name: { type: String },
        address: { type: AddressDefinition }
      }
    });

    AdminConfigModel = getMongoModel<AdminConfig>('AdminConfig', AdminConfigShema, 'admin_config');
  }

  return AdminConfigModel;
};
