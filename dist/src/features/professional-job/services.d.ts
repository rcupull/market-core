import { getProfessionalJobSlugFromName } from './utils';
import { GetAllProfessionalJobArgs, ProfessionalJob } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class ProfessionalJobServices extends ModelCrudTemplate<ProfessionalJob, Pick<ProfessionalJob, 'hidden' | 'hiddenBusiness' | 'description' | 'details' | 'images' | 'routeName' | 'name' | 'professionalJobSlug' | 'createdBy'>, GetAllProfessionalJobArgs> {
    constructor();
    getProfessionalJobSlugFromName: typeof getProfessionalJobSlugFromName;
}
