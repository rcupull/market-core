import {
  AggregatePaginateModel,
  FilterQuery,
  PaginateModel,
  Schema,
  SchemaDefinition,
  SchemaDefinitionProperty
} from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import {
  Address,
  AnyRecord,
  BankAccount,
  BaseIdentity,
  CreatedDateRangeQueryType,
  Currency
} from '../types/general';
import { getMongoose } from '../db';
import { getFlattenUndefinedJson, isEmpty } from './general';
import { Commission, CommissionMode, Commissions } from '../types/commision';
import {
  DeliveryConfig,
  DeliveryConfigType,
  PostCardLayout,
  PostLayoutShoppingMethod
} from '../features/business/types';
import { ShoppingPostData } from '../features/shopping/types';
import { subMonths } from 'date-fns';

export const createdAtSchemaDefinition: SchemaDefinition = {
  createdAt: { type: Date, required: true, default: Date.now }
};

export const getInArrayQuery = <T extends AnyRecord = AnyRecord>(
  anyArray: Array<string | number | Schema.Types.ObjectId>
): FilterQuery<T> => {
  return { $in: anyArray };
};

export const getSearchRegexQuery = <T extends AnyRecord = AnyRecord>(
  search = ''
): FilterQuery<T> => {
  return { $regex: new RegExp(search.trim()), $options: 'i' };
};

export const getMongoModel = <T extends AnyRecord>(
  ref: string,
  schema: Schema,
  collectionName: string
) => {
  const { model } = getMongoose();

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

type GetFilterQuery<T extends AnyRecord = AnyRecord, F extends FilterQuery<T> = FilterQuery<T>> = (
  filterQuery: F
) => F;

export const getFilterQueryFactory = <
  T extends AnyRecord = AnyRecord,
  F extends FilterQuery<T> = FilterQuery<T>
>(
  callback: GetFilterQuery<T, F>
): GetFilterQuery<T, F> => {
  const out: GetFilterQuery<T, F> = (allFilterQuery) => {
    let filterQuery: F = allFilterQuery;

    /**
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     * Add empty $or
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     */
    if (!filterQuery.$or) {
      filterQuery.$or = [];
    }

    if (!filterQuery.$and) {
      filterQuery.$and = [];
    }

    /**
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     * Run callback
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     */
    filterQuery = callback(filterQuery);

    /**
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     * Remove empty $or
     * ///////////////////////////////////////////////////////////////////
     * ///////////////////////////////////////////////////////////////////
     */
    if (isEmpty(filterQuery.$or)) {
      delete filterQuery.$or;
    }

    if (isEmpty(filterQuery.$and)) {
      delete filterQuery.$and;
    }

    return getFlattenUndefinedJson(filterQuery);
  };

  return out;
};

const commissionSchemaDefinition: SchemaDefinition<Commission> = {
  mode: {
    _id: false,
    type: String,
    enum: Object.values(CommissionMode)
  },
  value: {
    _id: false,
    type: Number
  }
};

export const commissionsSchemaDefinition: SchemaDefinition<Commissions> = {
  marketOperation: {
    _id: false,
    type: commissionSchemaDefinition
  },
  systemUse: {
    _id: false,
    type: commissionSchemaDefinition
  }
};

export const DeliveryConfigDefinition: SchemaDefinitionProperty<DeliveryConfig> = {
  type: {
    type: String,
    enum: Object.values(DeliveryConfigType),
    default: DeliveryConfigType.NONE
  },
  minPrice: { type: Number, default: 0 },
  priceByKm: { type: Number, default: 0 }
};

const PostLayoutShoppingMethodDefinition: SchemaDefinitionProperty<PostLayoutShoppingMethod> = {
  type: String,
  enum: ['none', 'shoppingCart']
};

export const PostCardLayoutSchema = new Schema<PostCardLayout>({
  images: {
    type: String,
    enum: ['static', 'hoverZoom', 'slider', 'switch', 'rounded'],
    default: 'static'
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'long'],
    default: 'medium'
  },
  metaLayout: {
    type: String,
    enum: ['basic', 'verticalCentered'],
    default: 'basic'
  },
  name: {
    type: String,
    enum: ['none', 'basic'],
    required: true,
    default: 'basic'
  },
  price: {
    type: String,
    enum: ['none', 'basic', 'smallerCurrency', 'usdCurrencySymbol'],
    default: 'basic'
  },
  discount: {
    type: String,
    enum: ['none', 'savedPercent', 'savedMoney'],
    default: 'none'
  },
  shoppingMethod: PostLayoutShoppingMethodDefinition
});

export const getBooleanQuery = <T extends AnyRecord = AnyRecord>(
  value: boolean
): FilterQuery<T> => {
  /**
   * when value ===false include false, null or undefined,all except true => { $ne: true }
   */
  return value ? { $eq: true } : { $ne: true };
};

export const postDataSchemaDefinition: SchemaDefinition<ShoppingPostData> = {
  _id: { type: String, required: true },
  images: {
    type: [
      {
        src: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
      }
    ]
  },
  name: { type: String, required: true },
  commissions: { _id: false, type: commissionsSchemaDefinition, required: true },
  salePrice: { type: Number, required: true },
  routeName: { type: String, required: true },
  currency: { type: String, enum: Object.values(Currency) },
  currenciesOfSale: {
    _id: false,
    type: [{ type: String, enum: Object.values(Currency) }],
    default: []
  }
};

export const setFilterQueryWithDates = <T extends BaseIdentity = BaseIdentity>({
  filterQuery,
  dateFrom,
  dateTo
}: {
  dateFrom?: string;
  dateTo?: string;
  filterQuery: FilterQuery<T>;
}): void => {
  if (dateFrom) {
    //@ts-expect-error ts(2345)
    set(filterQuery, 'createdAt.$gte', new Date(dateFrom));
  }

  if (dateTo) {
    //@ts-expect-error ts(2345)
    set(filterQuery, 'createdAt.$lte', new Date(dateTo));
  }
};

export const getCreatedLastMonthQuery = (): CreatedDateRangeQueryType => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  return {
    createdAt: {
      $gte: lastMonth,
      $lt: now
    }
  };
};
