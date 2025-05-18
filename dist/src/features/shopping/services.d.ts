import { ModelDocument, QueryHandle } from '../../types/general';
import { GetAllShoppingArgs, Shopping, ShoppingState } from './types';
import { Post } from '../post/types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { User } from '../user/types';
import { getShoppingInfo } from './getShoppingInfo';
import { BusinessType, DeliveryConfig } from '../business/types';
export type NArgsShopping = Pick<Shopping, 'state' | 'purchaserId' | 'browserFingerprint' | 'routeName' | 'businessType' | 'requestedDelivery' | 'posts' | 'exchangeRates'>;
export declare class ShoppingServices extends ModelCrudTemplate<Shopping, NArgsShopping, GetAllShoppingArgs> {
    constructor();
    getShoppingDataFromPosts: QueryHandle<{
        posts: Array<Post>;
    }, {
        getOnePostShoppingData: (post: Post) => {
            amountInProcess: number;
            stockAmountAvailable: number;
            stockAmount: number;
        };
    }>;
    /**
     * Return tru if the shopping is or was approved
     */
    wasApprovedShopping: (shopping: Shopping) => boolean;
    changeShoppingState: (shopping: ModelDocument<Shopping>, state: ShoppingState, reason?: string) => ModelDocument<Shopping>;
    changeShoppingAddCancellation: (shopping: ModelDocument<Shopping>, user: User) => ModelDocument<Shopping>;
    getDeliveryPrice: (args: {
        distance: number;
        deliveryConfig: DeliveryConfig;
    }) => number | undefined;
    getDeliveryConfigToUse: (args: {
        businessType: BusinessType | undefined;
        businessDeliveryConfig: DeliveryConfig | undefined;
        adminDeliveryConfig: DeliveryConfig | undefined;
    }) => DeliveryConfig | undefined;
    getShoppingInfo: typeof getShoppingInfo;
}
