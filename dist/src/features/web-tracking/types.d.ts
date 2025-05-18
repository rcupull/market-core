import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity, Currency } from '../../types/general';
import { PaymentWay } from '../payment/types';
export declare const webTrackingTypeRecord: {
    'page.signIn.phone.focus': string;
    'page.signIn.password.focus': string;
    'page.signIn.button.click': string;
    'page.signUp.name.focus': string;
    'page.signUp.phone.focus': string;
    'page.signUp.password.focus': string;
    'page.signUp.button.click': string;
    'auth.signOut.success': string;
    'auth.signOut.failed': string;
    'auth.signIn.success': string;
    'auth.signIn.failed': string;
    'auth.singUp.success': string;
    'auth.singUp.failed': string;
    'page.main.productCard.click': string;
    'page.main.addToCart.click': string;
    'page.main.search.focus': string;
    'page.main.search.call': string;
    'page.business.productCard.click': string;
    'page.business.addToCart.click': string;
    'page.business.search.focus': string;
    'page.business.search.call': string;
    'page.product.addToCart.click': string;
    'page.product.related.productCard.click': string;
    'page.product.related.addToCart.click': string;
    'navbar.logo.click': string;
    'navbar.cart.click': string;
    'navbar.menu.click': string;
    'navbar.toShoppingPage.click': string;
    'navbar.toDeliveryPage.click': string;
    'cart.menu.buy.click': string;
    'cart.menu.removeAll.click': string;
    'page.cart.nextToPay.click': string;
    'page.cart.payment.payWhenPickUp.click': string;
    'page.cart.payment.paymentWaySelect': string;
    'page.cart.payment.notify.click': string;
    'page.view': string;
    'error.render': string;
};
export type WebTrackingType = keyof typeof webTrackingTypeRecord;
export interface WebTrackingData extends AnyRecord {
    pathname?: string;
    paymentWay?: PaymentWay;
    currency?: Currency;
    productId?: string;
    routeName?: string;
}
export interface WebTracking extends BaseIdentity {
    type: WebTrackingType;
    browserFingerprint: string;
    hostname: string;
    userId?: Schema.Types.ObjectId;
    data?: WebTrackingData;
}
export interface TrackCounter {
    date: string;
    count: number;
}
