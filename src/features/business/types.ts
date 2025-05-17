import { Address, BankAccount, BaseIdentity, Currency, Image } from '../../types/general';
import { Schema } from 'mongoose';
import { PostType } from '../post/types';
import { User } from '../user/types';
import { Commissions } from '../../types/commision';

export type PostsLayoutSectionType = 'grid' | 'oneRowSlider';

export type BannerLayoutType = 'none' | 'static' | 'swipableClassic';
export type SearchLayoutType =
  | 'none'
  | 'left'
  | 'center'
  | 'right'
  | 'postCategories'
  | 'postCategoriesScrollable'
  | 'postCategoriesExcluded'
  | 'postCategoriesExcludedScrollable';

export type FooterLayoutType = 'none' | 'basic';

export interface PostsLayoutSection {
  _id: string;
  name: string;
  //
  showMobile?: boolean;
  showPC?: boolean;
  //
  postType: PostType;
  //
  hiddenName?: boolean;
  //
  searchLayout?: SearchLayoutType;
  //
  postCategoriesLabels?: Array<string>;
  //
  type: PostsLayoutSectionType;
  postCardLayout?: PostCardLayout;
}
export interface PostsLayout {
  sections?: Array<PostsLayoutSection>;
}

export type PostCardLayoutImages = 'static' | 'hoverZoom' | 'slider' | 'switch' | 'rounded';

export type PostCardSize = 'small' | 'medium' | 'long';
export type PostCardLayoutName = 'none' | 'basic';
export type PostCardLayoutPrice = 'none' | 'basic' | 'smallerCurrency' | 'usdCurrencySymbol';
export type PostCardLayoutDiscount = 'none' | 'savedPercent' | 'savedMoney';
export type PostLayoutShoppingMethod = 'none' | 'shoppingCart';

export type PostLayoutShoppingCart = 'none' | 'added_whatsApp';

export type PostCardLayoutMetaLayout = 'basic' | 'verticalCentered';

export interface PostCardLayout {
  images?: PostCardLayoutImages;
  size?: PostCardSize;
  metaLayout?: PostCardLayoutMetaLayout;
  name?: PostCardLayoutName;
  price?: PostCardLayoutPrice;
  discount?: PostCardLayoutDiscount;
  shoppingMethod?: PostLayoutShoppingMethod;
}

export interface BannerLayout {
  type: BannerLayoutType;
}

export interface SearchLayout {
  type: SearchLayoutType;
}

export interface FooterLayout {
  type: FooterLayoutType;
}

export interface BusinessLayouts {
  posts?: PostsLayout;
  footer?: FooterLayout;
  banner?: BannerLayout;
}

export interface PostCategory {
  label: string;
  hidden?: boolean;
}

export interface BusinessAboutUsPage {
  visible?: boolean;
  title?: string;
  description?: string; // checkeditor text
}

export interface BusinessSEO {
  title?: string;
  description?: string;
}

export enum BusinessNotificationFlags {
  NEW_SHOPPING = 'NEW_SHOPPING'
}

export enum DeliveryConfigType {
  NONE = 'NONE',
  FREE = 'FREE',
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL'
}

export interface DeliveryConfig {
  minPrice?: number;
  priceByKm?: number;
  type?: DeliveryConfigType;
}

export interface BusinessChecks {
  doneOnboarding?: boolean;
}

export enum BusinessType {
  /**
   * The busines controla y maneja todo los recursos de ventas y delivery
   * Solo utiliza la plataforma para darle visibilidad a los productos
   */
  BUSINESS_FULL = 'BUSINESS_FULL',
  /**
   * El business no controla nada de la plataforma, es un proveedor que solo
   * nos entrega su mercancia y el marketplace gestiona todo
   * : Stock, shopping y delivery
   */
  MARKET_FULL = 'MARKET_FULL',
  /**
   * El business controla el stock y las ventas y nos encarga la gestion del delivery
   */
  MARKET_DELIVERY = 'MARKET_DELIVERY'
}

export interface BusinessConfigBilling {
  name?: string;
  address?: Address;
  accountNumber?: string;
  bankNumber?: string;
  nit?: string;
  identityNumber: string;
}

export enum PostFormField {
  /**
   * optional fields of the new product form
   */
  CLOTHING_SIZES = 'CLOTHING_SIZES',
  COLORS = 'COLORS',
  DETAILS = 'DETAILS',
  DISCOUNT = 'DISCOUNT'
}

export interface Business extends BaseIdentity {
  name: string;
  routeName: string;
  createdBy: Schema.Types.ObjectId; // userId
  customCommissions?: boolean;
  commissions?: {
    products?: Commissions;
    delivery?: Commissions;
  };
  hidden?: boolean;
  bannerImages?: Array<Image>;
  logo?: Image;
  postCategories: Array<PostCategory>;
  socialLinks: {
    face?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  layouts?: BusinessLayouts;
  aboutUsPage?: BusinessAboutUsPage;
  phoneNumber?: string;
  notificationFlags?: Array<BusinessNotificationFlags>;
  shoppingMeta?: {
    termsAndConditions?: string;
  };
  postFormFields?: Array<PostFormField>;
  currency: Currency;
  seo?: BusinessSEO;
  addresses?: Array<Address>;
  deliveryConfig?: DeliveryConfig;
  favoritesUserIds?: Array<Schema.Types.ObjectId>;
  checks?: BusinessChecks;
  //
  bankAccountCUP?: BankAccount;
  bankAccountMLC?: BankAccount;
  businessType: BusinessType;
  billing?: BusinessConfigBilling;
  //
  allowedOnlyCUPinCash?: boolean;
}

export interface BusinessAdminDto extends Business {
  ownersData?: Array<Pick<User, 'name'>>;
  postCount?: number;
}
export interface BusinessDto extends Business {}

export interface BusinessSummary {
  _id: Business['_id'];
  deliveryConfig: Business['deliveryConfig'];
  name: Business['name'];
  routeName: Business['routeName'];
  //
  images: Array<Image>;
  bestDiscount: number; // percent
  salesAmount: number; // ammount
}
