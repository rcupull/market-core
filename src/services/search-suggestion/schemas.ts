import { Schema } from 'mongoose';
import { SearchSuggestion } from './types';
import { createdAtSchemaDefinition, getMongoModel } from '../../utils/schemas';

const SearchSuggestionSchema = new Schema<SearchSuggestion>({
  ...createdAtSchemaDefinition,
  search: { type: String, required: true, unique: true }
});

export const SearchSuggestionModel = getMongoModel<SearchSuggestion>(
  'SearchSuggestion',
  SearchSuggestionSchema,
  'search_suggestion'
);
