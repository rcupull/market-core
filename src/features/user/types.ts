import { Address, BankAccount, BaseIdentity, Image } from '../../types/general';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserChecks {
  requestUserTypeWhenStart?: boolean;
  doneMyFirstBusiness?: boolean;
}
export interface passwordHistory {
  password: string;
  createdAt: Date;
}
export interface User extends BaseIdentity {
  name: string;
  email?: string;
  phone: string;
  password: string;
  passwordHistory: Array<passwordHistory>;
  role: UserRole;
  validated: boolean;
  profileImage?: Image;
  specialAccess?: Array<string>;
  //
  defaultAddressIndex?: number;
  addresses?: Array<Address>;
  //
  messengerAvailable?: boolean;
  //
  checks?: UserChecks;
  lastGeolocation?: Geolocation;
  isOwnerOf: Array<string>; // list of business routeNames
  isMessengerOf: Array<string>; // list of business routeNames
  messengerBankAccountCUP?: BankAccount;
  messengerBankAccountMLC?: BankAccount;
}
