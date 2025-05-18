import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity } from '../../types/general';
import { BusinessNotificationFlags } from '../business/types';
export interface PushNotification extends BaseIdentity {
    type: string;
    userIds?: Array<Schema.Types.ObjectId>;
    readBys?: Record<string, Date>;
    postId?: Schema.Types.ObjectId;
    shoppingId?: Schema.Types.ObjectId;
    shoppingCode?: string;
    stockAmountAvailable?: number;
    routeName?: string;
    businessName?: string;
    meta?: AnyRecord;
    paymentProofCode?: string;
    paymentProofId?: Schema.Types.ObjectId;
    message?: string;
}
export interface NotificationUserData {
    userId: Schema.Types.ObjectId;
    firebaseTokens: Array<string>;
    phone: string;
}
export interface NotificationBusinessData {
    businessName: string;
    routeName: string;
    createdBy?: Schema.Types.ObjectId;
    /**
     * - if notificationFlags=undefined there is not restrictions. All notifications are allowed
     * - If notificationFlags has some value the notification can be not sended according the flags
     */
    notificationFlags: Array<BusinessNotificationFlags> | undefined;
}
