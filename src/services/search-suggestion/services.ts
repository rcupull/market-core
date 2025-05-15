import { SearchSuggestion } from './types';
import { FilterQuery } from 'mongoose';
import { SearchSuggestionModel } from './schemas';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';

export class SearchSuggestionServices extends ModelCrudTemplate<
  SearchSuggestion,
  Pick<SearchSuggestion, 'search'>,
  FilterQuery<SearchSuggestion>
> {
  constructor() {
    super(SearchSuggestionModel);
  }
}
