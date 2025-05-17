import { AggregateOptions, AggregatePaginateModel, FilterQuery, PaginateModel, PaginateOptions, PipelineStage, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';
import { AnyRecord, ModelDocument, QueryHandle, QuerySelectType } from '../types/general';
import { UpdateOptions } from 'mongodb';
import { PaginateResult } from '../types/pagination';
export type ModelType<T> = PaginateModel<T> & AggregatePaginateModel<T>;
export declare class ModelCrudTemplate<T extends AnyRecord, NArgs extends Partial<T>, Q extends FilterQuery<T>> {
    private readonly modelGetter;
    private readonly getFilterQuery;
    constructor(modelGetter: () => ModelType<T>, getFilterQuery?: (q: Q) => FilterQuery<T>);
    private getHiddenFields;
    createOne: QueryHandle<NArgs, ModelDocument<T>>;
    addOne: QueryHandle<NArgs, ModelDocument<T>>;
    addOneTestingEnv: QueryHandle<Partial<T>, ModelDocument<T>>;
    distinct: QueryHandle<{
        field: keyof T;
    }, Array<any>>;
    exists: QueryHandle<{
        query: FilterQuery<T>;
    }, boolean>;
    getOne: QueryHandle<{
        query: Q;
        projection?: ProjectionType<T>;
        select?: QuerySelectType<T>;
        options?: QueryOptions<T>;
        sort?: string;
    }, ModelDocument<T> | null>;
    deleteOne: QueryHandle<{
        query: Q;
    }>;
    deleteMany: QueryHandle<{
        query: Q;
    }>;
    findAndDelete: QueryHandle<{
        query: Q;
        queryOptions?: QueryOptions<T>;
    }, ModelDocument<T> | null>;
    getAllWithPagination: QueryHandle<{
        paginateOptions?: PaginateOptions;
        query: Q;
        sort?: string;
        projection?: ProjectionType<T>;
        select?: QuerySelectType<T>;
    }, PaginateResult<T>>;
    getAll: QueryHandle<{
        query: Q;
        projection?: ProjectionType<T>;
        select?: QuerySelectType<T>;
    }, Array<ModelDocument<T>>>;
    updateOne: QueryHandle<{
        query: Q;
        update: UpdateQuery<T>;
        options?: UpdateOptions;
    }, void>;
    updateMany: QueryHandle<{
        query: Q;
        update: UpdateQuery<T>;
        options?: UpdateOptions;
    }, void>;
    findOneAndUpdate: QueryHandle<{
        query: Q;
        update: UpdateQuery<T>;
        queryOptions?: QueryOptions<T>;
    }, ModelDocument<T> | null>;
    getLatest: QueryHandle<{
        query: Q;
    }, ModelDocument<T> | null>;
    /**
     * ////////////////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////////////////
     * AGGREGATIONS
     * ////////////////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////////////////
     */
    private getPipelineToHidePrivateFields;
    aggregate: <R>(args: {
        pipeline: PipelineStage[];
        options?: AggregateOptions;
        select?: QuerySelectType<T>;
    }) => Promise<Array<R>>;
    aggregateOnMatch: <R>(args: {
        matchQuery: Q;
        pipeline: PipelineStage[];
        options?: AggregateOptions;
        select?: QuerySelectType<T>;
    }) => Promise<Array<R>>;
    aggregateWithPagination: <R>(args: {
        paginateOptions?: PaginateOptions;
        pipeline: PipelineStage[];
        options?: AggregateOptions;
        select?: QuerySelectType<T>;
    }) => Promise<PaginateResult<R>>;
}
