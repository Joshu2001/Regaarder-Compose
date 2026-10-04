/**
 * Regaarder Creem.io Product Catalog Mappings (Live Production)
 *
 * Mapped to your approved live products in Creem:
 * - Starter: prod_6qxSvrvGFuyREofCABrsuI ($115/yr)
 * - Pro: prod_5qHQeqBCxg3Hdq8z5inqmH ($29/mo)
 * - Advanced: prod_7LQFed4vGZNLqvBN20sSHu ($79/mo)
 * - 3-Year Executive: prod_7hQ8dJClk0geCOlIeLaAvo ($199 once)
 * - Lifetime Founder: prod_5v93SRjTgSlVIvk4tJfdHe ($349 once)
 */

export const CREEM_CATALOG = {
  starter: {
    productId: 'prod_6qxSvrvGFuyREofCABrsuI',
    billing: 'year',
    price: '$115',
    period: '/year'
  },
  pro: {
    productId: 'prod_5qHQeqBCxg3Hdq8z5inqmH',
    billing: 'month',
    price: '$29',
    period: '/month'
  },
  advanced: {
    productId: 'prod_7LQFed4vGZNLqvBN20sSHu',
    billing: 'month',
    price: '$79',
    period: '/month'
  },
  threeYear: {
    productId: 'prod_7hQ8dJClk0geCOlIeLaAvo',
    billing: 'once',
    price: '$199',
    period: 'one-time'
  },
  lifetime: {
    productId: 'prod_5v93SRjTgSlVIvk4tJfdHe',
    billing: 'once',
    price: '$349',
    period: 'one-time'
  }
};

/**
 * @typedef {Object} Tier
 * @property {'Starter' | 'Pro' | 'Advanced'} name
 * @property {string} description
 * @property {string[]} features
 * @property {string} creemProductId
 * @property {{ month: string, year: string }} fallbackPrice
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
    creemProductId: 'prod_6qxSvrvGFuyREofCABrsuI',
    fallbackPrice: {
      month: '$12',
      year: '$115',
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
      'Full intelligence updates and priority support',
    ],
    creemProductId: 'prod_5qHQeqBCxg3Hdq8z5inqmH',
    fallbackPrice: {
      month: '$29',
      year: '$278',
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
    creemProductId: 'prod_7LQFed4vGZNLqvBN20sSHu',
    fallbackPrice: {
      month: '$79',
      year: '$758',
    },
    featured: false,
  },
];
