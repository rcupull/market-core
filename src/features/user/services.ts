import { User } from './types';
import { modelGetter } from './schemas';
import { getAllFilterQuery, GetAllUsersArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class UserServices extends ModelCrudTemplate<
  User,
  {
    phone: string;
    password: string;
    name: string;
  },
  GetAllUsersArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }
}
