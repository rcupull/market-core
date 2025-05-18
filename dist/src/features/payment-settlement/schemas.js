"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
const db_1 = require("../../db");
let PaymentSettlementModel;
const modelGetter = () => {
    if (!PaymentSettlementModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const PaymentSettlementSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            state: { type: String, enum: Object.values(types_1.PaymentSettlementState), required: true },
            type: { type: String, enum: Object.values(types_1.PaymentSettlementType), required: true },
            //
            shoppingRecords: [
                {
                    _id: false,
                    type: {
                        _id: false,
                        shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true },
                        shoppingCode: { type: String, required: true },
                        shoppingDeliveryAmount: { type: Number },
                        postsData: {
                            _id: false,
                            type: [
                                {
                                    _id: false,
                                    type: {
                                        _id: false,
                                        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
                                        postName: { type: String, required: true },
                                        postAmount: { type: Number, required: true }
                                    }
                                }
                            ]
                        }
                    },
                    require: true
                }
            ],
            //
            fromDate: { type: Date, required: true },
            toDate: { type: Date, required: true },
            //
            changedToDoneAt: { type: Date },
            changedToDoneBy: { type: Schema.Types.ObjectId, ref: 'User' },
            settlementCode: { type: String },
            //
            routeName: { type: String },
            messengerId: { type: Schema.Types.ObjectId, ref: 'User' }
            //
        });
        PaymentSettlementModel = (0, schemas_1.getMongoModel)('PaymentSettlement', PaymentSettlementSchema, 'payment_settlement');
    }
    return PaymentSettlementModel;
};
exports.modelGetter = modelGetter;
