"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissionPrice = exports.getShoppingCode = exports.getAllFilterQuery = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
const commision_1 = require("../../types/commision");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ routeNames, states, deliveryStates, dateFrom, dateTo, shoppingIds, excludeShoppingIds, routeName, search, deliveryManId, ...filterQuery }) => {
    if (shoppingIds === null || shoppingIds === void 0 ? void 0 : shoppingIds.length) {
        filterQuery.$and.push({ _id: { $in: shoppingIds } });
    }
    if (excludeShoppingIds === null || excludeShoppingIds === void 0 ? void 0 : excludeShoppingIds.length) {
        filterQuery.$and.push({ _id: { $nin: excludeShoppingIds } });
    }
    if (search) {
        filterQuery.code = (0, schemas_1.getSearchRegexQuery)(search);
    }
    if (routeName) {
        filterQuery.routeName = routeName;
    }
    if (routeNames === null || routeNames === void 0 ? void 0 : routeNames.length) {
        filterQuery.routeName = { $in: routeNames };
    }
    if (states === null || states === void 0 ? void 0 : states.length) {
        filterQuery.state = { $in: states };
    }
    if (deliveryStates === null || deliveryStates === void 0 ? void 0 : deliveryStates.length) {
        filterQuery['requestedDelivery.state'] = { $in: deliveryStates };
    }
    if (deliveryManId) {
        filterQuery['requestedDelivery.deliveryManId'] = deliveryManId;
    }
    (0, schemas_1.setFilterQueryWithDates)({ filterQuery, dateFrom, dateTo });
    return filterQuery;
});
const getShoppingCode = () => {
    const chars = (0, general_1.getCharCode)(2);
    const numbers = (0, general_1.getNumberCode)(4);
    return `O-${chars}-${numbers}`;
};
exports.getShoppingCode = getShoppingCode;
const getCommissionPrice = (comission, price) => {
    const { mode, value } = comission;
    if (mode === commision_1.CommissionMode.PERCENT) {
        return (price * value) / 100;
    }
    /**
     * TODO in the future we can add more modes
     */
    return 0;
};
exports.getCommissionPrice = getCommissionPrice;
