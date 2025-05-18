"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../utils/general");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ search, questionSuggestions, hidden, ...filterQuery }) => {
    /**
     * ////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////
     */
    if (search) {
        filterQuery.$or.push({ question: (0, schemas_1.getSearchRegexQuery)(search) });
    }
    if (questionSuggestions === null || questionSuggestions === void 0 ? void 0 : questionSuggestions.length) {
        filterQuery.$or.push({ question: (0, schemas_1.getInArrayQuery)(questionSuggestions) });
    }
    if ((0, general_1.isBoolean)(hidden)) {
        filterQuery.hidden = (0, schemas_1.getBooleanQuery)(hidden);
    }
    return filterQuery;
});
