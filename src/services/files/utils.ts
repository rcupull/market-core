export interface GetPathToSaveArgs {
  routeName?: string;
  postId?: string;
  userId?: string;
  customKey?: string;
}

export const getPathToSave = (args: GetPathToSaveArgs): string => {
  const { routeName, postId, userId, customKey } = args;

  if (routeName) {
    let out = `business/${routeName}`;

    if (postId) {
      out = `${out}/posts/${postId}`;
    }

    if (customKey) {
      out = `${out}/${customKey}`;
    }

    return out;
  }

  if (userId) {
    let out = `users/${userId}`;

    if (customKey) {
      out = `${out}/${customKey}`;
    }

    return out;
  }

  if (customKey) {
    return customKey;
  }

  return 'unknow';
};
