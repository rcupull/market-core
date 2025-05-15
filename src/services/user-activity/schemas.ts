import { Schema } from 'mongoose';
import { UserActivity } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

const UserActivitySchema = new Schema<UserActivity>({
  ...createdAtSchemaDefinition,
  identifier: { type: String, unique: true, required: true },
  products: {
    _id: false,
    type: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        score: { type: Number, required: true }
      }
    ],
    default: []
  }
});

export const UserActivityModel = getMongoModel<UserActivity>(
  'UserActivity',
  UserActivitySchema,
  'user_activities'
);
