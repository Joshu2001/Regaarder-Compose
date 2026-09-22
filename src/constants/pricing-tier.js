/**
 * Regaarder Catalog Mappings (Sandbox vs. Live)
 */

export const PADDLE_CATALOG = {
  sandbox: {
    clientToken: 'test_27ec8ae3d57fef6a0e6eacea02a',
    starter: {
      productId: 'pro_01m34gy7w3wtwj0t5c0y5zfxbm',
      month: 'pri_01m34gy8ap05r0b2765mxq41yp',
      year: 'pri_01m34gy8yj6vbzg08c0ryj58jz',
    },
    pro: {
      productId: 'pro_01m34bez6ce9qy0h09883h68kf',
      month: 'pri_01m34gx9e3638ssw3ek0nkj2h5',
      year: 'pri_01m34gx9rb5kcnk0gjfbecr4bm',
    },
    team: {
      productId: 'pro_01m34bjj72dh2bsrnp7hs6hkar',
      month: 'pri_01m34gxxvn8n66snhrew1dnw8b',
      year: 'pri_01m34gxmge1ydf84c8yhb82a39',
    },
    threeYear: {
      productId: 'pro_01m34bnf3r364sbhjnrtjyq247',
      priceId: 'pri_01m34ctqhxmrgnp6azfmhg3z2m',
    },
    lifetime: {
      productId: 'pro_01m34bm3dbfdgdpcasy96ybv0w',
      priceId: 'pri_01m34c2fh4rm9bxtjt712va1me',
    },
  },
  production: {
    clientToken: 'live_aec8a6a238563dc3b3285972199',
    starter: {
      productId: 'pro_01m34kp449erszdzdvfzfwdewq',
      month: 'pri_01m34kp4hp79phbxgnzvhk4vea',
      year: 'pri_01m34kp50wwt5ymgdgtwa9dexg',
    },
    pro: {
      productId: 'pro_01m34kp5eg6bxrdx0ms74m3t5y',
      month: 'pri_01m34kp5s82mxs68rj1j91te9t',
      year: 'pri_01m34kp66mj70f88cr98tsbp3f',
    },
    team: {
      productId: 'pro_01m34kp6reyf1zpxevtf3hv0m9',
      month: 'pri_01m34kp73c6ppy1qc3qg3advep',
      year: 'pri_01m34kp7ej5njxmczsjk78q7g2',
    },
    threeYear: {
      productId: 'pro_01m34kp7vgb94h2nzdz85pyw0n',
      priceId: 'pri_01m34kp87das41zqm3ssj1rz9c',
    },
    lifetime: {
      productId: 'pro_01m34kp8pha7451yk65a6fbrsk',
      priceId: 'pri_01m34kp94bq3g0xzwpmpshxb8t',
    },
  },
};

const currentEnv = import.meta.env.VITE_PADDLE_ENV === 'production' ? 'production' : 'sandbox';
const activeCatalog = PADDLE_CATALOG[currentEnv];

/**
 * @typedef {Object} Tier
 * @property {'Starter' | 'Pro' | 'Advanced'} name
 * @property {string} description
 * @property {string[]} features
 * @property {{ month: string, year: string }} priceId
 * @property {boolean} [featured]
 */

/** @type {Tier[]} */
export const PricingTiers = [
  {
    name: 'Starter',
    description: 'Essential workspace intelligence for individual creators and professionals.',
    features: [
      'Single active executive workspace',
      'Unified timetable and document canvas',
      'Standard AI contextual actions',
      'Export to PDF, DOCX, and XLSX',
      'Community and email support',
    ],
    priceId: {
      month: import.meta.env.VITE_PADDLE_PRICE_STARTER_MONTH || activeCatalog.starter.month,
      year: import.meta.env.VITE_PADDLE_PRICE_STARTER_YEAR || activeCatalog.starter.year,
    },
    featured: false,
  },
  {
    name: 'Pro',
    description: 'Advanced productivity suite with full AI models, deep indexing, and priority throughput.',
    features: [
      'Unlimited workspaces and timeline indexing',
      'Circle AI Signature intelligence engine',
      'Real-time document diffing and version sync',
      'Priority inference compute and zero-queue queueing',
      'Purchasing power localized pricing',
      '7-day free trial on monthly and annual plans',
    ],
    priceId: {
      month: import.meta.env.VITE_PADDLE_PRICE_PRO_MONTH || activeCatalog.pro.month,
      year: import.meta.env.VITE_PADDLE_PRICE_PRO_YEAR || activeCatalog.pro.year,
    },
    featured: true,
  },
  {
    name: 'Advanced',
    description: 'Enterprise-grade orchestration for power users, leaders, and high-velocity workflows.',
    features: [
      'Everything in Pro plus unlimited memory indexing',
      'Custom slash commands and automation rules',
      'Dedicated high-throughput local & cloud AI fallback',
      'VIP concierge onboarding and 24/7 dedicated support',
      'Early access to experimental intelligence features',
    ],
    priceId: {
      month: import.meta.env.VITE_PADDLE_PRICE_ADVANCED_MONTH || activeCatalog.team.month,
      year: import.meta.env.VITE_PADDLE_PRICE_ADVANCED_YEAR || activeCatalog.team.year,
    },
    featured: false,
  },
];
