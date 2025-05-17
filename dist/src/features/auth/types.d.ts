import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';
import { User } from '../user/types';
export declare enum TYPE_DEVICE {
    NATIVE = "NATIVE",
    WEB = "WEB"
}
export declare enum AuthSessionState {
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}
export interface AuthSession extends BaseIdentity {
    refreshToken: string;
    typeDevice: TYPE_DEVICE;
    descriptionDevice: string | undefined;
    userId: Schema.Types.ObjectId;
    refreshHistory: Array<Date>;
    state: AuthSessionState;
    closedAt?: Date;
    firebaseToken?: string;
}
export type AuthenticateCallback = (err: any, user?: User, info?: object | string | Array<string | undefined>, status?: number | Array<number | undefined>) => any;
