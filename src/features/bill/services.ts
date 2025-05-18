import { modelGetter } from './schemas';
import { Bill, BillDetailedAmount, GetAllBillArgs } from './types';

import { getAllFilterQuery } from './utils';
import { Currency } from '../../types/general';
import { PaymentDistributionServices } from '../payment-distribution/services';
import { BusinessServices } from '../business/services';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { ConfigServices } from '../config/services';
import { Logger } from 'winston';
import { AdminConfig } from '../config/types';
import { Business } from '../business/types';
import { PaymentWay } from '../payment/types';

interface BillCurrencyData {
  totalAmount: number;
  detailedAmount: Array<BillDetailedAmount>;
}

export class BillServices extends ModelCrudTemplate<
  Bill,
  Pick<
    Bill,
    | 'number'
    | 'concepts'
    //
    | 'customerName'
    | 'customerAddress'
    | 'customerAccountNumber'
    | 'customerBankNumber'
    | 'customerNit'
    | 'customerIdentityNumber'
    //
    | 'sellerName'
    | 'sellerAddress'
    | 'sellerAccountNumber'
    | 'sellerBankNumber'
    | 'sellerNit'
    | 'sellerEmail'
    //
    | 'paymentWay'
    | 'currency'
    | 'totalAmount'
    | 'detailedAmount'
    | 'routeName'
    | 'dateFrom'
    | 'dateTo'
  >,
  GetAllBillArgs
