import { AuthSessionServices } from '../auth-session/services';
import { BusinessServices } from '../business/services';
import { ConfigServices } from '../config/services';
import { HelperDto } from '../helper-dtos/types';
import { HelperServices } from '../helper/services';
import { Helper } from '../helper/types';
import { PaymentProofDto } from '../payment-proof-dtos/types';
import { PaymentProofServices } from '../payment-proof/services';
import { PaymentProof } from '../payment-proof/types';
import { PaymentServices } from '../payment/services';
import { PostDto } from '../post-dtos/types';
import { PostServices } from '../post/services';
import { Post } from '../post/types';
import { SearchDto } from '../search-dtos/types';
import { ShoppingCartDto, ShoppingDto } from '../shopping-dtos/types';
import { ShoppingServices } from '../shopping/services';
import { Shopping } from '../shopping/types';
import { UserDto } from '../user-dtos/types';
import { UserServices } from '../user/services';
import { User } from '../user/types';
export declare class DtosServices {
    private readonly businessServices;
    private readonly authSessionServices;
    private readonly userServices;
    private readonly paymentServices;
    private readonly paymentProofServices;
    private readonly configServices;
    private readonly shoppingServices;
    private readonly postServices;
    private readonly helperServices;
    constructor(businessServices: BusinessServices, authSessionServices: AuthSessionServices, userServices: UserServices, paymentServices: PaymentServices, paymentProofServices: PaymentProofServices, configServices: ConfigServices, shoppingServices: ShoppingServices, postServices: PostServices, helperServices: HelperServices);
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
    /**
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////HELPER///////////////////////////////
     * //////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////
     */
    getHelperDto: (helpers: Array<Helper>) => Promise<Array<HelperDto>>;
}
