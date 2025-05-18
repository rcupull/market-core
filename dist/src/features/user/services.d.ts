import { User } from './types';
import { GetAllUsersArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Address, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
export declare class UserServices extends ModelCrudTemplate<User, {
    phone: string;
    password: string;
    name: string;
}, GetAllUsersArgs> {
    constructor();
    getPurchasersData: QueryHandle<{
        query: GetAllUsersArgs;
    }, {
        getOnePurchaserData: (args: {
            purchaserId: Schema.Types.ObjectId | undefined;
        }) => {
            purchaserName: string;
            purchaserAddress?: Address;
            purchaserPhone?: string;
        } | null;
    }>;
}
