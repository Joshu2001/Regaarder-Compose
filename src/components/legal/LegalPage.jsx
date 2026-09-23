import React from 'react';
import { FileText, ShieldCheck, RefreshCw, Scale, ArrowLeft } from 'lucide-react';

// ─── Shared page shell ────────────────────────────────────────────────────────

function LegalPageShell({ icon: Icon, title, subtitle, children }) {
  return (
    <div
      className="fixed inset-0 overflow-y-auto z-50 bg-slate-50"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Regaarder
          </a>
          <span className="text-xs text-slate-400">© 2026 Regaarder Technologies Inc.</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Policy body */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-8 text-sm leading-relaxed text-slate-600 space-y-6">
          {children}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Last updated: September 2026 · Questions? Contact{' '}
          <a href="mailto:legal@regaarder.com" className="underline hover:text-slate-700">
            legal@regaarder.com
          </a>
        </p>
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
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Summary</h3>
        <p className="text-xs text-slate-600">
          By accessing or using the Regaarder suite (Compose, Deck, Sheet, Room, Whiteboard, Schedule,
          Memory, and Tasks), you agree to be bound by these Terms. You retain full ownership of all
          documents, data, and content you produce.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. Acceptance of Terms &amp; Eligibility</h4>
        <p>
          These Terms of Service govern your access to and use of the Regaarder unified productivity
          suite and associated cloud services. By creating an account, accessing, or using any part of
          the service, you confirm that you are at least 13 years of age (or the minimum legal age in
          your jurisdiction) and agree to be bound by these Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Account Registration &amp; Authentication Security</h4>
        <p>
          You may create an account using direct email credentials or authorized single sign-on (SSO)
          providers, including Google Sign-In and Sign in with Apple. You are responsible for
          maintaining the confidentiality of your credentials and session tokens. Notify Regaarder
          immediately of any unauthorized account access.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. Workspace Content &amp; Intellectual Property</h4>
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
        <h4 className="font-semibold text-slate-900 text-sm">4. Acceptable Use Policy</h4>
        <p>You agree not to misuse Regaarder. Prohibited actions include:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Reverse engineering, decompiling, or attempting to derive source code from any platform component.</li>
          <li>Distributing malware, malicious code, or exploiting security vulnerabilities.</li>
          <li>Using automated systems or bots to access or harvest data without express authorization.</li>
          <li>Engaging in unlawful, infringing, fraudulent, or harassing conduct.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Subscriptions, Billing &amp; Cancellation</h4>
        <p>
          Paid workspace tiers are billed in advance on a recurring monthly or annual basis. You may
          upgrade, downgrade, or cancel at any time via your workspace settings. Upon cancellation,
          access remains active until the end of your current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">6. Termination</h4>
        <p>
          You may terminate your account at any time. We reserve the right to suspend or terminate
          accounts that breach these Terms, engage in fraudulent behavior, or pose security risks to
          other users.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">7. Disclaimer of Warranties &amp; Limitation of Liability</h4>
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
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Privacy Commitment</h3>
        <p className="text-xs text-slate-600">
          Your privacy is paramount. We do not sell your personal data. We do not use your private
          workspace documents, spreadsheets, or meetings to train foundational AI models without your
          explicit consent.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. Information We Collect</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Account &amp; Identity Credentials:</strong> Name, email address, salted password hashes (never stored in plaintext), and session authentication tokens.</li>
          <li><strong>Third-Party Sign-In (Google &amp; Apple OAuth):</strong> When you authenticate via Google or Apple, we receive your verified display name, email address, and unique provider UID. We never access your external passwords.</li>
          <li><strong>Local Device Session Storage:</strong> Authentication tokens and cached user profiles are saved in your browser's <code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">localStorage</code> to maintain your session.</li>
          <li><strong>Workspace Content:</strong> Documents, spreadsheets, presentations, canvases, task entries, and uploaded assets necessary to render and sync your workspace.</li>
          <li><strong>Technical &amp; Telemetry Data:</strong> Browser type, OS, diagnostic logs, and session telemetry used strictly to maintain platform reliability.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Authentication Infrastructure &amp; Third-Party Sub-Processors</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Google Firebase Authentication:</strong> Facilitates identity token issuance and Google OAuth integration in compliance with Google Cloud privacy standards.</li>
          <li><strong>Sign in with Apple (Apple Inc.):</strong> Facilitates privacy-first OAuth tokens and Apple Private Relay email obfuscation.</li>
          <li><strong>Google User Data Limited Use Policy:</strong> Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900 font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements. We do not sell your Google account data.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. AI Processing &amp; Document Confidentiality</h4>
        <p>
          When you interact with AI features, your prompt and contextual workspace excerpts are
          transmitted via encrypted channels, processed ephemerally, and are never shared with
          unauthorized third parties or used to train public AI models.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. Data Security, Storage &amp; Synchronization</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Data in transit is encrypted using TLS 1.3.</li>
          <li>Real-time collaborative channels use token-authorized WebSockets.</li>
          <li>Persistent database storage uses AES-256 encryption at rest.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Data Subject Rights (GDPR &amp; CCPA)</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Right to Erasure (GDPR Art. 17):</strong> Selectively purge specific categories of data at any time via Settings › Storage &amp; Data Management.</li>
          <li><strong>Data Portability (GDPR Art. 20):</strong> Export your complete structured data archive in JSON format.</li>
          <li><strong>Right to Access (GDPR Art. 15):</strong> Inspect exact real-time byte sizes and item counts stored locally.</li>
          <li><strong>Right to Rectification:</strong> Instantly update profile details and configuration secrets.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">6. Contact Our Data Protection Team</h4>
        <p>
          For privacy inquiries or to exercise statutory rights, contact{' '}
          <a href="mailto:privacy@regaarder.com" className="font-medium text-slate-900 underline">
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
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Refund &amp; Cancellation Commitment</h3>
        <p className="text-xs text-slate-600">
          We want you to be completely satisfied with Regaarder. All subscriptions and licenses
          processed via our Merchant of Record, Paddle, are backed by a transparent 14-day refund
          guarantee.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. 14-Day Money-Back Guarantee</h4>
        <p>
          If you are unsatisfied with your Regaarder subscription (Monthly or Annual) or one-time
          license purchase, you may request a full refund within 14 days of your initial transaction
          date. No questions asked.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Free Trial Periods</h4>
        <p>
          Certain plans (such as Regaarder Workspace Pro) include a 7-day free trial. If you cancel
          before the 7-day trial period concludes, your payment method will not be charged.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. Cancellation Process</h4>
        <p>
          You can cancel at any time directly through your account dashboard under Workspace Settings ›
          Billing, or via the Paddle customer portal. Upon cancellation, your access remains fully
          active until the end of your current billing cycle — no further charges will be processed.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. How to Request a Refund</h4>
        <p>
          Contact our support desk at{' '}
          <a href="mailto:billing@regaarder.com" className="font-medium text-slate-900 underline">
            billing@regaarder.com
          </a>{' '}
          or{' '}
          <a href="mailto:support@regaarder.com" className="font-medium text-slate-900 underline">
            support@regaarder.com
          </a>{' '}
          with your account email and Paddle transaction receipt number. Eligible refunds are
          processed within 3–5 business days to your original payment method.
        </p>
      </section>
    </LegalPageShell>
  );
}
