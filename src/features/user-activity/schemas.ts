import { UserActivity } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getMongoose } from '../../db';

let UserActivityModel: ReturnType<typeof getMongoModel<UserActivity>>;

export const modelGetter = () => {
  if (!UserActivityModel) {
    const { Schema } = getMongoose();

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

    UserActivityModel = getMongoModel<UserActivity>(
      'UserActivity',
      UserActivitySchema,
      'user_activities'
    );
  }

  return UserActivityModel;
};
