"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let SearchSuggestionModel;
const modelGetter = () => {
    if (!SearchSuggestionModel) {
        const SearchSuggestionSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            search: { type: String, required: true, unique: true }
        });
        SearchSuggestionModel = (0, schemas_1.getMongoModel)('SearchSuggestion', SearchSuggestionSchema, 'search_suggestion');
    }
    return SearchSuggestionModel;
};
exports.modelGetter = modelGetter;
