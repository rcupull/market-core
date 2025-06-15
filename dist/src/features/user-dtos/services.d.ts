import { AuthSessionServices } from '../auth-session/services';
import { BusinessServices } from '../business/services';
import { User } from '../user/types';
import { UserDto } from './types';
export declare class UserDtosServices {
    private readonly businessServices;
    private readonly authSessionServices;
    constructor(businessServices: BusinessServices, authSessionServices: AuthSessionServices);
    getUsersDto: (users: Array<User>) => Promise<Array<UserDto>>;
}
