import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { modelGetter } from './schemas';
import { AuthSession, AuthSessionState } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class AuthSessionServices extends ModelCrudTemplate<
  AuthSession,
  Pick<AuthSession, 'refreshToken' | 'userId' | 'typeDevice' | 'descriptionDevice'>,
  FilterQuery<AuthSession>
> {
  constructor() {
    super(modelGetter);
  }

  close: QueryHandle<
    {
      refreshToken: string;
    },
    ModelDocument<AuthSession> | null
  > = async ({ refreshToken }) => {
    const Model = modelGetter();

    const authSession = await Model.findOneAndUpdate(
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
