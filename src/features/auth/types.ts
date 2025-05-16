import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export enum TYPE_DEVICE {
  NATIVE = 'NATIVE',
  WEB = 'WEB'
}

export enum AuthSessionState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface AuthSession extends BaseIdentity {
  refreshToken: string;
  typeDevice: TYPE_DEVICE;
  descriptionDevice: string | undefined;
  userId: Schema.Types.ObjectId;
  refreshHistory: Array<Date>;
  state: AuthSessionState;
  closedAt?: Date;
  firebaseToken?: string;
}

export interface AccessControlFlags {
  isOwnerOfSomeBusiness?: boolean;
  isOwnerOfThisBusiness?: boolean;
  isOwnerOfThisPost?: boolean;
  isOwnerOfThisShopping?: boolean;
  isOwnerOfSomeBusinessOfThisMessenger?: boolean;
  isMessengerOfThisShopping?: boolean;
  isMessengerOfSomeone?: boolean;
  isPurchaserOfThisShopping?: boolean;
  isPurchaserOfThisPaymentProof?: boolean;
  isAdminWithAccess?: Array<Access>;
}

export enum Access {
  FULL = 'full',
  //
  ACCESS_READ = 'access__read',
  ACCESS_WRITE = 'access__write',
  //
  USER_REMOVE = 'user__remove',
  USER_READ = 'user__read',
  USER_WRITE = 'user__write',
  //
  SHOPPING_READ = 'shopping__read',
  SHOPPING_WRITE = 'shopping__write',
  SHOPPING_REMOVE = 'shopping__remove',
  //
  PAYMENT_READ = 'payment__read',
  PAYMENT_WRITE = 'payment__write',
  PAYMENT_REMOVE = 'payment__remove',
  //
  CATEGORY_READ = 'category__read',
  CATEGORY_WRITE = 'category__write',
  CATEGORY_REMOVE = 'category__remove',
  //
  PAYMENT_SETTLEMENT_READ = 'payment_settlement__read',
  PAYMENT_SETTLEMENT_WRITE = 'payment_settlement__write',
  PAYMENT_SETTLEMENT_REMOVE = 'payment_settlement__remove',
  //
  BUSINESS_READ = 'business__read',
  BUSINESS_WRITE = 'business__write',
  BUSINESS_REMOVE = 'business__remove',
  //
  API_TRACKING_READ = 'api_tracking__read',
  //
  BILLS_READ = 'bills__read',
  BILLS_WRITE = 'bills__write',
  BILLS_REMOVE = 'bills__remove',
  //
  PRIVACY_POLICY_WRITE = 'privacy_policy__write',
  TERMS_AND_CONDITIONS_WRITE = 'terms_and_conditions__write',
  CONTRACT_WRITE = 'contract__write',
  FEATURES_WRITE = 'features__write',
  DELIVERY_CONFIG_WRITE = 'delivery_config__write',
  CATEGORIES_WRITE = 'categories__write',
  //
  AGENDA_FULL = 'agenda__full',
  UPLOAD_NATIVE_COMPILATION = 'upload__native_compilation',
  //
  BUSINESS_MANAGER = 'business_manager',
  SALES_PIPELINE_MANAGER = 'sales_pipeline_manager',
  DELIVERY_MANAGER = 'delivery_manager',
  //
  MARKETING = 'marketing'
}
