"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ routeNames, ...filterQuery }) => {
    if (routeNames === null || routeNames === void 0 ? void 0 : routeNames.length) {
        filterQuery.routeName = { $in: routeNames };
    }
    return filterQuery;
});
