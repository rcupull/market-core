import { getAllFilterQuery, GetAllClassifiersArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllClassifiersArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "label": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "productNames": {
              "$options": "i",
              "$regex": /search/,
            },
          },
        ],
      }
    `);
  });
});
