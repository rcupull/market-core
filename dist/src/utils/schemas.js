"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatedLastMonthQuery = exports.setFilterQueryWithDates = exports.postDataSchemaDefinition = exports.getBooleanQuery = exports.PostCardLayoutSchema = exports.DeliveryConfigDefinition = exports.commissionsSchemaDefinition = exports.getFilterQueryFactory = exports.BankAccountDefinition = exports.AddressDefinition = exports.getSortQuery = exports.lastUpQuerySort = exports.getMongoModel = exports.getSearchRegexQuery = exports.getInArrayQuery = exports.createdAtSchemaDefinition = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const general_1 = require("../types/general");
const general_2 = require("./general");
const commision_1 = require("../types/commision");
const types_1 = require("../features/business/types");
const date_fns_1 = require("date-fns");
exports.createdAtSchemaDefinition = {
    createdAt: { type: Date, required: true, default: Date.now }
};
const getInArrayQuery = (anyArray) => {
    return { $in: anyArray };
};
exports.getInArrayQuery = getInArrayQuery;
const getSearchRegexQuery = (search = '') => {
    return { $regex: new RegExp(search.trim()), $options: 'i' };
};
exports.getSearchRegexQuery = getSearchRegexQuery;
const getMongoModel = (ref, schema, collectionName) => {
    schema.plugin(mongoose_paginate_v2_1.default);
    schema.plugin(mongoose_aggregate_paginate_v2_1.default);
    return (0, mongoose_1.model)(ref, schema, collectionName);
};
exports.getMongoModel = getMongoModel;
exports.lastUpQuerySort = '-createdAt';
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
exports.AddressDefinition = {
    name: { type: String },
    city: { type: String },
    municipality: { type: String },
    street: { type: String },
    streetBetweenFrom: { type: String },
    streetBetweenTo: { type: String },
    neighborhood: { type: String },
    number: { type: Number },
    apartment: { type: Number },
    country: { type: String },
    countryCode: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    postCode: { type: String },
    placeId: { type: String }
};
exports.BankAccountDefinition = {
    alias: { type: String },
    accountNumber: { type: String },
    confirmationPhoneNumber: { type: String }
};
const getFilterQueryFactory = (callback) => {
    const out = (allFilterQuery) => {
        let filterQuery = allFilterQuery;
        /**
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         * Add empty $or
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         */
        if (!filterQuery.$or) {
            filterQuery.$or = [];
        }
        if (!filterQuery.$and) {
            filterQuery.$and = [];
        }
        /**
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         * Run callback
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         */
        filterQuery = callback(filterQuery);
        /**
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         * Remove empty $or
         * ///////////////////////////////////////////////////////////////////
         * ///////////////////////////////////////////////////////////////////
         */
        if ((0, general_2.isEmpty)(filterQuery.$or)) {
            delete filterQuery.$or;
        }
        if ((0, general_2.isEmpty)(filterQuery.$and)) {
            delete filterQuery.$and;
        }
        return (0, general_2.getFlattenUndefinedJson)(filterQuery);
    };
    return out;
};
exports.getFilterQueryFactory = getFilterQueryFactory;
const commissionSchemaDefinition = {
    mode: {
        _id: false,
        type: String,
        enum: Object.values(commision_1.CommissionMode)
    },
    value: {
        _id: false,
        type: Number
    }
};
exports.commissionsSchemaDefinition = {
    marketOperation: {
        _id: false,
        type: commissionSchemaDefinition
    },
    systemUse: {
        _id: false,
        type: commissionSchemaDefinition
    }
};
exports.DeliveryConfigDefinition = {
    type: {
        type: String,
        enum: Object.values(types_1.DeliveryConfigType),
        default: types_1.DeliveryConfigType.NONE
    },
    minPrice: { type: Number, default: 0 },
    priceByKm: { type: Number, default: 0 }
};
const PostLayoutShoppingMethodDefinition = {
    type: String,
    enum: ['none', 'shoppingCart']
};
exports.PostCardLayoutSchema = new mongoose_1.Schema({
    images: {
        type: String,
        enum: ['static', 'hoverZoom', 'slider', 'switch', 'rounded'],
        default: 'static'
    },
    size: {
        type: String,
        enum: ['small', 'medium', 'long'],
        default: 'medium'
    },
    metaLayout: {
        type: String,
        enum: ['basic', 'verticalCentered'],
        default: 'basic'
    },
    name: {
        type: String,
        enum: ['none', 'basic'],
        required: true,
        default: 'basic'
    },
    price: {
        type: String,
        enum: ['none', 'basic', 'smallerCurrency', 'usdCurrencySymbol'],
        default: 'basic'
    },
    discount: {
        type: String,
        enum: ['none', 'savedPercent', 'savedMoney'],
        default: 'none'
    },
    shoppingMethod: PostLayoutShoppingMethodDefinition
});
const getBooleanQuery = (value) => {
    /**
     * when value ===false include false, null or undefined,all except true => { $ne: true }
     */
    return value ? { $eq: true } : { $ne: true };
};
exports.getBooleanQuery = getBooleanQuery;
exports.postDataSchemaDefinition = {
    _id: { type: String, required: true },
    images: {
        type: [
            {
                src: { type: String, required: true },
                width: { type: Number, required: true },
                height: { type: Number, required: true }
            }
        ]
    },
    name: { type: String, required: true },
    commissions: { _id: false, type: exports.commissionsSchemaDefinition, required: true },
    salePrice: { type: Number, required: true },
    routeName: { type: String, required: true },
    currency: { type: String, enum: Object.values(general_1.Currency) },
    currenciesOfSale: {
        _id: false,
        type: [{ type: String, enum: Object.values(general_1.Currency) }],
        default: []
    }
};
const setFilterQueryWithDates = ({ filterQuery, dateFrom, dateTo }) => {
    if (dateFrom) {
        //@ts-expect-error ts(2345)
        set(filterQuery, 'createdAt.$gte', new Date(dateFrom));
    }
    if (dateTo) {
        //@ts-expect-error ts(2345)
        set(filterQuery, 'createdAt.$lte', new Date(dateTo));
    }
};
exports.setFilterQueryWithDates = setFilterQueryWithDates;
const getCreatedLastMonthQuery = () => {
    const now = new Date();
    const lastMonth = (0, date_fns_1.subMonths)(now, 1);
    return {
        createdAt: {
            $gte: lastMonth,
            $lt: now
        }
    };
};
exports.getCreatedLastMonthQuery = getCreatedLastMonthQuery;
