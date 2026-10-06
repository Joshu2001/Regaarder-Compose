/**
 * Regaarder Ledger — Deterministic Accounting Substrate Engine
 * 
 * Rules:
 * - Deterministic calculations: No LLM arithmetic or freeform balances.
 * - Double-entry invariant: Total Debits === Total Credits (Δ = $0.00) strictly enforced.
 * - OCR Grounding: Physical bounding boxes and SHA-256 fingerprint verification.
 */

export const CHART_OF_ACCOUNTS = [
  { code: '1010', name: 'Operating Cash (Silicon Valley Bank)', type: 'Asset' },
  { code: '1020', name: 'Corporate Visa Card Clearing', type: 'Asset' },
  { code: '1520', name: 'Tech & Hardware Equipment', type: 'Asset' },
  { code: '2000', name: 'Accounts Payable', type: 'Liability' },
  { code: '2200', name: 'Input Sales Tax / VAT Recoverable', type: 'Asset' },
  { code: '4000', name: 'SaaS Software Revenue', type: 'Revenue' },
  { code: '6010', name: 'Cloud Hosting & Compute Infrastructure', type: 'Expense' },
  { code: '6050', name: 'Payment Processing Fees', type: 'Expense' }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-aws-9812',
    reference: 'INV-2026-9812',
    vendor: 'Amazon Web Services Inc.',
    date: '2026-10-12',
    rawFileType: 'pdf',
    status: 'verified', // 'verified' | 'review' | 'processing'
    items: [
      { id: 'item-1', label: 'EC2 Elastic Compute Cloud Instances', amount: 2800.00, boundingBox: { top: 38, left: 10, width: 80, height: 12 } },
      { id: 'item-2', label: 'S3 Cloud Storage & Data Egress', amount: 350.00, boundingBox: { top: 52, left: 10, width: 80, height: 12 } }
    ],
    tax: { rate: '8.6%', amount: 270.50, jurisdiction: 'WA State DOR', boundingBox: { top: 66, left: 10, width: 80, height: 10 } },
    total: 3420.50,
    currency: 'USD',
    hash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    suggestedAccount: '6010',
    settlementAccount: '2000',
    notes: 'Direct debit cleared via SVB.'
  },
  {
    id: 'doc-apple-8921',
    reference: 'RCT-8921',
    vendor: 'Apple Store — Cupertino Park',
    date: '2026-10-14',
    rawFileType: 'png',
    status: 'review', // Needs human review for tax/asset capitalization
    items: [
      { id: 'item-1', label: 'iPad Pro 13-inch M4 Testing Hardware', amount: 1199.00, boundingBox: { top: 35, left: 12, width: 76, height: 14 } },
      { id: 'item-2', label: 'Apple Pencil Pro Active Stylus', amount: 100.00, boundingBox: { top: 51, left: 12, width: 76, height: 14 } }
    ],
    tax: { rate: '0.0%', amount: 0.00, jurisdiction: 'CA Tax Exempt Direct Demo', boundingBox: { top: 67, left: 12, width: 76, height: 10 } },
    total: 1299.00,
    currency: 'USD',
    hash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    suggestedAccount: '1520',
    settlementAccount: '1020',
    notes: 'Verify asset threshold: Capitalize as Hardware vs Expense as Office Supplies.'
  },
  {
    id: 'doc-stripe-491290',
    reference: 'TXN-491290',
    vendor: 'Stripe Platform Inc.',
    date: '2026-10-15',
    rawFileType: 'csv',
    status: 'verified',
    items: [
      { id: 'item-1', label: 'Gross Customer Subscriptions (Compose)', amount: 19000.00, boundingBox: { top: 30, left: 10, width: 80, height: 14 } },
      { id: 'item-2', label: 'Stripe Processing Fees (2.9% + 30¢)', amount: -550.00, boundingBox: { top: 48, left: 10, width: 80, height: 14 } }
    ],
    tax: { rate: '0.0%', amount: 0.00, jurisdiction: 'N/A', boundingBox: { top: 64, left: 10, width: 80, height: 10 } },
    total: 18450.00,
    currency: 'USD',
    hash: 'sha256-ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    suggestedAccount: '4000',
    settlementAccount: '1010',
    notes: 'Monthly merchant clearing batch matched to SVB statement.'
  }
];

