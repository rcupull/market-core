import { Schema } from 'mongoose';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

import { WebTracking, wt } from './types';

const WebTrackingSchema = new Schema<WebTracking>({
  ...createdAtSchemaDefinition,
  type: { type: String, enum: Object.values(wt), required: true },
  browserFingerprint: { type: String, required: true },
  hostname: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  data: { type: Schema.Types.Mixed }
});

export const WebTrackingModel = getMongoModel<WebTracking>(
  'WebTracking',
  WebTrackingSchema,
  'web_trackings'
);
