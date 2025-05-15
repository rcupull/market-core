import { getAllFilterQuery, GetAllBillArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllBillArgs = {
      routeNames: ['routeName1', 'routeName2']
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
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
