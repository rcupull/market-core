import { FilterQuery } from 'mongoose';
import { ValidationCodeModel } from './schemas';
import { ValidationCode } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class ValidationCodeServices extends ModelCrudTemplate<
  ValidationCode,
  Pick<ValidationCode, 'userId'>,
  FilterQuery<ValidationCode>
> {
  constructor() {
    super(ValidationCodeModel);
  }
}
