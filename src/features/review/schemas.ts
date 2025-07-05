import { Review } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Schema } from 'mongoose';

let ReviewModel: ReturnType<typeof getMongoModel<Review>>;

export const modelGetter = () => {
  if (!ReviewModel) {
    const ReviewSchema = new Schema<Review>({
      ...createdAtSchemaDefinition,
      reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
      comment: { type: String, required: true },
      star: { type: Number, required: true },
      images: {
        type: [
          {
            src: String,
            width: Number,
            height: Number,
            href: { type: String, required: false }
          }
        ],
        required: false
      }
    });

    ReviewModel = getMongoModel<Review>('Review', ReviewSchema, 'reviews');
  }

  return ReviewModel;
};
