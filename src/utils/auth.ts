import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN, SECRET_REFRESH_TOKEN } from '../config';

//seconds to expire access token
export const steat = 300;

export const generateAccessJWT = ({ id }: { id: string }): string => {
  return jwt.sign(
    {
      id
    },
    SECRET_ACCESS_TOKEN,
    {
      expiresIn: steat
    }
  );
};

export const generateRefreshJWT = ({ id }: { id: string }): string => {
  return jwt.sign(
    {
      id
    },
    SECRET_REFRESH_TOKEN,
    {
      expiresIn: '30d'
    }
  );
};
