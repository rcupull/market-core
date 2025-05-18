import { ProductSimilarity } from './types';
import { QueryHandle } from '../../types/general';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { PostServices } from '../post/services';
import { ClassifiersServices } from '../classifier/services';
import { NlpServices } from '../nlp/services';
import { BusinessServices } from '../business/services';
import { GetAllClassifiersArgs } from '../classifier/utils';
export declare class ProductSimilarityServices extends ModelCrudTemplate<ProductSimilarity, Pick<ProductSimilarity, 'productId' | 'productScores' | 'classfiersScores' | 'productName'>, GetAllClassifiersArgs> {
    private readonly postServices;
    private readonly classifiersServices;
    private readonly nlpServices;
    private readonly businessServices;
    constructor(postServices: PostServices, classifiersServices: ClassifiersServices, nlpServices: NlpServices, businessServices: BusinessServices);
    /**
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     * Product Similarity
     * //////////////////////////////////////////////////////////////////////////
     * //////////////////////////////////////////////////////////////////////////
     */
    private getSimilarity;
    updateClassfiersScores: QueryHandle;
    updateProductScores: QueryHandle;
}
