"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathToSave = void 0;
const getPathToSave = (args) => {
    const { routeName, postId, professionalJobId, userId, customKey } = args;
    if (routeName) {
        let out = `business/${routeName}`;
        if (postId) {
            out = `${out}/posts/${postId}`;
        }
        if (professionalJobId) {
            out = `${out}/professionalJobs/${professionalJobId}`;
        }
        if (customKey) {
            out = `${out}/${customKey}`;
        }
        return out;
    }
    if (userId) {
        let out = `users/${userId}`;
        if (customKey) {
            out = `${out}/${customKey}`;
        }
        return out;
    }
    if (customKey) {
        return customKey;
    }
    return 'unknow';
};
exports.getPathToSave = getPathToSave;
