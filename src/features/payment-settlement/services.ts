import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery, PaginateOptions, ProjectionType, Schema } from 'mongoose';
import { getInArrayQuery, getSortQuery } from '../../utils/schemas';
import {
  GetAllPaymentSettlementArgs,
  PaymentSettlement,
  PaymentSettlementDto,
  PaymentSettlementShoppingRecord,
  PaymentSettlementShoppingRecordDto,
  PaymentSettlementState,
  PaymentSettlementType
} from './types';
import { modelGetter } from './schemas';
import { compact, deepJsonCopy, isEqualIds } from '../../utils/general';
import { UserServices } from '../user/services';
import { BusinessServices } from '../business/services';
import { ConfigServices } from '../config/services';
import { AdminConfig } from '../config/types';
import { Business } from '../business/types';
import { User } from '../user/types';
import { PaginateResult } from '../../types/pagination';

export class PaymentSettlementServices {
  constructor(
    private readonly userServices: UserServices,
    private readonly businessServices: BusinessServices,
    private readonly configServices: ConfigServices
  ) {}

  paymentSettlementServicesAddOne: QueryHandle<
    Pick<
      PaymentSettlement,
      'routeName' | 'messengerId' | 'type' | 'fromDate' | 'toDate' | 'shoppingRecords'
    >,
    ModelDocument<PaymentSettlement>
  > = async ({ routeName, messengerId, type, fromDate, toDate, shoppingRecords }) => {
    const PaymentSettlementModel = modelGetter();
    const out = new PaymentSettlementModel({
      routeName,
      messengerId,
      fromDate,
      toDate,
      type,
      state: PaymentSettlementState.PENDING,
      shoppingRecords
    });

    await out.save();

    return out;
  };

  paymentSettlementServicesGetAllWithPagination: QueryHandle<
    {
      paginateOptions?: PaginateOptions;
      query: GetAllPaymentSettlementArgs;
      sort?: string;
    },
    PaginateResult<PaymentSettlement>
  > = async ({ query, sort, paginateOptions = {} }) => {
    const filterQuery = this.getAllPaymentSettlementFilterQuery(query);
    const PaymentSettlementModel = modelGetter();

    const out = await PaymentSettlementModel.paginate(filterQuery, {
      ...paginateOptions,
      sort: getSortQuery(sort)
    });

    return out as unknown as PaginateResult<PaymentSettlement>;
  };

  paymentSettlementServicesGetAll: QueryHandle<
    {
      query: GetAllPaymentSettlementArgs;
      projection?: ProjectionType<PaymentSettlement>;
    },
    Array<ModelDocument<PaymentSettlement>>
  > = async ({ query, projection }) => {
    const filterQuery = this.getAllPaymentSettlementFilterQuery(query);

    const PaymentSettlementModel = modelGetter();
    const out = await PaymentSettlementModel.find(filterQuery, projection);

    return out;
  };

  paymentSettlementServicesGetOne: QueryHandle<
    {
      query: FilterQuery<PaymentSettlement>;
      projection?: ProjectionType<PaymentSettlement>;
    },
    ModelDocument<PaymentSettlement> | null
  > = async ({ query, projection }) => {
    const PaymentSettlementModel = modelGetter();
    const out = await PaymentSettlementModel.findOne(query, projection);

    return out;
  };

  paymentSettlementServicesDeleteOne: QueryHandle<
    {
      query: FilterQuery<PaymentSettlement>;
    },
    ModelDocument<PaymentSettlement> | null
  > = async ({ query }) => {
    const PaymentSettlementModel = modelGetter();
    const out = await PaymentSettlementModel.findOneAndDelete(query);

    return out;
  };

  paymentSettlementServicesChangeToDone: QueryHandle<
    {
      paymentSettlementId: string | Schema.Types.ObjectId;
      settlementCode: string;
      changedToDoneBy: Schema.Types.ObjectId;
    },
    ModelDocument<PaymentSettlement> | null
  > = async ({ paymentSettlementId, changedToDoneBy, settlementCode }) => {
    const PaymentSettlementModel = modelGetter();
    const out = await PaymentSettlementModel.findOneAndUpdate(
      {
        _id: paymentSettlementId
      },
      {
        changedToDoneAt: new Date(),
        changedToDoneBy,
        state: PaymentSettlementState.DONE,
        settlementCode
      },
      {
        returnDocument: 'after'
      }
    );

    return out;
  };

