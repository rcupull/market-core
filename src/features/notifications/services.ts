import { NotificationBusinessData, NotificationUserData, PushNotification } from './types';
import firebase from 'firebase-admin';
import { ModelDocument, QueryHandle } from '../../types/general';

import { modelGetter } from './schemas';
import { getAllFilterQuery, GetAllNotificationsArgs, getNotificationsCredentials } from './utils';

import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { BusinessServices } from '../business/services';
import { UserServices } from '../user/services';
import { AuthServices } from '../auth/services';
import { Business } from '../business/types';
import { FilterQuery } from 'mongoose';
import { User } from '../user/types';
import { getInArrayQuery } from '../../utils/schemas';
import { AuthSession, AuthSessionState } from '../auth/types';
import { compact, isEqualIds } from '../../utils/general';

export class NotificationsServices extends ModelCrudTemplate<
  PushNotification,
  Pick<
    PushNotification,
    | 'type'
    | 'userIds'
    | 'readBys'
    | 'postId'
    | 'shoppingId'
    | 'shoppingCode'
    | 'stockAmountAvailable'
    | 'routeName'
    | 'businessName'
    | 'meta'
    | 'paymentProofCode'
    | 'paymentProofId'
    | 'message'
  >,
  GetAllNotificationsArgs
> {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly userServices: UserServices,
    private readonly authServices: AuthServices
  ) {
    super(modelGetter, getAllFilterQuery);
    this.notificationsServicesInit();
  }

  private firebaseInstance = firebase;

  private notificationsServicesInit = () => {
    firebase.initializeApp({
      //@ts-expect-error ignore
      credential: firebase.credential.cert(getNotificationsCredentials())
    });
    console.info('Initialized Firebase SDK');
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  sendEachForMulticast: QueryHandle<{
    notification: PushNotification;
    tokens: Array<string>;
    body?: string;
    title?: string;
  }> = async ({ notification, tokens, body, title }) => {
    await this.firebaseInstance.messaging().sendEachForMulticast({
      data: { payload: JSON.stringify(notification) },
      tokens,
      notification: {
        title,
        body
      }
    });
  };

  getBusinessData: QueryHandle<
    {
      routeName: string;
    },
    NotificationBusinessData | null
  > = async ({ routeName }) => {
    const businessData: Pick<Business, 'name' | 'notificationFlags' | 'createdBy'> | null =
      await this.businessServices.getOne({
        query: {
          routeName
        },
        projection: {
          name: 1,
          notificationFlags: 1,
          createdBy: 1
        }
      });

    if (!businessData) {
      return null;
    }

    return {
      businessName: businessData.name,
      routeName,
      notificationFlags: businessData.notificationFlags,
      createdBy: businessData.createdBy
    };
  };

  getUsersData: QueryHandle<
    {
      query: FilterQuery<User>;
    },
    Array<NotificationUserData>
  > = async ({ query }) => {
    const users: Array<ModelDocument<Pick<User, '_id' | 'phone'>>> = await this.userServices.getAll(
      {
        query,
        projection: {
          _id: 1,
          phone: 1
        }
      }
    );

    const sessions = (await this.authServices.getAll({
      query: {
        userId: getInArrayQuery(users.map((user) => user._id.toString())),
        state: AuthSessionState.OPEN
      },
      projection: {
        firebaseToken: 1,
        userId: 1
      }
    })) as unknown as Array<ModelDocument<Pick<AuthSession, 'firebaseToken' | 'userId'>>>;

    return users.map((user) => ({
      firebaseTokens: compact(
        sessions.filter((s) => isEqualIds(s.userId, user._id)).map((s) => s.firebaseToken)
      ),
      userId: user._id,
      phone: user.phone
    }));
  };
}
