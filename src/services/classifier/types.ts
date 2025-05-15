import { BaseIdentity } from '../../types/general';

export enum ClassifierSearchType {
  SEARCH = 'search',
  PROCESS = 'process'
}

export enum ClassifierType {
  CATEGORY = 'CATEGORY',
  DATE = 'DATE',
  SORT = 'SORT'
}

export interface Classifier extends BaseIdentity {
  label: string;
  tags?: string; // list of tags separated by \n
  hidden?: boolean;
  type: ClassifierType;
}
