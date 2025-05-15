import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity } from '../../types/general';

export enum PushNotificationType {
  POST_AMOUNT_STOCK_CHANGE = 'POST_AMOUNT_STOCK_CHANGE',
  NEW_ORDER_WAS_CREATED = 'NEW_ORDER_WAS_CREATED',
  ORDER_WAS_APPROVED = 'ORDER_WAS_APPROVED',
  ORDER_IN_CONSTRUCTION_WAS_REMOVED = 'ORDER_IN_CONSTRUCTION_WAS_REMOVED',
  ORDER_CANCELED = 'ORDER_CANCELED',
  ORDER_REJECTED = 'ORDER_REJECTED',
  ORDER_READY_TO_PICKUP = 'ORDER_READY_TO_PICKUP',
  //
  BUSINESS_REQUEST_WAS_CREATED = 'BUSINESS_REQUEST_WAS_CREATED',
  BUSINESS_REQUEST_WAS_APPROVED = 'BUSINESS_REQUEST_WAS_APPROVED',
  BUSINESS_REQUEST_WAS_REJECTED = 'BUSINESS_REQUEST_WAS_REJECTED',
  //
  DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
  DELIVERY_REVOKED = 'DELIVERY_REVOKED',
  DELIVERY_FINISHED = 'DELIVERY_FINISHED',
  //
  DELIVERYMAN_ADDED_TO_BUSINESS = 'DELIVERYMAN_ADDED_TO_BUSINESS',
  DELIVERYMAN_REMOVED_FROM_BUSINESS = 'DELIVERYMAN_REMOVED_FROM_BUSINESS',
  RENDER_ERROR_OCURRED = 'RENDER_ERROR_OCURRED',
  PAYMENT_PROOF_GENERATED = 'PAYMENT_PROOF_GENERATED',
  //
  ADMIN_ALERT = 'ADMIN_ALERT'
}

export interface PushNotification extends BaseIdentity {
  type: PushNotificationType;
  userIds: Array<Schema.Types.ObjectId>;
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
