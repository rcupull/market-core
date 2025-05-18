import { QueryHandle } from '../../types/general';
import { ProductScore } from './types';
import { SearchServicesNLP } from './services-nlp';
import { SearchServicesEmbeddings } from './services-embedding';
import { ProductSimilarityServices } from '../product-similarity/services';
import { ConfigServices } from '../config/services';
export declare class SearchServices {
    private readonly configServices;
    private readonly productSimilarityServices;
    private readonly searchServicesNLP;
    private readonly searchServicesEmbeddings;
    constructor(configServices: ConfigServices, productSimilarityServices: ProductSimilarityServices, searchServicesNLP: SearchServicesNLP, searchServicesEmbeddings: SearchServicesEmbeddings);
    searchInMarketplace: QueryHandle<{
        search: string | undefined;
    }, {
        productScores: Array<ProductScore>;
        similarProductScores: Array<ProductScore>;
    }>;
    getRelatedToProductMapping: QueryHandle<{
        postId: string;
    }, {
        similarProductScores: Array<ProductScore>;
    }>;
    searchInBusiness: QueryHandle<{
        search: string | undefined;
        routeName: string;
    }, {
        productScores: Array<ProductScore>;
    }>;
    trainingMarketplace: QueryHandle;
    trainingOneBusiness: (routeName: string) => Promise<void>;
    trainingAllBusiness: () => Promise<void>;
}
