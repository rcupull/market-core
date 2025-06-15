"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionState = exports.TYPE_DEVICE = void 0;
var TYPE_DEVICE;
(function (TYPE_DEVICE) {
    TYPE_DEVICE["NATIVE"] = "NATIVE";
    TYPE_DEVICE["WEB"] = "WEB";
})(TYPE_DEVICE || (exports.TYPE_DEVICE = TYPE_DEVICE = {}));
var AuthSessionState;
(function (AuthSessionState) {
    AuthSessionState["OPEN"] = "OPEN";
    AuthSessionState["CLOSED"] = "CLOSED";
})(AuthSessionState || (exports.AuthSessionState = AuthSessionState = {}));
