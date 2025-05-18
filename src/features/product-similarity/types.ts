import { FilterQuery, Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export interface ProductSimilarityScore {
  productId: Schema.Types.ObjectId;
  productName: string;
  score: number;
}

export interface ProductSimilarity extends BaseIdentity {
  productId: Schema.Types.ObjectId;
  productName: string;
  productScores: Array<ProductSimilarityScore>;
  classfiersScores: Array<{
    classifierId: Schema.Types.ObjectId;
    score: number;
  }>;
}

export interface GetAllProductSimilarityArgs extends FilterQuery<ProductSimilarity> {}
