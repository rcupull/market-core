import { Business } from './types';
import { modelGetter } from './schemas';

import { GetAllBusinessArgs, getAllFilterQuery } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class BusinessServices extends ModelCrudTemplate<
  Business,
  Pick<Business, 'createdBy' | 'routeName' | 'name'>,
  GetAllBusinessArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }
}
