"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDtosServices = void 0;
const general_1 = require("../../utils/general");
const schemas_1 = require("../../utils/schemas");
const types_1 = require("../auth-session/types");
class UserDtosServices {
    constructor(businessServices, authSessionServices) {
        this.businessServices = businessServices;
        this.authSessionServices = authSessionServices;
        this.getUsersDto = async (users) => {
            const { getFavoritesBusiness } = await this.businessServices.getBusinessFavoritesData({
                query: {
                    favoritesUserIds: (0, schemas_1.getInArrayQuery)(users.map((user) => user._id))
                }
            });
            const getDto = async (user) => {
                const out = {
                    ...(0, general_1.deepJsonCopy)(user),
                    favoritesBusiness: getFavoritesBusiness({ userId: user._id }),
                    hasOpenSession: false,
                    lastAccessAt: undefined
                };
                const lastSession = await this.authSessionServices.getOne({
                    query: { userId: user._id },
                    sort: schemas_1.lastUpQuerySort
                });
                if (!lastSession) {
                    return out;
                }
                const refreshHistory = lastSession.refreshHistory;
                const lastAccessAt = refreshHistory[refreshHistory.length - 1];
                out.hasOpenSession = lastSession.state === types_1.AuthSessionState.OPEN;
                out.lastAccessAt = lastAccessAt || lastSession.createdAt;
                return out;
            };
            const promises = users.map(getDto);
            const out = await Promise.all(promises);
            return out;
        };
    }
}
exports.UserDtosServices = UserDtosServices;
