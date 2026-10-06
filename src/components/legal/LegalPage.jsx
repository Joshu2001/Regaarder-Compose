import React from 'react';
import { FileText, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import RegaarderBrandIcon from '../RegaarderBrandIcon';

// ─── Shared page shell ────────────────────────────────────────────────────────

function LegalPageShell({ icon: Icon, title, subtitle, children }) {
  return (
    <div
      className="fixed inset-0 overflow-y-auto z-50 bg-[#fafafa] dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 [scrollbar-gutter:stable]"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Workspace</span>
          </a>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-[#18181b] border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
            <RegaarderBrandIcon size={13} className="text-zinc-900 dark:text-zinc-100" />
            <span className="font-semibold tracking-tight text-[11px]">Regaarder Legal</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 sm:py-12">
        {/* Page title */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <Icon size={18} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Policy body */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xs px-6 sm:px-8 py-8 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-6">
          {children}
        </div>

        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-10 space-y-2">
          <p>
            Last updated: September 2026 · Questions? Contact{' '}
            <a href="mailto:legal@regaarder.com" className="underline hover:text-zinc-900 dark:hover:text-white font-medium">
              legal@regaarder.com
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] pt-1">
            <a href="/pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing & Plans</a>
            <span>•</span>
            <a href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/refund" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── /terms ──────────────────────────────────────────────────────────────────

export function TermsPage() {
  return (
    <LegalPageShell
      icon={FileText}
      title="Terms of Service"
      subtitle="Governs your access to and use of the Regaarder suite"
    >
      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-1">Summary</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          By accessing or using the Regaarder suite (Compose, Deck, Sheet, Room, Whiteboard, Schedule,
          Memory, and Tasks), you agree to be bound by these Terms. You retain full ownership of all
          documents, data, and content you produce.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">1. Acceptance of Terms &amp; Eligibility</h4>
        <p>
          These Terms of Service govern your access to and use of the Regaarder unified productivity
          suite and associated cloud services. By creating an account, accessing, or using any part of
          the service, you confirm that you are at least 13 years of age (or the minimum legal age in
          your jurisdiction) and agree to be bound by these Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">2. Account Registration &amp; Authentication Security</h4>
        <p>
          You may create an account using direct email credentials or authorized single sign-on (SSO)
          providers, including Google Sign-In and Sign in with Apple. You are responsible for
          maintaining the confidentiality of your credentials and session tokens. Notify Regaarder
          immediately of any unauthorized account access.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">3. Workspace Content &amp; Intellectual Property</h4>
        <p>
          <strong>Your Content:</strong> You retain complete intellectual property rights over all
          documents, presentations, spreadsheets, canvases, task lists, and data you create or upload.
        </p>
        <p>
          <strong>Platform Rights:</strong> Regaarder and its licensors retain all rights in and to the
          platform architecture, user interfaces, branding, software engines, and associated source code.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">4. Acceptable Use Policy</h4>
        <p>You agree not to misuse Regaarder. Prohibited actions include:</p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>Reverse engineering, decompiling, or attempting to derive source code from any platform component.</li>
          <li>Distributing malware, malicious code, or exploiting security vulnerabilities.</li>
          <li>Using automated systems or bots to access or harvest data without express authorization.</li>
          <li>Engaging in unlawful, infringing, fraudulent, defamatory, or harassing conduct.</li>
          <li>Generating harmful, abusive, sexually explicit, hateful, or non-consensual AI content via our synthesis models.</li>
          <li>Using our AI models to build competitive foundational models or to circumvent safety guardrails and moderation filters.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">5. Subscriptions, Billing &amp; Cancellation</h4>
        <p>
          Paid workspace tiers are billed in advance on a recurring monthly or annual basis. You may
          upgrade, downgrade, or cancel at any time via your workspace settings. Upon cancellation,
          access remains active until the end of your current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">6. Termination</h4>
        <p>
          You may terminate your account at any time. We reserve the right to suspend or terminate
          accounts that breach these Terms, engage in fraudulent behavior, or pose security risks to
          other users.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">7. Disclaimer of Warranties &amp; Limitation of Liability</h4>
        <p>
          Regaarder is provided "as is" and "as available" without warranties of any kind. To the
          maximum extent permitted by applicable law, Regaarder Technologies Inc. shall not be liable
          for any indirect, incidental, special, or consequential damages resulting from your use of
          the service.
        </p>
      </section>
    </LegalPageShell>
  );
}

// ─── /privacy ────────────────────────────────────────────────────────────────

export function PrivacyPage() {
  return (
    <LegalPageShell
      icon={ShieldCheck}
      title="Privacy Policy"
      subtitle="How Regaarder collects, uses, and protects your data"
    >
      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-1">Privacy Commitment</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Your privacy is paramount. We do not sell your personal data. We do not use your private
          workspace documents, spreadsheets, or meetings to train foundational AI models without your
          explicit consent.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">1. Information We Collect</h4>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
          <li><strong>Account &amp; Identity Credentials:</strong> Name, email address, salted password hashes (never stored in plaintext), and session authentication tokens.</li>
          <li><strong>Third-Party Sign-In (Google &amp; Apple OAuth):</strong> When you authenticate via Google or Apple, we receive your verified display name, email address, and unique provider UID. We never access your external passwords.</li>
          <li><strong>Local Device Session Storage:</strong> Authentication tokens and cached user profiles are saved in your browser's <code className="text-xs text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localStorage</code> to maintain your session.</li>
          <li><strong>Workspace Content:</strong> Documents, spreadsheets, presentations, canvases, task entries, and uploaded assets necessary to render and sync your workspace.</li>
          <li><strong>Technical &amp; Telemetry Data:</strong> Browser type, OS, diagnostic logs, and session telemetry used strictly to maintain platform reliability.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">2. Authentication Infrastructure &amp; Third-Party Sub-Processors</h4>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
          <li><strong>Google Firebase Authentication:</strong> Facilitates identity token issuance and Google OAuth integration in compliance with Google Cloud privacy standards.</li>
          <li><strong>Sign in with Apple (Apple Inc.):</strong> Facilitates privacy-first OAuth tokens and Apple Private Relay email obfuscation.</li>
          <li><strong>Google User Data Limited Use Policy:</strong> Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-950 dark:hover:text-white font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements. We do not sell your Google account data.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">3. AI Processing &amp; Document Confidentiality</h4>
        <p>
          When you interact with AI features, your prompt and contextual workspace excerpts are
          transmitted via encrypted channels, processed ephemerally, and are never shared with
          unauthorized third parties or used to train public AI models.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">4. Data Security, Storage &amp; Synchronization</h4>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>Data in transit is encrypted using TLS 1.3.</li>
          <li>Real-time collaborative channels use token-authorized WebSockets.</li>
          <li>Persistent database storage uses AES-256 encryption at rest.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">5. Data Subject Rights (GDPR &amp; CCPA)</h4>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
          <li><strong>Right to Erasure (GDPR Art. 17):</strong> Selectively purge specific categories of data at any time via Settings › Storage &amp; Data Management.</li>
          <li><strong>Data Portability (GDPR Art. 20):</strong> Export your complete structured data archive in JSON format.</li>
          <li><strong>Right to Access (GDPR Art. 15):</strong> Inspect exact real-time byte sizes and item counts stored locally.</li>
          <li><strong>Right to Rectification:</strong> Instantly update profile details and configuration secrets.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">6. Contact Our Data Protection Team</h4>
        <p>
          For privacy inquiries or to exercise statutory rights, contact{' '}
          <a href="mailto:privacy@regaarder.com" className="font-medium text-zinc-900 dark:text-zinc-100 underline">
            privacy@regaarder.com
          </a>.
        </p>
      </section>
    </LegalPageShell>
  );
}

// ─── /refund ─────────────────────────────────────────────────────────────────

export function RefundPage() {
  return (
    <LegalPageShell
      icon={RefreshCw}
      title="Refund Policy"
      subtitle="14-day money-back guarantee on all Regaarder subscriptions"
    >
      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-1">Refund &amp; Cancellation Commitment</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We want you to be completely satisfied with Regaarder. All subscriptions and licenses
          processed via our Merchant of Record, Creem.io, are backed by a transparent 14-day refund
          guarantee.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">1. 14-Day Money-Back Guarantee</h4>
        <p>
          If you are unsatisfied with your Regaarder subscription (Monthly or Annual) or one-time
          license purchase, you may request a full refund within 14 days of your initial transaction
          date. No questions asked.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">2. Free Trial Periods</h4>
        <p>
          Certain plans (such as Regaarder Workspace Pro) include a 7-day free trial. If you cancel
          before the 7-day trial period concludes, your payment method will not be charged.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">3. Cancellation Process</h4>
        <p>
          You can cancel at any time directly through your account dashboard under Workspace Settings ›
          Billing, or via the Creem customer portal. Upon cancellation, your access remains fully
          active until the end of your current billing cycle — no further charges will be processed.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-zinc-950 dark:text-white text-sm">4. How to Request a Refund</h4>
        <p>
          Contact our support desk at{' '}
          <a href="mailto:billing@regaarder.com" className="font-medium text-zinc-900 dark:text-zinc-100 underline">
            billing@regaarder.com
          </a>{' '}
          or{' '}
          <a href="mailto:support@regaarder.com" className="font-medium text-zinc-900 dark:text-zinc-100 underline">
            support@regaarder.com
          </a>{' '}
          with your account email and Creem transaction receipt number. Eligible refunds are
          processed within 3–5 business days to your original payment method.
        </p>
      </section>
    </LegalPageShell>
  );
}
