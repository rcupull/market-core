import bcrypt from 'bcrypt';
import { User, UserRole } from './types';
import {
  AddressDefinition,
  BankAccountDefinition,
  createdAtSchemaDefinition,
  getMongoModel
} from '../../utils/schemas';
import { Schema } from 'mongoose';

let UserModel: ReturnType<typeof getMongoModel<User>>;

export const modelGetter = () => {
  if (!UserModel) {
    const UserSchema = new Schema<User>({
      ...createdAtSchemaDefinition,
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
      role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
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
      addresses: [AddressDefinition],
      checks: { type: Schema.Types.Mixed },
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
        type: BankAccountDefinition
      },
      messengerBankAccountMLC: {
        _id: false,
        type: BankAccountDefinition
      }
    });

    const updateUserPassword = (user: User): Promise<void> => {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return reject(err);

          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return reject(err);

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
        this.invalidate(
          'phone',
          'Debe proporcionar al menos un número de teléfono o una dirección de correo electrónico.',
          undefined
        );
        this.invalidate(
          'email',
          'Debe proporcionar al menos un número de teléfono o una dirección de correo electrónico.',
          undefined
        );
        next(
          new Error('Validation failed: Must provide either a phone number or an email address.')
        );
      } else {
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
        } catch (err: any) {
          next(err);
        }
      }

      next();
    });

    UserModel = getMongoModel<User>('User', UserSchema, 'users');
  }

  return UserModel;
};
