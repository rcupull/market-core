import { GetAllPaymentProofArgs, PaymentProof } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { ConfigServices } from '../config/services';
import { UserServices } from '../user/services';
import { ShoppingServices } from '../shopping/services';
import { PaymentServices } from '../payment/services';
import { ModelDocument, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { Logger } from 'winston';
export declare class PaymentProofServices extends ModelCrudTemplate<PaymentProof, Pick<PaymentProof, 'customerId' | 'shoppingId'>, GetAllPaymentProofArgs> {
    private readonly configServices;
    private readonly userServices;
    private readonly shoppingServices;
    private readonly paymentServices;
    private readonly options;
    constructor(configServices: ConfigServices, userServices: UserServices, shoppingServices: ShoppingServices, paymentServices: PaymentServices, options: {
        logger: Logger;
    });
    getPaymentProofDataFromShopping: QueryHandle<{
        query: GetAllPaymentProofArgs;
    }, {
        getOneShoppingPaymentProofData: (args: {
            shoppingId: Schema.Types.ObjectId;
        }) => {
            paymentProofCode: PaymentProof['code'];
            paymentProofId: PaymentProof['_id'];
        } | null;
    }>;
    addPaymentProofFromShopping: (args: {
        shoppingId: string | Schema.Types.ObjectId;
    }) => Promise<ModelDocument<PaymentProof> | null>;
}
