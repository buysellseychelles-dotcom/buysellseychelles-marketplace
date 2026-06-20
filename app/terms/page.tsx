import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions – BuySellSeychelles',
  description: 'Terms and conditions for using the BuySellSeychelles marketplace.',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-4">

      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-black">← Back</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. About BuySellSeychelles</h2>
          <p>BuySellSeychelles (<strong>buysellseychelles.com</strong>) is a free online marketplace connecting buyers and sellers in the Seychelles. The platform allows users to post, browse, and respond to classified advertisements.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. Acceptance of Terms</h2>
          <p>By accessing or using BuySellSeychelles, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.</p>
          <p className="mt-2">In accordance with the <strong>Electronic Transactions Act, 2001</strong> of the Republic of Seychelles, your acceptance of these Terms by electronic means — including registering an account, posting a listing, or otherwise using the platform — constitutes a valid, binding agreement, and electronic records are recognised as equivalent to written records.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide a valid email address to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must be at least 18 years old to use this platform.</li>
            <li>One person may only hold one account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. Listing Rules</h2>
          <p>When posting an advertisement, you agree that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You are the legitimate owner of the item or authorised to sell/offer it.</li>
            <li>All information provided is accurate, complete, and not misleading.</li>
            <li>The item or service offered is legal under Seychelles law.</li>
            <li>You will not post duplicate listings for the same item.</li>
            <li>Listings must relate to a genuine offer — no spam, solicitation, or advertising.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. Prohibited Content</h2>
          <p>The following are strictly prohibited on BuySellSeychelles:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Illegal goods or services (drugs, weapons, counterfeit items, etc.)</li>
            <li>Adult or sexually explicit content</li>
            <li>Fraudulent or misleading listings</li>
            <li>Content that is hateful, discriminatory, or abusive</li>
            <li>Personal data of third parties without their consent</li>
            <li>Multi-level marketing or pyramid schemes</li>
          </ul>
          <p className="mt-2">BuySellSeychelles reserves the right to remove any listing that violates these rules without prior notice.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">6. Transactions</h2>
          <p>BuySellSeychelles is a platform for connecting buyers and sellers. We are not a party to any transaction between users. We do not guarantee the quality, safety, or legality of items listed. All transactions are carried out at the users' own risk.</p>
          <p className="mt-2">We strongly recommend meeting in a safe, public place and inspecting items before any payment.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">7. Intellectual Property</h2>
          <p>By posting content on BuySellSeychelles, you grant us a non-exclusive, royalty-free licence to display that content on the platform. You retain ownership of your content. You must not reproduce or distribute content from the platform without permission.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">8. Limitation of Liability</h2>
          <p>BuySellSeychelles is provided "as is" without any warranty. We shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform or from transactions between users.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">9. Modifications</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes your acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">10. Data Protection</h2>
          <p>We process your personal data in accordance with the <strong>Data Protection Act, 2023</strong> of the Republic of Seychelles. Details of what we collect, how we use it, and your rights are set out in our <Link href="/privacy" className="text-black underline">Privacy Policy</Link>.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">11. Governing Law</h2>
          <p>These Terms are governed by the laws of the Republic of Seychelles. Any dispute shall be subject to the exclusive jurisdiction of the courts of Seychelles.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">12. Contact</h2>
          <p>For any questions regarding these Terms, please <a href="/contact" className="text-black underline">contact us via our contact form</a>.</p>
        </section>

      </div>
    </div>
  )
}
