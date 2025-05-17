import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';
export interface Review extends BaseIdentity {
    reviewerId: Schema.Types.ObjectId;
    postId: Schema.Types.ObjectId;
    star: number;
    comment: string;
}
