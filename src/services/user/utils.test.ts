import { getAllFilterQuery, GetAllUsersArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllUsersArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "name": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "phone": {
              "$options": "i",
              "$regex": /search/,
            },
          },
        ],
      }
    `);
  });
});
