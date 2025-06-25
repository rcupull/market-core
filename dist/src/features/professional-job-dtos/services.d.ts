import { ProfessionalJob } from '../professional-job/types';
import { ProfessionalJobDto } from './types';
export declare class ProfessionalJobDtosServices {
    constructor();
    getProfessionalJobsDto: (professionalJobs: Array<ProfessionalJob>) => Promise<Array<ProfessionalJobDto>>;
}
