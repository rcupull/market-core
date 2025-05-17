import { getMongoose } from '../../db';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { PushNotification } from './types';

let PushNotificationModel: ReturnType<typeof getMongoModel<PushNotification>>;

export const modelGetter = () => {
  if (!PushNotificationModel) {
    const { Schema } = getMongoose();

    const PushNotificationShema = new Schema<PushNotification>({
      ...createdAtSchemaDefinition,
      type: { type: String, required: true },
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

    PushNotificationModel = getMongoModel<PushNotification>(
      'PushNotification',
      PushNotificationShema,
      'push_notification'
    );
  }

  return PushNotificationModel;
};
