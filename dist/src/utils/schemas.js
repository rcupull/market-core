"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCardLayoutSchema = exports.DeliveryConfigDefinition = exports.commissionsSchemaDefinition = exports.getFilterQueryFactory = exports.BankAccountDefinition = exports.AddressDefinition = exports.getSortQuery = exports.lastUpQuerySort = exports.getMongoModel = exports.getSearchRegexQuery = exports.getInArrayQuery = exports.createdAtSchemaDefinition = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const db_1 = require("../db");
const general_1 = require("./general");
const commision_1 = require("../types/commision");
const types_1 = require("../features/business/types");
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
    const { model } = (0, db_1.getMongoose)();
    schema.plugin(mongoose_paginate_v2_1.default);
    schema.plugin(mongoose_aggregate_paginate_v2_1.default);
    return model(ref, schema, collectionName);
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
        if ((0, general_1.isEmpty)(filterQuery.$or)) {
            delete filterQuery.$or;
        }
        if ((0, general_1.isEmpty)(filterQuery.$and)) {
            delete filterQuery.$and;
        }
        return (0, general_1.getFlattenUndefinedJson)(filterQuery);
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
