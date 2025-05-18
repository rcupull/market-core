import { Business, BusinessNotificationFlags, BusinessType, PostFormField } from './types';
import {
  AddressDefinition,
  BankAccountDefinition,
  createdAtSchemaDefinition,
  commissionsSchemaDefinition,
  DeliveryConfigDefinition,
  getMongoModel,
  PostCardLayoutSchema
} from '../../utils/schemas';
import { modelGetter as postModelGetter } from '../post/schemas';

import { Currency } from '../../types/general';
import { Schema } from 'mongoose';

let BusinessModel: ReturnType<typeof getMongoModel<Business>>;

export const modelGetter = () => {
  if (!BusinessModel) {
    const BusinessSchema = new Schema<Business>({
      ...createdAtSchemaDefinition,
      name: { type: String, required: true },
      routeName: { type: String, required: true, unique: true },
      hidden: { type: Boolean, default: false },
      currency: { type: String, enum: Object.values(Currency), default: Currency.CUP },
      customCommissions: { type: Boolean },
      commissions: {
        products: {
          type: commissionsSchemaDefinition
        },
        delivery: {
          type: commissionsSchemaDefinition
        }
      },
      businessType: {
        type: String,
        enum: Object.values(BusinessType),
        default: BusinessType.BUSINESS_FULL
      },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

      postCategories: {
        type: [
          {
            label: { type: String, required: true },
            hidden: { type: Boolean, default: false }
          }
        ],
        required: true
      },
      bannerImages: {
        type: [
          {
            src: { type: String, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            href: { type: String }
          }
        ],
        default: []
      },
      logo: {
        type: {
          src: { type: String, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true }
        },
        default: null
      },
      socialLinks: {
        face: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        youtube: { type: String }
      },
      layouts: {
        banner: {
          type: {
            type: String,
            enum: ['none', 'static', 'swipableClassic'],
            default: 'none'
          }
        },
        posts: {
          _id: false,
          type: {
            sections: {
              type: [
                {
                  name: { type: String },
                  hiddenName: { type: Boolean, default: false },
                  showMobile: { type: Boolean, default: false },
                  showPC: { type: Boolean, default: false },
                  searchLayout: {
                    type: String,
                    enum: [
                      'none',
                      'left',
                      'center',
                      'right',
                      'postCategories',
                      'postCategoriesScrollable',
                      'postCategoriesExcluded',
                      'postCategoriesExcludedScrollable'
                    ],
                    default: 'none'
                  },
                  postCategoriesLabels: { type: [String] },
                  type: {
                    type: String,
                    enum: ['grid', 'oneRowSlider'],
                    default: 'grid'
                  },
                  postCardLayout: {
                    type: PostCardLayoutSchema
                  },
                  postType: {
                    type: String,
                    enum: ['product', 'link'],
                    required: true,
                    default: 'product'
                  }
                }
              ],
              default: []
            }
          },
          default: {}
        },
        footer: {
          type: {
            type: String,
            enum: ['none', 'basic'],
            default: 'basic'
          }
        },
        search: {
          type: {
            type: String,
            enum: [
              'none',
              'left',
              'center',
              'right',
              'postCategories',
              'postCategoriesExcluded',
              'postCategoriesScrollable',
              'postCategoriesExcludedScrollable'
            ],
            default: 'right'
          }
        }
      },
      aboutUsPage: {
        visible: { type: Boolean, default: false },
        title: { type: String },
        description: { type: String }
      },
      phoneNumber: { type: String },
      notificationFlags: {
        type: [
          {
            type: String,
            enum: Object.values(BusinessNotificationFlags)
          }
        ],
        default: [BusinessNotificationFlags.NEW_SHOPPING]
      },
      shoppingMeta: {
        termsAndConditions: { type: String }
      },
      postFormFields: {
        type: [
          {
            type: String,
            enum: Object.values(PostFormField)
          }
        ],
        default: []
      },
      seo: {
        title: { type: String },
        description: { type: String }
      },
      addresses: [AddressDefinition],
      deliveryConfig: DeliveryConfigDefinition,
      favoritesUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      checks: { type: Schema.Types.Mixed },
      bankAccountCUP: {
        _id: false,
        type: BankAccountDefinition
      },
      bankAccountMLC: {
        _id: false,
        type: BankAccountDefinition
      },
      billing: {
        type: {
          accountNumber: { type: String },
          bankNumber: { type: String },
          nit: { type: String },
          name: { type: String },
          address: { type: AddressDefinition },
          identityNumber: { type: String }
        },
        select: false
      },
      allowedOnlyCUPinCash: { type: Boolean }
    });

    BusinessSchema.pre('updateOne', async function (next) {
      //@ts-expect-error ignored
      const { hidden } = this.getUpdate();
      const { routeName } = this.getQuery();

      const PostModel = postModelGetter();

      if (hidden !== undefined) {
        await PostModel.updateMany(
          {
            routeName
          },
          {
            hiddenBusiness: hidden
          }
        );
      }

      next();
    });

    BusinessModel = getMongoModel<Business>('Business', BusinessSchema, 'business');
  }

  return BusinessModel;
};
