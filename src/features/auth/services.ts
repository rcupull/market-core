import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery } from 'mongoose';
import { modelGetter } from './schemas';
import { AuthenticateCallback, AuthSession, AuthSessionState } from './types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import passportJWT from 'passport-jwt';
import passport from 'passport';
import { UserServices } from '../user/services';
import { ValidationCodeServices } from '../validation-code/services';
import { Logger } from '../../utils/general';
import jwt from 'jsonwebtoken';

const { Strategy: JWTStrategy, ExtractJwt } = passportJWT;

export class AuthServices extends ModelCrudTemplate<
  AuthSession,
  Pick<AuthSession, 'refreshToken' | 'userId' | 'typeDevice' | 'descriptionDevice'>,
  FilterQuery<AuthSession>
> {
  steat: number;
  constructor(
    private readonly userServices: UserServices,
    private readonly validationCodeServices: ValidationCodeServices,
    private readonly options: {
      logger: Logger;
      SECRET_ACCESS_TOKEN: string;
      SECRET_REFRESH_TOKEN: string;
      steat: number;
    }
  ) {
    super(modelGetter);

    this.steat = this.options.steat;
    this.init();
  }

  private init = () => {
    const { SECRET_ACCESS_TOKEN } = this.options;

    passport.use(
      new LocalStrategy(async (username: string, password: string, done) => {
        try {
          const user = await this.userServices.getOne({
            query: {
              phone: username
            },
            select: {
              password: true
            }
          });

          if (!user) {
            return done(null, false, {
              message: 'Usuario o contraseña incorrectos.'
            });
          }

          // const session = await AuthSessionModel.findOne({ userId: user?.id });

          // if (session) {
          //   return done(null, false, {
          //     message:
          //       translateES[
          //         'Ya tiene una sesión abierta en otro dispositivo. Por motivos de seguridad no permitimos varias sesiones con las mismas credenciales.'
          //       ]
          //   });
          // }

          const exists = await (async () => {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
              return true;
            } else {
              const validation = await this.validationCodeServices.findAndDelete({
                query: {
                  userId: user._id,
                  code: password
                }
              });

              return !!validation;
            }
          })();

          if (!exists) {
            return done(null, false, {
              message: 'Usuario o contraseña incorrectos.'
            });
          }
          const { logger } = this.options;

          logger.info(`User ${user.phone} logged in.`);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      })
    );

    passport.use(
      new JWTStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: SECRET_ACCESS_TOKEN
        },
        async (jwt_payload, done) => {
          const authSession = await this.getOne({
            query: { userId: jwt_payload.id }
          });

          if (!authSession) {
            return done(null, false, {
              message:
                'No tiene una sesión abierta en este dispositivo o venció el tiempo de expiración.'
            });
          }

          const user = await this.userServices.getOne({
            query: {
              _id: jwt_payload.id
            }
          });

          if (!user) {
            return done(null, false, {
              message: 'Usuario o contraseña incorrectos.'
            });
          }

          return done(null, user);
        }
      )
    );
  };

  generateAccessJWT = ({ id }: { id: string }): string => {
    const { SECRET_ACCESS_TOKEN, steat } = this.options;

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

  generateRefreshJWT = ({ id }: { id: string }): string => {
    const { SECRET_REFRESH_TOKEN } = this.options;

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

  refreshAccessToken: QueryHandle<
    { currentSession: AuthSession; refreshToken: string },
    {
      accessToken: string | null;
    }
  > = async ({ currentSession, refreshToken }) => {
    const { SECRET_REFRESH_TOKEN, logger } = this.options;

    return new Promise((resolve) => {
      jwt.verify(refreshToken, SECRET_REFRESH_TOKEN, async (err: any, jwt_payload: any) => {
        if (err) {
          logger.error(`Error refreshing token ${err}`);

          /**
           * Cuando falla la verificación del token de refresco, se elimina la sesión
           */
          await this.close({ refreshToken });

          resolve({
            accessToken: null
          });
        } else {
          await this.updateOne({
            query: {
              _id: currentSession._id
            },
            update: {
              $push: { refreshHistory: new Date() }
            }
          });

          resolve({
            accessToken: this.generateAccessJWT({ id: jwt_payload.id })
          });
        }
      });
    });
  };

  close: QueryHandle<
    {
      refreshToken: string;
    },
    ModelDocument<AuthSession> | null
  > = async ({ refreshToken }) => {
    const Model = modelGetter();

    const authSession = await Model.findOneAndUpdate(
      {
        refreshToken,
        state: AuthSessionState.OPEN
      },
      {
        state: AuthSessionState.CLOSED,
        closedAt: new Date()
      },
      {
        returnDocument: 'after'
      }
    );

    return authSession;
  };

  passportMiddlewareAutenticateLocal = (callback: AuthenticateCallback) => {
    return passport.authenticate(
      'local',
      {
        session: false
      },
      callback
    );
  };

  passportMiddlewareAutenticateJWT = (callback: AuthenticateCallback) => {
    return passport.authenticate(
      'jwt',
      {
        session: false
      },
      callback
    );
  };

  passportMiddlewareInitialize = passport.initialize();
}
