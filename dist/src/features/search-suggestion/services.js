"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSuggestionServices = void 0;
const schemas_1 = require("./schemas");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
class SearchSuggestionServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor() {
        super(schemas_1.modelGetter);
    }
}
exports.SearchSuggestionServices = SearchSuggestionServices;
