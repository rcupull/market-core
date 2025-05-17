import bcrypt from 'bcrypt';
import { User, UserRole } from './types';
import {
  AddressDefinition,
  BankAccountDefinition,
  createdAtSchemaDefinition,
  getMongoModel
} from '../../utils/schemas';
import { getMongoose } from '../../db';

let UserModel: ReturnType<typeof getMongoModel<User>>;

export const modelGetter = () => {
  if (!UserModel) {
    const { Schema } = getMongoose();

    const UserSchema = new Schema<User>({
      ...createdAtSchemaDefinition,
      name: { type: String, required: true },
      phone: { type: String, unique: true, required: true },
      email: { type: String, default: null },
      password: { type: String, required: true, select: false },
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
            resolve();
          });
        });
      });
    };

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
