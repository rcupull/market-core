"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let ReviewModel;
const modelGetter = () => {
    if (!ReviewModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const ReviewSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
            comment: { type: String, required: true },
            star: { type: Number, required: true }
        });
        ReviewModel = (0, schemas_1.getMongoModel)('Review', ReviewSchema, 'reviews');
    }
    return ReviewModel;
};
exports.modelGetter = modelGetter;
