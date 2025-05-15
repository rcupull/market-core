import { Schema } from 'mongoose';
import { AnyRecord, BaseIdentity, Currency } from '../../types/general';
import { PaymentWay } from '../payment/types';

export const wt = {
  // Sign In
  'page.signIn.phone.focus': 'page.signIn.phone.focus',
  'page.signIn.password.focus': 'page.signIn.password.focus',
  'page.signIn.button.click': 'page.signIn.button.click',

  // Sign Up
  'page.signUp.name.focus': 'page.signUp.name.focus',
  'page.signUp.phone.focus': 'page.signUp.phone.focus',
  'page.signUp.password.focus': 'page.signUp.password.focus',
  'page.signUp.button.click': 'page.signUp.button.click',

  // Auth
  'auth.signOut.success': 'auth.signOut.success',
  'auth.signOut.failed': 'auth.signOut.failed',
  'auth.signIn.success': 'auth.signIn.success',
  'auth.signIn.failed': 'auth.signIn.failed',
  'auth.singUp.success': 'auth.singUp.success',
  'auth.singUp.failed': 'auth.singUp.failed',

  // Main Page
  'page.main.productCard.click': 'page.main.productCard.click',
  'page.main.addToCart.click': 'page.main.addToCart.click',
  'page.main.search.focus': 'page.main.search.focus',
  'page.main.search.call': 'page.main.search.call',

  // Business Page
  'page.business.productCard.click': 'page.business.productCard.click',
  'page.business.addToCart.click': 'page.business.addToCart.click',
  'page.business.search.focus': 'page.business.search.focus',
  'page.business.search.call': 'page.business.search.call',

  // Product Page
  'page.product.addToCart.click': 'page.product.addToCart.click',
  'page.product.related.productCard.click': 'page.product.related.productCard.click',
  'page.product.related.addToCart.click': 'page.product.related.addToCart.click',

  // Navbar
  'navbar.logo.click': 'navbar.logo.click',
  'navbar.cart.click': 'navbar.cart.click',
  'navbar.menu.click': 'navbar.menu.click',
  'navbar.toShoppingPage.click': 'navbar.toShoppingPage.click',
  'navbar.toDeliveryPage.click': 'navbar.toDeliveryPage.click',

  // Cart Menu
  'cart.menu.buy.click': 'cart.menu.buy.click',
  'cart.menu.removeAll.click': 'cart.menu.removeAll.click',

  // Cart Page
  'page.cart.nextToPay.click': 'page.cart.nextToPay.click',
  'page.cart.payment.payWhenPickUp.click': 'page.cart.payment.payWhenPickUp.click',
  'page.cart.payment.paymentWaySelect': 'page.cart.payment.paymentWaySelect',
  'page.cart.payment.notify.click': 'page.cart.payment.notify.click',

  // General
  'page.view': 'page.view',
  'error.render': 'error.render'
};

export type WebTrackingType = keyof typeof wt;

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
