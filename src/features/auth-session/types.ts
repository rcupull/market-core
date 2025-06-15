import { Schema } from 'mongoose';
import { BaseIdentity } from '../../types/general';

export enum TYPE_DEVICE {
  NATIVE = 'NATIVE',
  WEB = 'WEB'
}

export enum AuthSessionState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
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
