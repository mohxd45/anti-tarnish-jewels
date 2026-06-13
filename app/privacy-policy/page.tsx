import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Anti Tarnish Jewels",
  description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Privacy Policy</h1>
      <div className="mt-6 rounded-[2rem] border border-gold/15 bg-white/[0.04] p-8 leading-8 text-cream/70 font-sans text-sm md:text-base space-y-6">
        
        <p>
          At Anti Tarnish Jewels, accessible from our online store, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Anti Tarnish Jewels and how we use it.
        </p>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Information Collection</h2>
          <p>
            We collect your name, address, email, phone number, and order history when you place an order or create an account with us. This information is strictly required to fulfill your orders and manage your account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Data Usage</h2>
          <p>
            Your data is used strictly for order fulfillment, delivery updates, Cash on Delivery (COD) verification calls, and providing customer support via WhatsApp. We may also use your email to send updates about your order status.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Authentication & Third Parties</h2>
          <p>
            We use Firebase and Google for secure login and authentication. Your payment information is securely processed by our authorized payment partners; we do not store raw credit card details on our servers. We do not sell or share customer data with unauthorized third parties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Data Retention</h2>
          <p>
            We retain your personal information, including order history and account details, only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with our legal and tax obligations, resolve disputes, and enforce our policies. If you wish to delete your account or request the removal of your personal data, please contact our support team.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Cookies</h2>
          <p>
            We use essential cookies to maintain your session, keep items in your cart, and save your wishlist across visits. You can choose to disable cookies through your individual browser options, but this may affect the functionality of our website.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-semibold text-gold mb-2">Contact Us</h2>
          <p>
            For privacy concerns, data deletion requests, or questions about this policy, please reach out to us at <strong>support@antitarnishjewels.com</strong> or via our WhatsApp support.
          </p>
        </div>

      </div>
    </section>
  );
}
