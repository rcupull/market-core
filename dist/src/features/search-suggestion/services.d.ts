import { QueryHandle } from '../../types/general';
import { ProductScore } from '../search/types';
import { ConfigServices } from '../config/services';
import { SearchEmbeddingSuggestionServices } from './services-embedding';
export declare class SearchSuggestionServices {
    private readonly configServices;
    private readonly searchEmbeddingSuggestionServices;
    constructor(configServices: ConfigServices, searchEmbeddingSuggestionServices: SearchEmbeddingSuggestionServices);
    searchSuggestionProducts: QueryHandle<{
        search: string | undefined;
    }, {
        productScores: Array<ProductScore>;
        similarProductScores: Array<ProductScore>;
    }>;
}
