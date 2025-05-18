import { BaseIdentity } from '../../types/general';

export interface SearchSuggestion extends BaseIdentity {
  search: string;
}
