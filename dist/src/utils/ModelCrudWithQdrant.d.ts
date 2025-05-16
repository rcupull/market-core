import { ModelCrudTemplate, ModelType } from './ModelCrudTemplate';
import { FilterQuery } from 'mongoose';
import { Logger } from './general';
import { AnyRecord } from '../types/general';
export type EmbeddedVector = Array<number>;
interface QdrantPoint<Payload extends AnyRecord = AnyRecord> {
    vector: Array<number>;
    id: number | string;
    payload: Payload;
}
type QdrantQueryHandle<Args extends AnyRecord | void = void, R = void> = (customCollectionName: string, args: Args) => Promise<R>;
interface QdrantSearchPoint<Payload extends AnyRecord = AnyRecord> extends QdrantPoint<Payload> {
    score: number;
}
export type GetTextFromDoc<T extends AnyRecord> = (doc: T) => Promise<string | null> | string | null;
export declare class ModelCrudWithQdrant<T extends AnyRecord, NArgs extends Partial<T>, Q extends FilterQuery<T>, QdrantPayload extends AnyRecord> extends ModelCrudTemplate<T, NArgs, Q> {
    private readonly options;
    private qdrantClient;
    constructor(modelGetter: () => ModelType<T>, getFilterQuery: ((q: Q) => FilterQuery<T>) | undefined, options: {
        payloadFromDoc: (doc: T) => Promise<QdrantPayload> | QdrantPayload;
        EMBEDDING_HOST: string;
        NODE_ENV: string;
        QDRANT_API_KEY: string;
        QDRANT_ENV: string;
        QDRANT_HOST: string;
        logger?: Logger;
    });
    private getCollectionName;
    private checkCollection;
    private embed;
    qdrantUpdateAllVectors: QdrantQueryHandle<{
        query: Q;
        getTextFromDoc: GetTextFromDoc<T>;
    }>;
    qdrantSearch: QdrantQueryHandle<{
        search?: string;
        vector?: EmbeddedVector;
        limit?: number;
    }, Array<QdrantSearchPoint<QdrantPayload>>>;
    qdrantSearchOne: QdrantQueryHandle<{
        query: Partial<QdrantPayload>;
    }, QdrantPoint | null>;
}
export {};