  getAllPaymentSettlementFilterQuery = (
    args: GetAllPaymentSettlementArgs
  ): FilterQuery<PaymentSettlement> => {
    const { paymentIds, states, ...omittedQuery } = args;

    const filterQuery: FilterQuery<PaymentSettlement> = omittedQuery;

    if (paymentIds?.length) {
      filterQuery.paymentIds = { $in: paymentIds };
    }

    if (states?.length) {
      filterQuery.state = { $in: states };
    }

    return filterQuery;
  };

  getShoppingRecordDto = (
    shoppingRecord: PaymentSettlementShoppingRecord
  ): PaymentSettlementShoppingRecordDto => {
    const { postsData, shoppingDeliveryAmount = 0 } = shoppingRecord;

    const shoppingPostsAmount = postsData.reduce((acc, { postAmount = 0 }) => acc + postAmount, 0);

    return {
      ...deepJsonCopy(shoppingRecord),
      shoppingAmount: shoppingPostsAmount + shoppingDeliveryAmount,
      shoppingPostsAmount
    };
  };

  paymentSettlementToDto = async (
    data: Array<PaymentSettlement>
  ): Promise<Array<PaymentSettlementDto>> => {
    const adminConfig: Pick<AdminConfig, 'bankAccountCUP' | 'bankAccountMLC'> | null =
      await this.configServices.adminConfigServicesGetOne({
        projection: {
          bankAccountCUP: 1,
          bankAccountMLC: 1
        }
      });

    const business: Array<
      Pick<Business, 'bankAccountCUP' | 'bankAccountMLC' | 'name' | 'routeName'>
    > = await this.businessServices.getAll({
      query: {
        routeName: getInArrayQuery(compact(data.map(({ routeName }) => routeName)))
      },
      projection: {
        bankAccountCUP: 1,
        bankAccountMLC: 1,
        routeName: 1,
        name: 1
      }
    });

    const messengers: Array<Pick<User, 'name' | '_id' | 'messengerBankAccountCUP'>> =
      await this.userServices.getAll({
        query: {
          _id: getInArrayQuery(compact(data.map(({ messengerId }) => messengerId)))
        },
        projection: {
          _id: 1,
          name: 1,
          messengerBankAccountCUP: 1
        }
      });

    const getDto = (paymentSettlement: PaymentSettlement): PaymentSettlementDto => {
      const { routeName, messengerId, type, shoppingRecords } = paymentSettlement;

      const shoppingRecordsDto = shoppingRecords.map(this.getShoppingRecordDto);
      const amount = shoppingRecordsDto.reduce(
        (acc, { shoppingAmount }) => acc + shoppingAmount,
        0
      );

      const out: PaymentSettlementDto = {
        ...deepJsonCopy(paymentSettlement),
        shoppingRecords: shoppingRecordsDto,
        amount,
        bankAccountToSettle: undefined,
        messengerName: undefined,
        businessName: undefined
      };

      if (routeName) {
        const theBusiness = business.find((b) => b.routeName === routeName);

        out.businessName = theBusiness?.name;

        /**
         * TODO: In the future the MLC card can be used
         */
        if (type === PaymentSettlementType.FROM__BUSINESS_FULL) {
          /**
           * use the market CUP account to make the settlement
           */
          out.bankAccountToSettle = adminConfig?.bankAccountCUP;
        }
        if (
          type === PaymentSettlementType.TO__BUSINESS_FULL ||
          type === PaymentSettlementType.TO__MARKET_FULL
        ) {
          /**
           * use the business CUP account to make the settlement
           */
          out.bankAccountToSettle = theBusiness?.bankAccountCUP;
        }
      }

      if (messengerId) {
        const theMessenger = messengers.find((m) => isEqualIds(m._id, messengerId));

        out.messengerName = theMessenger?.name;

        if (type === PaymentSettlementType.TO__MESSENGER) {
          /**
           * use the messenger CUP account to make the settlement
           */
          out.bankAccountToSettle = theMessenger?.messengerBankAccountCUP;
        }
      }

      ////////////////////////////////////////////////////////////////////
      return out;
    };

    return data.map(getDto);
  };
}
