import { GetAllBusinessRequestArgs, getAllFilterQuery } from './utils';
import { BusinessRequestModel } from './schemas';
import { BusinessRequest } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class BusinessRequestServices extends ModelCrudTemplate<
  BusinessRequest,
  Pick<BusinessRequest, 'createdBy' | 'routeName' | 'name' | 'currency' | 'status' | 'description'>,
  GetAllBusinessRequestArgs
> {
  constructor() {
    super(BusinessRequestModel, getAllFilterQuery);
  }
}
