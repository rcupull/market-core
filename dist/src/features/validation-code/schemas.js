"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const uuid_1 = require("uuid");
const db_1 = require("../../db");
let ValidationCodeModel;
const modelGetter = () => {
    if (!ValidationCodeModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const ValidationCodeShema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            code: { type: String, default: () => (0, uuid_1.v4)(), required: true, unique: true },
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            meta: { type: Schema.Types.Mixed }
        });
        ValidationCodeModel = (0, schemas_1.getMongoModel)('ValidationCode', ValidationCodeShema, 'validation_codes');
    }
    return ValidationCodeModel;
};
exports.modelGetter = modelGetter;
