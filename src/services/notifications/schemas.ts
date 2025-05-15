import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { PushNotification, PushNotificationType } from './types';

const PushNotificationShema = new Schema<PushNotification>({
  ...createdAtSchemaDefinition,
  type: { type: String, enum: Object.values(PushNotificationType), required: true },
  userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  readBys: { type: Object },
  businessName: { type: String },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  routeName: { type: String },
  shoppingId: { type: Schema.Types.ObjectId, ref: 'Shopping' },
  shoppingCode: { type: String },
  stockAmountAvailable: { type: Number },
  meta: { type: Schema.Types.Mixed },
  paymentProofCode: { type: String },
  message: { type: String },
  paymentProofId: { type: Schema.Types.ObjectId, ref: 'PaymentProof' }
});

export const PushNotificationModel = getMongoModel<PushNotification>(
  'PushNotification',
  PushNotificationShema,
  'push_notification'
);
