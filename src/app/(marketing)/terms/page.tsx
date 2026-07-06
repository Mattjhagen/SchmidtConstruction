import type { Metadata } from 'next';
import { site } from '@/content/site';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Terms of Service | ${site.legalName}`,
  description: 'Terms of Service for Schmidt Construction Inc. — Omaha, NE general contractor.',
};

const EFFECTIVE_DATE = 'July 6, 2026';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

      <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using the website at <strong>schmidt-construction.com</strong> or the client portal at{' '}
            <strong>login.schmidt-construction.com</strong>, you agree to be bound by these Terms of Service and all
            applicable laws and regulations. If you do not agree, please do not use our services.
          </p>
          <p className="mt-2">
            These terms apply to all visitors, clients, and others who access or use our website and portal services
            operated by <strong>{site.legalName}</strong>, an Omaha, Nebraska company.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Construction Services</h2>
          <p>
            Our website and portal are used to facilitate estimates, proposals, and communication related to
            construction services including retaining walls, concrete work, drainage solutions, and remodeling.
            Proposals delivered through the portal constitute offers to perform work under the stated terms and are
            subject to a separate written contract executed between {site.legalName} and the client.
          </p>
          <p className="mt-2">
            Accepting a proposal electronically through the portal constitutes a binding agreement to the outlined
            scope of work, pricing, timeline, and payment schedule. Electronic signatures carry the same legal
            weight as written signatures under Nebraska law and the federal Electronic Signatures in Global and
            National Commerce Act (E-SIGN).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Client Portal Accounts</h2>
          <p>
            You may create an account on the client portal to access your proposals and communicate with our team.
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account. Notify us immediately at{' '}
            <a href={`mailto:${site.email}`} className="text-yellow-600 hover:underline">{site.email}</a> if you
            suspect unauthorized use.
          </p>
          <p className="mt-2">
            Account access is provided for the purpose of viewing and acting on your construction proposals only.
            You may not share your portal access with unrelated third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Proposals and Estimates</h2>
          <p>
            All proposals and estimates provided through our portal are valid for the expiration period stated on
            the proposal. Prices are subject to change based on material costs, scope changes, and site conditions
            discovered during execution. Any changes to the agreed scope must be documented in a written change order
            signed by both parties.
          </p>
          <p className="mt-2">
            Estimates shared via a public proposal link are confidential and intended solely for the named recipient.
            Do not distribute proposal links to competitors or third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Payments</h2>
          <p>
            Payment terms are as stated on the accepted proposal. Deposit amounts are due prior to mobilization.
            Final balances are due upon substantial completion unless otherwise stated in writing. Late payments may
            be subject to interest charges and may result in work stoppage. {site.legalName} reserves the right to
            file a mechanic's lien on the property as permitted under Nebraska law for unpaid balances.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Intellectual Property</h2>
          <p>
            All content on this website — including text, photos, logos, and design — is the property of{' '}
            {site.legalName} and may not be copied, reproduced, or distributed without written permission.
            Proposal documents delivered to clients may be retained for personal reference but may not be shared
            with competitors or used for bidding purposes against {site.legalName}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {site.legalName} shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of this website or portal,
            including but not limited to loss of data, loss of profits, or business interruption. Our total
            liability for any claim related to the website or portal services is limited to $100.
          </p>
          <p className="mt-2">
            Liability related to construction work performed is governed by the separate written contract executed
            for that project, and is not limited by these website terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Disclaimer of Warranties</h2>
          <p>
            This website and portal are provided "as is" without warranties of any kind, express or implied. We do
            not warrant that the site will be uninterrupted, error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Nebraska. Any disputes shall be resolved in the
            courts of Douglas County, Nebraska, and you consent to the personal jurisdiction of such courts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Changes to These Terms</h2>
          <p>
            We may update these Terms of Service at any time. Changes take effect upon posting to this page. Your
            continued use of the website or portal after changes are posted constitutes acceptance of the revised
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">11. Contact Us</h2>
          <p>
            Questions about these terms? Contact us at:
          </p>
          <address className="not-italic mt-2 text-sm text-gray-600">
            <strong>{site.legalName}</strong><br />
            {site.address.full}<br />
            Phone: <a href={site.phoneHref} className="text-yellow-600 hover:underline">{site.phone}</a><br />
            Email: <a href={`mailto:${site.email}`} className="text-yellow-600 hover:underline">{site.email}</a>
          </address>
        </section>

        <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
          See also: <Link href="/privacy" className="text-yellow-600 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
