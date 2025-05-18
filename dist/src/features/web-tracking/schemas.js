"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const mongoose_1 = require("mongoose");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
let WebTrackingModel;
const modelGetter = () => {
    if (!WebTrackingModel) {
        const WebTrackingSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            type: { type: String, enum: Object.values(types_1.webTrackingTypeRecord), required: true },
            browserFingerprint: { type: String, required: true },
            hostname: { type: String, required: true },
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            data: { type: mongoose_1.Schema.Types.Mixed }
        });
        WebTrackingModel = (0, schemas_1.getMongoModel)('WebTracking', WebTrackingSchema, 'web_trackings');
    }
    return WebTrackingModel;
};
exports.modelGetter = modelGetter;
