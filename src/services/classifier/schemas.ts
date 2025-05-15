import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Classifier, ClassifierType } from './types';

///////////////////////////////////////////////////////////////////////////////

const ClassifierShema = new Schema<Classifier>({
  ...createdAtSchemaDefinition,
  label: { type: String, required: true, unique: true },
  tags: { type: String },
  hidden: { type: Boolean, default: false },
  type: { type: String, enum: Object.values(ClassifierType), default: ClassifierType.CATEGORY }
});

export const ClassifierModel = getMongoModel<Classifier>(
  'Classifier',
  ClassifierShema,
  'classifiers'
);
