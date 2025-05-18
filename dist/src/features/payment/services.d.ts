import { ModelDocument, QueryHandle } from '../../types/general';
import { GetAllPaymentArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Payment } from './types';
import { ShoppingServices } from '../shopping/services';
import { Shopping, ShoppingDto } from '../shopping/types';
import { User } from '../user/types';
export declare class PaymentServices extends ModelCrudTemplate<Payment, Pick<Payment, 'saleProductsPrice' | 'saleDeliveryPrice' | 'saleTotalPrice' | 'bankAccountNumberFrom' | 'paymentWay' | 'shoppingId' | 'createdBy' | 'transactionCode' | 'wasTransactionCodeAutoCompleted' | 'currency' | 'validation'>, GetAllPaymentArgs> {
    private readonly shoppingAppServices;
    constructor(shoppingAppServices: ShoppingServices);
    getPaymentDataFromShopping: QueryHandle<{
        query: GetAllPaymentArgs;
    }, {
        getOneShoppingPaymentData: (shopping: Shopping) => {
            paymentCompleted: ShoppingDto['paymentCompleted'];
            paymentHistory: ShoppingDto['paymentHistory'];
            shoppingAllPayments: Array<Payment>;
        };
    }>;
    changePaymentAddValidation: (payment: ModelDocument<Payment>, user: User) => ModelDocument<Payment>;
}
