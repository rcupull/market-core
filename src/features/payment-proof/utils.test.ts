import { GetAllPaymentProofArgs } from './types';
import { getAllFilterQuery } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllPaymentProofArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "purchaseInfo.code": {
          "$options": "i",
          "$regex": /search/,
        },
      }
    `);
  });
});
