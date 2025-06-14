"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let HelperModel;
const modelGetter = () => {
    if (!HelperModel) {
        const HelperSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            title: { type: String, required: true },
            content: { type: String, required: true },
            description: { type: String },
            helperSlug: { type: String, required: true, unique: true },
            hidden: { type: Boolean, default: false },
            relatedIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'helper' }]
        });
        HelperModel = (0, schemas_1.getMongoModel)('helper', HelperSchema, 'helpers');
    }
    return HelperModel;
};
exports.modelGetter = modelGetter;
