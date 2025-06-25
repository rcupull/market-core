import { deepJsonCopy } from '../../utils/general';
import { ProfessionalJob } from '../professional-job/types';
import { ProfessionalJobDto } from './types';

export class ProfessionalJobDtosServices {
  constructor() {}

  getProfessionalJobsDto = async (
    professionalJobs: Array<ProfessionalJob>
  ): Promise<Array<ProfessionalJobDto>> => {
    const getProfessionalJobDto = async (
      professionalJobs: ProfessionalJob
    ): Promise<ProfessionalJobDto> => {
      return {
        ...deepJsonCopy(professionalJobs)
      };
    };

    const promises = professionalJobs.map(getProfessionalJobDto);
    const out = await Promise.all(promises);

    return out;
  };
}
