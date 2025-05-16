"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCrudTemplate = void 0;
const general_1 = require("./general");
const schemas_1 = require("./schemas");
class ModelCrudTemplate {
    constructor(modelGetter, getFilterQuery = (q) => q) {
        this.modelGetter = modelGetter;
        this.getFilterQuery = getFilterQuery;
        this.addOne = async (args) => {
            const Model = this.modelGetter();
            const out = new Model(args);
            await out.save();
            return out;
        };
        this.addOneTestingEnv = async (args) => {
            const Model = this.modelGetter();
            const out = new Model(args);
            await out.save();
            return out;
        };
        this.distinct = async ({ field }) => {
            const Model = this.modelGetter();
            const out = await Model.distinct(field);
            return out;
        };
        this.exists = async ({ query }) => {
            const Model = this.modelGetter();
            const out = await Model.exists(query);
            return !!out;
        };
        this.getOne = async ({ query, projection, select, options = {}, sort }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            const promise = Model.findOne(filterQuery, projection, {
                ...options,
                sort: (0, schemas_1.getSortQuery)(sort)
            });
            if (select) {
                promise.select(Object.keys(select)
                    .map((key) => `+${key}`)
                    .join(' '));
            }
            const out = await promise;
            return out;
        };
        this.deleteOne = async ({ query }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            await Model.deleteOne(filterQuery);
        };
        this.deleteMany = async ({ query }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            await Model.deleteMany(filterQuery);
        };
        this.findAndDelete = async ({ query, queryOptions = {} }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            const out = await Model.findOneAndDelete(filterQuery, {
                returnDocument: 'after',
                ...queryOptions
            });
            return out;
        };
        this.getAllWithPagination = async ({ query, sort, paginateOptions = {}, projection, select }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            const out = await Model.paginate(filterQuery, {
                projection,
                ...paginateOptions,
                sort: (0, schemas_1.getSortQuery)(sort),
                select: select && Object.keys(select).map((key) => `+${key}`)
            });
            return out;
        };
        this.getAll = async ({ query, projection, select }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            const promise = Model.find(filterQuery, projection);
            if (select) {
                promise.select(Object.keys(select)
                    .map((key) => `+${key}`)
                    .join(' '));
            }
            const out = await promise;
            return out;
        };
        this.updateOne = async ({ query, update, options }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            await Model.updateOne(filterQuery, update, options);
        };
        this.updateMany = async ({ query, update, options }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            await Model.updateMany(filterQuery, update, options);
        };
        this.findOneAndUpdate = async ({ query, update, queryOptions = {} }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            return await Model.findOneAndUpdate(filterQuery, update, {
                returnDocument: 'after',
                ...queryOptions
            });
        };
        this.getLatest = async ({ query }) => {
            const filterQuery = this.getFilterQuery(query);
            const Model = this.modelGetter();
            return await Model.findOne(filterQuery).sort({ createdAt: 1 }).limit(1);
        };
        /**
         * ////////////////////////////////////////////////////////////////////////////////////////////////
         * ////////////////////////////////////////////////////////////////////////////////////////////////
         * AGGREGATIONS
         * ////////////////////////////////////////////////////////////////////////////////////////////////
         * ////////////////////////////////////////////////////////////////////////////////////////////////
         */
        this.getPipelineToHidePrivateFields = (args) => {
            const { select = {} } = args;
            /**
             * objectFields has the field that with need to hide in the aggregation
             * and the value is 0, so it will be hidden in the aggregation
             */
            const objectFields = this.getHiddenFields().reduce((acc, field) => {
                const exists = field in select;
                return exists ? acc : { ...acc, [field]: 0 };
            }, {});
            /**
             * If the objectFields is empty, we don't need to add the $project stage
             * because we don't need to hide any fields
             * So we can just return the $match stage
             * and the aggregation will return all the fields
             */
            if ((0, general_1.isEmpty)(objectFields)) {
                return { $match: {} };
            }
            return { $project: objectFields };
        };
        this.aggregate = async (args) => {
            const { options, pipeline, select } = args;
            const Model = this.modelGetter();
            const out = await Model.aggregate([...pipeline, this.getPipelineToHidePrivateFields({ select })], options);
            return out;
        };
        this.aggregateOnMatch = async (args) => {
            const { options, pipeline, matchQuery, select } = args;
            const filterQuery = this.getFilterQuery(matchQuery);
            return await this.aggregate({
                pipeline: [
                    { $match: filterQuery },
                    ...pipeline,
                    this.getPipelineToHidePrivateFields({ select })
                ],
                options
            });
        };
        this.aggregateWithPagination = async (args) => {
            const { options, pipeline, paginateOptions = {}, select } = args;
            const Model = this.modelGetter();
            const aggregation = Model.aggregate([...pipeline, this.getPipelineToHidePrivateFields({ select })], options);
            const out = await Model.aggregatePaginate(aggregation, {
                ...paginateOptions
            });
            return out;
        };
    }
    getHiddenFields() {
        const Model = this.modelGetter();
        /**
         * This is a list of fields that are not returned by default when querying the database.
         * This is useful for fields that are not needed in the response, such as passwords or sensitive information.
         */
        return Object.entries(Model.schema.paths)
            .filter(([, path]) => path.options && path.options.select === false)
            .map(([key]) => key);
    }
}
exports.ModelCrudTemplate = ModelCrudTemplate;
