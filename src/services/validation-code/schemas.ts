import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { ValidationCode } from './types';
import { v4 as uuid } from 'uuid';

const ValidationCodeShema = new Schema<ValidationCode>({
  ...createdAtSchemaDefinition,
  code: { type: String, default: () => uuid(), required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meta: { type: Schema.Types.Mixed }
});

export const ValidationCodeModel = getMongoModel<ValidationCode>(
  'ValidationCode',
  ValidationCodeShema,
  'validation_codes'
);
