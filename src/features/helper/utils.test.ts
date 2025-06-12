import { getAllFilterQuery, GetAllHelpersArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllHelpersArgs = {
      search: 'search'
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "$or": [
          {
            "question": {
              "$options": "i",
              "$regex": /search/,
            },
          },
          {
            "question": {
              "$in": [
                "question1",
                "question2",
              ],
            },
          },
        ],
      }
    `);
  });
});
