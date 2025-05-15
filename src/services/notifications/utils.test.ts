import { getAllFilterQuery, GetAllNotificationsArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllNotificationsArgs = {
      userIds: ['userId1', 'userId2']
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "userIds": {
          "$in": [
            "userId1",
            "userId2",
          ],
        },
      }
    `);
  });
});
