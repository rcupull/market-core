export const isPasswordValidLength = (password: string): boolean => {
  const regexp = new RegExp('^(?=.{8,})');
  return regexp.test(password);
};

export const isPasswordValidNumber = (password: string): boolean => {
  //Longitud mínima, que debe tener un mínimo de 8 caracteres y menos de 99 caracteres:
  const regexp = new RegExp('^(?=.*[0-9])');
  return regexp.test(password);
};
export const isPasswordValidSpecialChar = (password: string): boolean => {
  //Un carácter especial obligatorio de este conjunto:
  const regexp = new RegExp('^(?=.*[.!@#$%^&*/])');
  return regexp.test(password);
};
export const isPasswordValidUppperCase = (password: string): boolean => {
  //Requiere letras mayúsculas obligatorias
  const regexp = new RegExp('^(?=.*[A-Z])');
  return regexp.test(password);
};
export const isPasswordValidLowerCase = (password: string): boolean => {
  //Requiere letras minúsculas obligatorias
  const regexp = new RegExp('^(?=.*[a-z])');
  return regexp.test(password);
};

export const validateStrongPassword = (password: string): boolean => {
  return (
    isPasswordValidLength(password) &&
    isPasswordValidNumber(password) &&
    isPasswordValidSpecialChar(password) &&
    isPasswordValidUppperCase(password) &&
    isPasswordValidLowerCase(password)
  );
};
