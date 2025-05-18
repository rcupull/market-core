import { modelGetter } from './schemas';

import { getAllFilterQuery } from './utils';
import { GetAllPaymentProofArgs, PaymentProof } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { ConfigServices } from '../config/services';
import { UserServices } from '../user/services';
import { ShoppingServices } from '../shopping/services';
import { PaymentServices } from '../payment/services';
import { ModelDocument, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { isEqualIds } from '../../utils/general';
import { Logger } from 'winston';
import { AdminConfig } from '../config/types';

export class PaymentProofServices extends ModelCrudTemplate<
  PaymentProof,
  Pick<PaymentProof, 'customerId' | 'shoppingId'>,
  GetAllPaymentProofArgs
> {
  constructor(
    private readonly configServices: ConfigServices,
    private readonly userServices: UserServices,
    private readonly shoppingServices: ShoppingServices,
    private readonly paymentServices: PaymentServices,
    private readonly options: {
      logger: Logger;
    }
  ) {
    super(modelGetter, getAllFilterQuery);
  }

  getPaymentProofDataFromShopping: QueryHandle<
    {
      query: GetAllPaymentProofArgs;
    },
    {
      getOneShoppingPaymentProofData: (args: { shoppingId: Schema.Types.ObjectId }) => {
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
      getOneShoppingPaymentProofData: ({ shoppingId }) => {
        const paymentProof = allPaymentsProofs.find((paymentProof) => {
          return isEqualIds(paymentProof.shoppingId, shoppingId);
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
      const { logger } = this.options;
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
      const { logger } = this.options;

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
