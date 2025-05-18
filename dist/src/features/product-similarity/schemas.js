"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let ProductSimilarityModel;
const modelGetter = () => {
    if (!ProductSimilarityModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const ProductSimilaritySchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
            productName: { type: String },
            classfiersScores: {
                type: [
                    {
                        _id: false,
                        classifierId: { type: Schema.Types.ObjectId, ref: 'Classifier', required: true },
                        score: { type: Number, required: true }
                    }
                ],
                default: []
            },
            productScores: {
                type: [
                    {
                        _id: false,
                        productId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
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
