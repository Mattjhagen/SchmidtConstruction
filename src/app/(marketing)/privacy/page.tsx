import type { Metadata } from 'next';
import { site } from '@/content/site';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Privacy Policy | ${site.legalName}`,
  description: 'Privacy Policy for Schmidt Construction Inc. — how we collect, use, and protect your information.',
};

const EFFECTIVE_DATE = 'July 6, 2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

      <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Who We Are</h2>
          <p>
            <strong>{site.legalName}</strong> operates <strong>schmidt-construction.com</strong> and the client
            portal at <strong>login.schmidt-construction.com</strong>. This Privacy Policy explains what personal
            information we collect, how we use it, and your rights regarding that information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Information We Collect</h2>
          <h3 className="font-semibold text-gray-800 mt-3 mb-1">Information you provide directly</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Name, phone number, and email address submitted via the contact form or quote requests</li>
            <li>Property or job site address provided for estimating purposes</li>
            <li>Account credentials (email and password) when you create a client portal account</li>
            <li>Messages and feedback submitted through the negotiation panel in your proposal portal</li>
            <li>Electronic signature (typed name) when you accept a proposal</li>
          </ul>

          <h3 className="font-semibold text-gray-800 mt-4 mb-1">Information collected automatically</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>IP address and browser type when you visit our website or open a proposal portal link</li>
            <li>Pages visited, time on site, and referral source (via standard web analytics)</li>
            <li>Proposal view events (when a portal link is opened) for audit and notification purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>To prepare and deliver construction estimates and proposals</li>
            <li>To communicate with you about your project before, during, and after construction</li>
            <li>To process electronic proposal acceptance and maintain audit records</li>
            <li>To send transactional emails (proposal delivery, confirmation, password reset)</li>
            <li>To respond to contact form inquiries and schedule estimates</li>
            <li>To improve our website and understand how visitors use it</li>
            <li>To comply with legal obligations, including mechanic's lien requirements</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal information to third parties. We do not use your information for
            advertising networks or data brokers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. How We Share Your Information</h2>
          <p>We share your information only in limited circumstances:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li>
              <strong>Service providers:</strong> We use Supabase (database and authentication), Resend (email
              delivery), and Vercel (hosting). These providers process data on our behalf under their own privacy
              policies and do not use your data for their own purposes.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose information if required by law, court order, or
              to protect the rights and safety of our company, employees, or the public.
            </li>
            <li>
              <strong>Business transfer:</strong> If {site.legalName} is sold or merged, client information may
              transfer to the acquiring party, who will be bound by this policy.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Data Retention</h2>
          <p>
            We retain contact and project information for the duration of any active business relationship and for
            a reasonable period afterward for legal and accounting purposes (typically 7 years). Proposal and
            contract records may be retained for the life of the constructed improvement for warranty and
            legal purposes.
          </p>
          <p className="mt-2">
            Portal account information is retained while your account is active. You may request deletion of your
            account at any time (see Section 7).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Cookies and Tracking</h2>
          <p>
            Our website uses essential cookies to maintain your login session on the client portal. We do not
            use third-party advertising cookies or cross-site tracking. We may use basic analytics (such as
            aggregate page views) that do not identify you personally.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li><strong>Access</strong> the personal information we hold about you</li>
            <li><strong>Correct</strong> inaccurate information in your client record</li>
            <li><strong>Delete</strong> your portal account and associated personal data (subject to legal retention requirements)</li>
            <li><strong>Opt out</strong> of non-transactional communications at any time by contacting us</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${site.email}`} className="text-yellow-600 hover:underline">{site.email}</a> or{' '}
            <a href={site.phoneHref} className="text-yellow-600 hover:underline">{site.phone}</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Security</h2>
          <p>
            We take reasonable measures to protect your information, including encrypted data storage,
            HTTPS-only transmission, and access controls on our internal systems. Portal authentication is
            handled by Supabase, which uses industry-standard security practices. No method of transmission or
            storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18. We do not knowingly collect personal
            information from children. If you believe a child has provided us with personal information, please
            contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Third-Party Links</h2>
          <p>
            Our website may link to third-party sites (such as Google Maps or review platforms). We are not
            responsible for the privacy practices of those sites and encourage you to review their policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. When we do, we will update the effective date at the
            top of this page. Material changes will be communicated to portal account holders via email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">12. Contact Us</h2>
          <p>Privacy questions or requests:</p>
          <address className="not-italic mt-2 text-sm text-gray-600">
            <strong>{site.legalName}</strong><br />
            {site.address.full}<br />
            Phone: <a href={site.phoneHref} className="text-yellow-600 hover:underline">{site.phone}</a><br />
            Email: <a href={`mailto:${site.email}`} className="text-yellow-600 hover:underline">{site.email}</a>
          </address>
        </section>

        <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
          See also: <Link href="/terms" className="text-yellow-600 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
