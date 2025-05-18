import { NotificationBusinessData, NotificationUserData, PushNotification } from './types';
import { QueryHandle } from '../../types/general';
import { GetAllNotificationsArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { BusinessServices } from '../business/services';
import { UserServices } from '../user/services';
import { AuthServices } from '../auth/services';
import { FilterQuery } from 'mongoose';
import { User } from '../user/types';
export declare class NotificationsServices extends ModelCrudTemplate<PushNotification, Pick<PushNotification, 'type' | 'userIds' | 'readBys' | 'postId' | 'shoppingId' | 'shoppingCode' | 'stockAmountAvailable' | 'routeName' | 'businessName' | 'meta' | 'paymentProofCode' | 'paymentProofId' | 'message'>, GetAllNotificationsArgs> {
    private readonly businessServices;
    private readonly userServices;
    private readonly authServices;
    constructor(businessServices: BusinessServices, userServices: UserServices, authServices: AuthServices);
    private firebaseInstance;
    private notificationsServicesInit;
    sendEachForMulticast: QueryHandle<{
        notification: PushNotification;
        tokens: Array<string>;
        body?: string;
        title?: string;
    }>;
    getBusinessData: QueryHandle<{
        routeName: string;
    }, NotificationBusinessData | null>;
    getUsersData: QueryHandle<{
        query: FilterQuery<User>;
    }, Array<NotificationUserData>>;
}
