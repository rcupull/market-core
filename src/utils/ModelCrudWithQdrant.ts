import { QdrantClient } from '@qdrant/js-client-rest';
import { ModelCrudTemplate } from './ModelCrudTemplate'; // tu clase base
import { AnyRecord, QueryHandle } from '../types/general';
import { AggregatePaginateModel, FilterQuery, PaginateModel } from 'mongoose';
import { EMBEDDING_HOST, NODE_ENV, QDRANT_API_KEY, QDRANT_ENV, QDRANT_HOST } from '../config';
import { compact } from './general';
import { logger } from '../services/logger';
import axios from 'axios';

export type EmbeddedVector = Array<number>;

interface QdrantPoint<Payload extends AnyRecord = AnyRecord> {
  vector: Array<number>;
  id: number | string;
  payload: Payload;
}

type QdrantQueryHandle<Args extends AnyRecord | void = void, R = void> = (
  customCollectionName: string,
  args: Args
) => Promise<R>;

interface QdrantSearchPoint<Payload extends AnyRecord = AnyRecord> extends QdrantPoint<Payload> {
  score: number;
}

const getCollectionName = (customCollectionName: string) => {
  return `${NODE_ENV}_${QDRANT_ENV}_${customCollectionName}`;
};

export type GetTextFromDoc<T extends AnyRecord> = (
  doc: T
) => Promise<string | null> | string | null;

export class ModelCrudWithQdrant<
  T extends AnyRecord,
  NArgs extends Partial<T>,
  Q extends FilterQuery<T>,
  QdrantPayload extends AnyRecord
> extends ModelCrudTemplate<T, NArgs, Q> {
  private qdrantClient: QdrantClient;

  constructor(
    private readonly model: PaginateModel<T> & AggregatePaginateModel<T>,
    getFilterQuery: (q: Q) => FilterQuery<T> = (q) => q,
    private readonly payloadFromDoc: (doc: T) => Promise<QdrantPayload> | QdrantPayload
  ) {
    super(model, getFilterQuery);

    this.qdrantClient = new QdrantClient({ url: QDRANT_HOST, apiKey: QDRANT_API_KEY });
  }

  private checkCollection: QdrantQueryHandle = async (collectionName) => {
    const existsProductsCollection = await this.qdrantClient.collectionExists(collectionName);

    if (!existsProductsCollection.exists) {
      await this.qdrantClient.createCollection(collectionName, {
        vectors: { size: 384, distance: 'Cosine' }
      });
    }
  };

  private embed: QueryHandle<
    {
      text: string;
    },
    {
      embedding: Array<number>;
    }
  > = async ({ text }) => {
    try {
      const { data } = await axios({
        method: 'get',
        url: `${EMBEDDING_HOST}/embed`,
        params: { text }
      });

      return {
        embedding: data.embedding as Array<number>
      };
    } catch (e) {
      logger.error('Failed call to Embedding provider');
      logger.error(e);

      return {
        embedding: []
      };
    }
  };

  qdrantUpdateAllVectors: QdrantQueryHandle<{ query: Q; getTextFromDoc: GetTextFromDoc<T> }> =
    async (customCollectionName, { query, getTextFromDoc }) => {
      /**
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       */
      const collectionName = getCollectionName(customCollectionName);
      await this.checkCollection(collectionName);

      /**
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       */

      const documents = await this.getAll({ query });

      try {
        const getPoint = async (
          document: T,
          index: number
        ): Promise<QdrantPoint<QdrantPayload> | null> => {
          const text = await getTextFromDoc(document);

          if (!text) return null;

          const { embedding } = await this.embed({ text });

          const payload = await this.payloadFromDoc(document);

          return {
            id: index,
            vector: embedding,
            payload: payload
          };
        };

        const points = await Promise.all(documents.map(getPoint));

        await this.qdrantClient.delete(collectionName, {
          filter: {} // //Remove all the points
        });

        await this.qdrantClient.upsert(collectionName, {
          wait: true,
          points: compact(points)
        });
      } catch (e) {
        logger.error('Failed calling upsert to Qdrant');
        logger.error(JSON.stringify(e, null, 2));
      }
    };

  qdrantSearch: QdrantQueryHandle<
    { search?: string; vector?: EmbeddedVector; limit?: number },
    Array<QdrantSearchPoint<QdrantPayload>>
  > = async (customCollectionName, { search, limit, vector }) => {
    /**
     * ///////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////
     */
    const collectionName = getCollectionName(customCollectionName);
    await this.checkCollection(collectionName);

    /**
     * ///////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////
     */

    try {
      const query = await (async () => {
        if (search) {
          const { embedding } = await this.embed({ text: search });
          return embedding;
        }

        if (vector) {
          return vector;
        }

        return [];
      })();

      const { points } = await this.qdrantClient.query(collectionName, {
        query,
        with_payload: true,
        with_vector: true,
        limit: limit || 20
      });

      return points.map(({ score, payload, vector, id }) => ({
        id,
        score,
        vector: vector as EmbeddedVector,
        payload: payload as QdrantPayload
      }));
    } catch (e) {
      logger.error('Failed calling search to Qdrant');
      logger.error(JSON.stringify(e, null, 2));

      return [];
    }
  };

  qdrantSearchOne: QdrantQueryHandle<{ query: Partial<QdrantPayload> }, QdrantPoint | null> =
    async (customCollectionName, { query }) => {
      /**
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       */
      const collectionName = getCollectionName(customCollectionName);
      await this.checkCollection(collectionName);

      /**
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       * ///////////////////////////////////////////////////////////////
       */

      try {
        const { points } = await this.qdrantClient.scroll(collectionName, {
          limit: 1,
          with_payload: true,
          with_vector: true,
          filter: {
            must: Object.entries(query).map(([k, v]) => ({
              key: k,
              match: {
                value: v
              }
            }))
          }
        });

        if (!points.length) {
          return null;
        }

        return points[0] as QdrantPoint;
      } catch (e) {
        logger.error('Failed calling qdrantSearchOne to Qdrant');
        logger.error(JSON.stringify(e, null, 2));

        return null;
      }
    };
}
