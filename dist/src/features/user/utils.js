"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKET = exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ search, ...filterQuery }) => {
    if (search) {
        filterQuery.$or.push({ name: (0, schemas_1.getSearchRegexQuery)(search) });
        filterQuery.$or.push({ phone: (0, schemas_1.getSearchRegexQuery)(search) });
    }
    return filterQuery;
});
exports.MARKET = 'market';
