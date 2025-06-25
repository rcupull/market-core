"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let ProfessionalJobModel;
const modelGetter = () => {
    if (!ProfessionalJobModel) {
        const ProfessionalJobSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            routeName: { type: String, required: true },
            description: { type: String },
            details: { type: String },
            hidden: { type: Boolean, default: false },
            hiddenBusiness: { type: Boolean, default: false },
            createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            images: {
                type: [
                    {
                        src: { type: String, required: true },
                        width: { type: Number, required: true },
                        height: { type: Number, required: true }
                    }
                ]
            },
            name: { type: String, required: true },
            professionalJobSlug: { type: String, required: true }
        });
        ProfessionalJobSchema.index({
            routeName: 1,
            professionalJobSlug: 1
        }, { unique: true });
        ProfessionalJobModel = (0, schemas_1.getMongoModel)('ProfessionalJob', ProfessionalJobSchema, 'professional_jobs');
    }
    return ProfessionalJobModel;
};
exports.modelGetter = modelGetter;
