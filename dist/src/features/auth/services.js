"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const schemas_1 = require("./schemas");
const types_1 = require("./types");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { Strategy: JWTStrategy, ExtractJwt } = passport_jwt_1.default;
class AuthServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(userServices, validationCodeServices, options) {
        super(schemas_1.modelGetter);
        this.userServices = userServices;
        this.validationCodeServices = validationCodeServices;
        this.options = options;
        this.init = () => {
            const { SECRET_ACCESS_TOKEN } = this.options;
            passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
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
                        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
                        if (isPasswordValid) {
                            return true;
                        }
                        else {
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
                }
                catch (err) {
                    return done(err);
                }
            }));
            passport_1.default.use(new JWTStrategy({
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: SECRET_ACCESS_TOKEN
            }, async (jwt_payload, done) => {
                const authSession = await this.getOne({
                    query: { userId: jwt_payload.id }
                });
                if (!authSession) {
                    return done(null, false, {
                        message: 'No tiene una sesión abierta en este dispositivo o venció el tiempo de expiración.'
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
            }));
        };
        this.generateAccessJWT = ({ id }) => {
            const { SECRET_ACCESS_TOKEN, steat } = this.options;
            return jsonwebtoken_1.default.sign({
                id
            }, SECRET_ACCESS_TOKEN, {
                expiresIn: steat
            });
        };
        this.generateRefreshJWT = ({ id }) => {
            const { SECRET_REFRESH_TOKEN } = this.options;
            return jsonwebtoken_1.default.sign({
                id
            }, SECRET_REFRESH_TOKEN, {
                expiresIn: '30d'
            });
        };
        this.refreshAccessToken = async ({ currentSession, refreshToken }) => {
            const { SECRET_REFRESH_TOKEN, logger } = this.options;
            return new Promise((resolve) => {
                jsonwebtoken_1.default.verify(refreshToken, SECRET_REFRESH_TOKEN, async (err, jwt_payload) => {
                    if (err) {
                        logger.error(`Error refreshing token ${err}`);
                        /**
                         * Cuando falla la verificación del token de refresco, se elimina la sesión
                         */
                        await this.close({ refreshToken });
                        resolve({
                            accessToken: null
                        });
                    }
                    else {
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
        this.close = async ({ refreshToken }) => {
            const Model = (0, schemas_1.modelGetter)();
            const authSession = await Model.findOneAndUpdate({
                refreshToken,
                state: types_1.AuthSessionState.OPEN
            }, {
                state: types_1.AuthSessionState.CLOSED,
                closedAt: new Date()
            }, {
                returnDocument: 'after'
            });
            return authSession;
        };
        this.passportMiddlewareAutenticateLocal = (callback) => {
            return passport_1.default.authenticate('local', {
                session: false
            }, callback);
        };
        this.passportMiddlewareAutenticateJWT = (callback) => {
            return passport_1.default.authenticate('jwt', {
                session: false
            }, callback);
        };
        this.changePasswordValidated = async (user, newPassword) => {
            const userPasswordHistory = await this.userServices.getOne({
                query: {
                    _id: user._id
                },
                select: {
                    passwordHistory: true
                },
                projection: {
                    passwordHistory: 1
                }
            });
            const passwordHistory = (userPasswordHistory === null || userPasswordHistory === void 0 ? void 0 : userPasswordHistory.passwordHistory) || [];
            const results = await Promise.all(passwordHistory.map(password => bcrypt_1.default.compare(newPassword, password.password)));
            const passwordWasUsed = results.some(result => result);
            return passwordWasUsed;
        };
        this.passportMiddlewareInitialize = passport_1.default.initialize();
        this.steat = this.options.steat;
        this.init();
    }
}
exports.AuthServices = AuthServices;
