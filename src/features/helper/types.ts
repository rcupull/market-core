import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export enum HelperType {
  ARTICLE = 'ARTICLE',
  HELP = 'HELP'
}

export interface Helper extends BaseIdentity {
  content: string;
  helperSlug: string;
  title: string;
  description?: string;
  hidden?: boolean;
  type?: HelperType;
  relatedIds?: Array<Schema.Types.ObjectId>;
}
