import { getAllFilterQuery, GetAllBusinessArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('hidden = true', () => {
    const args: GetAllBusinessArgs = {
      routeNames: ['routeName1', 'routeName2'],
      search: 'search',
      hidden: true
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
            "postCategories": {
              "$elemMatch": {
                "label": {
                  "$options": "i",
                  "$regex": /search/,
                },
              },
            },
          },
        ],
        "hidden": true,
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
  });

  it('hidden = false', () => {
    const args: GetAllBusinessArgs = {
      routeNames: ['routeName1', 'routeName2'],
      search: 'search',
      hidden: false
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
            "postCategories": {
              "$elemMatch": {
                "label": {
                  "$options": "i",
                  "$regex": /search/,
                },
              },
            },
          },
        ],
        "hidden": false,
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
  });
});
