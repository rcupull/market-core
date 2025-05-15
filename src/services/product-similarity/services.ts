import { ProductSimilarityModel } from './schemas';
import { ProductSimilarity } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { GetAllClassifiersArgs, getAllFilterQuery } from './utils';
import { compact, isEqualIds } from '../../utils/general';
import { ModelDocument, QueryHandle } from '../../types/general';
import { Schema } from 'mongoose';
import { PostServices } from '../post/services';
import { ClassifiersServices } from '../classifier/services';
import { Post } from '../post/types';
import { getInArrayQuery } from '../../utils/schemas';
import { ObjectId } from 'mongodb';
import { NlpServices } from '../nlp/services';

import { BusinessServices } from '../business/services';

export class ProductSimilarityServices extends ModelCrudTemplate<
  ProductSimilarity,
  Pick<ProductSimilarity, 'productId' | 'productScores' | 'classfiersScores' | 'productName'>,
  GetAllClassifiersArgs
> {
  constructor(
    private readonly postServices: PostServices,
    private readonly classifiersServices: ClassifiersServices,
    private readonly nlpServices: NlpServices,
    private readonly businessServices: BusinessServices
  ) {
    super(ProductSimilarityModel, getAllFilterQuery);
  }

  /**
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   * Product Similarity
   * //////////////////////////////////////////////////////////////////////////
   * //////////////////////////////////////////////////////////////////////////
   */

  private getSimilarity: QueryHandle<{ product: Post }, ModelDocument<ProductSimilarity>> = async ({
    product
  }) => {
    const similarity = await this.getOne({
      query: {
        productId: product._id
      }
    });

    if (!similarity) {
      return await this.addOne({
        productId: product._id,
        productName: product.name,
        productScores: [],
        classfiersScores: []
      });
    }

    return similarity;
  };

  updateClassfiersScores: QueryHandle = async () => {
    const allPosts = await this.postServices.getAll({ query: {} });

    const handle = async (product: Post) => {
      const text = product.name;

      const response = await this.classifiersServices.process({ text });

      if (!response) return;

      const { classifications } = response;

      const similarity = await this.getSimilarity({ product });

      similarity.classfiersScores = compact(
        classifications.map((classification) => {
          if (!classification.score) return null;

          if (!ObjectId.isValid(classification.intent)) return null;
          //@ts-expect-error this type is correct. Mongo does to right conversion here
          const classifierId: Schema.Types.ObjectId = classification.intent;

          return {
            classifierId,
            score: classification.score
          };
        })
      );

      await similarity.save();
    };

    const promises = allPosts.map(handle);

    await Promise.all(promises);
  };

  updateProductScores: QueryHandle = async () => {
    const allProducts = await this.postServices.getAll({ query: {} });

    const allSimilarities = await this.getAll({
      query: {
        productId: getInArrayQuery(allProducts.map((product) => product._id))
      }
    });

    const handle = async (currentSimilarity: ModelDocument<ProductSimilarity>) => {
      const currentScores = currentSimilarity?.classfiersScores || [];
      const currentProductId = currentSimilarity.productId;

      currentSimilarity.productScores = compact(
        allSimilarities.map((matcherSimilarity) => {
          const matcherScores = matcherSimilarity?.classfiersScores || [];
          const matcheProductId = matcherSimilarity.productId;

          if (isEqualIds(currentProductId, matcheProductId)) return null;

          const commonScores = currentScores.filter((currentScore) => {
            return matcherScores.some((matcherScore) => {
              return isEqualIds(currentScore.classifierId, matcherScore.classifierId);
            });
          });

          const score = commonScores?.reduce((acc, { score }) => acc + score, 0);

          if (!score) return null;

          return {
            productId: matcherSimilarity.productId,
            productName: matcherSimilarity.productName,
            score
          };
        })
      );

      currentSimilarity.productScores.sort((a, b) => b.score - a.score);

      await currentSimilarity.save();
    };

    const promises = allSimilarities.map(handle);
    await Promise.all(promises);
  };
}
