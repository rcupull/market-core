import { FilterQuery, Schema } from 'mongoose';
import { excludeRepetedValues, isArray } from '../../utils/general';
import { PushNotification, PushNotificationType } from './types';
import { NotificationUserData } from '../notifications-data/types';
import { getFilterQueryFactory } from '../../utils/schemas';
export interface GetAllNotificationsArgs extends FilterQuery<PushNotification> {
  userIds?: Array<Schema.Types.ObjectId | string>;
}

export const getAllFilterQuery = getFilterQueryFactory<GetAllNotificationsArgs>(
  ({ userIds, ...filterQuery }) => {
    if (isArray(userIds) && userIds.length) {
      filterQuery.userIds = { $in: userIds };
    }

    return filterQuery;
  }
);

export const getUsersIdsFromUsersData = (usersData: Array<NotificationUserData>) => {
  return usersData.map((user) => user.userId);
};

export const getTokensFromUsersData = (usersData: Array<NotificationUserData>) => {
  return excludeRepetedValues(usersData.map((user) => user.firebaseTokens).flat());
};

export const notificationDummies = {
  postId: '5678',
  shoppingId: '1234',
  shoppingCode: 'ABC-123',
  businessName: 'La Florería de Barbara',
  routeName: 'la-floreria-de-barbara'
};

export const pushNotificationInfo: Record<
  PushNotificationType,
  | {
      title: string;
      body: string;
    }
  | undefined
> = {
  [PushNotificationType.POST_AMOUNT_STOCK_CHANGE]: undefined,
  [PushNotificationType.NEW_ORDER_WAS_CREATED]: {
    title: 'Nueva orden de compra',
    body: 'Excelente trabajo!!'
  },
  [PushNotificationType.PAYMENT_PROOF_GENERATED]: {
    title: 'Comprobante de pago generado',
    body: `Se ha generado el comprobante de pago de la orden`
  },
  [PushNotificationType.ORDER_WAS_APPROVED]: {
    title: 'Orden de compra aceptada',
    body: 'Ya casi tienes tu producto'
  },
  [PushNotificationType.ORDER_IN_CONSTRUCTION_WAS_REMOVED]: undefined,
  [PushNotificationType.ORDER_CANCELED]: {
    title: 'Orden Cancelada',
    body: `Se ha cancelado la orden ABC-123`
  },
  [PushNotificationType.ORDER_REJECTED]: {
    title: 'Orden lista',
    body: `La orden ABC-123 está lista para ser recogida`
  },
  [PushNotificationType.ORDER_READY_TO_PICKUP]: {
    title: 'Orden Rechazada',
    body: `Se ha Rechazado la orden ABC-123 porque no se ha pagado en tiempo`
  },
  [PushNotificationType.BUSINESS_REQUEST_WAS_CREATED]: {
    title: 'Negocio solicitado',
    body: `Se ha solicitado la apertura del negocio La Florería de Bárbara `
  },
  [PushNotificationType.BUSINESS_REQUEST_WAS_APPROVED]: {
    title: 'Negocio aprobado',
    body: 'Ya puedes empezar a trabajar'
  },
  [PushNotificationType.BUSINESS_REQUEST_WAS_REJECTED]: {
    title: 'Negocio rechazado',
    body: 'Tu solicitud ha sido rechazada'
  },
  [PushNotificationType.DELIVERY_ASSIGNED]: {
    title: 'Nueva Mensajería asignada',
    body: 'Se te ha asingado una nueva mensajería'
  },
  [PushNotificationType.DELIVERY_REVOKED]: {
    title: 'Mensajería revocada',
    body: 'Se ha reasignado una mensajería a otro mensajero'
  },
  [PushNotificationType.DELIVERY_FINISHED]: {
    title: 'Mensajería finalizada',
    body: `Se ha finalizado la entrega de la compra ABC-123`
  },
  [PushNotificationType.DELIVERYMAN_ADDED_TO_BUSINESS]: {
    title: 'Mensajero de un negocio',
    body: `Has sido añadido como mensajero del negocio La Florería de Bárbara`
  },
  [PushNotificationType.DELIVERYMAN_REMOVED_FROM_BUSINESS]: {
    title: 'Eliminado de un negocio',
    body: `Ya no eres mensajero del negocio La Florería de Bárbara`
  },
  [PushNotificationType.RENDER_ERROR_OCURRED]: {
    title: 'Error de renderización',
    body: `Ha ocurrido un error en la renderización de la página`
  },
  [PushNotificationType.ADMIN_ALERT]: {
    title: 'Admin Alert',
    body: `Ha ocurrido una alerta para los admins`
  }
};

