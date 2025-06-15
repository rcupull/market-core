import { Currency, ModelDocument, QueryHandle } from '../../types/general';
import { modelGetter } from './schemas';
import { GetAllPaymentArgs, getAllFilterQuery } from './utils';
import { deepJsonCopy, isEqualIds } from '../../utils/general';
import { getConvertedPrice } from '../../utils/price';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Payment } from './types';
import { ShoppingServices } from '../shopping/services';
import { Shopping } from '../shopping/types';
import { bigEq, bigGt } from '../../utils/big';
import { User } from '../user/types';
import { ShoppingDto } from '../shopping-dtos/types';

export class PaymentServices extends ModelCrudTemplate<
  Payment,
  Pick<
    Payment,
    | 'saleProductsPrice'
    | 'saleDeliveryPrice'
    | 'saleTotalPrice'
    | 'bankAccountNumberFrom'
    | 'paymentWay'
    | 'shoppingId'
    | 'createdBy'
    | 'transactionCode'
    | 'wasTransactionCodeAutoCompleted'
    | 'currency'
    | 'validation'
  >,
  GetAllPaymentArgs
> {
  constructor(private readonly shoppingAppServices: ShoppingServices) {
    super(modelGetter, getAllFilterQuery);
  }

  getPaymentDataFromShopping: QueryHandle<
    {
      query: GetAllPaymentArgs;
    },
    {
      getOneShoppingPaymentData: (shopping: Shopping) => {
        paymentCompleted: ShoppingDto['paymentCompleted'];
        paymentHistory: ShoppingDto['paymentHistory'];
        shoppingAllPayments: Array<Payment>;
      };
    }
  > = async ({ query }) => {
    const allPayments = await this.getAll({ query });

    return {
      getOneShoppingPaymentData: (shopping) => {
        const shoppingAllPayments = deepJsonCopy(allPayments).filter((payment) => {
          return isEqualIds(payment.shoppingId, shopping._id);
        });
        return {
          paymentCompleted: (() => {
            if (!shoppingAllPayments.length) {
              return false;
            }

            const { getPricesForDesiredCurrency } =
              this.shoppingAppServices.getShoppingInfo(shopping);

            /**
             * shoppingSaleTotalPrice is the value of the products in the shopping normalized to CUP.
             * (Is neccesary normalize a value to compare with the shopping payments)
             */
            const shoppingSaleTotalPrice = getPricesForDesiredCurrency(Currency.CUP).saleTotalPrice;

            /**
             * totalAmountPaidInCUP is the acc of the amount in the payments of a shopping normalized to CUP.
             * (Is neccesary normalize a value to compare with the shopping value of above)
             */
            const totalAmountPaidInCUP = shoppingAllPayments.reduce((accumulator, payment) => {
              const saleTotalPriceInCUP = getConvertedPrice({
                price: payment.saleTotalPrice,
                currentCurrency: payment.currency,
                desiredCurrency: Currency.CUP,
                exchangeRates: shopping.exchangeRates
              });

              return accumulator + saleTotalPriceInCUP;
            }, 0);

            /**
             * Compare using big library the paid money and the shopping value
             * if: totalAmountPaidInCUP = shoppingSaleTotalPrice || totalAmountPaidInCUP > shoppingSaleTotalPrice
             * then: the shopping was paid
             */
            const shoppingWasPaid =
              bigEq(totalAmountPaidInCUP, shoppingSaleTotalPrice) ||
              bigGt(totalAmountPaidInCUP, shoppingSaleTotalPrice);

            const allPaymentAreValidated = shoppingAllPayments.every((p) => p.validation);

            return shoppingWasPaid && allPaymentAreValidated;
          })(),
          paymentHistory: shoppingAllPayments.map(({ _id, paymentWay, validation, currency }) => {
            return {
              paymentCurrency: currency,
              paymentId: _id,
              hasValidation: !!validation,
              paymentWay
            };
          }),
          shoppingAllPayments
        };
      }
    };
  };

  changePaymentAddValidation = (payment: ModelDocument<Payment>, user: User) => {
    payment.validation = {
      createdAt: new Date(),
      createdBy: user._id
    };

    return payment;
  };
}
