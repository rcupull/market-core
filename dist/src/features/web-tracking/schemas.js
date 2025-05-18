"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const db_1 = require("../../db");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
let WebTrackingModel;
const modelGetter = () => {
    if (!WebTrackingModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const WebTrackingSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            type: { type: String, enum: Object.values(types_1.webTrackingTypeRecord), required: true },
            browserFingerprint: { type: String, required: true },
            hostname: { type: String, required: true },
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            data: { type: Schema.Types.Mixed }
        });
        WebTrackingModel = (0, schemas_1.getMongoModel)('WebTracking', WebTrackingSchema, 'web_trackings');
    }
    return WebTrackingModel;
};
exports.modelGetter = modelGetter;
