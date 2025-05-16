import {
  AggregatePaginateModel,
  FilterQuery,
  model,
  PaginateModel,
  Schema,
  SchemaDefinition,
  SchemaDefinitionProperty
} from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { Address, AnyRecord, BankAccount } from '../types/general';

export const createdAtSchemaDefinition: SchemaDefinition = {
  createdAt: { type: Date, required: true, default: Date.now }
};

export const getInArrayQuery = <T extends AnyRecord = AnyRecord>(
  anyArray: Array<string | number | Schema.Types.ObjectId>
): FilterQuery<T> => {
  return { $in: anyArray };
};

export const getMongoModel = <T extends AnyRecord>(
  ref: string,
  schema: Schema,
  collectionName: string
) => {
  schema.plugin(mongoosePaginate);
  schema.plugin(aggregatePaginate);

  return model<T, PaginateModel<T> & AggregatePaginateModel<T>>(ref, schema, collectionName);
};

export const lastUpQuerySort = '-createdAt';

export const getSortQuery = (sort: string | undefined): Record<string, number> | undefined => {
  /**
   * get the query from a field similar to '-createdAt' or 'createdAt'
   */
  if (!sort) return undefined;

  const field = sort[0] === '-' ? sort.slice(1) : sort;
  const direction = sort[0] === '-' ? -1 : 1;

  if (!field || !direction) {
    return undefined;
  }

  return { [field]: direction };
};

export const AddressDefinition: SchemaDefinitionProperty<Address> = {
  name: { type: String },
  city: { type: String },
  municipality: { type: String },
  street: { type: String },
  streetBetweenFrom: { type: String },
  streetBetweenTo: { type: String },
  neighborhood: { type: String },
  number: { type: Number },
  apartment: { type: Number },
  country: { type: String },
  countryCode: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  postCode: { type: String },
  placeId: { type: String }
};

export const BankAccountDefinition: SchemaDefinitionProperty<BankAccount> = {
  alias: { type: String },
  accountNumber: { type: String },
  confirmationPhoneNumber: { type: String }
};
