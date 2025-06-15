import { deepJsonCopy } from '../../utils/general';
import { getInArrayQuery, lastUpQuerySort } from '../../utils/schemas';
import { AuthSessionServices } from '../auth-session/services';
import { AuthSessionState } from '../auth-session/types';
import { BusinessServices } from '../business/services';
import { User } from '../user/types';
import { UserDto } from './types';

export class UserDtosServices {
  constructor(
    private readonly businessServices: BusinessServices,
    private readonly authSessionServices: AuthSessionServices
  ) {}

  getUsersDto = async (users: Array<User>): Promise<Array<UserDto>> => {
    const { getFavoritesBusiness } = await this.businessServices.getBusinessFavoritesData({
      query: {
        favoritesUserIds: getInArrayQuery(users.map((user) => user._id))
      }
    });

    const getDto = async (user: User): Promise<UserDto> => {
      const out: UserDto = {
        ...deepJsonCopy(user),
        favoritesBusiness: getFavoritesBusiness({ userId: user._id }),
        hasOpenSession: false,
        lastAccessAt: undefined
      };

      const lastSession = await this.authSessionServices.getOne({
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
