import {
  AggregateOptions,
  AggregatePaginateModel,
  FilterQuery,
  PaginateModel,
  PaginateOptions,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery
} from 'mongoose';
import { AnyRecord, ModelDocument, QueryHandle, QuerySelectType } from '../types/general';
import { getSortQuery } from './schemas';
import { UpdateOptions } from 'mongodb';
import { isEmpty } from './general';
import { PaginateResult } from '../types/pagination';

export class ModelCrudTemplate<
  T extends AnyRecord,
  NArgs extends Partial<T>,
  Q extends FilterQuery<T>
> {
  hiddenFields: Array<string> = [];

  constructor(
    private readonly Model: PaginateModel<T> & AggregatePaginateModel<T>,
    private readonly getFilterQuery: (q: Q) => FilterQuery<T> = (q) => q
  ) {
    this.init();
  }

  private init() {
    /**
     * This is a list of fields that are not returned by default when querying the database.
     * This is useful for fields that are not needed in the response, such as passwords or sensitive information.
     */
    this.hiddenFields = Object.entries(this.Model.schema.paths)
      .filter(([, path]) => path.options && path.options.select === false)
      .map(([key]) => key);
  }

  addOne: QueryHandle<NArgs, ModelDocument<T>> = async (args) => {
    const out = new this.Model(args);
    await out.save();
    return out;
  };

  addOneTestingEnv: QueryHandle<Partial<T>, ModelDocument<T>> = async (args) => {
    const out = new this.Model(args);
    await out.save();
    return out;
  };

  distinct: QueryHandle<
    {
      field: keyof T;
    },
    Array<any>
  > = async ({ field }) => {
    const out = await this.Model.distinct(field as string);
    return out;
  };

  exists: QueryHandle<
    {
      query: FilterQuery<T>;
    },
    boolean
  > = async ({ query }) => {
    const out = await this.Model.exists(query);

    return !!out;
  };

  getOne: QueryHandle<
    {
      query: Q;
      projection?: ProjectionType<T>;
      select?: QuerySelectType<T>;
      options?: QueryOptions<T>;
      sort?: string;
    },
    ModelDocument<T> | null
  > = async ({ query, projection, select, options = {}, sort }) => {
    const filterQuery = this.getFilterQuery(query);

    const promise = this.Model.findOne(filterQuery, projection, {
      ...options,
      sort: getSortQuery(sort)
    });

    if (select) {
      promise.select(
        Object.keys(select)
          .map((key) => `+${key}`)
          .join(' ')
      );
    }

    const out = await promise;

    return out;
  };

  deleteOne: QueryHandle<{
    query: Q;
  }> = async ({ query }) => {
    const filterQuery = this.getFilterQuery(query);

    await this.Model.deleteOne(filterQuery);
  };

  deleteMany: QueryHandle<{
    query: Q;
  }> = async ({ query }) => {
    const filterQuery = this.getFilterQuery(query);

    await this.Model.deleteMany(filterQuery);
  };

  findAndDelete: QueryHandle<
    {
      query: Q;
      queryOptions?: QueryOptions<T>;
    },
    ModelDocument<T> | null
  > = async ({ query, queryOptions = {} }) => {
    const filterQuery = this.getFilterQuery(query);

    const out = await this.Model.findOneAndDelete(filterQuery, {
      returnDocument: 'after',
      ...queryOptions
    });

    return out;
  };

  getAllWithPagination: QueryHandle<
    {
      paginateOptions?: PaginateOptions;
      query: Q;
      sort?: string;
      projection?: ProjectionType<T>;
      select?: QuerySelectType<T>;
    },
    PaginateResult<T>
  > = async ({ query, sort, paginateOptions = {}, projection, select }) => {
    const filterQuery = this.getFilterQuery(query);

    const out = await this.Model.paginate(filterQuery, {
      projection,
      ...paginateOptions,
      sort: getSortQuery(sort),
      select: select && Object.keys(select).map((key) => `+${key}`)
    });

    return out as unknown as PaginateResult<T>;
  };

  getAll: QueryHandle<
    {
      query: Q;
      projection?: ProjectionType<T>;
      select?: QuerySelectType<T>;
    },
    Array<ModelDocument<T>>
  > = async ({ query, projection, select }) => {
    const filterQuery = this.getFilterQuery(query);

    const promise = this.Model.find(filterQuery, projection);

    if (select) {
      promise.select(
        Object.keys(select)
          .map((key) => `+${key}`)
          .join(' ')
      );
    }

    const out = await promise;

    return out;
  };

  updateOne: QueryHandle<
    {
      query: Q;
      update: UpdateQuery<T>;
      options?: UpdateOptions;
    },
    void
  > = async ({ query, update, options }) => {
    const filterQuery = this.getFilterQuery(query);

    await this.Model.updateOne(filterQuery, update, options);
  };

  updateMany: QueryHandle<
    {
      query: Q;
      update: UpdateQuery<T>;
      options?: UpdateOptions;
    },
    void
  > = async ({ query, update, options }) => {
    const filterQuery = this.getFilterQuery(query);

    await this.Model.updateMany(filterQuery, update, options);
  };

  findOneAndUpdate: QueryHandle<
    {
      query: Q;
      update: UpdateQuery<T>;
      queryOptions?: QueryOptions<T>;
    },
    ModelDocument<T> | null
  > = async ({ query, update, queryOptions = {} }) => {
    const filterQuery = this.getFilterQuery(query);

    return await this.Model.findOneAndUpdate(filterQuery, update, {
      returnDocument: 'after',
      ...queryOptions
    });
  };

  getLatest: QueryHandle<
    {
      query: Q;
    },
    ModelDocument<T> | null
  > = async ({ query }) => {
    const filterQuery = this.getFilterQuery(query);

    return await this.Model.findOne(filterQuery).sort({ createdAt: 1 }).limit(1);
  };

  /**
   * ////////////////////////////////////////////////////////////////////////////////////////////////
   * ////////////////////////////////////////////////////////////////////////////////////////////////
   * AGGREGATIONS
   * ////////////////////////////////////////////////////////////////////////////////////////////////
   * ////////////////////////////////////////////////////////////////////////////////////////////////
   */

  private getPipelineToHidePrivateFields = (args: {
    select?: QuerySelectType<T>;
  }): PipelineStage => {
    const { select = {} } = args;

    /**
     * objectFields has the field that with need to hide in the aggregation
     * and the value is 0, so it will be hidden in the aggregation
     */
    const objectFields = this.hiddenFields.reduce((acc, field) => {
      const exists = field in select;
      return exists ? acc : { ...acc, [field]: 0 };
    }, {});

    /**
     * If the objectFields is empty, we don't need to add the $project stage
     * because we don't need to hide any fields
     * So we can just return the $match stage
     * and the aggregation will return all the fields
     */
    if (isEmpty(objectFields)) {
      return { $match: {} };
    }

    return { $project: objectFields };
  };

  aggregate = async <R>(args: {
    pipeline: PipelineStage[];
    options?: AggregateOptions;
    select?: QuerySelectType<T>;
  }): Promise<Array<R>> => {
    const { options, pipeline, select } = args;
    const out = await this.Model.aggregate<R>(
      [...pipeline, this.getPipelineToHidePrivateFields({ select })],
      options
    );

    return out;
  };

  aggregateOnMatch = async <R>(args: {
    matchQuery: Q;
    pipeline: PipelineStage[];
    options?: AggregateOptions;
    select?: QuerySelectType<T>;
  }): Promise<Array<R>> => {
    const { options, pipeline, matchQuery, select } = args;

    const filterQuery = this.getFilterQuery(matchQuery);

    return await this.aggregate<R>({
      pipeline: [
        { $match: filterQuery },
        ...pipeline,
        this.getPipelineToHidePrivateFields({ select })
      ],
      options
    });
  };

  aggregateWithPagination = async <R>(args: {
    paginateOptions?: PaginateOptions;
    pipeline: PipelineStage[];
    options?: AggregateOptions;
    select?: QuerySelectType<T>;
  }): Promise<PaginateResult<R>> => {
    const { options, pipeline, paginateOptions = {}, select } = args;

    const aggregation = this.Model.aggregate<R>(
      [...pipeline, this.getPipelineToHidePrivateFields({ select })],
      options
    );

    const out = await this.Model.aggregatePaginate(aggregation, {
      ...paginateOptions
    });

    return out as unknown as PaginateResult<R>;
  };
}
