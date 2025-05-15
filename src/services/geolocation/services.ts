import { Address, QueryHandle } from '../../types/general';
import { axios } from '../../utils/api';
import { fixToTwoDigits } from '../../utils/general';
import { ConfigServices } from '../config/services';
import { FeatureKey } from '../config/types';
import { getDistanceBetweenPositions } from '../shopping/utils';
import { GetGeolocationDistanceReturn, OsrmResponse } from './types';
import { getOsrmEndpoint } from './utils';

/**
 * doc in https://project-osrm.org/docs/v5.24.0/api/#route-object
 */

export class GeolocationServices {
  constructor(private readonly configServices: ConfigServices) {}

  private getAproximatedDistance: QueryHandle<
    {
      fromAddress: Address;
      toAddress: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
    const distance = getDistanceBetweenPositions(
      {
        lat: fromAddress.lat,
        lon: fromAddress.lon
      },
      {
        lat: toAddress.lat,
        lon: toAddress.lon
      }
    );

    return {
      distance,
      mapRoute: []
    };
  };

  private getOSRMGeolocationDistance: QueryHandle<
    {
      fromAddress: Address;
      toAddress: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
    const { data } = await axios({
      method: 'get',
      url: getOsrmEndpoint({
        profile: 'driving',
        service: 'route',
        coordinates: {
          destination: {
            lon: toAddress.lon,
            lat: toAddress.lat
          },
          origin: {
            lon: fromAddress.lon,
            lat: fromAddress.lat
          }
        }
      }),
      params: {
        geometries: 'geojson',
        overview: 'full'
      }
    });

    const response = data as OsrmResponse;
    const route = response.routes[0];

    return {
      distance: fixToTwoDigits(route.distance / 1000), // convert to km
      mapRoute: route.geometry?.coordinates?.map(([lon, lat]) => ({
        lat,
        lon
      }))
    };
  };

  getGeolocationDistance: QueryHandle<
    {
      fromAddress?: Address;
      toAddress?: Address;
    },
    GetGeolocationDistanceReturn
  > = async ({ fromAddress, toAddress }) => {
    if (!fromAddress || !toAddress) {
      return {
        distance: 0,
        mapRoute: []
      };
    }

    const { getEnabledFeature } = await this.configServices.features();

    if (getEnabledFeature(FeatureKey.COMPUTE_DELIVERY_DISTANCE_USING_OSRM_SERVICES)) {
      return await this.getOSRMGeolocationDistance({ fromAddress, toAddress });
    }

    return await this.getAproximatedDistance({ fromAddress, toAddress });
  };
}
