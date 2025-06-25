"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalJobServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class ProfessionalJobServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.getProfessionalJobSlugFromName = (name) => {
            return (0, utils_1.getProfessionalJobSlugFromName)(name);
        };
    }
}
exports.ProfessionalJobServices = ProfessionalJobServices;
