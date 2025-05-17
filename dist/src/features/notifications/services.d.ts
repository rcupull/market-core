import { PushNotification } from './types';
import { QueryHandle } from '../../types/general';
import { GetAllNotificationsArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class NotificationsServices extends ModelCrudTemplate<PushNotification, Pick<PushNotification, 'type' | 'userIds' | 'readBys' | 'postId' | 'shoppingId' | 'shoppingCode' | 'stockAmountAvailable' | 'routeName' | 'businessName' | 'meta' | 'paymentProofCode' | 'paymentProofId' | 'message'>, GetAllNotificationsArgs> {
    constructor();
    private firebaseInstance;
    private notificationsServicesInit;
    sendEachForMulticast: QueryHandle<{
        notification: PushNotification;
        tokens: Array<string>;
        body?: string;
        title?: string;
    }>;
}
