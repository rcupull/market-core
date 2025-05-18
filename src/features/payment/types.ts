import { Schema } from 'mongoose';
import { BaseIdentity, Currency } from '../../types/general';
import { Shopping } from '../shopping/types';

export enum PaymentWay {
  TRANSFERMOVIL = 'TRANSFERMOVIL',
  ENZONA = 'ENZONA',
  CASH = 'CASH'
}

export interface Payment extends BaseIdentity {
  paymentWay: PaymentWay;
  //
  saleProductsPrice: number;
  saleDeliveryPrice: number;
  saleTotalPrice: number;
  currency: Currency;
  transactionCode?: string;
  wasTransactionCodeAutoCompleted?: boolean;
  /**
   * One payment can be made for multiple shoppings
   */
  shoppingId: Schema.Types.ObjectId;
  //
  createdBy: Schema.Types.ObjectId;
  //
  bankAccountNumberFrom?: string;
  //
  validation?: {
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
  };
}

export interface PaymentDto extends Payment {
  shopping: Pick<Shopping, 'code' | 'state'> | undefined;
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////VALIDATION///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
