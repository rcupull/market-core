import { Schema } from 'mongoose';
import { Address, Currency } from '../../types/general';
import { PaymentProof } from '../payment-proof/types';

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
