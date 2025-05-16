import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity } from '../../types/general';
export interface ApiTracking extends BaseIdentity {
    descriptionDevice?: string;
    path: string;
    method: string;
    body: AnyRecord;
    params: AnyRecord;
    query: AnyRecord;
    userId: Schema.Types.ObjectId;
}
export interface ApiTrackingDto extends ApiTracking {
    userName: string | undefined;
}
