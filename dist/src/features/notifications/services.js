"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsServices = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const schemas_1 = require("./schemas");
const utils_1 = require("./utils");
const ModelCrudTemplate_1 = require("../../utils/ModelCrudTemplate");
const schemas_2 = require("../../utils/schemas");
const types_1 = require("../auth/types");
const general_1 = require("../../utils/general");
class NotificationsServices extends ModelCrudTemplate_1.ModelCrudTemplate {
    constructor(businessServices, userServices, authServices) {
        super(schemas_1.modelGetter, utils_1.getAllFilterQuery);
        this.businessServices = businessServices;
        this.userServices = userServices;
        this.authServices = authServices;
        this.firebaseInstance = firebase_admin_1.default;
        this.notificationsServicesInit = () => {
            firebase_admin_1.default.initializeApp({
                //@ts-expect-error ignore
                credential: firebase_admin_1.default.credential.cert((0, utils_1.getNotificationsCredentials)())
            });
            console.info('Initialized Firebase SDK');
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.sendEachForMulticast = async ({ notification, tokens, body, title }) => {
            await this.firebaseInstance.messaging().sendEachForMulticast({
                data: { payload: JSON.stringify(notification) },
                tokens,
                notification: {
                    title,
                    body
                }
            });
        };
        this.getBusinessData = async ({ routeName }) => {
            const businessData = await this.businessServices.getOne({
                query: {
                    routeName
                },
                projection: {
                    name: 1,
                    notificationFlags: 1,
                    createdBy: 1
                }
            });
            if (!businessData) {
                return null;
            }
            return {
                businessName: businessData.name,
                routeName,
                notificationFlags: businessData.notificationFlags,
                createdBy: businessData.createdBy
            };
        };
        this.getUsersData = async ({ query }) => {
            const users = await this.userServices.getAll({
                query,
                projection: {
                    _id: 1,
                    phone: 1
                }
            });
            const sessions = (await this.authServices.getAll({
                query: {
                    userId: (0, schemas_2.getInArrayQuery)(users.map((user) => user._id.toString())),
                    state: types_1.AuthSessionState.OPEN
                },
                projection: {
                    firebaseToken: 1,
                    userId: 1
                }
            }));
            return users.map((user) => ({
                firebaseTokens: (0, general_1.compact)(sessions.filter((s) => (0, general_1.isEqualIds)(s.userId, user._id)).map((s) => s.firebaseToken)),
                userId: user._id,
                phone: user.phone
            }));
        };
        this.getUsersIdsFromUsersData = (usersData) => {
            return usersData.map((user) => user.userId);
        };
        this.getTokensFromUsersData = (usersData) => {
            return (0, general_1.excludeRepetedValues)(usersData.map((user) => user.firebaseTokens).flat());
        };
        this.notificationsServicesInit();
    }
}
exports.NotificationsServices = NotificationsServices;
