export interface GetPathToSaveArgs {
  routeName?: string;
  postId?: string;
  professionalJobId?: string;
  userId?: string;
  customKey?: string;
}

export const getPathToSave = (args: GetPathToSaveArgs): string => {
  const { routeName, postId, professionalJobId, userId, customKey } = args;

  if (routeName) {
    let out = `business/${routeName}`;

    if (postId) {
      out = `${out}/posts/${postId}`;
    }

    if (professionalJobId) {
      out = `${out}/professionalJobs/${professionalJobId}`;
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
