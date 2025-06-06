import { QueryHandle } from '../../types/general';
import { EmbeddedProductScore } from '../search/types';
import { PostServices } from '../post/services';
export declare class SearchEmbeddingSuggestionServices {
    private readonly postServices;
    constructor(postServices: PostServices);
    searchSuggestionProducts: QueryHandle<{
        search: string;
        limit?: number;
    }, Array<EmbeddedProductScore>>;
    searchSimilarSuggestionProducts: QueryHandle<{
        productScore?: EmbeddedProductScore;
        productId?: string;
        limit?: number;
    }, Array<EmbeddedProductScore>>;
    trainingSearchSuggestions: QueryHandle;
}
