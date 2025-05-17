import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity } from '../../types/general';

export interface PushNotification extends BaseIdentity {
  type: string;
  userIds?: Array<Schema.Types.ObjectId>;
  readBys?: Record<string, Date>;
  //
  postId?: Schema.Types.ObjectId;
  shoppingId?: Schema.Types.ObjectId;
  shoppingCode?: string;
  stockAmountAvailable?: number;
  routeName?: string;
  businessName?: string;
  meta?: AnyRecord;
  paymentProofCode?: string;
  paymentProofId?: Schema.Types.ObjectId;
  message?: string;
}
