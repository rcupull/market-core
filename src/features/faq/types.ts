import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export enum InterestingForUser {
  OWNERS = 'OWNERS',
  MESSENGERS = 'MESSENGERS',
  CUSTOMERS = 'CUSTOMERS'
}

export interface Faq extends BaseIdentity {
  question: string;
  answer: string;
  hidden?: boolean;
  relatedIds?: Array<Schema.Types.ObjectId>;
  interestingFor?: Array<InterestingForUser>;
}

export interface FaqDto extends Faq {
  relatedFaqs: Array<Pick<Faq, '_id' | 'question'>> | undefined;
}
