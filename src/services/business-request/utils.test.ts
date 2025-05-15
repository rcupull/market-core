import { getAllFilterQuery, GetAllBusinessRequestArgs } from './utils';

describe('getAllFilterQuery', () => {
  it('should return', () => {
    const args: GetAllBusinessRequestArgs = {};

    expect(getAllFilterQuery(args)).toMatchInlineSnapshot(`{}`);
  });
});
