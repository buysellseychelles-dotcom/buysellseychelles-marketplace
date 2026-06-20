import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – BuySellSeychelles',
  description: 'How BuySellSeychelles collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-4">

      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-black">← Back</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. Introduction</h2>
          <p>BuySellSeychelles is committed to protecting your privacy. This policy explains what personal data we collect, how we use it, and your rights regarding that data. By using our platform, you accept this Privacy Policy.</p>
          <p className="mt-2">This policy is issued in accordance with the <strong>Data Protection Act, 2023</strong> of the Republic of Seychelles (in force since 22 December 2023). We process your personal data in line with the data protection principles set out in that Act: data is processed lawfully, fairly and transparently, collected for specified purposes, kept adequate, accurate and no longer than necessary, and kept secure.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. Data Controller</h2>
          <p>For the purposes of the Data Protection Act, 2023, the data controller responsible for your personal data is:</p>
          <p className="mt-1">
            <strong>Coming soon</strong><br />
            Registered address (Seychelles): Coming soon<br />
            Business Reg. No.: Coming soon<br />
            Contact: <a href="/contact" className="text-black underline">contact form</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. Data We Collect</h2>
          <p><strong>Account data:</strong> When you register, we collect your email address and, optionally, your name and profile photo.</p>
          <p className="mt-2"><strong>Listing data:</strong> Content you post, including titles, descriptions, photos, price, and location (island/district).</p>
          <p className="mt-2"><strong>Usage data:</strong> Pages visited, search queries, device type, browser, and IP address — collected automatically via analytics tools.</p>
          <p className="mt-2"><strong>Messages:</strong> Private messages exchanged between users on the platform are stored securely and are accessible only to the conversation participants.</p>
          <p className="mt-2"><strong>Notifications and alerts:</strong> Preferences you set for email or in-app alerts.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain the BuySellSeychelles service</li>
            <li>To send transactional emails (message notifications, listing alerts, account verification)</li>
            <li>To moderate content and prevent fraud</li>
            <li>To improve platform performance and user experience through analytics</li>
            <li>To contact you about important updates to the service or these policies</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. Legal Basis for Processing</h2>
          <p>Under the Data Protection Act, 2023, we process your personal data on the following grounds:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Performance of a service</strong> you have requested (e.g. creating your account, publishing your listings, delivering messages).</li>
            <li><strong>Your consent</strong> — for analytics cookies and optional marketing communications, which you may withdraw at any time.</li>
            <li><strong>Our legitimate interests</strong> — to moderate content, prevent fraud, and secure the platform, balanced against your rights.</li>
            <li><strong>Legal obligation</strong> — where we are required to retain or disclose data under Seychelles law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">6. Data Storage and Security</h2>
          <p>Your data is stored securely using <strong>Supabase</strong>, a cloud database provider with industry-standard encryption at rest and in transit. Transactional emails are sent via <strong>Resend</strong>. We take reasonable technical and organisational measures to protect your data from unauthorised access.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">7. Cookies and Analytics</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep you signed in to your account (essential cookies)</li>
            <li>Remember your language preference (essential cookies)</li>
            <li>Collect anonymous usage statistics via Google Analytics (analytics cookies)</li>
          </ul>
          <p className="mt-2">Essential cookies are required for the platform to work. <strong>Analytics cookies are only set after you give consent</strong> via the cookie banner, and you can decline or withdraw consent at any time. You can also disable cookies in your browser settings, but this may affect some functionality of the platform.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">8. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Vercel</strong> — hosting and content delivery</li>
            <li><strong>Google Analytics</strong> — anonymous usage statistics</li>
          </ul>
          <p className="mt-2">Each provider operates under their own privacy policy and data processing agreements.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">9. International Data Transfers</h2>
          <p>Because we rely on the cloud providers listed above, your personal data is stored and processed <strong>outside the Republic of Seychelles</strong>, in particular:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Supabase</strong> — database and authentication (servers in Singapore)</li>
            <li><strong>Vercel</strong> and <strong>Google Analytics</strong> — hosting and analytics (servers in the United States)</li>
          </ul>
          <p className="mt-2">In accordance with the rules on international transfers under the Data Protection Act, 2023, we only use providers that apply industry-standard technical and contractual safeguards (encryption in transit and at rest, data processing agreements) to ensure an adequate level of protection for your data. By using the platform, you consent to this transfer of your data abroad for the purposes described in this policy.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">10. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. Listings are retained until you delete them or your account is closed. You may request deletion of your account and all associated data at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">11. Your Rights</h2>
          <p>Under the Data Protection Act, 2023, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be informed whether we hold personal data about you and to access that data (subject access request)</li>
            <li>Have inaccurate or incomplete data corrected, blocked, or erased</li>
            <li>Request deletion of your data and account</li>
            <li>Prevent processing that is likely to cause you damage or distress</li>
            <li>Prevent processing of your data for direct marketing purposes</li>
            <li>Withdraw consent at any time (where processing is based on consent)</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, <a href="/contact" className="text-black underline">contact us via our contact form</a>. We will respond within the timeframe required by law.</p>
          <p className="mt-2">If you are not satisfied with how we handle your data, you have the right to lodge a complaint with the <strong>Information Commissioner</strong> of the Republic of Seychelles, the supervisory authority established under the Data Protection Act, 2023.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">12. Children's Privacy</h2>
          <p>BuySellSeychelles is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has created an account, please contact us so we can take appropriate action.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">13. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email or via an in-app notification. Continued use of the platform constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">14. Contact</h2>
          <p>For any privacy-related questions or requests, <a href="/contact" className="text-black underline">contact us via our contact form</a>.</p>
        </section>

      </div>
    </div>
  )
}
