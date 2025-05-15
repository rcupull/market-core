import { Schema } from 'mongoose';
import { BusinessRequest, BusinessRequestStatus } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Currency } from '../../types/general';

const BusinessRequestSchema = new Schema<BusinessRequest>({
  ...createdAtSchemaDefinition,
  name: { type: String, required: true },
  routeName: { type: String, required: true },
  currency: { type: String, enum: Object.values(Currency), required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(BusinessRequestStatus), required: true },
  description: { type: String, required: true }
});

export const BusinessRequestModel = getMongoModel<BusinessRequest>(
  'BusinessRequest',
  BusinessRequestSchema,
  'business_request'
);
