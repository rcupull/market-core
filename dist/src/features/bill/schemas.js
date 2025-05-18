"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../types/general");
const mongoose_1 = require("mongoose");
const types_2 = require("../payment/types");
let BillModel;
const modelGetter = () => {
    if (!BillModel) {
        const BillSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            number: { type: Number, required: true },
            routeName: { type: String, required: true },
            //
            sellerName: { type: String, required: true },
            sellerEmail: { type: String, required: true },
            sellerAddress: { type: schemas_1.AddressDefinition, required: true },
            sellerAccountNumber: { type: String, required: true },
            sellerBankNumber: { type: String, required: true },
            sellerNit: { type: String, required: true },
            //
            customerName: { type: String, required: true },
            customerAddress: { type: schemas_1.AddressDefinition, required: true },
            customerAccountNumber: { type: String, required: true },
            customerBankNumber: { type: String, required: true },
            customerNit: { type: String, required: true },
            customerIdentityNumber: { type: String },
            //
            concepts: {
                type: [
                    {
                        type: { type: String, enum: Object.values(types_1.BillConceptType), required: true },
                        productMetaFromShopping: { type: schemas_1.postDataSchemaDefinition }
                    }
                ],
                required: true,
                default: []
            },
            totalAmount: { type: Number, required: true },
            detailedAmount: {
                type: [
                    {
                        _id: false,
                        shoppingCode: { type: String, required: true },
                        shoppingId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
                        amount: { type: Number, required: true }
                    }
                ],
                required: true,
                default: []
            },
            dateFrom: { type: Date, required: true },
            dateTo: { type: Date, required: true },
            currency: { type: String, enum: Object.values(general_1.Currency), required: true },
            paymentWay: { type: String, enum: Object.values(types_2.PaymentWay), required: true }
        });
        BillModel = (0, schemas_1.getMongoModel)('Bill', BillSchema, 'bills');
    }
    return BillModel;
};
exports.modelGetter = modelGetter;
