import { Helper } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Schema } from 'mongoose';

let HelperModel: ReturnType<typeof getMongoModel<Helper>>;

export const modelGetter = () => {
  if (!HelperModel) {
    const HelperSchema = new Schema<Helper>({
      ...createdAtSchemaDefinition,
      title: { type: String, required: true },
      content: { type: String, required: true },
      helperSlug: { type: String, required: true, unique: true },
      hidden: { type: Boolean, default: false },
      relatedIds: [{ type: Schema.Types.ObjectId, ref: 'helper' }]
    });

    HelperModel = getMongoModel<Helper>('helper', HelperSchema, 'helpers');
  }

  return HelperModel;
};
