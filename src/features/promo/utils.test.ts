import { GetAllPromoArgs } from './types';
import { getAllFilterQuery } from './utils';

describe('getAllFilterQuery', () => {
  it('render', () => {
    const args: GetAllPromoArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "name": {
          "$options": "i",
          "$regex": /search/,
        },
      }
    `);
  });
});
