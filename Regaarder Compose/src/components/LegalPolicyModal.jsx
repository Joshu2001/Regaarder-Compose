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
              <span className="text-xs text-slate-500 font-medium">Last updated: May 2026</span>
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
        <h4 className="font-semibold text-slate-900 text-sm">1. Acceptance of Terms</h4>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Regaarder unified productivity suite and associated services. 
          By creating an account, accessing, or using any part of the service, you confirm that you have read, understood, and agreed to be bound by these Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. Workspace Content & Intellectual Property</h4>
        <p>
          <strong>Your Content:</strong> You retain complete intellectual property rights and full ownership over all documents, presentations, spreadsheets, canvases, task lists, and other data you create or upload to Regaarder.
        </p>
        <p>
          <strong>Platform Rights:</strong> Regaarder and its licensors retain all right, title, and interest in and to the platform architecture, user interfaces, branding, software engines, and associated source code.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. Acceptable Use Policy</h4>
        <p>You agree not to misuse Regaarder. Prohibited actions include:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Reverse engineering, decompiling, or attempting to derive source code from any platform component.</li>
          <li>Distributing malware, malicious code, or exploiting security vulnerabilities.</li>
          <li>Using automated systems or bots to access or harvest data without express authorization.</li>
          <li>Engaging in unlawful, infringing, fraudulent, or harassing conduct.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. Subscriptions, Billing & Cancellation</h4>
        <p>
          Paid workspace tiers are billed in advance on a recurring monthly or annual basis. You may upgrade, downgrade, or cancel your subscription at any time via your workspace settings. Upon cancellation, your access will remain active until the end of your current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Termination</h4>
        <p>
          You may terminate your account at any time. We reserve the right to suspend or terminate accounts that breach these Terms, engage in fraudulent behavior, or pose security risks to other platform users.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">6. Disclaimer of Warranties & Limitation of Liability</h4>
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
          <li><strong>Account Information:</strong> Name, email address, workspace profile information, and authentication credentials.</li>
          <li><strong>Workspace Content:</strong> Documents, spreadsheets, presentations, whiteboard canvases, task entries, and uploaded assets necessary to render your workspace.</li>
          <li><strong>Technical & Telemetry Data:</strong> Browser type, operating system, diagnostic logs, and session telemetry used to ensure platform reliability.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">2. AI Processing & Document Confidentiality</h4>
        <p>
          When you interact with AI features in Regaarder (such as Compose AI, Deck generation, or smart formulas), your prompt and contextual workspace excerpts are transmitted securely via encrypted channels. Contextual data is processed ephemerally and is never shared with unauthorized third parties or used to train third-party public AI models.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">3. Data Security & Storage</h4>
        <p>
          We employ industry-standard encryption protocols (TLS 1.3 in transit and AES-256 at rest) to safeguard your data. Multi-region redundancy and regular automated security audits protect workspace integrity.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">4. Data Subject Rights & Granular Storage Controls (GDPR & CCPA)</h4>
        <p>
          Regardless of your jurisdiction, Regaarder provides comprehensive, user-directed privacy controls directly inside <strong>Settings &gt; Storage &amp; Data Management</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Granular Device &amp; Cloud Erasure (GDPR Art. 17 - &quot;Right to be Forgotten&quot;):</strong> Users may selectively purge specific categories of data at any time—including workspace documents, AI conversation logs, extracted memories, personal profile information, API credentials, and local caches—without delay.</li>
          <li><strong>Data Portability &amp; Archive Export (GDPR Art. 20):</strong> Export your complete structured data archive in machine-readable JSON format with a single click before initiating any data deletion.</li>
          <li><strong>Right to Access &amp; Inspection (GDPR Art. 15):</strong> Inspect exact real-time byte sizes and item counts stored locally across each functional category.</li>
          <li><strong>Right to Rectification:</strong> Instantly update, edit, or replace profile details and configuration secrets across the platform.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">5. Contact Our Data Protection Team</h4>
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
          Regaarder is built with the support of the open-source community. Key open source libraries include React, Lucide Icons, Yjs, KaTeX, and standard web platform specifications. Complete license texts and attributions are available in our technical disclosures index.
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
