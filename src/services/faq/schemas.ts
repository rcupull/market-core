import { Schema } from 'mongoose';
import { Faq, InterestingForUser } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

export const FaqSchema = new Schema<Faq>({
  ...createdAtSchemaDefinition,
  question: { type: String, required: true },
  answer: { type: String, required: true },
  hidden: { type: Boolean, default: false },
  relatedIds: [{ type: Schema.Types.ObjectId, ref: 'Faq' }],
  interestingFor: [{ type: String, enum: Object.values(InterestingForUser) }]
});

export const FaqModel = getMongoModel<Faq>('Faq', FaqSchema, 'faqs');
