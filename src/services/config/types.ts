import { Commissions } from '../../types/commision';
import { Address, BankAccount, BaseIdentity } from '../../types/general';
import { BusinessType, DeliveryConfig } from '../business/types';

export type CommissionsByBusinessType = Record<BusinessType, Commissions>;

export interface ConfigBilling {
  name?: string;
  address?: Address;
  accountNumber?: string;
  bankNumber?: string;
  nit?: string;
}

export interface ExchangeRates {
  USD_CUP?: number;
  MLC_CUP?: number;
}

export enum FeatureKey {
  CAN_CREATE_SECTIONS = 'CAN_CREATE_SECTIONS',
  SET_BUSINESS_SOCIAL_NETWORKS = 'SET_BUSINESS_SOCIAL_NETWORKS',
  CAN_CREATE_LINKS = 'CAN_CREATE_LINKS',
  BUSINESS_REPORTS = 'BUSINESS_REPORTS',
  SALES_REPORTS = 'SALES_REPORTS',
  MARKET_SHOPPING_DELIVERIES_MAP = 'MARKET_SHOPPING_DELIVERIES_MAP',
  CAN_DOWNLOAD_APK = 'CAN_DOWNLOAD_APK',
  SEARCH_SUGGESTION_IN_MAIN_PAGE = 'SEARCH_SUGGESTION_IN_MAIN_PAGE',
  ANALYTICS = 'ANALYTICS',
  BUSINESS_TERMS_AND_CONDITIONS_TO_SELL = 'BUSINESS_TERMS_AND_CONDITIONS_TO_SELL',
  //
  SEND_SMS_TO_CUSTOMER_WITH_PAYMENT_PROOF = 'SEND_SMS_TO_CUSTOMER_WITH_PAYMENT_PROOF',
  SEND_SMS_TO_ADMIN_WHEN_NEW_PAYMENT_VALIDATION = 'SEND_SMS_TO_ADMIN_WHEN_NEW_PAYMENT_VALIDATION',
  SEND_SMS_TO_OWNER_WHEN_NEW_REQUESTED_SHOPPING = 'SEND_SMS_TO_OWNER_WHEN_NEW_REQUESTED_SHOPPING',
  SEND_SMS_TO_MESSENGER_WHEN_DELIVERY_ASSIGNED = 'SEND_SMS_TO_MESSENGER_WHEN_DELIVERY_ASSIGNED',
  //
  MAIN_SEARCH_USING_NLP = 'MAIN_SEARCH_USING_NLP',
  MAIN_SEARCH_USING_EMBEDDING = 'MAIN_SEARCH_USING_EMBEDDING',
  MAIN_SEARCH_USING_USER_ACTIVITY = 'MAIN_SEARCH_USING_USER_ACTIVITY',
  MAIN_SEARCH_USING_PRODUCT_SIMILARITY = 'MAIN_SEARCH_USING_PRODUCT_SIMILARITY',

  MAIN_BANNER = 'MAIN_BANNER',
  //
  ALLOW_SHOPPING_CANCELLATION = 'ALLOW_SHOPPING_CANCELLATION',
  //
  ALLOW_PAYMENT_TRANSFERMOVIL_CUP = 'ALLOW_PAYMENT_TRANSFERMOVIL_CUP',
  ALLOW_PAYMENT_TRANSFERMOVIL_MLC = 'ALLOW_PAYMENT_TRANSFERMOVIL_MLC',
  ALLOW_PAYMENT_USD = 'ALLOW_PAYMENT_USD',
  //
  ALLOW_BUSINESS_CREATE_MARKET_DELIVERY = 'ALLOW_BUSINESS_CREATE_MARKET_DELIVERY',
  //
  IMAGE_INPUT_ADJUSTS = 'IMAGE_INPUT_ADJUSTS',
  IMAGE_INPUT_REMOVE_BACKGROUND = 'IMAGE_INPUT_REMOVE_BACKGROUND',
  //
  COMPUTE_DELIVERY_DISTANCE_USING_OSRM_SERVICES = 'COMPUTE_DELIVERY_DISTANCE_USING_OSRM_SERVICES'
}

export interface AdminConfig extends BaseIdentity {
  bankAccountCUP?: BankAccount;
  bankAccountMLC?: BankAccount;

  billing?: ConfigBilling;
  //
  apkUploadHistory?: Array<{
    filename: string;
    savedAt: Date;
    major: string;
    minor: string;
    patch: string;
  }>;
  termsAndConditions?: string;
  termsAndConditionsRecord?: Array<{
    value: string;
    savedAt: Date;
  }>;
  businessContract?: string;
  businessContractRecords?: Array<{
    value: string;
    savedAt: Date;
  }>;
  privacyPolicy?: string;
  privacyPolicyRecord?: Array<{
    value: string;
    savedAt: Date;
  }>;
  price?: string;
  priceRecord?: Array<{
    value: string;
    savedAt: Date;
  }>;
  features?: Array<{
    key: FeatureKey;
    enabled: boolean;
    description: string;
  }>;

  exchangeRates: ExchangeRates;
  addresses: Array<Address>;
  deliveryConfig: DeliveryConfig;

  commissions: {
    products: CommissionsByBusinessType;
    delivery: CommissionsByBusinessType;
  };
}

export interface AdminConfigDto
  extends Pick<
    AdminConfig,
    | 'businessContract'
    | 'exchangeRates'
    | 'apkUploadHistory'
    | 'features'
    | 'privacyPolicy'
    | 'termsAndConditions'
    | 'bankAccountCUP'
    | 'bankAccountMLC'
    | 'price'
  > {}

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
