"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
///////////////////////////////////////////////////////////////////////////////
let CategoryModel;
const modelGetter = () => {
    if (!CategoryModel) {
        const CategoryShema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            label: { type: String, required: true, unique: true },
            subCategories: {
                type: [
                    {
                        label: { type: String, required: true },
                        description: { type: String, required: true }
                    }
                ],
                default: []
            },
            categorySlug: { type: String, required: true, unique: true },
            categoryImages: {
                type: [
                    {
                        _id: false,
                        src: { type: String, required: false },
                        width: { type: Number, required: false },
                        height: { type: Number, required: false }
                    }
                ],
                default: null
            },
            subProductsAmounts: [{ type: Number, default: 0 }]
        });
        CategoryModel = (0, schemas_1.getMongoModel)('Category', CategoryShema, 'categories');
    }
    return CategoryModel;
};
exports.modelGetter = modelGetter;
