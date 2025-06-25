import { ProfessionalJob } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Schema } from 'mongoose';

let ProfessionalJobModel: ReturnType<typeof getMongoModel<ProfessionalJob>>;

export const modelGetter = () => {
  if (!ProfessionalJobModel) {
    const ProfessionalJobSchema = new Schema<ProfessionalJob>({
      ...createdAtSchemaDefinition,
      routeName: { type: String, required: true },
      description: { type: String },
      details: { type: String },
      hidden: { type: Boolean, default: false },
      hiddenBusiness: { type: Boolean, default: false },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

    ProfessionalJobSchema.index(
      {
        routeName: 1,
        professionalJobSlug: 1
      },
      { unique: true }
    );

    ProfessionalJobModel = getMongoModel<ProfessionalJob>(
      'ProfessionalJob',
      ProfessionalJobSchema,
      'professional_jobs'
    );
  }

  return ProfessionalJobModel;
};
