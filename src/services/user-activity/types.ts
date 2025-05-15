import { BaseIdentity } from '../../types/general';
import { Schema } from 'mongoose';

export interface ScoreElement {
  productId: Schema.Types.ObjectId;
  score: number;
}

export interface UserActivity extends BaseIdentity {
  identifier: string;
  products: Array<ScoreElement>;
}
