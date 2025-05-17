"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationCodeServices = void 0;
const schemas_1 = require("./schemas");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class ValidationCodeServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter);
    }
}
exports.ValidationCodeServices = ValidationCodeServices;
