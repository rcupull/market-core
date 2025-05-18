import { NotificationBusinessData, NotificationUserData } from './types';
import { QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { AuthServices } from '../auth/services';
import { UserServices } from '../user/services';
import { BusinessServices } from '../business/services';
import { User } from '../user/types';
export declare class NotificationsDataServices {
    private readonly businessServices;
    private readonly userServices;
    private readonly authServices;
    constructor(businessServices: BusinessServices, userServices: UserServices, authServices: AuthServices);
    getBusinessData: QueryHandle<{
        routeName: string;
    }, NotificationBusinessData | null>;
    getUsersData: QueryHandle<{
        query: FilterQuery<User>;
    }, Array<NotificationUserData>>;
}
