import { SearchSuggestion } from './types';
import { FilterQuery } from 'mongoose';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class SearchSuggestionServices extends ModelCrudTemplate<SearchSuggestion, Pick<SearchSuggestion, 'search'>, FilterQuery<SearchSuggestion>> {
    constructor();
}
