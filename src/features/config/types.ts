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
    key: string;
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
