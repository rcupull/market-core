import { z } from 'zod';
import { CommissionMode } from '../types/commision';
import { DeliveryConfigType } from '../services/business/types';
import { ObjectId } from 'mongodb';
import { validateStrongPassword } from './password';

export const MongoObjectIdSchema = z.string().refine((val) => ObjectId.isValid(val));

export const StrongPasswordSchema = z
  .string()
  .nonempty()
  .refine((val) => validateStrongPassword(val));

export const CommissionShape = z
  .object({
    mode: z.nativeEnum(CommissionMode),
    value: z.number()
  })
  .optional();

export const CommissionsShape = z
  .object({
    systemUse: CommissionShape,
    marketOperation: CommissionShape
  })
  .optional();

export const GeolocationShape = z.object({
  lat: z.number(),
  lon: z.number()
});

export const AddressShape = GeolocationShape.extend({
  name: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  countryCode: z.string().nullish(),
  municipality: z.string().nullish(),
  street: z.string().nullish(),
  streetBetweenFrom: z.string().nullish(),
  streetBetweenTo: z.string().nullish(),
  neighborhood: z.string().nullish(),
  number: z.number().nullish(),
  apartment: z.number().nullish(),
  postCode: z.string().nullish(),
  placeId: z.string().nullish()
});

export const PostPurshaseNotesShape = z.object({
  interestedByColor: z.string().nullish(),
  interestedByClothingSize: z.string().optional()
});

export const BankAccountShape = z.object({
  alias: z.string().nullish(),
  accountNumber: z.string().regex(/^\d+$/).nonempty(),
  confirmationPhoneNumber: z.string().regex(/^\d+$/).nonempty()
});

export const DeliveryConfigShape = z.object({
  minPrice: z.number().nullish(),
  priceByKm: z.number().nullish(),
  type: z.nativeEnum(DeliveryConfigType).optional()
});

export const ImageShape = z.object({
  src: z.string().nonempty(),
  width: z.number(),
  height: z.number(),
  href: z.string().optional()
});

export const PhoneShape = z.string().nonempty().regex(/^\d+$/);
export const DateShape = z.string().datetime();

export const SocialLinksShape = z.object({
  face: z.string().nullish(),
  instagram: z.string().nullish(),
  twitter: z.string().nullish(),
  linkedin: z.string().nullish(),
  youtube: z.string().optional()
});

const PostCardLayoutShape = z.object({
  images: z.enum(['static', 'hoverZoom', 'slider', 'switch', 'rounded']).nullish(),
  size: z.enum(['small', 'medium', 'long']).nullish(),
  metaLayout: z.enum(['basic', 'verticalCentered']).nullish(),
  name: z.enum(['none', 'basic']).nullish(),
  price: z.enum(['none', 'basic', 'smallerCurrency', 'usdCurrencySymbol']).nullish(),
  discount: z.enum(['none', 'savedPercent', 'savedMoney']).nullish(),
  shoppingMethod: z.enum(['none', 'shoppingCart']).optional()
});

const PostsLayoutSectionShape = z.object({
  _id: MongoObjectIdSchema,
  name: z.string().nonempty(),
  showMobile: z.boolean().optional(),
  showPC: z.boolean().optional(),
  postType: z.enum(['product', 'link']),
  hiddenName: z.boolean().optional(),
  searchLayout: z.enum([
    'none',
    'left',
    'center',
    'right',
    'postCategories',
    'postCategoriesScrollable',
    'postCategoriesExcluded',
    'postCategoriesExcludedScrollable'
  ]),
  PostCategoriesLabels: z.array(z.string()).nullish(),
  type: z.enum(['grid', 'oneRowSlider']),
  postCardLayout: PostCardLayoutShape.optional()
});

const PostsLayoutShape = z.object({
  sections: z.array(PostsLayoutSectionShape).optional()
});

const FooterLayoutShape = z.object({
  type: z.enum(['none', 'basic']).optional()
});

const BannerLayoutShape = z.object({
  type: z.enum(['none', 'static', 'swipableClassic']).optional()
});

export const BusinessLayoutsShape = z.object({
  posts: PostsLayoutShape.nullish(),
  footer: FooterLayoutShape.nullish(),
  banner: BannerLayoutShape.optional()
});

/**
 * * @description This shape is used to validate and transform the boolean query params in the request. As they usually get to the middleware as value = 'true' instead of value = true
 */
export const QueryBooleanSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  });

export const ArrayOrSingleSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]);
