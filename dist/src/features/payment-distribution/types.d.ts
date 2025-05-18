import { Schema } from 'mongoose';
export interface PaymentDistributionDataCurrency {
    deliveryAmount: number;
    postsData: Array<{
        postId: Schema.Types.ObjectId;
        postName: string;
        postAmount: number;
    }>;
}
export declare enum DistributionCurrency {
    CUP_CASH = "CUP_CASH",
    CUP_TRAN = "CUP_TRAN",
    MLC = "MLC",
    USD = "USD"
}
export interface PaymentDistributionData {
    shoppingId: Schema.Types.ObjectId;
    shoppingCode: string;
    [DistributionCurrency.CUP_CASH]: PaymentDistributionDataCurrency | undefined;
    [DistributionCurrency.CUP_TRAN]: PaymentDistributionDataCurrency | undefined;
    [DistributionCurrency.MLC]: PaymentDistributionDataCurrency | undefined;
    [DistributionCurrency.USD]: PaymentDistributionDataCurrency | undefined;
}
export interface PaymentDistributionMeta {
    commisionBusiness: Array<PaymentDistributionData>;
    commisionMarket: Array<PaymentDistributionData>;
    productBusiness: Array<PaymentDistributionData>;
    productMarket: Array<PaymentDistributionData>;
    deliveryBusiness: Array<PaymentDistributionData>;
    deliveryMarket: Array<PaymentDistributionData>;
}
export interface PaymentDistribution extends PaymentDistributionMeta {
    dateFrom: Date;
    dateTo: Date;
    routeName: string;
    businessName: string;
}
