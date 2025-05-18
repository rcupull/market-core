"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ paymentIds, ...filterQuery }) => {
    if (paymentIds === null || paymentIds === void 0 ? void 0 : paymentIds.length) {
        filterQuery._id = (0, schemas_1.getInArrayQuery)(paymentIds);
    }
    return filterQuery;
});
