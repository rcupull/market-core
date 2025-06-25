"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalJobDtosServices = void 0;
const general_1 = require("../../utils/general");
class ProfessionalJobDtosServices {
    constructor() {
        this.getProfessionalJobsDto = async (professionalJobs) => {
            const getProfessionalJobDto = async (professionalJobs) => {
                return {
                    ...(0, general_1.deepJsonCopy)(professionalJobs)
                };
            };
            const promises = professionalJobs.map(getProfessionalJobDto);
            const out = await Promise.all(promises);
            return out;
        };
    }
}
exports.ProfessionalJobDtosServices = ProfessionalJobDtosServices;
