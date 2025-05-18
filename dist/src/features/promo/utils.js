"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ search, ...filterQuery }) => {
    if (search) {
        filterQuery.name = (0, schemas_1.getSearchRegexQuery)(search);
    }
    return filterQuery;
});
