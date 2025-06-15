import { ConfigServices } from '../config/services';
import { PaymentProof } from '../payment-proof/types';
import { PaymentServices } from '../payment/services';
import { ShoppingServices } from '../shopping/services';
import { UserServices } from '../user/services';
import { PaymentProofDto } from './types';
export declare class PaymentProofDtosServices {
    private readonly userServices;
    private readonly paymentServices;
    private readonly configServices;
    private readonly shoppingServices;
    constructor(userServices: UserServices, paymentServices: PaymentServices, configServices: ConfigServices, shoppingServices: ShoppingServices);
    getPaymentProofsDto: (paymentProofs: Array<PaymentProof>) => Promise<Array<PaymentProofDto>>;
}
