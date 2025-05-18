"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const uuid_1 = require("uuid");
const mongoose_1 = require("mongoose");
let ValidationCodeModel;
const modelGetter = () => {
    if (!ValidationCodeModel) {
        const ValidationCodeShema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            code: { type: String, default: () => (0, uuid_1.v4)(), required: true, unique: true },
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            meta: { type: mongoose_1.Schema.Types.Mixed }
        });
        ValidationCodeModel = (0, schemas_1.getMongoModel)('ValidationCode', ValidationCodeShema, 'validation_codes');
    }
    return ValidationCodeModel;
};
exports.modelGetter = modelGetter;
