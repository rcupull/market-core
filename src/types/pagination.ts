import { AnyRecord } from './general';

export interface Paginator {
  dataCount: number;
  offset: number;
  limit: number;
  pageCount: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number;
  nextPage?: number;
}

export interface PaginatedData<D extends AnyRecord = AnyRecord> {
  data: Array<D>;
  paginator: Paginator;
}

export interface PaginateResult<T> {
  data: T[];
  dataCount: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  page?: number | undefined;
  pageCount: number;
  offset: number;
  prevPage?: number | null | undefined;
  nextPage?: number | null | undefined;
  pagingCounter: number;
  paginator?: any;
  [customLabel: string]: T[] | number | boolean | null | undefined;
}