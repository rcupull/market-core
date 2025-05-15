import { getAllFilterQuery, GetAllReviewArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllReviewArgs = {};

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`{}`);
  });
});