> {
  constructor(
    private readonly configServices: ConfigServices,
    private readonly businessServices: BusinessServices,
    private readonly paymentDistributionServices: PaymentDistributionServices,
    private readonly options: {
      logger: Logger;
    }
  ) {
    super(modelGetter, getAllFilterQuery);
  }

  getConfigData = async () => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const config: Pick<AdminConfig, 'billing'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          billing: 1
        }
      });

    if (
      !config?.billing?.accountNumber ||
      !config?.billing?.bankNumber ||
      !config?.billing?.nit ||
      !config?.billing?.name ||
      !config?.billing?.address
    ) {
      /**
       * send message or something to check when this happen
       */

      const { logger } = this.options;

      logger.error('Billing config not found');
      return null;
    }

    const out: Pick<
      Bill,
      | 'sellerAccountNumber'
      | 'sellerBankNumber'
      | 'sellerNit'
      | 'sellerName'
      | 'sellerAddress'
      | 'sellerEmail'
    > = {
      sellerAccountNumber: config.billing?.accountNumber,
      sellerBankNumber: config.billing?.bankNumber,
      sellerNit: config.billing?.nit,
      sellerName: config.billing?.name,
      sellerAddress: config.billing?.address,
      sellerEmail: 'TODO'
    };

    return out;
  };

  getBusinessData = async ({ routeName }: { routeName: string }) => {
    const business: Pick<Business, 'billing'> | null = await this.businessServices.getOne({
      query: {
        routeName
      },
      projection: {
        billing: 1
      }
    });

    if (
      !business?.billing?.accountNumber ||
      !business?.billing?.bankNumber ||
      !business?.billing?.nit ||
      !business?.billing?.name ||
      !business?.billing?.address
    ) {
      const { logger } = this.options;

      logger.error('Billing config not found');
      return null;
    }

    const out: Pick<
      Bill,
      | 'customerAccountNumber'
      | 'customerBankNumber'
      | 'customerNit'
      | 'customerAddress'
      | 'customerIdentityNumber'
      | 'customerName'
    > = {
      customerAccountNumber: business.billing?.accountNumber,
      customerBankNumber: business.billing?.bankNumber,
      customerNit: business.billing?.nit,
      customerName: business.billing?.name,
      customerAddress: business.billing?.address,
      customerIdentityNumber: business.billing?.identityNumber
    };

    return out;
  };

  getDistrubutionData = async (args: {
    routeName: string;
    dateFrom: Date;
    dateTo: Date;
  }): Promise<{
    dataFromCUP: BillCurrencyData | null;
    dataFromMLC: BillCurrencyData | null;
  } | null> => {
    const { dateFrom, dateTo, routeName } = args;

    const business = await this.businessServices.getOne({
      query: {
        routeName
      }
    });

    if (!business) {
      const { logger } = this.options;

      logger.error('Business not found');
      return null;
    }

    const { commisionBusiness, commisionMarket } =
      await this.paymentDistributionServices.getPaymentDistributionData({
        business,
        dateFrom,
        dateTo
      });

    const allDistrubutions = [...commisionBusiness, ...commisionMarket];

    const totalAmount = this.paymentDistributionServices.getTotalAmount(allDistrubutions);

    return {
      dataFromCUP: (() => {
        if (!totalAmount.CUP_CASH && !totalAmount.CUP_TRAN) {
          return null;
        }

        return {
          totalAmount: totalAmount.CUP_CASH + totalAmount.CUP_TRAN,
          detailedAmount: allDistrubutions.reduce<Array<BillDetailedAmount>>((acc, args) => {
            const { shoppingCode, shoppingId, CUP_CASH, CUP_TRAN } = args;

            if (CUP_CASH || CUP_TRAN) {
              const item: BillDetailedAmount = {
                shoppingCode,
                shoppingId,
                amount: (() => {
                  let out = 0;
                  if (CUP_CASH) {
                    out = out + this.paymentDistributionServices.getTotalAmountFromOne(CUP_CASH);
                  }

                  if (CUP_TRAN) {
                    out = out + this.paymentDistributionServices.getTotalAmountFromOne(CUP_TRAN);
                  }

                  return out;
                })()
              };

              return [...acc, item];
            }

            return acc;
          }, [])
        };
      })(),
      dataFromMLC: (() => {
        if (!totalAmount.MLC) {
          return null;
        }

        return {
          totalAmount: totalAmount.MLC,
          detailedAmount: allDistrubutions.reduce<Array<BillDetailedAmount>>((acc, args) => {
            const { shoppingCode, shoppingId, MLC } = args;

            if (MLC) {
              const item: BillDetailedAmount = {
                shoppingCode,
                shoppingId,
                amount: this.paymentDistributionServices.getTotalAmountFromOne(MLC)
              };

              return [...acc, item];
            }

            return acc;
          }, [])
        };
      })()
    };
  };

  billGenerateForSaleService = async (args: {
    routeName: string;
    dateFrom: Date;
    dateTo: Date;
  }) => {
    const { dateFrom, dateTo, routeName } = args;

    const sellerData = await this.getConfigData();
    const customerData = await this.getBusinessData({ routeName });

    const distributionData = await this.getDistrubutionData({ routeName, dateFrom, dateTo });

    const latestBillFromBusiness = await this.getLatest({ query: { routeName } });

    const { logger } = this.options;

    if (!sellerData) {
      logger.error('sellerData no found');
      return;
    }

    if (!customerData) {
      logger.error('customerData no found');
      return;
    }

    if (!distributionData) {
      logger.error('distributionData no found');
      return;
    }

    const { dataFromCUP, dataFromMLC } = distributionData;
    let billNumber = latestBillFromBusiness ? latestBillFromBusiness.number + 1 : 0;

    const {
      customerAccountNumber,
      customerBankNumber,
      customerIdentityNumber,
      customerName,
      customerNit,
      customerAddress
    } = customerData;

    const {
      sellerAccountNumber,
      sellerBankNumber,
      sellerEmail,
      sellerName,
      sellerNit,
      sellerAddress
    } = sellerData;

    if (dataFromCUP) {
      const { detailedAmount, totalAmount } = dataFromCUP;

      await this.addOne({
        customerAccountNumber,
        customerBankNumber,
        customerIdentityNumber,
        customerName,
        customerNit,
        customerAddress,
        //
        sellerAccountNumber,
        sellerBankNumber,
        sellerEmail,
        sellerName,
        sellerNit,
        sellerAddress,
        //
        concepts: [], //TODO
        number: billNumber,
        currency: Currency.CUP,
        paymentWay: PaymentWay.TRANSFERMOVIL,
        routeName,
        totalAmount,
        detailedAmount,
        dateFrom,
        dateTo
      });

      billNumber++;
    }

    if (dataFromMLC) {
      const { detailedAmount, totalAmount } = dataFromMLC;
      await this.addOne({
        customerAccountNumber,
        customerBankNumber,
        customerIdentityNumber,
        customerName,
        customerNit,
        customerAddress,
        //
        sellerAccountNumber,
        sellerBankNumber,
        sellerEmail,
        sellerName,
        sellerNit,
        sellerAddress,
        //
        concepts: [], //TODO
        number: billNumber,
        currency: Currency.MLC,
        paymentWay: PaymentWay.TRANSFERMOVIL,
        routeName,
        totalAmount,
        detailedAmount,
        dateFrom,
        dateTo
      });
    }
  };
}
