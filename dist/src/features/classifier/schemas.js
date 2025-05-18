"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const mongoose_1 = require("mongoose");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("./types");
///////////////////////////////////////////////////////////////////////////////
let ClassifierModel;
const modelGetter = () => {
    if (!ClassifierModel) {
        const ClassifierShema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            label: { type: String, required: true, unique: true },
            tags: { type: String },
            hidden: { type: Boolean, default: false },
            type: { type: String, enum: Object.values(types_1.ClassifierType), default: types_1.ClassifierType.CATEGORY }
        });
        ClassifierModel = (0, schemas_1.getMongoModel)('Classifier', ClassifierShema, 'classifiers');
    }
    return ClassifierModel;
};
exports.modelGetter = modelGetter;
