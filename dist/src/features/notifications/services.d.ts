import { NotificationBusinessData, NotificationUserData, PushNotification } from './types';
import { QueryHandle } from '../../types/general';
import { GetAllNotificationsArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { BusinessServices } from '../business/services';
import { UserServices } from '../user/services';
import { FilterQuery } from 'mongoose';
import { User } from '../user/types';
import { AuthSessionServices } from '../auth-session/services';
export declare class NotificationsServices extends ModelCrudTemplate<PushNotification, Pick<PushNotification, 'type' | 'userIds' | 'readBys' | 'postId' | 'shoppingId' | 'shoppingCode' | 'stockAmountAvailable' | 'routeName' | 'businessName' | 'meta' | 'paymentProofCode' | 'paymentProofId' | 'message'>, GetAllNotificationsArgs> {
    private readonly businessServices;
    private readonly userServices;
    private readonly authSessionServices;
    constructor(businessServices: BusinessServices, userServices: UserServices, authSessionServices: AuthSessionServices);
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
    getUsersIdsFromUsersData: (usersData: Array<NotificationUserData>) => import("mongoose").Schema.Types.ObjectId[];
    getTokensFromUsersData: (usersData: Array<NotificationUserData>) => string[];
}
