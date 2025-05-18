import { GetAllPromoArgs, Promo, PromoDto } from './types';
import { PostServices } from '../post/services';
import { ModelCrudTemplate } from '../../utils/ModelCrudTemplate';
export declare class PromoServices extends ModelCrudTemplate<Promo, Pick<Promo, 'entityId' | 'entityType' | 'image' | 'name' | 'description'>, GetAllPromoArgs> {
    private readonly postServices;
    constructor(postServices: PostServices);
    getDtos: (promos: Array<Promo>) => Promise<Array<PromoDto>>;
}
