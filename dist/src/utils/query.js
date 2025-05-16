"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSortQuery = void 0;
const getSortQuery = (sort) => {
    /**
     * get the query from a field similar to '-createdAt' or 'createdAt'
     */
    if (!sort)
        return undefined;
    const field = sort[0] === '-' ? sort.slice(1) : sort;
    const direction = sort[0] === '-' ? -1 : 1;
    if (!field || !direction) {
        return undefined;
    }
    return { [field]: direction };
};
exports.getSortQuery = getSortQuery;
