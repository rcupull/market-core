"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const utils_1 = require("./utils");
const mongoose_1 = require("mongoose");
let PaymentProofModel;
const modelGetter = () => {
    if (!PaymentProofModel) {
        const PaymentProofSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            //
            code: { type: String, required: true, default: utils_1.getPaymentProofCode },
            customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            shoppingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shopping', required: true }
        });
        PaymentProofModel = (0, schemas_1.getMongoModel)('PaymentProof', PaymentProofSchema, 'payment_proofs');
    }
    return PaymentProofModel;
};
exports.modelGetter = modelGetter;
