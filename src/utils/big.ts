import Big from 'big.js';

/**
 * http://mikemcl.github.io/big.js/
 */
export const bigEq = (val1: number, val2: number) => {
  const v1 = Big(val1).round(2);
  const v2 = Big(val2).round(2);

  return v1.eq(v2);
};

export const bigGt = (val1: number, val2: number) => {
  const v1 = Big(val1).round(2);
  const v2 = Big(val2).round(2);

  return v1.gt(v2);
};

export const bigRoundUpToTwoDecimals = (val: number): number => {
  const out = Big(val).round(2, Big.roundUp).toString();
  return Number(out);
};
