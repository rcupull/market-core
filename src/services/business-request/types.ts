import { Business } from '../business/types';

export enum BusinessRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface BusinessRequest
  extends Pick<Business, '_id' | 'createdAt' | 'createdBy' | 'name' | 'routeName' | 'currency'> {
  status: BusinessRequestStatus;
  description: string;
}
