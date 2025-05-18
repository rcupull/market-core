"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let PromoModel;
const modelGetter = () => {
    if (!PromoModel) {
        const PromoSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            name: { type: String, required: true },
            description: { type: String },
            entityId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            entityType: { type: String, enum: Object.values(types_1.PromoEntityType), required: true },
            image: {
                type: {
                    src: { type: String, required: true },
                    width: { type: Number, required: true },
                    height: { type: Number, required: true }
                }
            }
        });
        PromoModel = (0, schemas_1.getMongoModel)('Promo', PromoSchema, 'promos');
    }
    return PromoModel;
};
exports.modelGetter = modelGetter;
