"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = exports.isObject = exports.fixToTwoDigits = exports.mergeArrays = exports.baseConversion = exports.getNumberCode = exports.getCharCode = exports.getRandomNumber = exports.excludeRepetedValues = exports.numberExtract = exports.stringExtract = exports.getFlattenUndefinedJson = exports.getFlattenJson = exports.deepJsonCopy = exports.getRandomHash = exports.addStringToUniqueArray = exports.movRow = exports.addRow = exports.compact = exports.isNullOrUndefinedOrEmptyString = exports.isArray = exports.isBoolean = exports.isString = exports.isNumber = exports.isNullOrUndefined = exports.set = exports.get = exports.isEmpty = exports.combineMiddleware = exports.isEqualObj = exports.isEqual = exports.includesId = exports.line = exports.range = exports.isFunction = exports.isEqualIds = exports.idToString = exports.replaceAll = void 0;
const dlv_1 = __importDefault(require("dlv"));
const dset_1 = require("dset");
const replaceAll = (value, match, replace) => value.split(match).join(replace);
exports.replaceAll = replaceAll;
const idToString = (id) => {
    return (0, exports.isString)(id) ? id : id.toString();
};
exports.idToString = idToString;
const isEqualIds = (id1, id2) => {
    return (0, exports.idToString)(id1) === (0, exports.idToString)(id2);
};
exports.isEqualIds = isEqualIds;
//eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (value) => {
    return typeof value === 'function';
};
exports.isFunction = isFunction;
const range = (count) => [...Array(count).keys()];
exports.range = range;
const line = (count, fill) => (0, exports.range)(count).map(() => fill);
exports.line = line;
const includesId = (array, id) => {
    return array.map(exports.idToString).includes((0, exports.idToString)(id));
};
exports.includesId = includesId;
const isEqual = (a, b) => {
    if (typeof a === 'object' && typeof b === 'object') {
        return (0, exports.isEqualObj)(a, b);
    }
    return a === b;
};
exports.isEqual = isEqual;
const isEqualObj = (aArg, bArg) => {
    if (!aArg || !bArg)
        return false;
    if ((0, exports.isArray)(aArg) && (0, exports.isArray)(bArg) && aArg.length !== bArg.length) {
        return false;
    }
    const a = (0, exports.deepJsonCopy)(aArg);
    const b = (0, exports.deepJsonCopy)(bArg);
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
                    if (!(0, exports.isEqualObj)(a[prop], b[prop]))
                        return false;
                }
                else {
                    //@ts-expect-error ignore
                    if (a[prop] !== b[prop])
                        return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
};
exports.isEqualObj = isEqualObj;
const combineMiddleware = (...mids) => {
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
exports.combineMiddleware = combineMiddleware;
const isEmpty = (value) => {
    if (!value)
        return true;
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return !keys.length;
    }
    return false;
};
exports.isEmpty = isEmpty;
const get = (obj, path) => {
    return (0, dlv_1.default)(obj, path);
};
exports.get = get;
const set = (obj, path, value) => {
    (0, dset_1.dset)(obj, path, value);
};
exports.set = set;
const isNullOrUndefined = (value) => {
    return value === null || value === undefined;
};
exports.isNullOrUndefined = isNullOrUndefined;
const isNumber = (value) => {
    return typeof value === 'number';
};
exports.isNumber = isNumber;
const isString = (value) => {
    return typeof value === 'string';
};
exports.isString = isString;
const isBoolean = (value) => {
    return typeof value === 'boolean';
};
exports.isBoolean = isBoolean;
const isArray = (value) => {
    return Array.isArray(value);
};
exports.isArray = isArray;
const isNullOrUndefinedOrEmptyString = (value) => {
    return (0, exports.isNullOrUndefined)(value) || value === '';
};
exports.isNullOrUndefinedOrEmptyString = isNullOrUndefinedOrEmptyString;
const compact = (value) => {
    return value.filter((val) => val);
};
exports.compact = compact;
const addRow = (data, rowData, position = 'end') => {
    const newData = [...data];
    return position === 'start' ? [rowData, ...newData] : [...newData, rowData];
};
exports.addRow = addRow;
const movRow = (data, fromIndex, toIndex) => {
    const new_index = ((toIndex % data.length) + data.length) % data.length;
    data.splice(new_index, 0, data.splice(fromIndex, 1)[0]);
    return data;
};
exports.movRow = movRow;
const addStringToUniqueArray = (array, value) => {
    return array.includes(value) ? array : (0, exports.addRow)(array, value);
};
exports.addStringToUniqueArray = addStringToUniqueArray;
const getRandomHash = () => `${Math.floor(Math.random() * 1000000000000000)}`;
exports.getRandomHash = getRandomHash;
const deepJsonCopy = (json) => {
    return JSON.parse(JSON.stringify(json));
};
exports.deepJsonCopy = deepJsonCopy;
const getFlattenJson = (value) => {
    /**
     * remove the undefined, null or empty string fields from JSON
     */
    return Object.entries(value).reduce((acc, [k, v]) => ((0, exports.isNullOrUndefinedOrEmptyString)(v) ? acc : { ...acc, [k]: v }), {});
};
exports.getFlattenJson = getFlattenJson;
const getFlattenUndefinedJson = (value) => {
    /**
     * remove the undefined fields from JSON
     */
    return Object.entries(value).reduce((acc, [k, v]) => (v === undefined ? acc : { ...acc, [k]: v }), {});
};
exports.getFlattenUndefinedJson = getFlattenUndefinedJson;
const stringExtract = (matcher, value) => {
    /**
     *  matcher should has this structure +> 'products.name.{val}.max.{val}'. Use {val} where you want extract the values
     */
    const dotsInMather = matcher.split('.').length - 1;
    const dotsInValue = value.split('.').length - 1;
    if (dotsInMather !== dotsInValue) {
        return null;
    }
    const exp = new RegExp((0, exports.replaceAll)(matcher, '{val}', '(.*)'));
    const response = exp.exec(value);
    if (!response) {
        return null;
    }
    return response.slice(1);
};
exports.stringExtract = stringExtract;
const numberExtract = (value) => {
    const response = value.match(/(\d+)/g);
    if (!response) {
        return null;
    }
    return response.map(Number);
};
exports.numberExtract = numberExtract;
const excludeRepetedValues = (values) => {
    const out = [];
    values.forEach((value) => {
        if (out.some((v) => (0, exports.isEqual)(v, value)))
            return;
        out.push(value);
    });
    return out;
};
exports.excludeRepetedValues = excludeRepetedValues;
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.getRandomNumber = getRandomNumber;
const getCharCode = (length) => {
    const num = (0, exports.getRandomNumber)(1, 26 ** length);
    return (0, exports.baseConversion)(num, length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
};
exports.getCharCode = getCharCode;
const getNumberCode = (length) => {
    const num = (0, exports.getRandomNumber)(0, 10000);
    return (0, exports.baseConversion)(num, length, '0123456789');
};
exports.getNumberCode = getNumberCode;
const baseConversion = (n, digits, alphabet) => {
    const base = alphabet.length;
    let result = '';
    for (let i = 0; i < digits; i++) {
        result += alphabet.charAt(n % base);
        n = Math.floor(n / base);
    }
    return result;
};
exports.baseConversion = baseConversion;
const mergeArrays = (...allArray) => {
    return allArray.reduce((acc, arr) => [...acc, ...arr], []);
};
exports.mergeArrays = mergeArrays;
const fixToTwoDigits = (number) => Number(number.toFixed(2));
exports.fixToTwoDigits = fixToTwoDigits;
const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};
exports.isObject = isObject;
const mergeDeep = (target, source, mergeCallback) => {
    const output = Object.assign({}, target);
    if ((0, exports.isObject)(target) && (0, exports.isObject)(source)) {
        Object.keys(source).forEach((key) => {
            if ((0, exports.isObject)(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                //@ts-expect-error ignored
                else
                    output[key] = (0, exports.mergeDeep)(target[key], source[key], mergeCallback);
            }
            else {
                if (mergeCallback) {
                    Object.assign(output, { [key]: mergeCallback(target[key], source[key]) });
                }
                else {
                    Object.assign(output, { [key]: source[key] });
                }
            }
        });
    }
    return output;
};
exports.mergeDeep = mergeDeep;
