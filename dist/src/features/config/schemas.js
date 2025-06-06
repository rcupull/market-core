"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const schemas_2 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
const types_1 = require("../business/types");
///////////////////////////////////////////////////////////////////////////////
let AdminConfigModel;
const modelGetter = () => {
    if (!AdminConfigModel) {
        const commissionsByBusinessTypeSchemaDefinition = Object.values(types_1.BusinessType).reduce((acc, type) => ({
            ...acc,
            [type]: { _id: false, type: schemas_1.commissionsSchemaDefinition, required: true, select: false }
        }), {});
        const AdminConfigShema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            bankAccountCUP: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            bankAccountMLC: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            termsAndConditions: { type: String },
            termsAndConditionsRecord: [
                {
                    _id: false,
                    value: { type: String },
                    savedAt: { type: Date }
                }
            ],
            businessContract: { type: String },
            businessContractRecords: [
                {
                    _id: false,
                    value: { type: String },
                    savedAt: { type: Date }
                }
            ],
            apkUploadHistory: [
                {
                    _id: false,
                    filename: { type: String },
                    savedAt: { type: Date },
                    major: { type: Number },
                    minor: { type: Number },
                    patch: { type: Number }
                }
            ],
            ///////////////////////////////////////
            privacyPolicy: { type: String },
            privacyPolicyRecord: [
                {
                    _id: false,
                    value: { type: String },
                    savedAt: { type: Date }
                }
            ],
            ////////////////////////////////////////
            price: { type: String },
            priceRecord: [
                {
                    _id: false,
                    value: { type: String },
                    savedAt: { type: Date }
                }
            ],
            ////////////////////////////////////////
            features: {
                type: [
                    {
                        _id: false,
                        key: { type: String, unique: true },
                        enabled: { type: Boolean },
                        description: { type: String }
                    }
                ]
            },
            ////////////////////////////////////////
            exchangeRates: {
                _id: false,
                type: {
                    USD_CUP: { type: Number },
                    MLC_CUP: { type: Number }
                }
            },
            addresses: [schemas_2.AddressDefinition],
            deliveryConfig: schemas_2.DeliveryConfigDefinition,
            commissions: {
                _id: false,
                type: {
                    products: {
                        _id: false,
                        type: commissionsByBusinessTypeSchemaDefinition
                    },
                    delivery: {
                        _id: false,
                        type: commissionsByBusinessTypeSchemaDefinition
                    }
                },
                select: false
            },
            billing: {
                accountNumber: { type: String },
                bankNumber: { type: String },
                nit: { type: String },
                name: { type: String },
                address: { type: schemas_2.AddressDefinition }
            }
        });
        AdminConfigModel = (0, schemas_1.getMongoModel)('AdminConfig', AdminConfigShema, 'admin_config');
    }
    return AdminConfigModel;
};
exports.modelGetter = modelGetter;
