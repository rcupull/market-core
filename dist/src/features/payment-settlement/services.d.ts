import { ModelDocument, QueryHandle } from '../../types/general';
import { FilterQuery, PaginateOptions, ProjectionType, Schema } from 'mongoose';
import { GetAllPaymentSettlementArgs, PaymentSettlement, PaymentSettlementDto, PaymentSettlementShoppingRecord, PaymentSettlementShoppingRecordDto } from './types';
import { UserServices } from '../user/services';
import { BusinessServices } from '../business/services';
import { ConfigServices } from '../config/services';
import { PaginateResult } from '../../types/pagination';
export declare class PaymentSettlementServices {
    private readonly userServices;
    private readonly businessServices;
    private readonly configServices;
    constructor(userServices: UserServices, businessServices: BusinessServices, configServices: ConfigServices);
    paymentSettlementServicesAddOne: QueryHandle<Pick<PaymentSettlement, 'routeName' | 'messengerId' | 'type' | 'fromDate' | 'toDate' | 'shoppingRecords'>, ModelDocument<PaymentSettlement>>;
    paymentSettlementServicesGetAllWithPagination: QueryHandle<{
        paginateOptions?: PaginateOptions;
        query: GetAllPaymentSettlementArgs;
        sort?: string;
    }, PaginateResult<PaymentSettlement>>;
    paymentSettlementServicesGetAll: QueryHandle<{
        query: GetAllPaymentSettlementArgs;
        projection?: ProjectionType<PaymentSettlement>;
    }, Array<ModelDocument<PaymentSettlement>>>;
    paymentSettlementServicesGetOne: QueryHandle<{
        query: FilterQuery<PaymentSettlement>;
        projection?: ProjectionType<PaymentSettlement>;
    }, ModelDocument<PaymentSettlement> | null>;
    paymentSettlementServicesDeleteOne: QueryHandle<{
        query: FilterQuery<PaymentSettlement>;
    }, ModelDocument<PaymentSettlement> | null>;
    paymentSettlementServicesChangeToDone: QueryHandle<{
        paymentSettlementId: string | Schema.Types.ObjectId;
        settlementCode: string;
        changedToDoneBy: Schema.Types.ObjectId;
    }, ModelDocument<PaymentSettlement> | null>;
    getAllPaymentSettlementFilterQuery: (args: GetAllPaymentSettlementArgs) => FilterQuery<PaymentSettlement>;
    getShoppingRecordDto: (shoppingRecord: PaymentSettlementShoppingRecord) => PaymentSettlementShoppingRecordDto;
    paymentSettlementToDto: (data: Array<PaymentSettlement>) => Promise<Array<PaymentSettlementDto>>;
}
