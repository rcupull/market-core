import { getAllFilterQuery, GetAllFaqsArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllFaqsArgs = {
      questionSuggestions: ['question1', 'question2'],
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
