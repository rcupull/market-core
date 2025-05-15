import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { AuthSessionModel } from './schemas';
import { AuthSession, AuthSessionState } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class AuthServices extends ModelCrudTemplate<
  AuthSession,
  Pick<AuthSession, 'refreshToken' | 'userId' | 'typeDevice' | 'descriptionDevice'>,
  FilterQuery<AuthSession>
> {
  constructor() {
    super(AuthSessionModel);
  }

  close: QueryHandle<
    {
      refreshToken: string;
    },
    ModelDocument<AuthSession> | null
  > = async ({ refreshToken }) => {
    const authSession = await AuthSessionModel.findOneAndUpdate(
      {
        refreshToken,
        state: AuthSessionState.OPEN
      },
      {
        state: AuthSessionState.CLOSED,
        closedAt: new Date()
      },
      {
        returnDocument: 'after'
      }
    );

    return authSession;
  };
}
