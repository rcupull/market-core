import { PaymentDistributionData, PaymentDistributionDataCurrency, PaymentDistributionMeta } from './types';
import { Business } from '../business/types';
import { ShoppingServices } from '../shopping/services';
import { PaymentServices } from '../payment/services';
import { Shopping } from '../shopping/types';
interface Args {
    dateFrom?: Date;
    dateTo?: Date;
    business: Business;
}
export declare class PaymentDistributionServices {
    private readonly shoppingServices;
    private readonly paymentServices;
    constructor(shoppingServices: ShoppingServices, paymentServices: PaymentServices);
    getPaymentDistributionData: (args: Args) => Promise<PaymentDistributionMeta>;
    private getAssociatedShoppings;
    getShoppingResources: (args: Partial<Args>) => Promise<{
        allowedPayments: import("../payment/types").Payment[];
        allowedShopping: Shopping[];
        getOneShoppingPaymentData: (shopping: Shopping) => {
            paymentCompleted: import("../shopping/types").ShoppingDto["paymentCompleted"];
            paymentHistory: import("../shopping/types").ShoppingDto["paymentHistory"];
            shoppingAllPayments: Array<import("../payment/types").Payment>;
        };
    }>;
    private getData__BUSINESS_FULL;
    private howManyBusinessAreInShoppingPosts;
    private getData__MARKET_FULL;
    getTotalAmount: (allShoppingDistrubutions: Array<PaymentDistributionData>) => {
        CUP_CASH: number;
        CUP_TRAN: number;
        MLC: number;
        USD: number;
    };
    getTotalAmountFromOne: ({ deliveryAmount, postsData }: PaymentDistributionDataCurrency) => number;
}
export {};
