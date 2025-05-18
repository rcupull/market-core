import { Schema } from 'mongoose';
import { Address, BaseIdentity, Currency } from '../../types/general';
import { FilterQuery } from 'mongoose';

export interface PaymentProof extends BaseIdentity {
  code: string;
  customerId: Schema.Types.ObjectId;
  shoppingId: Schema.Types.ObjectId;
}

export interface PaymentProofDto extends PaymentProof {
  sellerName: string | undefined;
  sellerEmail: string | undefined;
  sellerPhone: string | undefined;
  //
  customerName: string | undefined;
  customerPhone: string | undefined;
  customerAddress: Address | undefined;
  //
  shoppingCode: string | undefined;
  shoppingProducts: Array<{
    productName: string;
    productId: Schema.Types.ObjectId;
    amount: number;
  }>;
  paymentsInfo: Array<{
    createdAt: Date;
    paymentId: Schema.Types.ObjectId;
    paymentWay: string;
    amount: number;
    currency: Currency;
  }>;
}

export interface GetAllPaymentProofArgs extends FilterQuery<PaymentProof> {
  search?: string;
}
