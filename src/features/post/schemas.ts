import { Post } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Currency } from '../../types/general';
import { Schema } from 'mongoose';

let PostModel: ReturnType<typeof getMongoModel<Post>>;

export const modelGetter = () => {
  if (!PostModel) {
    const PostSchema = new Schema<Post>({
      ...createdAtSchemaDefinition,
      routeName: { type: String, required: true },
      description: { type: String },
      details: { type: String },
      hidden: { type: Boolean, default: false },
      hiddenBusiness: { type: Boolean, default: false },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      postCategoriesLabels: { type: [String] },
      categoryIds: { type: [Schema.Types.ObjectId] },
      images: {
        type: [
          {
            src: { type: String, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true }
          }
        ]
      },
      clothingSizes: [
        {
          type: String,
          enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
        }
      ],
      colors: [
        {
          type: String
        }
      ],
      name: { type: String, required: true },
      postSlug: { type: String, required: true },
      //
      price: { type: Number },
      currency: { type: String, enum: Object.values(Currency) },
      currenciesOfSale: {
        _id: false,
        type: [{ type: String, enum: Object.values(Currency) }],
        default: []
      },
      //
      discount: { type: Number },
      stockAmount: { type: Number, required: true, default: 0 },
      stockAmountHistory: {
        _id: false,
        type: [
          {
            amount: { type: Number, required: true },
            updatedAt: { type: Date, required: true },
            updatedByUser: { type: Schema.Types.ObjectId, ref: 'User' },
            updatedByShopping: { type: Schema.Types.ObjectId, ref: 'Shopping' }
          }
        ],
        select: false,
        default: []
      },
      postType: {
        type: String,
        enum: ['product', 'link'],
        required: true,
        default: 'product'
      },
      postLink: {
        type: {
          type: String,
          enum: ['business', 'external']
        },
        value: { type: String }
      }
    });

    PostSchema.index(
      {
        routeName: 1,
        postSlug: 1
      },
      { unique: true }
    );

    PostModel = getMongoModel<Post>('Post', PostSchema, 'posts');
  }

  return PostModel;
};
