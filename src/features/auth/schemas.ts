import { AuthSession, AuthSessionState, TYPE_DEVICE } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { getMongoose } from '../../db';

let AuthSessionModel: ReturnType<typeof getMongoModel<AuthSession>>;

export const modelGetter = () => {
  const { Schema } = getMongoose();

  if (!AuthSessionModel) {
    const AuthSessionShema = new Schema<AuthSession>({
      ...createdAtSchemaDefinition,
      refreshToken: { type: String, required: true, unique: true },
      typeDevice: { type: String, enum: Object.values(TYPE_DEVICE), required: true },
      descriptionDevice: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      refreshHistory: { type: [Date], default: [] },
      state: {
        type: String,
        enum: Object.values(AuthSessionState),
        default: AuthSessionState.OPEN,
        required: true
      },
      closedAt: { type: Date },
      firebaseToken: { type: String, select: false }
    });

    AuthSessionModel = getMongoModel<AuthSession>('AuthSession', AuthSessionShema, 'auth_sessions');
  }

  return AuthSessionModel;
};
