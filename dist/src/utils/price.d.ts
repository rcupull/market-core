import { ExchangeRates } from '../features/config/types';
import { Currency } from '../types/general';
export declare const getConvertedPrice: (args: {
    price: number;
    currentCurrency: Currency;
    desiredCurrency: Currency;
    exchangeRates: ExchangeRates | undefined;
}) => number;
