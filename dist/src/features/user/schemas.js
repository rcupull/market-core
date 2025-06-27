"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelGetter = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const types_1 = require("./types");
const schemas_1 = require("../../utils/schemas");
const mongoose_1 = require("mongoose");
let UserModel;
const modelGetter = () => {
    if (!UserModel) {
        const UserSchema = new mongoose_1.Schema({
            ...schemas_1.createdAtSchemaDefinition,
            name: { type: String, required: true },
            phone: { type: String, unique: true, sparse: true, default: null },
            email: { type: String, unique: true, sparse: true, default: null },
            password: { type: String, required: true, select: false },
            passwordHistory: [
                {
                    password: { type: String, required: true, select: false },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            role: { type: String, enum: Object.values(types_1.UserRole), default: types_1.UserRole.USER },
            validated: { type: Boolean, default: false },
            profileImage: {
                type: {
                    _id: false,
                    src: { type: String, required: true },
                    width: { type: Number, required: true },
                    height: { type: Number, required: true }
                },
                default: null
            },
            specialAccess: { type: [String], default: [] },
            defaultAddressIndex: { type: Number },
            addresses: [schemas_1.AddressDefinition],
            checks: { type: mongoose_1.Schema.Types.Mixed },
            lastGeolocation: {
                lat: { type: Number },
                lon: { type: Number }
            },
            isOwnerOf: {
                type: [{ type: String }],
                default: []
            },
            isMessengerOf: {
                type: [{ type: String }],
                default: []
            },
            messengerBankAccountCUP: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            messengerBankAccountMLC: {
                _id: false,
                type: schemas_1.BankAccountDefinition
            },
            messengerAvailable: { type: Boolean }
        });
        const updateUserPassword = (user) => {
            return new Promise((resolve, reject) => {
                bcrypt_1.default.genSalt(10, (err, salt) => {
                    if (err)
                        return reject(err);
                    bcrypt_1.default.hash(user.password, salt, (err, hash) => {
                        if (err)
                            return reject(err);
                        user.password = hash;
                        user.passwordHistory.push({ password: hash, createdAt: new Date() });
                        resolve();
                    });
                });
            });
        };
        UserSchema.pre('validate', function (next) {
            // `this` se refiere al documento actual que se está validando/guardando
            if (!this.phone && !this.email) {
                // Si ni el teléfono ni el email están presentes, lanza un error de validación
                this.invalidate('phone', 'Debe proporcionar al menos un número de teléfono o una dirección de correo electrónico.', undefined);
                this.invalidate('email', 'Debe proporcionar al menos un número de teléfono o una dirección de correo electrónico.', undefined);
                next(new Error('Validation failed: Must provide either a phone number or an email address.'));
            }
            else {
                // Si al menos uno está presente, continúa con la validación normal
                next();
            }
        });
        UserSchema.pre('save', async function (next) {
            //eslint-disable-next-line
            const user = this;
            if (user.isModified('password')) {
                try {
                    await updateUserPassword(user);
                }
                catch (err) {
                    next(err);
                }
            }
            next();
        });
        UserModel = (0, schemas_1.getMongoModel)('User', UserSchema, 'users');
    }
    return UserModel;
};
exports.modelGetter = modelGetter;
