"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddress = exports.MARKET = exports.getAllFilterQuery = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
exports.getAllFilterQuery = (0, schemas_1.getFilterQueryFactory)(({ search, ...filterQuery }) => {
    if (search) {
        filterQuery.$or.push({ name: (0, schemas_1.getSearchRegexQuery)(search) });
        filterQuery.$or.push({ phone: (0, schemas_1.getSearchRegexQuery)(search) });
    }
    return filterQuery;
});
exports.MARKET = 'market';
const getUserAddress = (user, addressIndex) => {
    /**
     * if addressIndex is not defined, then we return the default address, or the first address if there is no default
     */
    const { addresses, defaultAddressIndex } = user;
    const index = (0, general_1.isNumber)(addressIndex) ? addressIndex : defaultAddressIndex;
    if ((0, general_1.isNumber)(index)) {
        return (addresses === null || addresses === void 0 ? void 0 : addresses[index]) || (addresses === null || addresses === void 0 ? void 0 : addresses[0]);
    }
    return addresses === null || addresses === void 0 ? void 0 : addresses[0];
};
exports.getUserAddress = getUserAddress;
