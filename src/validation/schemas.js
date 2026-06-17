const { z } = require('zod');

// Shared building blocks ----------------------------------------------------

// Stellar public ("G...") and secret ("S...") keys are 56-char base32 strings.
const stellarPublicKey = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar public key');
const stellarSecretKey = z
  .string()
  .regex(/^S[A-Z2-7]{55}$/, 'Invalid Stellar secret key');

const uuid = z.string().uuid();

const isoDateTime = z.iso.datetime({ offset: true });

const pagination = {
  cursor: isoDateTime.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

const VALID_CATEGORIES = [
  'electronics', 'fashion', 'home', 'beauty',
  'sports', 'food', 'automotive', 'industrial', 'other',
];

// Accept any casing, normalise to lowercase, then enforce the enum.
const category = z
  .string()
  .transform((s) => s.toLowerCase())
  .pipe(z.enum(VALID_CATEGORIES));

// A monetary amount: finite, non-negative, with a sane upper bound to block
// absurd values (Infinity/NaN are rejected by .finite()).
const price = z.coerce.number().finite().positive().max(1_000_000_000);

// posts ---------------------------------------------------------------------

const PostsQuerySchema = z.object({
  ...pagination,
});

const CreatePostSchema = z.object({
  user_id: uuid,
  text: z.string().min(1).max(2000),
  image_url: z.string().url().max(2048).optional(),
  tagged_listing_id: uuid.optional(),
});

// listings ------------------------------------------------------------------

const ListingsQuerySchema = z
  .object({
    category: category.optional(),
    search: z.string().max(100).optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    ...pagination,
  })
  .refine(
    (d) => d.minPrice === undefined || d.maxPrice === undefined || d.minPrice <= d.maxPrice,
    { message: 'minPrice must be ≤ maxPrice', path: ['minPrice'] },
  );

const CreateListingSchema = z.object({
  seller_id: uuid,
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price,
  category: category.optional(),
  moq: z.coerce.number().int().positive().optional(),
  ship_days: z.coerce.number().int().nonnegative().max(365).optional(),
  image_url: z.string().url().max(2048).optional(),
});

// chat ----------------------------------------------------------------------

const ConversationsQuerySchema = z.object({
  userId: uuid,
});

const CreateConversationSchema = z.object({
  listing_id: uuid,
  buyer_id: uuid,
  seller_id: uuid,
});

const MessagesQuerySchema = z.object({
  conversationId: uuid,
});

const CreateMessageSchema = z.object({
  conversation_id: uuid,
  sender_id: uuid,
  type: z.enum(['text', 'offer', 'system']).optional(),
  body: z.string().min(1).max(5000),
  offer_amount: z.coerce.number().finite().nonnegative().optional(),
});

// deals ---------------------------------------------------------------------

const DealsQuerySchema = z.object({
  userId: stellarPublicKey,
});

const CreateDealSchema = z.object({
  buyerSecret: stellarSecretKey,
  seller: stellarPublicKey,
  amount: price,
  description: z.string().min(1).max(2000),
});

// users ---------------------------------------------------------------------

const CreateUserSchema = z.object({
  wallet: stellarPublicKey,
  handle: z.string().min(1).max(50).optional(),
  display_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().max(2048).optional(),
});

const RoleSchema = z.object({
  role: z.enum(['buyer', 'seller', 'both']),
});

module.exports = {
  VALID_CATEGORIES,
  PostsQuerySchema,
  CreatePostSchema,
  ListingsQuerySchema,
  CreateListingSchema,
  ConversationsQuerySchema,
  CreateConversationSchema,
  MessagesQuerySchema,
  CreateMessageSchema,
  DealsQuerySchema,
  CreateDealSchema,
  CreateUserSchema,
  RoleSchema,
};
