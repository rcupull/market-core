import { SearchSuggestion } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';
import { Schema } from 'mongoose';

let SearchSuggestionModel: ReturnType<typeof getMongoModel<SearchSuggestion>>;

export const modelGetter = () => {
  if (!SearchSuggestionModel) {
    const SearchSuggestionSchema = new Schema<SearchSuggestion>({
      ...createdAtSchemaDefinition,
      search: { type: String, required: true, unique: true }
    });

    SearchSuggestionModel = getMongoModel<SearchSuggestion>(
      'SearchSuggestion',
      SearchSuggestionSchema,
      'search_suggestion'
    );
  }

  return SearchSuggestionModel;
};
