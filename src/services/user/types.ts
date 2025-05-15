import { Access } from '../config/types';
import { Business } from '../business/types';
import { Address, BankAccount, BaseIdentity, Image } from '../../types/general';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserChecks {
  requestUserTypeWhenStart?: boolean;
  doneMyFirstBusiness?: boolean;
}

export interface User extends BaseIdentity {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
  validated: boolean;
  profileImage?: Image;
  specialAccess?: Array<Access>;
  //
  defaultAddressIndex?: number;
  addresses?: Array<Address>;
  //
  checks?: UserChecks;
  lastGeolocation?: Geolocation;
  isOwnerOf: Array<string>; // list of business routeNames
  isMessengerOf: Array<string>; // list of business routeNames
  messengerBankAccountCUP?: BankAccount;
  messengerBankAccountMLC?: BankAccount;
}

export interface UserDto extends User {
  favoritesBusiness: Array<Pick<Business, 'routeName' | 'name'>>;
  hasOpenSession: boolean | undefined;
  lastAccessAt: Date | undefined;
}
