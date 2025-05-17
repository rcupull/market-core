"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ routeNames, search, hidden, ...filterQuery }) => {
    ///////////////////////////////////////////////////////////////////
    if (routeNames === null || routeNames === void 0 ? void 0 : routeNames.length) {
        filterQuery.routeName = { $in: routeNames };
    }
    ///////////////////////////////////////////////////////////////////
    if (search) {
        filterQuery.$or = [
            { name: (0, schemas_1.getSearchRegexQuery)(search) },
            { postCategories: { $elemMatch: { label: (0, schemas_1.getSearchRegexQuery)(search) } } }
        ];
    }
    ///////////////////////////////////////////////////////////////////
    if (hidden !== undefined) {
        filterQuery.hidden = hidden;
    }
    return filterQuery;
});
