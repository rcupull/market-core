"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentProofCode = exports.getAllFilterQuery = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../utils/general");
const getAllFilterQuery = (args) => {
    const { search, ...omittedQuery } = args;
    const filterQuery = omittedQuery;
    if (search) {
        filterQuery['purchaseInfo.code'] = (0, schemas_1.getSearchRegexQuery)(search);
    }
    return filterQuery;
};
exports.getAllFilterQuery = getAllFilterQuery;
const getPaymentProofCode = () => {
    const chars = (0, general_1.getCharCode)(2);
    const numbers = (0, general_1.getNumberCode)(4);
    return `CP-${chars}-${numbers}`;
};
exports.getPaymentProofCode = getPaymentProofCode;
