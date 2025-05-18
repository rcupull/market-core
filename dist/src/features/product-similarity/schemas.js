"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let ProductSimilarityModel;
const modelGetter = () => {
    if (!ProductSimilarityModel) {
        const ProductSimilaritySchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
            productName: { type: String },
            classfiersScores: {
                type: [
                    {
                        _id: false,
                        classifierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classifier', required: true },
                        score: { type: Number, required: true }
                    }
                ],
                default: []
            },
            productScores: {
                type: [
                    {
                        _id: false,
                        productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true },
                        productName: { type: String },
                        score: { type: Number, required: true }
                    }
                ],
                default: []
            }
        });
        ProductSimilarityModel = (0, schemas_1.getMongoModel)('ProductSimilarity', ProductSimilaritySchema, 'product_similarity');
    }
    return ProductSimilarityModel;
};
exports.modelGetter = modelGetter;
