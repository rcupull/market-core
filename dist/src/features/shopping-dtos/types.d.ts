import { Schema } from 'mongoose';
import { Address, Currency } from '../../types/general';
import { DeliveryConfig } from '../business/types';
import { Shopping, ShoppingPostMeta } from '../shopping/types';
import { PaymentWay } from '../payment/types';
export interface ShoppingDto extends Shopping {
    purchaserName: string | undefined;
    purchaserAddress: Address | undefined;
    purchaserPhone: string | undefined;
    businessName: string | undefined;
    businessAllowedOnlyCUPinCash: boolean | undefined;
    businessAddress: Address | undefined;
    businessTermsAndConditions: string | undefined;
    paymentCompleted: boolean | undefined;
    deliveryConfigToUse: DeliveryConfig | undefined;
    /**
     * Cuando la orden de compra no tiene delivery y
     * esta en listo para entregar debe agregarse la direccion de recogida
     */
    addressToPickUp: Address | undefined;
    paymentProofId: Schema.Types.ObjectId | undefined;
    paymentProofCode: string | undefined;
    paymentHistory: Array<{
        paymentCurrency: Currency;
        paymentWay: PaymentWay;
        paymentId: Schema.Types.ObjectId;
        hasValidation: boolean;
    }>;
}
export interface ShoppingCartDto extends ShoppingDto {
    posts: Array<ShoppingPostMeta & {
        stockAmountAvailable: number | undefined;
    }>;
}
