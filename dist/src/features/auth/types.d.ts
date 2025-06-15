import { User } from '../user/types';
export type AuthenticateCallback = (err: any, user?: User, info?: object | string | Array<string | undefined>, status?: number | Array<number | undefined>) => any;
