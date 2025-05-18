import { Faq, InterestingForUser } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getMongoose } from '../../db';

let FaqModel: ReturnType<typeof getMongoModel<Faq>>;

export const modelGetter = () => {
  if (!FaqModel) {
    const { Schema } = getMongoose();

    const FaqSchema = new Schema<Faq>({
      ...createdAtSchemaDefinition,
      question: { type: String, required: true },
      answer: { type: String, required: true },
      hidden: { type: Boolean, default: false },
      relatedIds: [{ type: Schema.Types.ObjectId, ref: 'Faq' }],
      interestingFor: [{ type: String, enum: Object.values(InterestingForUser) }]
    });

    FaqModel = getMongoModel<Faq>('Faq', FaqSchema, 'faqs');
  }

  return FaqModel;
};
