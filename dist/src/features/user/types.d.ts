import { Address, BankAccount, BaseIdentity, Image } from '../../types/general';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
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
    defaultAddressIndex?: number;
    addresses?: Array<Address>;
    checks?: UserChecks;
    lastGeolocation?: Geolocation;
    isOwnerOf: Array<string>;
    isMessengerOf: Array<string>;
    messengerBankAccountCUP?: BankAccount;
    messengerBankAccountMLC?: BankAccount;
}
