import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { AuthenticateCallback, AuthSession } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { UserServices } from '../user/services';
import { ValidationCodeServices } from '../validation-code/services';
import { Logger } from '../../utils/general';
import { User } from '../user/types';
export declare class AuthServices extends ModelCrudTemplate<AuthSession, Pick<AuthSession, 'refreshToken' | 'userId' | 'typeDevice' | 'descriptionDevice'>, FilterQuery<AuthSession>> {
    private readonly userServices;
    private readonly validationCodeServices;
    private readonly options;
    steat: number;
    constructor(userServices: UserServices, validationCodeServices: ValidationCodeServices, options: {
        logger: Logger;
        SECRET_ACCESS_TOKEN: string;
        SECRET_REFRESH_TOKEN: string;
        steat: number;
    });
    private init;
    generateAccessJWT: ({ id }: {
        id: string;
    }) => string;
    generateRefreshJWT: ({ id }: {
        id: string;
    }) => string;
    refreshAccessToken: QueryHandle<{
        currentSession: AuthSession;
        refreshToken: string;
    }, {
        accessToken: string | null;
    }>;
    close: QueryHandle<{
        refreshToken: string;
    }, ModelDocument<AuthSession> | null>;
    passportMiddlewareAutenticateLocal: (callback: AuthenticateCallback) => any;
    passportMiddlewareAutenticateJWT: (callback: AuthenticateCallback) => any;
    changePasswordValidated: (user: User, newPassword: any) => Promise<boolean>;
    passportMiddlewareInitialize: import("express").Handler;
}
