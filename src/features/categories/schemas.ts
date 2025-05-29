import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Category } from './types';
import { Schema } from 'mongoose';

///////////////////////////////////////////////////////////////////////////////

let CategoryModel: ReturnType<typeof getMongoModel<Category>>;

export const modelGetter = () => {
  if (!CategoryModel) {
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
      categorySlug: { type: String, required: true, unique: true },
      categoryImages: {
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

    CategoryModel = getMongoModel<Category>('Category', CategoryShema, 'categories');
  }

  return CategoryModel;
};
