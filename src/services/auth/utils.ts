export const extractOriginalEmail = (email: string): string => {
  const [aliasBase, domain] = email.split('@');
  const [base] = aliasBase.split('+');
  return `${base}@${domain}`;
};
