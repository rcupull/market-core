import { PaymentProofModel } from './schemas';

import { GetAllPaymentProofArgs, getAllFilterQuery } from './utils';
import { PaymentProof, PaymentProofDto } from './types';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { AdminConfig } from '../config/types';
import { ConfigServices } from '../config/services';
import { UserServices } from '../user/services';
import { ShoppingServices } from '../shopping/services';
import { ModelDocument, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { PaymentServices } from '../payment/services';
import { logger } from '../logger';
import { Shopping } from '../shopping/types';
import { deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';

export class PaymentProofServices extends ModelCrudTemplate<
  PaymentProof,
  Pick<PaymentProof, 'customerId' | 'shoppingId'>,
  GetAllPaymentProofArgs
> {
  constructor(
    private readonly configServices: ConfigServices,
    private readonly userServices: UserServices,
    private readonly shoppingServices: ShoppingServices,
    private readonly paymentServices: PaymentServices
  ) {
    super(PaymentProofModel, getAllFilterQuery);
  }

  getPaymentProofDataFromShopping: QueryHandle<
    {
      query: GetAllPaymentProofArgs;
    },
    {
      getOneShoppingPaymentProofData: (shopping: Shopping) => {
        paymentProofCode: PaymentProof['code'];
        paymentProofId: PaymentProof['_id'];
      } | null;
    }
  > = async ({ query }) => {
    const allPaymentsProofs: Array<Pick<PaymentProof, '_id' | 'code' | 'shoppingId'>> =
      await this.getAll({
        query,
        projection: {
          code: 1,
          _id: 1,
          shoppingId: 1
        }
      });

    return {
      getOneShoppingPaymentProofData: (shopping) => {
        const paymentProof = allPaymentsProofs.find((paymentProof) => {
          return isEqualIds(paymentProof.shoppingId, shopping._id);
        });

        if (!paymentProof) {
          return null;
        }

        return {
          paymentProofCode: paymentProof.code,
          paymentProofId: paymentProof._id
        };
      }
    };
  };

  getDtos = async (paymentProofs: Array<PaymentProof>): Promise<Array<PaymentProofDto>> => {
    //////////////////////////////////////////////////////////////////////

    const allShopping = await this.shoppingServices.getAll({
      query: {
        _id: getInArrayQuery(paymentProofs.map((p) => p.shoppingId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
      query: {
        shoppingId: getInArrayQuery(paymentProofs.map((p) => p.shoppingId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const config: Pick<AdminConfig, 'billing'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          billing: 1
        }
      });

    //////////////////////////////////////////////////////////////////////

    const customers = await this.userServices.getAll({
      query: {
        _id: getInArrayQuery(paymentProofs.map((p) => p.customerId))
      }
    });

    //////////////////////////////////////////////////////////////////////

    const getDto = (paymentProof: PaymentProof): PaymentProofDto => {
      const customer = customers.find((c) => isEqualIds(c._id, paymentProof.customerId));
      const shopping = allShopping.find((s) => isEqualIds(s._id, paymentProof.shoppingId));

      const shoppingAllPayments =
        shopping && getOneShoppingPaymentData(shopping)?.shoppingAllPayments;

      return {
        ...deepJsonCopy(paymentProof),
        sellerName: config?.billing?.name,
        sellerEmail: 'comercial@eltrapichecubiche.com',
        sellerPhone: '+53 5020 5971',
        //
        customerName: customer?.name,
        customerPhone: customer?.phone,
        customerAddress: customer?.addresses?.[0],
        //
        shoppingCode: shopping?.code,
        shoppingProducts: (shopping?.posts || []).map(({ postData, count }) => ({
          productName: postData.name,
          productId: postData._id,
          amount: count
        })),
        paymentsInfo: (shoppingAllPayments || []).map((payment) => ({
          createdAt: payment.createdAt,
          paymentId: payment._id,
          paymentWay: payment.paymentWay,
          amount: payment.saleTotalPrice,
          currency: payment.currency
        }))
      };
    };

    return paymentProofs.map(getDto);
  };

  addPaymentProofFromShopping = async (args: {
    shoppingId: string | Schema.Types.ObjectId;
  }): Promise<ModelDocument<PaymentProof> | null> => {
    const { shoppingId } = args;

    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     *  check if the payment proof exists
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */

    const exists = await this.exists({
      query: {
        shoppingId
      }
    });

    if (exists) {
      logger.error('Payment proof exists already');
      return null;
    }
    /**
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     *  create payment proof of this shopping
     * //////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////
     */

    const shopping = await this.shoppingServices.getOne({
      query: {
        _id: shoppingId
      }
    });

    if (!shopping) {
      return null;
    }

    //////////////////////////////////////////////////////////////////////

    const { getOneShoppingPaymentData } = await this.paymentServices.getPaymentDataFromShopping({
      query: {
        shoppingId
      }
    });

    const { paymentCompleted } = getOneShoppingPaymentData(shopping);

    if (!paymentCompleted) {
      return null;
    }

    //////////////////////////////////////////////////////////////////////

    const config: Pick<AdminConfig, 'billing'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          billing: 1
        }
      });

    if (!config?.billing?.name) {
      logger.info('Missing config data');

      return null;
    }

    //////////////////////////////////////////////////////////////////////

    const userData = await this.userServices.getOne({
      query: {
        _id: shopping.purchaserId
      }
    });

    if (!userData) {
      return null;
    }

    //////////////////////////////////////////////////////////////////////

    /**
     * create a payment proof
     */

    const paymentProof = await this.addOne({
      customerId: userData._id,
      shoppingId: shopping._id
    });

    return paymentProof;
  };
}
