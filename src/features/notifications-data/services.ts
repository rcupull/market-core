import { NotificationBusinessData, NotificationUserData } from './types';
import { ModelDocument, QueryHandle } from '../../types/general';

import { FilterQuery } from 'mongoose';
import { getInArrayQuery } from '../../utils/schemas';
import { compact, isEqualIds } from '../../utils/general';
import { AuthServices } from '../auth/services';
import { UserServices } from '../user/services';
import { BusinessServices } from '../business/services';
import { Business } from '../business/types';
import { AuthSession, AuthSessionState } from '../auth/types';
import { User } from '../user/types';

export class NotificationsDataServices {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly userServices: UserServices,
    private readonly authServices: AuthServices
  ) {}

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
