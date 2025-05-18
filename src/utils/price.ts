import { ExchangeRates } from '../features/config/types';
import { Currency } from '../types/general';

export const getConvertedPrice = (args: {
  price: number;
  currentCurrency: Currency;
  desiredCurrency: Currency;
  exchangeRates: ExchangeRates | undefined;
}) => {
  const { currentCurrency, desiredCurrency, price, exchangeRates } = args;

  const MLC_CUP = exchangeRates?.MLC_CUP || 1;
  const USD_CUP = exchangeRates?.USD_CUP || 1;

  //////////////////////////////////////////////////////////////////////////
  if (currentCurrency === Currency.CUP) {
    if (desiredCurrency === Currency.MLC) {
      return price / MLC_CUP;
    }

    if (desiredCurrency === Currency.USD) {
      return price / USD_CUP;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  if (currentCurrency === Currency.MLC) {
    if (desiredCurrency === Currency.CUP) {
      return price * MLC_CUP;
    }

    if (desiredCurrency === Currency.USD) {
      return (price * MLC_CUP) / USD_CUP;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  if (currentCurrency === Currency.USD) {
    if (desiredCurrency === Currency.CUP) {
      return price * USD_CUP;
    }

    if (desiredCurrency === Currency.MLC) {
      return (price * USD_CUP) / MLC_CUP;
    }
  }

  return price;
};
