import { Schema } from 'mongoose';
import { AnyRecord, EmptyObjectOf, Nullable, Path, RequestHandler } from '../types/general';
import dlv from 'dlv';
import { dset } from 'dset';
import { User, UserRole } from '../services/user/types';
import { Access } from '../services/config/types';
export const replaceAll = (value: string, match: string, replace: string): string =>
  value.split(match).join(replace);

export const idToString = (id: string | Schema.Types.ObjectId): string => {
  return isString(id) ? id : id.toString();
};

export const isEqualIds = (
  id1: string | Schema.Types.ObjectId,
  id2: string | Schema.Types.ObjectId
): boolean => {
  return idToString(id1) === idToString(id2);
};

//eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

export const range = (count: number): Array<number> => [...Array(count).keys()];

export const line = <T = any>(count: number, fill: T): Array<T> => range(count).map(() => fill);

export const includesId = (
  array: Array<string | Schema.Types.ObjectId>,
  id: string | Schema.Types.ObjectId
): boolean => {
  return array.map(idToString).includes(idToString(id));
};

export const isEqual = (a: any, b: any): boolean => {
  if (typeof a === 'object' && typeof b === 'object') {
    return isEqualObj(a, b);
  }

  return a === b;
};

export const isEqualObj = (aArg: AnyRecord | undefined, bArg: AnyRecord | undefined): boolean => {
  if (!aArg || !bArg) return false;

  if (isArray(aArg) && isArray(bArg) && aArg.length !== bArg.length) {
    return false;
  }

  const a = deepJsonCopy(aArg);
  const b = deepJsonCopy(bArg);

  const mergedObj = {
    ...a,
    ...b
  };

  for (const prop in mergedObj) {
    //eslint-disable-next-line
    if (a.hasOwnProperty(prop)) {
      //eslint-disable-next-line
      if (b.hasOwnProperty(prop)) {
        //@ts-expect-error ignore
        if (typeof a[prop] === 'object' && a[prop] !== null) {
          //@ts-expect-error ignore
          if (!isEqualObj(a[prop], b[prop])) return false;
        } else {
          //@ts-expect-error ignore
          if (a[prop] !== b[prop]) return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};
export const combineMiddleware = (...mids: Array<RequestHandler>) => {
  return mids.reduce(function (a, b) {
    return function (req, res, next) {
      a(req, res, function (err) {
        if (err) {
          return next(err);
        }
        b(req, res, next);
      });
    };
  });
};

export const isEmpty = <T = object>(
  value: T | null | undefined
): value is EmptyObjectOf<T> | null | undefined => {
  if (!value) return true;

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return !keys.length;
  }

  return false;
};

export const get = <T extends AnyRecord = AnyRecord>(obj: T, path: Path<T>): any => {
  return dlv(obj, path);
};

export const set = <T extends AnyRecord = AnyRecord>(obj: T, path: Path<T>, value: any): void => {
  dset(obj, path, value);
};

export const isNullOrUndefined = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number';
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isArray = (value: unknown): value is Array<any> => {
  return Array.isArray(value);
};

export const isNullOrUndefinedOrEmptyString = (value: unknown): value is null | undefined | '' => {
  return isNullOrUndefined(value) || value === '';
};

export const compact = <T = any>(value: Array<Nullable<T>>): Array<T> => {
  return value.filter((val) => val) as Array<T>;
};

export const addRow = <T = any>(
  data: Array<T>,
  rowData: T,
  position: 'start' | 'end' = 'end'
): Array<T> => {
  const newData = [...data];

  return position === 'start' ? [rowData, ...newData] : [...newData, rowData];
};

export const movRow = <T = any>(data: Array<T>, fromIndex: number, toIndex: number): Array<T> => {
  const new_index = ((toIndex % data.length) + data.length) % data.length;
  data.splice(new_index, 0, data.splice(fromIndex, 1)[0]);
  return data;
};

export const addStringToUniqueArray = <T extends string = string>(
  array: Array<T>,
  value: T
): Array<T> => {
  return array.includes(value) ? array : addRow(array, value);
};

export const getRandomHash = () => `${Math.floor(Math.random() * 1000000000000000)}`;

export const deepJsonCopy = <T extends AnyRecord = AnyRecord>(json: T): T => {
  return JSON.parse(JSON.stringify(json));
};

export const getFlattenJson = <T extends AnyRecord = AnyRecord>(value: T): T => {
  /**
   * remove the undefined, null or empty string fields from JSON
   */
  return Object.entries(value).reduce(
    (acc, [k, v]) => (isNullOrUndefinedOrEmptyString(v) ? acc : { ...acc, [k]: v }),
    {} as T
  );
};

export const getFlattenUndefinedJson = <T extends AnyRecord = AnyRecord>(value: T): T => {
  /**
   * remove the undefined fields from JSON
   */
  return Object.entries(value).reduce(
    (acc, [k, v]) => (v === undefined ? acc : { ...acc, [k]: v }),
    {} as T
  );
};

export const stringExtract = (matcher: string, value: string): Array<string> | null => {
  /**
   *  matcher should has this structure +> 'products.name.{val}.max.{val}'. Use {val} where you want extract the values
   */
  const dotsInMather = matcher.split('.').length - 1;
  const dotsInValue = value.split('.').length - 1;

  if (dotsInMather !== dotsInValue) {
    return null;
  }

  const exp = new RegExp(replaceAll(matcher, '{val}', '(.*)'));

  const response = exp.exec(value);

  if (!response) {
    return null;
  }

  return response.slice(1);
};

export const numberExtract = (value: string): Array<number> | null => {
  const response = value.match(/(\d+)/g);

  if (!response) {
    return null;
  }

  return response.map(Number);
};

export const excludeRepetedValues = <T = any>(values: Array<T>): Array<T> => {
  const out: Array<any> = [];

  values.forEach((value) => {
    if (out.some((v) => isEqual(v, value))) return;
    out.push(value);
  });

  return out;
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getCharCode = (length: number): string => {
  const num = getRandomNumber(1, 26 ** length);
  return baseConversion(num, length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
};

export const getNumberCode = (length: number): string => {
  const num = getRandomNumber(0, 10000);
  return baseConversion(num, length, '0123456789');
};

export const baseConversion = (n: number, digits: number, alphabet: string): string => {
  const base = alphabet.length;
  let result = '';
  for (let i = 0; i < digits; i++) {
    result += alphabet.charAt(n % base);
    n = Math.floor(n / base);
  }
  return result;
};

export const mergeArrays = <T = any>(...allArray: Array<Array<T>>): Array<T> => {
  return allArray.reduce((acc, arr) => [...acc, ...arr], [] as Array<T>);
};

export const userHasSomeAccess = (user: User | undefined, ...access: Array<Access>): boolean => {
  return access.map((val) => user?.specialAccess?.includes(val)).some(Boolean);
};

export const userIsAdmin = (user: User | undefined): boolean => {
  return user?.role === UserRole.ADMIN;
};

export const fixToTwoDigits = (number: number): number => Number(number.toFixed(2));

export const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const mergeDeep = <T extends AnyRecord = AnyRecord>(
  target: T,
  source: Partial<T>,
  mergeCallback?: (targetValue: any, sourceValue: any) => any
): T => {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        //@ts-expect-error ignored
        else output[key] = mergeDeep(target[key], source[key], mergeCallback);
      } else {
        if (mergeCallback) {
          Object.assign(output, { [key]: mergeCallback(target[key], source[key]) });
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      }
    });
  }
  return output;
};
