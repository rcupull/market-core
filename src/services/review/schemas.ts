import { Schema } from 'mongoose';
import { Review } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

export const ReviewSchema = new Schema<Review>({
  ...createdAtSchemaDefinition,
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  comment: { type: String, required: true },
  star: { type: Number, required: true }
});

export const ReviewModel = getMongoModel<Review>('Review', ReviewSchema, 'reviews');
