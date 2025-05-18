import { Currency } from '../../types/general';
import { Shopping, ShoppingPostData } from './types';
type GetProductPrices = (postData: ShoppingPostData) => {
    productPrice: number;
    saleProductPrice: number;
    marketOperationProductPrice: number;
    systemUseProductPrice: number;
};
type GetPricesForDesiredCurrency = (desiredCurrency: Currency) => {
    deliveryPrice: number;
    saleDeliveryPrice: number;
    marketOperationDeliveryPrice: number;
    systemUseDeliveryPrice: number;
    productsAmount: number;
    productsPrice: number;
    saleProductsPrice: number;
    getProductPrices: GetProductPrices;
    saleTotalPrice: number;
};
interface GetShoppingInfoReturn {
    firstCurrency: Currency;
    currenciesToSale: Array<Currency>;
    currenciesToSaleCash: Array<Currency>;
    getPricesForDesiredCurrency: GetPricesForDesiredCurrency;
}
export declare const getShoppingInfo: (shopping: Shopping) => GetShoppingInfoReturn;
export {};
