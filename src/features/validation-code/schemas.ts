import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { ValidationCode } from './types';
import { v4 as uuid } from 'uuid';
import { Schema } from 'mongoose';

let ValidationCodeModel: ReturnType<typeof getMongoModel<ValidationCode>>;

export const modelGetter = () => {
  if (!ValidationCodeModel) {
    const ValidationCodeShema = new Schema<ValidationCode>({
      ...createdAtSchemaDefinition,
      code: { type: String, default: () => uuid(), required: true, unique: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      meta: { type: Schema.Types.Mixed }
    });

    ValidationCodeModel = getMongoModel<ValidationCode>(
      'ValidationCode',
      ValidationCodeShema,
      'validation_codes'
    );
  }

  return ValidationCodeModel;
};
