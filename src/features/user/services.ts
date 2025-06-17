import { User } from './types';
import { modelGetter } from './schemas';
import { getAllFilterQuery, GetAllUsersArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Address, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { isEqualIds, isNumber } from '../../utils/general';

export class UserServices extends ModelCrudTemplate<
  User,
  {
    phone?: string;
    email?: string;
    password: string;
    name: string;
  },
  GetAllUsersArgs
> {
  constructor() {
    super(modelGetter, getAllFilterQuery);
  }

  getPurchasersData: QueryHandle<
    {
      query: GetAllUsersArgs;
    },
    {
      getOnePurchaserData: (args: { purchaserId: Schema.Types.ObjectId | undefined }) => {
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
      getOnePurchaserData: ({ purchaserId }) => {
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

  getUserAddress = (user: User, addressIndex?: number) => {
    /**
     * if addressIndex is not defined, then we return the default address, or the first address if there is no default
     */

    const { addresses, defaultAddressIndex } = user;

    const index = isNumber(addressIndex) ? addressIndex : defaultAddressIndex;

    if (isNumber(index)) {
      return addresses?.[index] || addresses?.[0];
    }

    return addresses?.[0];
  };
}
