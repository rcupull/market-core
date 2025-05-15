import { PushNotification, PushNotificationType } from './types';
import firebase from 'firebase-admin';
import { QueryHandle } from '../../types/general';

import { PushNotificationModel } from './schemas';
import { Schema } from 'mongoose';
import {
  getAllFilterQuery,
  GetAllNotificationsArgs,
  getNotificationsCredentials,
  getTokensFromUsersData,
  getUsersIdsFromUsersData,
  notificationDummies,
  pushNotificationInfo
} from './utils';
import { logger } from '../logger';
import { Shopping } from '../shopping/types';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
import { NotificationBusinessData, NotificationUserData } from '../notifications-data/types';

export class NotificationsServices extends ModelCrudTemplate<
  PushNotification,
  Pick<
    PushNotification,
    | 'type'
    | 'userIds'
    | 'readBys'
    | 'postId'
    | 'shoppingId'
    | 'shoppingCode'
    | 'stockAmountAvailable'
    | 'routeName'
    | 'businessName'
    | 'meta'
    | 'paymentProofCode'
    | 'paymentProofId'
    | 'message'
  >,
  GetAllNotificationsArgs
> {
  constructor() {
    super(PushNotificationModel, getAllFilterQuery);
    this.notificationsServicesInit();
  }

  firebaseInstance = firebase;

  private notificationsServicesInit = () => {
    firebase.initializeApp({
      //@ts-expect-error ignore
      credential: firebase.credential.cert(getNotificationsCredentials())
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

  AdminAlert: QueryHandle<{
    usersData: Array<NotificationUserData>;
    message: string;
  }> = async ({ usersData, message }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es enviado para el cliente cuando se apruebe una nueva orden
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const userIds = getUsersIdsFromUsersData(usersData);
    const tokens = getTokensFromUsersData(usersData);

    const notification = await this.addOne({
      type: PushNotificationType.ADMIN_ALERT,
      userIds,
      message
    });

    if (tokens.length) {
      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens,
        notification: {
          title: 'Admin alert',
          body: message
        }
      });
    }
  };

  NewOrderApprovedMessage: QueryHandle<{
    shoppingId: Schema.Types.ObjectId;
    usersData: Array<NotificationUserData>;
  }> = async ({ shoppingId, usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es enviado para el cliente cuando se apruebe una nueva orden
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const userIds = getUsersIdsFromUsersData(usersData);
    const tokens = getTokensFromUsersData(usersData);

    const notification = await this.addOne({
      type: PushNotificationType.ORDER_WAS_APPROVED,
      userIds,
      shoppingId
    });

    if (tokens.length) {
      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens,
        notification: {
          title: 'Orden de compra aceptada',
          body: 'Ya casi tienes tu producto'
        }
      });
    }
  };

  NewPaymentProofMessage: QueryHandle<{
    shoppingId: Schema.Types.ObjectId;
    shoppingCode: string;
    paymentProofCode: string;
    paymentProofId: Schema.Types.ObjectId;
    usersData: Array<NotificationUserData>;
  }> = async ({ shoppingCode, shoppingId, paymentProofCode, paymentProofId, usersData }) => {
    const userIds = getUsersIdsFromUsersData(usersData);
    const tokens = getTokensFromUsersData(usersData);

    const notification = await this.addOne({
      type: PushNotificationType.PAYMENT_PROOF_GENERATED,
      shoppingId,
      shoppingCode,
      paymentProofCode,
      paymentProofId,
      userIds
    });

    if (tokens.length) {
      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens,
        notification: {
          title: 'Comprobante de pago generado',
          body: `Se ha generado el comprobante de pago ${paymentProofCode}`
        }
      });
    }
  };

  NewOrderPushMessage: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData | undefined;
    shoppingId: Schema.Types.ObjectId;
  }> = async ({ businessData, shoppingId, usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es enviado para el proveedor cuando tiene una nueva orden de coompra para atender
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const { routeName, businessName } = businessData || {};
      /**
       * TODO maybe in the future this shoulbe used
       */
      // if (isNotAllowedNotification(notificationFlags, BusinessNotificationFlags.NEW_SHOPPING)) {
      //   return;
      // }

      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.NEW_ORDER_WAS_CREATED,
        shoppingId,
        routeName,
        businessName,
        userIds
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Nueva orden de compra',
            body: 'Excelente trabajo!!'
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  UpdateStockAmountMessage: QueryHandle<{
    usersData: Array<NotificationUserData>;
    stockAmountAvailable: number;
    postId: string;
  }> = async ({ postId, stockAmountAvailable, usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es enviado todos los usaarios con sessines abiertas actualizando el stock de un producto
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const tokens = getTokensFromUsersData(usersData);

      const notification = new PushNotificationModel({
        type: PushNotificationType.POST_AMOUNT_STOCK_CHANGE,
        stockAmountAvailable,
        postId
      });

      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens
      });
    } catch (e) {
      logger.error(e);
    }
  };

  BusinessRequestMessage: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData;
  }> = async ({ usersData, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para los admin de que ha sido solicitado un nuevo negocio
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const { businessName } = businessData;

      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.BUSINESS_REQUEST_WAS_CREATED,
        userIds,
        businessName
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Negocio solicitado',
            body: `Se ha solicitado la apertura del negocio ${businessName}`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  BusinessApprovedMessage: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData;
  }> = async ({ usersData, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el proveedor de un negocio de que su negocio ha sido aprobado
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.BUSINESS_REQUEST_WAS_APPROVED,
        businessName: businessData.businessName,
        routeName: businessData.routeName,
        userIds
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Negocio aprobado',
            body: 'Ya puedes empezar a trabajar'
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  BusinessRejectedMessage: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData;
  }> = async ({ usersData, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el proveedor de un negocio de que su negocio ha sido rechazado
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.BUSINESS_REQUEST_WAS_REJECTED,
        businessName: businessData.businessName,
        routeName: businessData.routeName,
        userIds
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Negocio rechazado',
            body: 'Tu solicitud ha sido rechazada'
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  OrderInConstructionWasRemoved: QueryHandle<{
    usersData: Array<NotificationUserData>;
  }> = async ({ usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el cliente indicando de que la orden de compra en el carro a sido eliminada
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const tokens = getTokensFromUsersData(usersData);

      const notification = new PushNotificationModel({
        type: PushNotificationType.ORDER_IN_CONSTRUCTION_WAS_REMOVED
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  DeliveryAssigned: QueryHandle<{
    usersData: Array<NotificationUserData>;
  }> = async ({ usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para unmensajero cuando se le asigan una entrega
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.DELIVERY_ASSIGNED,
        userIds
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Nueva Mensajería asignada',
            body: 'Se te ha asingado una nueva mensajería'
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  DeliveryRevoked: QueryHandle<{
    usersData: Array<NotificationUserData>;
    shopping: Shopping;
  }> = async ({ usersData, shopping }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para un mensajero cuando se le revoca una entrega(se le desasigna)
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.DELIVERY_REVOKED,
        userIds,
        shoppingId: shopping._id
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Mensajería revocada',
            body: 'Se ha reasignado una mensajería a otro mensajero'
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  DeliveryFinished: QueryHandle<{
    usersData: Array<NotificationUserData>;
    shopping: Shopping;
  }> = async ({ usersData, shopping }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el proveedor del negocio cuando se finaliza una compra y se entrega el producto
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.DELIVERY_FINISHED,
        userIds,
        shoppingCode: shopping.code,
        shoppingId: shopping._id
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Mensajería finalizada',
            body: `Se ha finalizado la entrega de la compra ${shopping.code}`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  AddedToBusiness: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData;
  }> = async ({ usersData, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para un mensajero es agregado como parte de los mensajeros de un negocio
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const { businessName } = businessData;

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.DELIVERYMAN_ADDED_TO_BUSINESS,
        userIds,
        businessName
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Mensajero de un negocio',
            body: `Has sido añadido como mensajero del negocio ${businessName}`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  RemovedFromBusiness: QueryHandle<{
    usersData: Array<NotificationUserData>;
    businessData: NotificationBusinessData;
  }> = async ({ usersData, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para un mensajero es eliminado como parte de los mensajeros de un negocio
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const { businessName } = businessData;

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.DELIVERYMAN_REMOVED_FROM_BUSINESS,
        userIds,
        businessName
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Eliminado de un negocio',
            body: `Ya no eres mensajero del negocio ${businessName}`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  OrderCanceled: QueryHandle<{
    usersData: Array<NotificationUserData>;
    shopping: Shopping;
  }> = async ({ usersData, shopping }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el proeedor del negocio cuando el cliente cancela una orden de compra
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.ORDER_CANCELED,
        userIds,
        shoppingCode: shopping.code,
        shoppingId: shopping._id
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Orden Cancelada',
            body: `Se ha cancelado la orden ${shopping.code}`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  OrderReadyToPickUp: QueryHandle<{
    usersData: Array<NotificationUserData>;
    shoppingCode: string;
    businessData: NotificationBusinessData | undefined;
  }> = async ({ usersData, shoppingCode, businessData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el cliente cuando la orden esta lista para entregar y debe recojerla en la tienda
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const { businessName } = businessData || {};

      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.ORDER_READY_TO_PICKUP,
        userIds,
        shoppingCode,
        businessName
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Orden lista',
            body: `La orden ${shoppingCode} está lista para ser recogida`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  OrderRejectedNoPayment: QueryHandle<{
    usersData: Array<NotificationUserData>;
    shopping: Shopping;
  }> = async ({ usersData, shopping }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * este mensaje es para el cliente cuando no paga la orden de compra
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    try {
      const userIds = getUsersIdsFromUsersData(usersData);
      const tokens = getTokensFromUsersData(usersData);

      const notification = await this.addOne({
        type: PushNotificationType.ORDER_REJECTED,
        userIds,
        shoppingCode: shopping.code,
        shoppingId: shopping._id
      });

      if (tokens.length) {
        await this.firebaseInstance.messaging().sendEachForMulticast({
          data: { payload: JSON.stringify(notification) },
          tokens,
          notification: {
            title: 'Orden Rechazada',
            body: `Se ha Rechazado la orden ${shopping.code} porque no se ha pagado en tiempo`
          }
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  RenderErrorOcurred: QueryHandle<{
    usersData: Array<NotificationUserData>;
  }> = async ({ usersData }) => {
    /**
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     * mensaje para los admins cuando hay un error de render en una aplicacion
     * ////////////////////////////////////////////////////////////////////////////////////
     * ////////////////////////////////////////////////////////////////////////////////////
     */

    const userIds = getUsersIdsFromUsersData(usersData);
    const tokens = getTokensFromUsersData(usersData);

    const notification = new PushNotificationModel({
      type: PushNotificationType.RENDER_ERROR_OCURRED,
      userIds
    });

    if (tokens.length) {
      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens,
        notification: pushNotificationInfo[PushNotificationType.RENDER_ERROR_OCURRED]
      });
    }
  };

  DummieNotification: QueryHandle<{
    usersData: Array<NotificationUserData>;
    type: PushNotificationType;
  }> = async ({ usersData, type }) => {
    const userIds = getUsersIdsFromUsersData(usersData);
    const tokens = getTokensFromUsersData(usersData);

    const notification = new PushNotificationModel({
      type,
      userIds,
      ...notificationDummies
    });

    if (tokens.length) {
      await this.firebaseInstance.messaging().sendEachForMulticast({
        data: { payload: JSON.stringify(notification) },
        tokens,
        notification: pushNotificationInfo[type]
      });
    }
  };
}
