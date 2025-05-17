import { AggregatePaginateModel, FilterQuery, PaginateModel, Schema, SchemaDefinition, SchemaDefinitionProperty } from 'mongoose';
import { Address, AnyRecord, BankAccount } from '../types/general';
import { Commissions } from '../types/commision';
import { DeliveryConfig, PostCardLayout } from '../features/business/types';
export declare const createdAtSchemaDefinition: SchemaDefinition;
export declare const getInArrayQuery: <T extends AnyRecord = AnyRecord>(anyArray: Array<string | number | Schema.Types.ObjectId>) => FilterQuery<T>;
export declare const getSearchRegexQuery: <T extends AnyRecord = AnyRecord>(search?: string) => FilterQuery<T>;
export declare const getMongoModel: <T extends AnyRecord>(ref: string, schema: Schema, collectionName: string) => PaginateModel<T, {}, {}> & AggregatePaginateModel<T>;
export declare const lastUpQuerySort = "-createdAt";
export declare const getSortQuery: (sort: string | undefined) => Record<string, number> | undefined;
export declare const AddressDefinition: SchemaDefinitionProperty<Address>;
export declare const BankAccountDefinition: SchemaDefinitionProperty<BankAccount>;
type GetFilterQuery<T extends AnyRecord = AnyRecord, F extends FilterQuery<T> = FilterQuery<T>> = (filterQuery: F) => F;
export declare const getFilterQueryFactory: <T extends AnyRecord = AnyRecord, F extends FilterQuery<T> = FilterQuery<T>>(callback: GetFilterQuery<T, F>) => GetFilterQuery<T, F>;
export declare const commissionsSchemaDefinition: SchemaDefinition<Commissions>;
export declare const DeliveryConfigDefinition: SchemaDefinitionProperty<DeliveryConfig>;
export declare const PostCardLayoutSchema: Schema<PostCardLayout, import("mongoose").Model<PostCardLayout, any, any, any, import("mongoose").Document<unknown, any, PostCardLayout, any> & PostCardLayout & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostCardLayout, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PostCardLayout>, {}> & import("mongoose").FlatRecord<PostCardLayout> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
