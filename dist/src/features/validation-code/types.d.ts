import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity } from '../../types/general';
export interface ValidationCode extends BaseIdentity {
    code: string;
    userId?: Schema.Types.ObjectId;
    meta?: AnyRecord;
}
