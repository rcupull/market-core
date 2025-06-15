import { QueryHandle } from '../../types/general';
import { AuthenticateCallback } from './types';
import { UserServices } from '../user/services';
import { ValidationCodeServices } from '../validation-code/services';
import { Logger } from '../../utils/general';
import { User } from '../user/types';
import { AuthSession } from '../auth-session/types';
import { AuthSessionServices } from '../auth-session/services';
export declare class AuthServices {
    private readonly authSessionServices;
    private readonly userServices;
    private readonly validationCodeServices;
    private readonly options;
    steat: number;
    constructor(authSessionServices: AuthSessionServices, userServices: UserServices, validationCodeServices: ValidationCodeServices, options: {
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
    passportMiddlewareAutenticateLocal: (callback: AuthenticateCallback) => any;
    passportMiddlewareAutenticateJWT: (callback: AuthenticateCallback) => any;
    isDeprecatedPassword: (user: User, newPassword: string) => Promise<boolean>;
    passportMiddlewareInitialize: import("express").Handler;
}
