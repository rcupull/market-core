"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTrackingServices = void 0;
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class ApiTrackingServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.ApiTrackingModel, utils_1.getAllFilterQuery);
    }
}
exports.ApiTrackingServices = ApiTrackingServices;
