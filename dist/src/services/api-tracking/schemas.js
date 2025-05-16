"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTrackingModel = void 0;
const mongoose_1 = require("mongoose");
const schemas_1 = require("../../utils/schemas");
const ApiTrackingSchema = new mongoose_1.Schema({
    ...schemas_1.createdAtSchemaDefinition,
    descriptionDevice: { type: String },
    path: { type: String, required: true },
    body: { type: Object, required: true },
    params: { type: Object, required: true },
    query: { type: Object, required: true },
    method: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
});
exports.ApiTrackingModel = (0, schemas_1.getMongoModel)('ApiTracking', ApiTrackingSchema, 'api_tracking');
