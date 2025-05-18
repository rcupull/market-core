"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let SearchSuggestionModel;
const modelGetter = () => {
    if (!SearchSuggestionModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const SearchSuggestionSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            search: { type: String, required: true, unique: true }
        });
        SearchSuggestionModel = (0, schemas_1.getMongoModel)('SearchSuggestion', SearchSuggestionSchema, 'search_suggestion');
    }
    return SearchSuggestionModel;
};
exports.modelGetter = modelGetter;
