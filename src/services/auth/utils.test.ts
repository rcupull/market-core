import { extractOriginalEmail } from './utils';

describe('extractOriginalEmail', () => {
  it.each([
    ['email@gmail.com', 'email@gmail.com'],
    ['email@gmail.com', 'email+alias@gmail.com']
  ])('should return %p when value = %p', (expected, value) => {
    expect(extractOriginalEmail(value)).toEqual(expected);
  });
});
