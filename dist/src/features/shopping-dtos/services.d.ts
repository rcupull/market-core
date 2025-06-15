import { BusinessServices } from '../business/services';
import { ConfigServices } from '../config/services';
import { PaymentProofServices } from '../payment-proof/services';
import { PaymentServices } from '../payment/services';
import { PostServices } from '../post/services';
import { ShoppingServices } from '../shopping/services';
import { Shopping } from '../shopping/types';
import { UserServices } from '../user/services';
import { ShoppingCartDto, ShoppingDto } from './types';
export declare class ShoppingDtosServices {
    private readonly businessServices;
    private readonly userServices;
    private readonly paymentServices;
    private readonly paymentProofServices;
    private readonly configServices;
    private readonly shoppingServices;
    private readonly postServices;
    constructor(businessServices: BusinessServices, userServices: UserServices, paymentServices: PaymentServices, paymentProofServices: PaymentProofServices, configServices: ConfigServices, shoppingServices: ShoppingServices, postServices: PostServices);
    private getShoppingsResources;
    getShoppingsCartDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingCartDto>>;
    getShoppingsPurchaserDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminFullDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminDeliveryDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminSalesDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsOwnerDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsMessengerDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
}
