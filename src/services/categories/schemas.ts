import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Category } from './types';

///////////////////////////////////////////////////////////////////////////////

const CategoryShema = new Schema<Category>({
  ...createdAtSchemaDefinition,
  label: { type: String, required: true, unique: true },
  subCategories: {
    type: [
      {
        label: { type: String, required: true },
        description: { type: String, required: true }
      }
    ],
    default: []
  },
  categoryImage: {
    type: [
      {
        _id: false,
        src: { type: String, required: false },
        width: { type: Number, required: false },
        height: { type: Number, required: false }
      }
    ],
    default: null
  },
  subProductsAmounts: [{ type: Number, default: 0 }]
});

export const CategoryModel = getMongoModel<Category>('Category', CategoryShema, 'categories');
