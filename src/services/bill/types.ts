import { Schema } from 'mongoose';
import { Address, BaseIdentity, Currency } from '../../types/general';
import { PaymentWay } from '../payment/types';

export enum BillConceptType {
  SALE_SERVICE = 'SALE_SERVICE'
}

interface BillConcept {
  type: BillConceptType;
  // productMetaFromShopping?: ShoppingPostMeta;
}

export interface BillDetailedAmount {
  shoppingCode: string;
  shoppingId: Schema.Types.ObjectId;
  amount: number;
}

export interface Bill extends BaseIdentity {
  number: number;
  routeName: string;
  //
  sellerName: string;
  sellerAddress?: Address;
  sellerAccountNumber: string;
  sellerBankNumber: string;
  sellerNit: string;
  sellerEmail: string;
  //
  customerName: string;
  customerAddress?: Address;
  customerAccountNumber: string;
  customerBankNumber: string;
  customerNit: string;
  customerIdentityNumber: string;
  //
  concepts?: Array<BillConcept>;
  //
  totalAmount: number;
  detailedAmount: Array<BillDetailedAmount>;
  currency: Currency;
  paymentWay: PaymentWay;
  //
  dateFrom: Date;
  dateTo: Date;
}

export interface BillDto extends Bill {
  businessName: string;
}
