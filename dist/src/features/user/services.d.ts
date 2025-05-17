import { User } from './types';
import { GetAllUsersArgs } from './utils';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class UserServices extends ModelCrudTemplate<User, {
    phone: string;
    password: string;
    name: string;
}, GetAllUsersArgs> {
    constructor();
}