export const INITIAL_JOURNAL_LINES = [
  // AWS Invariant Entry
  {
    id: 'j-1',
    docId: 'doc-aws-9812',
    date: '2026-10-12',
    accountCode: '6010',
    accountName: 'Cloud Hosting & Compute Infrastructure',
    description: 'EC2 & S3 compute nodes infrastructure',
    debit: 3150.00,
    credit: 0,
    ref: 'INV-2026-9812',
    status: 'verified'
  },
  {
    id: 'j-2',
    docId: 'doc-aws-9812',
    date: '2026-10-12',
    accountCode: '2200',
    accountName: 'Input Sales Tax / VAT Recoverable',
    description: 'WA State DOR 8.6% Tax',
    debit: 270.50,
    credit: 0,
    ref: 'INV-2026-9812',
    status: 'verified'
  },
  {
    id: 'j-3',
    docId: 'doc-aws-9812',
    date: '2026-10-12',
    accountCode: '2000',
    accountName: 'Accounts Payable',
    description: 'Net balance due to Amazon Web Services',
    debit: 0,
    credit: 3420.50,
    ref: 'INV-2026-9812',
    status: 'verified'
  },
  // Apple Hardware Entry
  {
    id: 'j-4',
    docId: 'doc-apple-8921',
    date: '2026-10-14',
    accountCode: '1520',
    accountName: 'Tech & Hardware Equipment',
    description: 'iPad Pro M4 + Pencil Pro Test Lab Kit',
    debit: 1299.00,
    credit: 0,
    ref: 'RCT-8921',
    status: 'review'
  },
  {
    id: 'j-5',
    docId: 'doc-apple-8921',
    date: '2026-10-14',
    accountCode: '1020',
    accountName: 'Corporate Visa Card Clearing',
    description: 'Visa ending in ••8201',
    debit: 0,
    credit: 1299.00,
    ref: 'RCT-8921',
    status: 'review'
  },
  // Stripe Settlement Entry
  {
    id: 'j-6',
    docId: 'doc-stripe-491290',
    date: '2026-10-15',
    accountCode: '1010',
    accountName: 'Operating Cash (Silicon Valley Bank)',
    description: 'Net merchant deposit via Stripe payout',
    debit: 18450.00,
    credit: 0,
    ref: 'TXN-491290',
    status: 'verified'
  },
  {
    id: 'j-7',
    docId: 'doc-stripe-491290',
    date: '2026-10-15',
    accountCode: '6050',
    accountName: 'Payment Processing Fees',
    description: 'Stripe gateway fees (2.9% + 30¢ interchange)',
    debit: 550.00,
    credit: 0,
    ref: 'TXN-491290',
    status: 'verified'
  },
  {
    id: 'j-8',
    docId: 'doc-stripe-491290',
    date: '2026-10-15',
    accountCode: '4000',
    accountName: 'SaaS Software Revenue',
    description: 'Gross recurring SaaS customer billing',
    debit: 0,
    credit: 19000.00,
    ref: 'TXN-491290',
    status: 'verified'
  }
];

export const INITIAL_BANK_FEED = [
  {
    id: 'tx-svb-1',
    date: '2026-10-12',
    description: 'AMAZON WEB SERVICES DIRECT DEBIT',
    amount: -3420.50,
    cleared: true,
    matchedDocId: 'doc-aws-9812',
    status: 'reconciled'
  },
  {
    id: 'tx-svb-2',
    date: '2026-10-14',
    description: 'APPLE STORE #R102 CUPERTINO',
    amount: -1299.00,
    cleared: true,
    matchedDocId: 'doc-apple-8921',
    status: 'pending_review'
  },
  {
    id: 'tx-svb-3',
    date: '2026-10-15',
    description: 'STRIPE PAYOUT MERCHANT SETTLEMENT',
    amount: 18450.00,
    cleared: true,
    matchedDocId: 'doc-stripe-491290',
    status: 'reconciled'
  }
];

/**
 * Deterministic Arithmetic Verification:
 * Validates that sum(items) + tax === total.
 */
export function validateArithmetic(items, taxAmount, totalAmount) {
  const sumItems = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const calculatedTotal = Number((sumItems + (Number(taxAmount) || 0)).toFixed(2));
  const diff = Math.abs(calculatedTotal - Number(totalAmount));
  return {
    isValid: diff < 0.005,
    calculatedTotal,
    sumItems,
    diff
  };
}

/**
 * Deterministic Double-Entry Invariance Assertion:
 * Validates that sum(Debits) === sum(Credits).
 */
export function validateDoubleEntry(journalLines) {
  const totalDebit = journalLines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = journalLines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const variance = Math.abs(Number((totalDebit - totalCredit).toFixed(2)));
  return {
    isBalanced: variance < 0.005,
    totalDebit: Number(totalDebit.toFixed(2)),
    totalCredit: Number(totalCredit.toFixed(2)),
    variance
  };
}

/**
 * Format currency in executive US standard
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}
