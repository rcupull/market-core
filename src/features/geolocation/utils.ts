import { MapOlPosition } from './types';

const osrmEndpoint = 'http://router.project-osrm.org';

type OsrmService = 'route' | 'nearest' | 'table' | 'match' | 'trip' | 'tile';
type OsrmProfile = 'car' | 'bike' | 'foot' | 'driving';

export const getOsrmEndpoint = (args: {
  service: OsrmService;
  version?: string;
  profile: OsrmProfile;
  coordinates: {
    origin: MapOlPosition;
    destination: MapOlPosition;
  };
}) => {
  const { service, profile, coordinates } = args;
  const { destination, origin } = coordinates;

  return `${osrmEndpoint}/${service}/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
};
