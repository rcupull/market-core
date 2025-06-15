import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';
export interface Helper extends BaseIdentity {
    content: string;
    helperSlug: string;
    title: string;
    description?: string;
    hidden?: boolean;
    relatedIds?: Array<Schema.Types.ObjectId>;
}
