import { FilterQuery } from 'mongoose';
import { modelGetter } from './schemas';
import { ValidationCode } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class ValidationCodeServices extends ModelCrudTemplate<
  ValidationCode,
  Pick<ValidationCode, 'userId'>,
  FilterQuery<ValidationCode>
> {
  constructor() {
    super(modelGetter);
  }
}
