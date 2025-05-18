import { AuthServices } from '../auth/services';
import { BusinessServices } from '../business/services';
import { ConfigServices } from '../config/services';
import { PaymentProofServices } from '../payment-proof/services';
import { PaymentProof, PaymentProofDto } from '../payment-proof/types';
import { PaymentServices } from '../payment/services';
import { PostServices } from '../post/services';
import { Post, PostDto } from '../post/types';
import { SearchDto } from '../search/types';
import { ShoppingServices } from '../shopping/services';
import { Shopping, ShoppingCartDto, ShoppingDto } from '../shopping/types';
import { UserServices } from '../user/services';
import { User, UserDto } from '../user/types';
export declare class DtosServices {
    private readonly businessServices;
    private readonly authServices;
    private readonly userServices;
    private readonly paymentServices;
    private readonly paymentProofServices;
    private readonly configServices;
    private readonly shoppingServices;
    private readonly postServices;
    constructor(businessServices: BusinessServices, authServices: AuthServices, userServices: UserServices, paymentServices: PaymentServices, paymentProofServices: PaymentProofServices, configServices: ConfigServices, shoppingServices: ShoppingServices, postServices: PostServices);
    /**
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     * ///////////////////////PAYMENT PROOF//////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     */
    getPaymentProofsDto: (paymentProofs: Array<PaymentProof>) => Promise<Array<PaymentProofDto>>;
    /**
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////USERS///////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     */
    getUsersDto: (users: Array<User>) => Promise<Array<UserDto>>;
    /**
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////SHOPPING////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     */
    private getShoppingsResources;
    getShoppingsCartDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingCartDto>>;
    getShoppingsPurchaserDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminFullDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminDeliveryDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsAdminSalesDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsOwnerDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    getShoppingsMessengerDto: (shoppings: Array<Shopping>) => Promise<Array<ShoppingDto>>;
    /**
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////POSTS///////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     */
    private getPostsResources;
    getSearchDto: (posts: Array<Post>) => Promise<Array<SearchDto>>;
    getPostsDto: (posts: Array<Post>) => Promise<Array<PostDto>>;
    getPostsOwnerDto: (posts: Array<Post>) => Promise<Array<PostDto>>;
}
