import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export interface Helper extends BaseIdentity {
  content: string;
  helperSlug: string;
  title: string;
  hidden?: boolean;
  relatedIds?: Array<Schema.Types.ObjectId>;
}

export interface HelperDto extends Helper {
  relatedHelpers: Array<Pick<Helper, 'helperSlug' | 'title'>> | undefined;
}
