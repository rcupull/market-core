import { Business } from '../business/types';
import { User } from '../user/types';
export interface UserDto extends User {
    favoritesBusiness: Array<Pick<Business, 'routeName' | 'name'>>;
    hasOpenSession: boolean | undefined;
    lastAccessAt: Date | undefined;
}
