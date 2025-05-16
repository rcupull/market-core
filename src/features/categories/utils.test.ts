import { getAllFilterQuery, GetAllCategoriesArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllCategoriesArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "label": {
          "$options": "i",
          "$regex": /search/,
        },
      }
    `);
  });
});
