import { QueryHandle } from '../../types/general';
import { ProductScore } from './types';
import { NlpServices } from '../nlp/services';
import { BusinessServices } from '../business/services';
import { PostServices } from '../post/services';
export declare class SearchServicesNLP {
    private readonly nlpServices;
    private readonly businessServices;
    private readonly postServices;
    constructor(nlpServices: NlpServices, businessServices: BusinessServices, postServices: PostServices);
    /**
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     * Searching
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     */
    searchInMarketplace: QueryHandle<{
        search: string;
    }, Array<ProductScore>>;
    searchInBusiness: QueryHandle<{
        search: string;
        routeName: string;
    }, Array<ProductScore>>;
    /**
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     * Training
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     */
    trainingMarketplace: () => Promise<void>;
    trainingOneBusiness: (routeName: string) => Promise<void>;
    trainingAllBusiness: () => Promise<void>;
}
