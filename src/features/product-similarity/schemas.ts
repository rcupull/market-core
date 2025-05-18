import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { ProductSimilarity } from './types';
import { Schema } from 'mongoose';

let ProductSimilarityModel: ReturnType<typeof getMongoModel<ProductSimilarity>>;

export const modelGetter = () => {
  if (!ProductSimilarityModel) {
    const ProductSimilaritySchema = new Schema<ProductSimilarity>({
      ...createdAtSchemaDefinition,
      productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
      productName: { type: String },
      classfiersScores: {
        type: [
          {
            _id: false,
            classifierId: { type: Schema.Types.ObjectId, ref: 'Classifier', required: true },
            score: { type: Number, required: true }
          }
        ],
        default: []
      },
      productScores: {
        type: [
          {
            _id: false,
            productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
            productName: { type: String },
            score: { type: Number, required: true }
          }
        ],
        default: []
      }
    });

    ProductSimilarityModel = getMongoModel<ProductSimilarity>(
      'ProductSimilarity',
      ProductSimilaritySchema,
      'product_similarity'
    );
  }

  return ProductSimilarityModel;
};
