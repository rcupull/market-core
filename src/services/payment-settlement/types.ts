import { FilterQuery, Schema } from 'mongoose';
import { BankAccount, BaseIdentity } from '../../types/general';

export enum PaymentSettlementState {
  PENDING = 'PENDING',
  DONE = 'DONE'
}

export enum PaymentSettlementType {
  TO__BUSINESS_FULL = 'TO__BUSINESS_FULL',
  TO__MARKET_FULL = 'TO__MARKET_FULL',
  TO__MESSENGER = 'TO__MESSENGER',
  FROM__BUSINESS_FULL = 'FROM__BUSINESS_FULL'
}

export interface PaymentSettlementShoppingRecord {
  shoppingId: Schema.Types.ObjectId;
  shoppingCode: string;
  shoppingDeliveryAmount: number | undefined;
  postsData: Array<{
    postId: Schema.Types.ObjectId;
    postName: string;
    postAmount: number | undefined;
  }>;
}

export interface PaymentSettlement extends BaseIdentity {
  type: PaymentSettlementType;
  //
  fromDate: Date;
  toDate: Date;
  //
  shoppingRecords: Array<PaymentSettlementShoppingRecord>;
  //
  routeName?: string;
  messengerId?: Schema.Types.ObjectId;
  //
  state: PaymentSettlementState;
  changedToDoneAt?: Date;
  changedToDoneBy?: Schema.Types.ObjectId;
  settlementCode?: string;
}

export interface PaymentSettlementShoppingRecordDto extends PaymentSettlementShoppingRecord {
  shoppingAmount: number;
  shoppingPostsAmount: number;
}

export interface PaymentSettlementDto extends PaymentSettlement {
  amount: number;
  shoppingRecords: Array<PaymentSettlementShoppingRecordDto>;
  //
  bankAccountToSettle: BankAccount | undefined;
  businessName: string | undefined;
  messengerName: string | undefined;
}

export interface GetAllPaymentSettlementArgs extends FilterQuery<PaymentSettlement> {
  paymentIds?: Array<string | Schema.Types.ObjectId>;
  states?: Array<PaymentSettlementState>;
}
