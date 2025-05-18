"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const db_1 = require("../../db");
let FaqModel;
const modelGetter = () => {
    if (!FaqModel) {
        const { Schema } = (0, db_1.getMongoose)();
        const FaqSchema = new Schema({
            ...schemas_1.createdAtSchemaDefinition,
            question: { type: String, required: true },
            answer: { type: String, required: true },
            hidden: { type: Boolean, default: false },
            relatedIds: [{ type: Schema.Types.ObjectId, ref: 'Faq' }],
            interestingFor: [{ type: String, enum: Object.values(types_1.InterestingForUser) }]
        });
        FaqModel = (0, schemas_1.getMongoModel)('Faq', FaqSchema, 'faqs');
    }
    return FaqModel;
};
exports.modelGetter = modelGetter;
