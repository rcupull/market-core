import { getAllFilterQuery, GetAllPromoArgs } from './utils';

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
