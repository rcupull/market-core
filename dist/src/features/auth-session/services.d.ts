import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { AuthSession } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class AuthSessionServices extends ModelCrudTemplate<AuthSession, Pick<AuthSession, 'refreshToken' | 'userId' | 'typeDevice' | 'descriptionDevice'>, FilterQuery<AuthSession>> {
    constructor();
    close: QueryHandle<{
        refreshToken: string;
    }, ModelDocument<AuthSession> | null>;
}
