import { RequestHandler as ExpressRequestHandler } from 'express';
import { ApplySchemaOptions, DefaultSchemaOptions, ObtainDocumentType, ResolveSchemaOptions, Schema } from 'mongoose';
import { Document } from 'mongoose';
export declare enum Currency {
    MLC = "MLC",
    CUP = "CUP",
    USD = "USD"
}
export type AnyRecord = Record<string, any>;
export type UnknownRecord = Record<string, unknown>;
export interface BaseIdentity {
    _id: Schema.Types.ObjectId;
    createdAt: Date;
}
export interface RequestHandler<P = AnyRecord, ResBody = any, ReqBody = any, ReqQuery = AnyRecord, Locals extends Record<string, any> = Record<string, any>> extends ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
}
export type QueryHandle<Args extends AnyRecord | void = void, R = void> = (args: Args) => Promise<R>;
export interface Image {
    src: string;
    width: number;
    height: number;
    href?: string;
}
export type SchemaDefinition<Type = any> = ApplySchemaOptions<ObtainDocumentType<any, Type, ResolveSchemaOptions<DefaultSchemaOptions>>, ResolveSchemaOptions<DefaultSchemaOptions>>;
type EmptyObject<T> = {
    [K in keyof T]?: never;
};
export type EmptyObjectOf<T> = EmptyObject<T> extends T ? EmptyObject<T> : never;
export type Nullable<T> = T | false | null | undefined;
export type ModelDocument<T extends AnyRecord = AnyRecord> = Document<unknown, AnyRecord, T> & T;
export interface Geolocation {
    lat: number;
    lon: number;
}
export interface Address extends Geolocation {
    name?: string;
    _id: string;
    city: string;
    country: string;
    countryCode: string;
    municipality?: string;
    street: string;
    streetBetweenFrom?: string;
    streetBetweenTo?: string;
    neighborhood: string;
    number?: number;
    apartment?: number;
    postCode: string;
    placeId: string;
}
export interface BankAccount {
    alias?: string;
    accountNumber: string;
    confirmationPhoneNumber: string;
}
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
type JSONObject = AnyRecord | Array<any>;
type JSONObjectKey = string | number;
type JoinPathsInline<K, P> = K extends JSONObjectKey ? P extends string ? `${K}.${P}` : never : never;
export type Path<T extends any, D extends number = 5> = D extends never ? never : T extends JSONObject ? {
    [K in keyof T]-?: K extends JSONObjectKey ? `${K}` | JoinPathsInline<K, Path<T[K], Prev[D]>> : never;
}[keyof T] : never;
export type QuerySelectType<T extends AnyRecord = AnyRecord> = Partial<Record<keyof T, true>>;
export type CreatedDateRangeQueryType = {
    createdAt: {
        $gte?: Date;
        $lt?: Date;
    };
};
export {};
