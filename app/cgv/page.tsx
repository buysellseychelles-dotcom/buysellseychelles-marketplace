import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Sale – BuySellSeychelles',
  description: 'Conditions of sale between buyers and sellers on BuySellSeychelles.',
}

export default function CGVPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-4">

      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-black">← Back</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Sale</h1>
      <p className="text-sm text-gray-400 mb-1">Last updated: June 2026</p>
      <p className="text-sm text-gray-500 mb-8">
        These Terms of Sale govern all transactions between buyers and sellers on BuySellSeychelles.
        They complement the general <Link href="/terms" className="underline text-black">Terms & Conditions</Link>.
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. Role of BuySellSeychelles</h2>
          <p>BuySellSeychelles is an intermediary platform that connects buyers and sellers. We are not a seller, buyer, or party to any transaction. The sale contract is formed exclusively between the buyer and the seller.</p>
          <p className="mt-2">Where buyer and seller reach an agreement electronically through the platform, that agreement is recognised as valid and binding under the <strong>Electronic Transactions Act, 2001</strong> of the Republic of Seychelles.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. Seller obligations</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>The seller must be the legitimate owner of the item or be authorised to sell it.</li>
            <li>The item description must be accurate, complete, and not misleading (condition, defects, dimensions, etc.).</li>
            <li>Photos must represent the actual item being sold.</li>
            <li>The seller must honour the advertised price unless clearly marked as negotiable.</li>
            <li>The seller must respond to buyer messages within a reasonable time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. Buyer obligations</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>The buyer must verify the item before completing the purchase.</li>
            <li>Once a sale is agreed, the buyer must follow through on the agreed terms.</li>
            <li>The buyer must not negotiate price in bad faith or repeatedly fail to show up.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. Payment</h2>
          <p>Payment terms are agreed directly between the buyer and seller. BuySellSeychelles does not process payments unless a secure payment option is explicitly offered through the platform.</p>
          <p className="mt-2 font-medium text-red-700">⚠️ Never transfer money in advance to a stranger. Always inspect the item in person before paying.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. Delivery</h2>
          <p>When a listing indicates delivery is available, the terms (cost, method, timeframe) are negotiated directly between buyer and seller. BuySellSeychelles is not responsible for any delivery service used.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">6. Returns & refunds</h2>
          <p>There is no statutory right of return for private sales between individuals unless the item is materially different from its description. In the case of a dispute:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Buyers should first contact the seller directly through the messaging system.</li>
            <li>If unresolved, a dispute can be submitted via the chat interface (⚠️ Report a problem).</li>
            <li>BuySellSeychelles will review the report but cannot enforce a refund in private transactions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">7. Prohibited transactions</h2>
          <p>The following are strictly prohibited:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sale of illegal goods or counterfeit items</li>
            <li>Sale of goods that require a licence the seller does not hold</li>
            <li>Fraudulent listings or impersonation of another seller</li>
            <li>Advance payment scams of any kind</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">8. Tax responsibilities</h2>
          <p>Sellers are solely responsible for complying with any applicable tax obligations in the Seychelles. Regular or professional sellers may be required to declare income from sales. See our <Link href="/help#tax" className="underline text-black">Help Centre – Tax FAQ</Link> for guidance.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">9. Limitation of liability</h2>
          <p>BuySellSeychelles shall not be liable for any loss, damage, or injury arising from transactions between users, inaccurate descriptions, payment disputes, or failed deliveries.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">10. Governing law</h2>
          <p>These Terms of Sale are governed by the laws of the Republic of Seychelles. Any dispute shall be subject to the jurisdiction of the courts of Seychelles.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">11. Contact</h2>
          <p>Questions or reports: <a href="/contact" className="underline text-black">contact us via our contact form</a>.</p>
        </section>

      </div>
    </div>
  )
}
