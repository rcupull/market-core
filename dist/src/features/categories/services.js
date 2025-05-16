"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesServices = void 0;
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
class CategoriesServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
    }
}
exports.CategoriesServices = CategoriesServices;
