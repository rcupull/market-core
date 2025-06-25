import { modelGetter } from './schemas';

import { getAllFilterQuery, getProfessionalJobSlugFromName } from './utils';

import { GetAllProfessionalJobArgs, ProfessionalJob } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class ProfessionalJobServices extends ModelCrudTemplate<
  ProfessionalJob,
  Pick<
    ProfessionalJob,
    | 'hidden'
    | 'hiddenBusiness'
    | 'description'
    | 'details'
    | 'images'
    | 'routeName'
    | 'name'
    | 'professionalJobSlug'
    | 'createdBy'
  >,
  GetAllProfessionalJobArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }

  getProfessionalJobSlugFromName: typeof getProfessionalJobSlugFromName = (name) => {
    return getProfessionalJobSlugFromName(name);
  };
}
