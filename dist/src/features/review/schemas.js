"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let ReviewModel;
const modelGetter = () => {
    if (!ReviewModel) {
        const ReviewSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            reviewerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true },
            comment: { type: String, required: true },
            star: { type: Number, required: true },
            images: {
                type: [{
                        src: String,
                        width: Number,
                        height: Number,
                        href: { type: String, required: false }
                    }], required: false
            }
        });
        ReviewModel = (0, schemas_1.getMongoModel)('Review', ReviewSchema, 'reviews');
    }
    return ReviewModel;
};
exports.modelGetter = modelGetter;
