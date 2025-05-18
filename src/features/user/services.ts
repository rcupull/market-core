import { User } from './types';
import { modelGetter } from './schemas';
import { getAllFilterQuery, GetAllUsersArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Address, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { isEqualIds } from '../../utils/general';

export class UserServices extends ModelCrudTemplate<
  User,
  {
    phone: string;
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
}
