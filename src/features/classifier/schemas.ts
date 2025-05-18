import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Classifier, ClassifierType } from './types';

///////////////////////////////////////////////////////////////////////////////

let ClassifierModel: ReturnType<typeof getMongoModel<Classifier>>;

export const modelGetter = () => {
  if (!ClassifierModel) {
    const ClassifierShema = new Schema<Classifier>({
      ...createdAtSchemaDefinition,
      label: { type: String, required: true, unique: true },
      tags: { type: String },
      hidden: { type: Boolean, default: false },
      type: { type: String, enum: Object.values(ClassifierType), default: ClassifierType.CATEGORY }
    });

    ClassifierModel = getMongoModel<Classifier>('Classifier', ClassifierShema, 'classifiers');
  }

  return ClassifierModel;
};
