"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOsrmEndpoint = void 0;
const osrmEndpoint = 'http://router.project-osrm.org';
const getOsrmEndpoint = (args) => {
    const { service, profile, coordinates } = args;
    const { destination, origin } = coordinates;
    return `${osrmEndpoint}/${service}/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
};
exports.getOsrmEndpoint = getOsrmEndpoint;
