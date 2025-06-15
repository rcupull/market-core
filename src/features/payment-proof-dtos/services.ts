import { deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';
import { ConfigServices } from '../config/services';
import { AdminConfig } from '../config/types';
import { PaymentProof } from '../payment-proof/types';
import { PaymentServices } from '../payment/services';
import { ShoppingServices } from '../shopping/services';
import { UserServices } from '../user/services';
import { PaymentProofDto } from './types';

export class PaymentProofDtosServices {
  constructor(
    private readonly userServices: UserServices,
    private readonly paymentServices: PaymentServices,
    private readonly configServices: ConfigServices,
    private readonly shoppingServices: ShoppingServices
  ) {}

  getPaymentProofsDto = async (
    paymentProofs: Array<PaymentProof>
  ): Promise<Array<PaymentProofDto>> => {
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
}
