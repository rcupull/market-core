"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsDataServices = void 0;
const schemas_1 = require("../../utils/schemas");
const general_1 = require("../../utils/general");
const types_1 = require("../auth/types");
class NotificationsDataServices {
    constructor(businessServices, userServices, authServices) {
        this.businessServices = businessServices;
        this.userServices = userServices;
        this.authServices = authServices;
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
                    userId: (0, schemas_1.getInArrayQuery)(users.map((user) => user._id.toString())),
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
    }
}
exports.NotificationsDataServices = NotificationsDataServices;
