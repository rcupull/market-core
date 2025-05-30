import { FilterQuery } from 'mongoose';
import { GetAllPaymentProofArgs, PaymentProof } from './types';
import { getSearchRegexQuery } from '../../utils/schemas';
import { getCharCode, getNumberCode } from '../../utils/general';

export const getAllFilterQuery = (args: GetAllPaymentProofArgs): FilterQuery<PaymentProof> => {
  const { search, ...omittedQuery } = args;

  const filterQuery: FilterQuery<PaymentProof> = omittedQuery;

  if (search) {
    filterQuery['purchaseInfo.code'] = getSearchRegexQuery(search);
  }

  return filterQuery;
};

export const getPaymentProofCode = (): string => {
  const chars = getCharCode(2);
  const numbers = getNumberCode(4);
  return `CP-${chars}-${numbers}`;
};
