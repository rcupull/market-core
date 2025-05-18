import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

import { WebTracking, webTrackingTypeRecord } from './types';

let WebTrackingModel: ReturnType<typeof getMongoModel<WebTracking>>;

export const modelGetter = () => {
  if (!WebTrackingModel) {
    const WebTrackingSchema = new Schema<WebTracking>({
      ...createdAtSchemaDefinition,
      type: { type: String, enum: Object.values(webTrackingTypeRecord), required: true },
      browserFingerprint: { type: String, required: true },
      hostname: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      data: { type: Schema.Types.Mixed }
    });

    WebTrackingModel = getMongoModel<WebTracking>(
      'WebTracking',
      WebTrackingSchema,
      'web_trackings'
    );
  }

  return WebTrackingModel;
};
