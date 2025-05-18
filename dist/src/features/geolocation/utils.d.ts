import { MapOlPosition } from './types';
type OsrmService = 'route' | 'nearest' | 'table' | 'match' | 'trip' | 'tile';
type OsrmProfile = 'car' | 'bike' | 'foot' | 'driving';
export declare const getOsrmEndpoint: (args: {
    service: OsrmService;
    version?: string;
    profile: OsrmProfile;
    coordinates: {
        origin: MapOlPosition;
        destination: MapOlPosition;
    };
}) => string;
export {};
