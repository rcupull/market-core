import { Schema } from 'mongoose';
import { Promo, PromoEntityType } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

export const PromoSchema = new Schema<Promo>({
  ...createdAtSchemaDefinition,
  name: { type: String, required: true },
  description: { type: String },
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityType: { type: String, enum: Object.values(PromoEntityType), required: true },
  image: {
    type: {
      src: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    }
  }
});

export const PromoModel = getMongoModel<Promo>('Promo', PromoSchema, 'promos');
