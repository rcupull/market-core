"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../types/general");
const mongoose_1 = require("mongoose");
let PostModel;
const modelGetter = () => {
    if (!PostModel) {
        const PostSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            routeName: { type: String, required: true },
            description: { type: String },
            details: { type: String },
            hidden: { type: Boolean, default: false },
            hiddenBusiness: { type: Boolean, default: false },
            createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            postCategoriesLabels: { type: [String] },
            categoryIds: { type: [mongoose_1.Schema.Types.ObjectId] },
            images: {
                type: [
                    {
                        src: { type: String, required: true },
                        width: { type: Number, required: true },
                        height: { type: Number, required: true }
                    }
                ]
            },
            clothingSizes: [
                {
                    type: String,
                    enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
                }
            ],
            colors: [
                {
                    type: String
                }
            ],
            name: { type: String, required: true },
            postSlug: { type: String, required: true },
            //
            price: { type: Number },
            currency: { type: String, enum: Object.values(general_1.Currency) },
            currenciesOfSale: {
                _id: false,
                type: [{ type: String, enum: Object.values(general_1.Currency) }],
                default: []
            },
            //
            discount: { type: Number },
            stockAmount: { type: Number, required: true, default: 0 },
            stockAmountHistory: {
                _id: false,
                type: [
                    {
                        amount: { type: Number, required: true },
                        updatedAt: { type: Date, required: true },
                        updatedByUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                        updatedByShopping: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shopping' }
                    }
                ],
                select: false,
                default: []
            },
            postType: {
                type: String,
                enum: ['product', 'link'],
                required: true,
                default: 'product'
            },
            postLink: {
                type: {
                    type: String,
                    enum: ['business', 'external']
                },
                value: { type: String }
            }
        });
        PostSchema.index({
            routeName: 1,
            postSlug: 1
        }, { unique: true });
        PostModel = (0, schemas_1.getMongoModel)('Post', PostSchema, 'posts');
    }
    return PostModel;
};
exports.modelGetter = modelGetter;
