"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let UserActivityModel;
const modelGetter = () => {
    if (!UserActivityModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const UserActivitySchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            identifier: { type: String, unique: true, required: true },
            products: {
                _id: false,
                type: [
                    {
                        productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
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
