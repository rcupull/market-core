import { Bill, BillDetailedAmount, GetAllBillArgs } from './types';
import { PaymentDistributionServices } from '../payment-distribution/services';
import { BusinessServices } from '../business/services';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { ConfigServices } from '../config/services';
import { Logger } from 'winston';
interface BillCurrencyData {
    totalAmount: number;
    detailedAmount: Array<BillDetailedAmount>;
}
export declare class BillServices extends ModelCrudTemplate<Bill, Pick<Bill, 'number' | 'concepts' | 'customerName' | 'customerAddress' | 'customerAccountNumber' | 'customerBankNumber' | 'customerNit' | 'customerIdentityNumber' | 'sellerName' | 'sellerAddress' | 'sellerAccountNumber' | 'sellerBankNumber' | 'sellerNit' | 'sellerEmail' | 'paymentWay' | 'currency' | 'totalAmount' | 'detailedAmount' | 'routeName' | 'dateFrom' | 'dateTo'>, GetAllBillArgs> {
    private readonly configServices;
    private readonly businessServices;
    private readonly paymentDistributionServices;
    private readonly options;
    constructor(configServices: ConfigServices, businessServices: BusinessServices, paymentDistributionServices: PaymentDistributionServices, options: {
        logger: Logger;
    });
    getConfigData: () => Promise<Pick<Bill, "sellerName" | "sellerAddress" | "sellerAccountNumber" | "sellerBankNumber" | "sellerNit" | "sellerEmail"> | null>;
    getBusinessData: ({ routeName }: {
        routeName: string;
    }) => Promise<Pick<Bill, "customerName" | "customerAddress" | "customerAccountNumber" | "customerBankNumber" | "customerNit" | "customerIdentityNumber"> | null>;
    getDistrubutionData: (args: {
        routeName: string;
        dateFrom: Date;
        dateTo: Date;
    }) => Promise<{
        dataFromCUP: BillCurrencyData | null;
        dataFromMLC: BillCurrencyData | null;
    } | null>;
    billGenerateForSaleService: (args: {
        routeName: string;
        dateFrom: Date;
        dateTo: Date;
    }) => Promise<void>;
}
export {};
