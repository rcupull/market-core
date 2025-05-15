import { Schema } from 'mongoose';
import { BusinessNotificationFlags } from '../business/types';

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