export const getNotificationsCredentials = () => {
  return {
    type: 'service_account',
    project_id: 'multi-store-2b052',
    private_key_id: 'd85058039b76d6cdde031b91d7e08455f580afd2',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNs21FHV4zKfuR\nwrnuonfXhM8t8kr09O12Yh6vjN24x+tznjtSCL5zSAhElgs64aCMGbGVxWQ0wV39\nrI1n0H1eFqvQG5YBzgBUukR2LZRJIU7F7qNDoLZWf/DAODUcRjmVeiEnR9AofLLU\njYLHR31SGG6C/NV5gJI6bW0YqI4xdc8H2HLNutHSCAQS3KQkC/Po9y/WbhgPqAyY\nT7YV0ujcWiYI9Bw8SJx/6GI3UHLKacBRithLzjuLilYV5PUDkNWvGF2NejLT/9ET\n/Yje4Gnm/WPQorEgX0CIpDP+nP/8iIVb3FSJ3CaBX059898shjN7XalMT0SBoU/n\nwjKjmlsPAgMBAAECggEAF5JWFTN2Vfqbn2pnEBeCECph62v2dveSNpyr04Ya6k/O\nhWM+fPoPiPpaKDHhe4/ba/KNzRHfl8QI10bstVbI5v1GFwTyPaazlwH5UmmKso6k\njj34a4mBG4xxtDU8sM7DToO+RNgP3HPdskm9EMT6cWvnTg9XDyNSnmtnswmtsbEP\nlVzBM4bhBD0/0qE0UcIOGLA2DDcNtEyEJDyEeRjNYM/bo0SS4RIG6ers5x8J/Dbj\nl22bTfQrUgHdbSBAv1XeiWnaAIzPx8GQ6rGGE9eGBO4mWb/AzNwbnNdQYgST5PM3\nVM3LxzKwTRlcajxLeGNaLkUqR9eWG7+fU3yQQ3AkMQKBgQD4JTIugtyMZg24g078\nFnTPFJ5Aa5pmYE1lnMwVGfDhcaAgCpirAyqRnsIiz/Vk5D25Kbnm6Wd1YxLErPs4\nefvy+rYHcCHvBjQjH/dH8Bo86hZ8e+AT7mNp21uxMQX68q5kD2BwbQUMuxaxarpl\n5i0v2/8K7f2ZCbHbFkNDWPwwZQKBgQDUNkokYGi3tuTRU2MmjfPeLI5tmJp/Uz27\nEZSmCsUbM3ZPPoDdonx3as1AFXqDhxrsJalxtMaV86ibDpdQ+FifXxU/4CnTbk28\nZct1uO3KY+jnvlxmXG0hbvBi2fcVE21P3LSX7StiDE/J4V0jwlTWBpwpnf/twg02\nZlPJugDUYwKBgQC7HvF0eWHuzZZTKVGKbzSuY5HiakIIKV6z3UVYNDOdDZ3+C3+M\nldqn7NvgfIlEB4kz8+8n3aIStx8UCI14zSPc2oohmcE9CaSPSC+ko75laPCD9rXG\n0eFNlgjS2XD1B8PR2HaU0OEZ9IrsRttAtA4nJPJyP30YxmLEH0mho5yosQKBgQC8\n5RZaCvcrkMFdErzPNMw+l6qwI4Zij9YDDkMjCbMp40UMhLZwkpH4Ojk5MeU77qco\nTN3nOOML1zfdzb8jc+xu8FQZ549ThHvtly7kOxhvbz+CCRB2jQ8XE4kmdJ5bRE+p\nJuwZ0CMtw4fCS7h8fB7H5FpdMSb+nBzmr28lwUu7wQKBgGeNT0oufTCwPzmQALt7\nVsrVkPAwW3tLqaUxpl5qym/vaGQEKkGycWH8igmueznR0exgaSHhpynedSMbppth\n0D+U7PrrlYsn4wo4XloY6CZbj0hufMmjp8y1sq3zvvbHTMtnEGzoFwjiVkqUCtRy\nBCv7Sck/8iYoRpUUm/DO7ydJ\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-e4h04@multi-store-2b052.iam.gserviceaccount.com',
    client_id: '104521757095808741249',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-e4h04%40multi-store-2b052.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com'
  };
};
