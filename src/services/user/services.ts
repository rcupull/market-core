import { Address, QueryHandle } from '../../types/general';
import { User, UserDto } from './types';
import { UserModel } from './schemas';
import { FilterQuery } from 'mongoose';
import { Shopping } from '../shopping/types';
import { deepJsonCopy, isEqualIds } from '../../utils/general';
import { getInArrayQuery } from '../../utils/schemas';
import { getAllFilterQuery, GetAllUsersArgs } from './utils';
import { AuthSessionState } from '../auth/types';
import { lastUpQuerySort } from '../../utils/api';

import { AuthServices } from '../auth/services';
import { BusinessServices } from '../business/services';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class UserServices extends ModelCrudTemplate<
  User,
  {
    phone: string;
    password: string;
    name: string;
  },
  GetAllUsersArgs
> {
  constructor(
    private readonly authServices: AuthServices,
    private readonly businessServices: BusinessServices
  ) {
    super(UserModel, getAllFilterQuery);
  }

  getUserDataFromShopping: QueryHandle<
    {
      query: FilterQuery<User>;
    },
    {
      getOneShoppingUserData: (shopping: Shopping) => {
        purchaserName: string;
        purchaserAddress?: Address;
        purchaserPhone?: string;
      } | null;
    }
  > = async ({ query }) => {
    const usersData: Array<Pick<User, '_id' | 'name' | 'addresses' | 'phone'>> = await this.getAll({
      query,
      projection: { name: 1, addresses: 1, _id: 1, phone: 1 }
    });

    return {
      getOneShoppingUserData: (shopping) => {
        const purchaserId = shopping.purchaserId;

        const userData = purchaserId && usersData.find((user) => isEqualIds(user._id, purchaserId));

        if (userData) {
          return {
            purchaserName: userData.name,
            purchaserAddress: userData.addresses?.[0],
            purchaserPhone: userData.phone
          };
        }
        return null;
      }
    };
  };

  getUsersDto = async (users: Array<User>): Promise<Array<UserDto>> => {
    const { getFavoritesBusiness } = await this.businessServices.getBusinessFavoritesData({
      query: {
        favoritesUserIds: getInArrayQuery(users.map((user) => user._id))
      }
    });

    const getDto = async (user: User): Promise<UserDto> => {
      const out: UserDto = {
        ...deepJsonCopy(user),
        favoritesBusiness: getFavoritesBusiness(user._id),
        hasOpenSession: false,
        lastAccessAt: undefined
      };

      const lastSession = await this.authServices.getOne({
        query: { userId: user._id },
        sort: lastUpQuerySort
      });

      if (!lastSession) {
        return out;
      }

      const refreshHistory = lastSession.refreshHistory;
      const lastAccessAt = refreshHistory[refreshHistory.length - 1];

      out.hasOpenSession = lastSession.state === AuthSessionState.OPEN;
      out.lastAccessAt = lastAccessAt || lastSession.createdAt;

      return out;
    };

    const promises = users.map(getDto);

    const out = await Promise.all(promises);

    return out;
  };
}
