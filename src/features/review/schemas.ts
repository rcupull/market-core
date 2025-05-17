import { Review } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getMongoose } from '../../db';

let ReviewModel: ReturnType<typeof getMongoModel<Review>>;

export const modelGetter = () => {
  if (!ReviewModel) {
    const { Schema } = getMongoose();

    const ReviewSchema = new Schema<Review>({
      ...createdAtSchemaDefinition,
      reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
      comment: { type: String, required: true },
      star: { type: Number, required: true }
    });

    ReviewModel = getMongoModel<Review>('Review', ReviewSchema, 'reviews');
  }

  return ReviewModel;
};
