"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let UserActivityModel;
const modelGetter = () => {
    if (!UserActivityModel) {
        const UserActivitySchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            identifier: { type: String, unique: true, required: true },
            products: {
                _id: false,
                type: [
                    {
                        productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true },
                        score: { type: Number, required: true }
                    }
                ],
                default: []
            }
        });
        UserActivityModel = (0, schemas_1.getMongoModel)('UserActivity', UserActivitySchema, 'user_activities');
    }
    return UserActivityModel;
};
exports.modelGetter = modelGetter;
