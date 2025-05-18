"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
const utils_1 = require("./utils");
const mongoose_1 = require("mongoose");
const types_2 = require("../business/types");
let ShoppingModel;
const modelGetter = () => {
    if (!ShoppingModel) {
        const shoppingState = {
            type: String,
            enum: Object.values(types_1.ShoppingState),
            required: true
        };
        const purshaseNotesSchemaDefinition = {
            interestedByClothingSize: {
                _id: false,
                type: String
            },
            interestedByColor: {
                _id: false,
                type: String
            }
        };
        const ShoppingSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            posts: {
                type: [
                    {
                        _id: false,
                        postData: { type: schemas_1.postDataSchemaDefinition, required: true },
                        count: { type: Number, required: true },
                        lastUpdatedDate: { type: Date, required: true },
                        purshaseNotes: {
                            _id: false,
                            type: purshaseNotesSchemaDefinition
                        }
                    }
                ]
            },
            purchaserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            browserFingerprint: { type: String, select: false },
            payOnPickUp: { type: Boolean, default: false },
            //
            routeName: { type: String },
            businessType: { type: String, enum: Object.values(types_2.BusinessType) },
            //
            code: { type: String, required: true, default: utils_1.getShoppingCode },
            state: shoppingState,
            exchangeRates: {
                type: {
                    USD_CUP: { type: Number },
                    MLC_CUP: { type: Number }
                }
            },
            history: {
                type: [
                    {
                        _id: false,
                        state: shoppingState,
                        lastUpdatedDate: {
                            type: Date
                        },
                        reason: { type: String }
                    }
                ]
            },
            requestedDelivery: {
                _id: false,
                type: {
                    //
                    distance: { type: Number },
                    fromAddress: schemas_1.AddressDefinition,
                    toAddress: schemas_1.AddressDefinition,
                    //
                    salePrice: { type: Number, required: true },
                    commissions: { _id: false, type: schemas_1.commissionsSchemaDefinition, required: true },
                    //
                    deliveryManId: { type: mongoose_1.Schema.Types.ObjectId },
                    state: { type: String, enum: Object.values(types_1.ShoppingDeliveryState) },
                    messengersHistory: {
                        _id: false,
                        type: [
                            {
                                messengerId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
                                lastUpdatedDate: { type: Date, required: true }
                            }
                        ],
                        default: []
                    }
                }
            },
            cancellation: {
                requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', require: true },
                requestedAt: { type: Date, require: true },
                wasReturnedMoneyBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                wasReturnedMoneyAt: { type: Date }
            },
            cashSettlement: {
                createdAt: { type: Date },
                createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
            }
        });
        ShoppingModel = (0, schemas_1.getMongoModel)('Shopping', ShoppingSchema, 'shopping');
    }
    return ShoppingModel;
};
exports.modelGetter = modelGetter;
