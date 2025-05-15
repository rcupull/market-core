import { getAllFilterQuery, GetAllPaymentArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllPaymentArgs = {
      paymentIds: ['paymentId1', 'paymentId2']
    };

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`
      {
        "_id": {
          "$in": [
            "paymentId1",
            "paymentId2",
          ],
        },
      }
    `);
  });
});
