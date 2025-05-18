import { Promo, PromoEntityType } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getMongoose } from '../../db';

let PromoModel: ReturnType<typeof getMongoModel<Promo>>;

export const modelGetter = () => {
  if (!PromoModel) {
    const { Schema } = getMongoose();

    const PromoSchema = new Schema<Promo>({
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

    PromoModel = getMongoModel<Promo>('Promo', PromoSchema, 'promos');
  }

  return PromoModel;
};
