import React, { useEffect } from "react";
import { X, FileText, ShieldCheck, Scale } from "lucide-react";

export default function LegalPolicyModal({ isOpen, initialTab = "terms", onClose }) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "legal", label: "Legal Notices", icon: Scale },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Scale size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight leading-none">
                Regaarder Legal & Compliance
              </h2>
              <span className="text-xs text-slate-500 font-medium">Last updated: September 2026</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation (Styled as slightly rounded rectangles with clean outlines) */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/70"
                }`}
              >
                <Icon size={14} strokeWidth={1.75} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-6 text-sm leading-relaxed text-slate-600 space-y-6">
          {activeTab === "terms" && <TermsOfServiceContent />}
          {activeTab === "privacy" && <PrivacyPolicyContent />}
          {activeTab === "legal" && <LegalNoticesContent />}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>© 2026 Regaarder Technologies Inc. All rights reserved.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function TermsOfServiceContent() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Summary of Terms</h3>
        <p className="text-xs text-slate-600">
          By accessing or using the Regaarder suite (Compose, Deck, Sheet, Room, Whiteboard, Schedule, Memory, and Tasks), 
          you agree to be bound by these Terms of Service. You retain full ownership of the documents, data, and content you produce.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. Acceptance of Terms & Eligibility</h4>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Regaarder unified productivity suite and associated cloud services. 
          By creating an account, accessing, or using any part of the service, you confirm that you are at least 13 years of age (or the minimum legal age in your jurisdiction) and agree to be bound by these Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Account Registration & Authentication Security</h4>
        <p>
          You may create an account using direct email credentials or authorized single sign-on (SSO) providers, including Google Sign-In and Sign in with Apple. 
          You are responsible for maintaining the confidentiality of your credentials and session authentication tokens. You agree to notify Regaarder immediately of any unauthorized access to your account.
        </p>
        <p className="text-xs text-slate-500">
          Accessing the platform through third-party identity providers is also governed by the respective terms of service of Google LLC and Apple Inc.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. Workspace Content & Intellectual Property</h4>
        <p>
          <strong>Your Content:</strong> You retain complete intellectual property rights and full ownership over all documents, presentations, spreadsheets, canvases, task lists, and other data you create or upload to Regaarder.
        </p>
        <p>
          <strong>Platform Rights:</strong> Regaarder and its licensors retain all right, title, and interest in and to the platform architecture, user interfaces, branding, software engines, and associated source code.
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
        <h4 className="font-semibold text-slate-900 text-sm">5. Subscriptions, Billing & Cancellation</h4>
        <p>
          Paid workspace tiers are billed in advance on a recurring monthly or annual basis. You may upgrade, downgrade, or cancel your subscription at any time via your workspace settings. Upon cancellation, your access will remain active until the end of your current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">6. Termination</h4>
        <p>
          You may terminate your account at any time. We reserve the right to suspend or terminate accounts that breach these Terms, engage in fraudulent behavior, or pose security risks to other platform users.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">7. Disclaimer of Warranties & Limitation of Liability</h4>
        <p>
          Regaarder is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. To the maximum extent permitted by applicable law, Regaarder Technologies Inc. shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.
        </p>
      </section>
    </div>
  );
}

function PrivacyPolicyContent() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Privacy Commitment</h3>
        <p className="text-xs text-slate-600">
          Your privacy is paramount. We do not sell your personal data. We do not use your private workspace documents, spreadsheets, or meetings to train foundational AI models without your explicit consent.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. Information We Collect</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>Account &amp; Identity Credentials:</strong> Name, email address, salted password hashes (never stored in plaintext), and session authentication tokens.
          </li>
          <li>
            <strong>Third-Party Sign-In (Google &amp; Apple OAuth):</strong> When you authenticate via Google Sign-In or Sign in with Apple, we receive your verified display name, email address, and unique provider subject identifier (UID). If you enable Apple&apos;s &quot;Hide My Email&quot;, we receive and store your anonymized relay address (<code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">@privaterelay.appleid.com</code>). We never access, request, or store your external Google or Apple passwords.
          </li>
          <li>
            <strong>Local Device Session Storage:</strong> Authentication tokens (<code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">rc.token</code>) and cached user profiles (<code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">rc.user</code>) are securely saved in your browser&apos;s <code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">localStorage</code> to maintain your session.
          </li>
          <li>
            <strong>Workspace Content:</strong> Documents, spreadsheets, presentations, whiteboard canvases, task entries, and uploaded assets necessary to render and sync your workspace.
          </li>
          <li>
            <strong>Technical &amp; Telemetry Data:</strong> Browser type, operating system, diagnostic logs, and session telemetry used strictly to maintain platform reliability.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Authentication Infrastructure &amp; Third-Party Sub-Processors</h4>
        <p>
          We partner with industry-standard identity and cloud providers to power seamless authentication:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>Google Firebase Authentication (Google LLC):</strong> Facilitates identity token issuance, token verification, and Google OAuth integration in compliance with Google Cloud privacy standards and Google API Terms.
          </li>
          <li>
            <strong>Sign in with Apple (Apple Inc.):</strong> Facilitates privacy-first OAuth tokens and Apple Private Relay email obfuscation in compliance with Apple Developer Program terms.
          </li>
          <li>
            <strong>Google User Data Limited Use Policy:</strong> Regaarder&apos;s use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900 font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements. We do not sell your Google account data or transfer it to third-party advertising networks.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. AI Processing &amp; Document Confidentiality</h4>
        <p>
          When you interact with AI features in Regaarder (such as Compose AI, Deck generation, or smart formulas), your prompt and contextual workspace excerpts are transmitted securely via encrypted channels. Contextual data is processed ephemerally and is never shared with unauthorized third parties or used to train third-party public AI models.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. Data Security, Storage &amp; Synchronization</h4>
        <p>
          We employ a hybrid architecture combining local-first offline resilience with cloud synchronization:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Data in transit is encrypted using modern TLS 1.3 protocols.</li>
          <li>Real-time collaborative channels utilize token-authorized WebSockets (<code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/yjs</code>).</li>
          <li>Persistent database storage utilizes AES-256 encryption at rest.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Data Subject Rights &amp; Granular Storage Controls (GDPR &amp; CCPA)</h4>
        <p>
          Regardless of your jurisdiction, Regaarder provides comprehensive, user-directed privacy controls directly inside <strong>Settings &gt; Storage &amp; Data Management</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Granular Device &amp; Cloud Erasure (GDPR Art. 17 - &quot;Right to be Forgotten&quot;):</strong> Users may selectively purge specific categories of data at any time—including workspace documents, AI conversation logs, extracted memories, personal profile information, API credentials, and local caches—without delay.</li>
          <li><strong>Immediate Session Token Purge:</strong> Clicking &quot;Sign Out&quot; immediately clears your active authentication tokens (<code className="text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">rc.token</code>) and cached profile from your local browser storage.</li>
          <li><strong>Data Portability &amp; Archive Export (GDPR Art. 20):</strong> Export your complete structured data archive in machine-readable JSON format with a single click before initiating any data deletion.</li>
          <li><strong>Right to Access &amp; Inspection (GDPR Art. 15):</strong> Inspect exact real-time byte sizes and item counts stored locally across each functional category.</li>
          <li><strong>Right to Rectification:</strong> Instantly update, edit, or replace profile details and configuration secrets across the platform.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">6. Contact Our Data Protection Team</h4>
        <p>
          If you have questions regarding our privacy practices, automated erasure mechanics, or wish to exercise statutory rights, please reach out to <span className="font-medium text-slate-900">privacy@regaarder.com</span>.
        </p>
      </section>
    </div>
  );
}

function LegalNoticesContent() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-1">Corporate & Regulatory Information</h3>
        <p className="text-xs text-slate-600">
          Regaarder Technologies Inc. operates in compliance with international commercial and digital service regulations.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">1. Corporate Identity</h4>
        <p>
          Regaarder Technologies Inc.<br />
          548 Market St, Suite 72100<br />
          San Francisco, CA 94104, USA<br />
          Inquiries: <span className="font-medium text-slate-900">legal@regaarder.com</span>
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Trademark & Copyright Notice</h4>
        <p>
          &quot;Regaarder&quot;, the Regaarder icon and monogram, and associated product names (Compose, Deck, Sheet, Room, Whiteboard, Schedule, Memory, Tasks) are trademarks or registered trademarks of Regaarder Technologies Inc. All other trademarks belong to their respective owners.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. DMCA & Copyright Infringement Policy</h4>
        <p>
          We respect the intellectual property of others. If you believe your copyrighted work has been copied or stored in a manner that constitutes infringement, please submit a formal DMCA notice to <span className="font-medium text-slate-900">dmca@regaarder.com</span> including proof of ownership and the exact URL or identifier of the material.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. Open Source Software Acknowledgements</h4>
        <p>
          Regaarder is built with the support of the open-source community. Key open-source libraries and frameworks include React, Lucide Icons, Yjs, KaTeX, Firebase Client SDK (Apache 2.0), Firebase Admin SDK (Apache 2.0), and standard web platform specifications. Complete license texts and attributions are available in our technical disclosures index.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Responsible Vulnerability Disclosure</h4>
        <p>
          We welcome vulnerability reports from the security research community. If you discover a potential vulnerability, please email <span className="font-medium text-slate-900">security@regaarder.com</span>. We review and remediate confirmed issues promptly.
        </p>
      </section>
    </div>
  );
}
