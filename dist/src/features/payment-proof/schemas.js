"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const utils_1 = require("./utils");
const db_1 = require("../../db");
let PaymentProofModel;
const modelGetter = () => {
    if (!PaymentProofModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const PaymentProofSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            //
            code: { type: String, required: true, default: utils_1.getPaymentProofCode },
            customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping', required: true }
        });
        PaymentProofModel = (0, schemas_1.getMongoModel)('PaymentProof', PaymentProofSchema, 'payment_proofs');
    }
    return PaymentProofModel;
};
exports.modelGetter = modelGetter;
