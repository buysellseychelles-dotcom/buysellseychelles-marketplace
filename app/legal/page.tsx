import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice – BuySellSeychelles',
  description: 'Legal information about BuySellSeychelles.',
}

export default function LegalPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-4">

      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-black">← Back</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Notice</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Platform</h2>
          <p><strong>Name:</strong> BuySellSeychelles</p>
          <p><strong>Website:</strong> <a href="https://buysellseychelles.com" className="text-black underline">buysellseychelles.com</a></p>
          <p><strong>Description:</strong> Free online classified ads marketplace for the Seychelles</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Operator / Publisher</h2>
          <p>In accordance with the Electronic Transactions Act, 2001, the platform is operated and published by:</p>
          <p className="mt-1">
            <strong>Coming soon</strong><br />
            Legal status: Coming soon<br />
            Registered address (Seychelles): Coming soon<br />
            Business Reg. No.: Coming soon<br />
            Email / contact: <a href="/contact" className="text-black underline">contact form</a>
          </p>
          <p className="mt-2 text-sm text-gray-500">Publication director: Coming soon</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Contact</h2>
          <p><strong>Contact:</strong> <a href="/contact" className="text-black underline">Contact form</a></p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Hosting</h2>
          <p>This website is hosted by:</p>
          <p className="mt-1"><strong>Vercel Inc.</strong><br />340 Pine Street, Suite 701<br />San Francisco, CA 94104<br />United States<br /><a href="https://vercel.com" className="text-black underline">vercel.com</a></p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Database & Authentication</h2>
          <p>User data and platform content are stored using:</p>
          <p className="mt-1"><strong>Supabase Inc.</strong><br />970 Toa Payoh North #07-04<br />Singapore 318992<br /><a href="https://supabase.com" className="text-black underline">supabase.com</a></p>
          <p className="mt-2 text-sm text-gray-500">As these providers are located outside the Seychelles, some personal data is transferred and stored abroad. See our <Link href="/privacy" className="text-black underline">Privacy Policy</Link> for details on international data transfers and the safeguards applied under the Data Protection Act, 2023.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Data Protection</h2>
          <p>BuySellSeychelles is the data controller for personal data processed on this platform, within the meaning of the <strong>Data Protection Act, 2023</strong> of the Republic of Seychelles. We process personal data in accordance with the data protection principles of that Act.</p>
          <p className="mt-2">For full details on what data we collect, how it is used, international transfers, and how to exercise your rights (access, rectification, erasure, objection) or lodge a complaint, see our <Link href="/privacy" className="text-black underline">Privacy Policy</Link>.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Electronic Transactions</h2>
          <p>This platform operates as an electronic commerce service under the <strong>Electronic Transactions Act, 2001</strong> of the Republic of Seychelles. Electronic records, communications, and acceptances made through the platform (such as creating an account or accepting our Terms) are legally recognised and binding under that Act.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Intellectual Property</h2>
          <p>The BuySellSeychelles name, logo, and all platform content (excluding user-generated content) are the property of BuySellSeychelles. Any reproduction, distribution, or use without prior written consent is prohibited.</p>
          <p className="mt-2">User-generated content (listings, photos, messages) remains the intellectual property of the respective users. By posting content, users grant BuySellSeychelles a licence to display that content on the platform.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Liability</h2>
          <p>BuySellSeychelles acts solely as an intermediary between buyers and sellers. We are not responsible for the content of listings, the quality or legality of items offered, or the outcome of transactions between users.</p>
          <p className="mt-2">We reserve the right to remove any content that violates our <Link href="/terms" className="text-black underline">Terms & Conditions</Link> without prior notice.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Applicable Law</h2>
          <p>This platform operates under the laws of the Republic of Seychelles. Any dispute arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts of Seychelles.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Links</h2>
          <ul className="space-y-1">
            <li><Link href="/terms" className="text-black underline">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="text-black underline">Privacy Policy</Link></li>
          </ul>
        </section>

      </div>
    </div>
  )
}
