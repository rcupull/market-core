import { FilterQuery, Schema } from 'mongoose';
import { Address, BaseIdentity } from '../../types/general';
import { Commissions } from '../../types/commision';
import { Post, PostPurshaseNotes } from '../post/types';
import { ExchangeRates } from '../config/types';
import { BusinessType, DeliveryConfigType } from '../business/types';

export enum ShoppingState {
  CONSTRUCTION = 'CONSTRUCTION',
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  READY_TO_DELIVERY = 'READY_TO_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED'
}

export interface ShoppingPostData
  extends Pick<Post, '_id' | 'images' | 'name' | 'routeName' | 'currency' | 'currenciesOfSale'> {
  commissions: Commissions;
  salePrice: number;
}

export enum ShoppingDeliveryState {
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export interface ShoppingDeliveryMessenger {
  messengerId: Schema.Types.ObjectId;
  lastUpdatedDate: Date;
}

export interface GetAllShoppingArgs extends FilterQuery<Shopping> {
  routeNames?: Array<string>;
  states?: Array<ShoppingState>;
  deliveryStates?: Array<ShoppingDeliveryState>;
  deliveryManId?: string | Schema.Types.ObjectId;
  shoppingIds?: Array<string | Schema.Types.ObjectId>;
  excludeShoppingIds?: Array<string | Schema.Types.ObjectId>;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ShoppingRequestedDelivery {
  deliveryType: DeliveryConfigType;
  //
  salePrice: number;
  commissions: Commissions;
  //
  distance: number;
  fromAddress?: Address;
  toAddress?: Address;
  //
  state: ShoppingDeliveryState;
  deliveryManId?: Schema.Types.ObjectId;
  messengersHistory: Array<ShoppingDeliveryMessenger>;
}

export interface ShoppingPostMeta {
  postData: ShoppingPostData;
  count: number;
  purshaseNotes?: PostPurshaseNotes;
  lastUpdatedDate: Date;
}

export interface Shopping extends BaseIdentity {
  posts: Array<ShoppingPostMeta>;
  //
  purchaserId?: Schema.Types.ObjectId;
  browserFingerprint?: string;

  exchangeRates?: ExchangeRates;
  /**
   * if the shopping has routename means that the shopping is of a BusinessType.BUSINESS_FULL
   * or BusinessType.MARKET_DELIVERY
   */
  routeName?: string;
  businessType?: BusinessType;
  //
  code: string;
  payOnPickUp?: boolean;
  //
  cancellation?: {
    requestedBy: Schema.Types.ObjectId;
    requestedAt: Date;

    wasReturnedMoneyBy?: Schema.Types.ObjectId;
    wasReturnedMoneyAt?: Date;
  };
  //
  state: ShoppingState;
  history?: Array<{
    state: ShoppingState;
    lastUpdatedDate: Date;
    reason?: string;
  }>;

  requestedDelivery?: ShoppingRequestedDelivery | null;

  /**
   * Indica el depósito hecho por el mensajero en la tienda una vez hecha la entrega
   */
  cashSettlement?: {
    createdAt: Date;
    createdBy: Schema.Types.ObjectId;
  };
}
