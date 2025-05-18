"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../types/general");
const types_1 = require("./types");
const mongoose_1 = require("mongoose");
let PaymentModel;
const modelGetter = () => {
    if (!PaymentModel) {
        const PaymentSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            bankAccountNumberFrom: { type: String },
            saleProductsPrice: { type: Number, required: true },
            saleDeliveryPrice: { type: Number, required: true },
            saleTotalPrice: { type: Number, required: true },
            currency: { type: String, required: true, enum: Object.values(general_1.Currency) },
            paymentWay: { type: String, enum: Object.values(types_1.PaymentWay), required: true },
            shoppingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shopping', required: true },
            createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            transactionCode: { type: String },
            wasTransactionCodeAutoCompleted: { type: Boolean },
            validation: {
                createdAt: { type: Date, require: true },
                createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', require: true }
            }
        });
        PaymentModel = (0, schemas_1.getMongoModel)('Payment', PaymentSchema, 'payments');
    }
    return PaymentModel;
};
exports.modelGetter = modelGetter;
