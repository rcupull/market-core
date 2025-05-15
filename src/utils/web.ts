import { HOSTNAME } from '../config';
import { Shopping } from '../services/shopping/types';

export const getValidationCodeRoute = (code: string): string => {
  return `${HOSTNAME}/validar-cuenta/${code}`;
};

export const getForgotPasswordCodeRoute = (code: string): string => {
  return `${HOSTNAME}/recuperar-contrasena/${code}`;
};

export const getDeliveryRoute = (shopping: Shopping): string => {
  return `${HOSTNAME}/deliveries/${shopping._id}`;
};
