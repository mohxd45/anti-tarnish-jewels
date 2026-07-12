export const metadata = {
  title: "Privacy Policy | LONA JEWELS",
  description: "Learn how LONA JEWELS collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 pb-32">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-charcoalBrown md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-stoneGray">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
      
      <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">1. Information Collection</h2>
          <p className="text-stoneGray leading-relaxed">
            We collect information you provide directly to us when you create an account, place an order, contact customer support, or interact with our website. This includes your name, email address, phone number, shipping and billing addresses, and payment details.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">2. Data Usage</h2>
          <p className="text-stoneGray leading-relaxed">
            We use the collected information to process and fulfill your orders, provide customer support, send transactional notifications (like order confirmations and tracking updates), and improve our products and services. If you opt-in, we may also send you promotional offers and newsletters.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">3. COD Verification</h2>
          <p className="text-stoneGray leading-relaxed">
            To ensure the authenticity of Cash on Delivery (COD) orders and prevent fraud, we may use your phone number to verify your order before shipping. This process helps us maintain a secure and reliable service for all customers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">4. Data Sharing</h2>
          <p className="text-stoneGray leading-relaxed">
            We do not sell or rent your personal information to third parties. We only share your data with trusted service providers who assist us in operating our website, processing payments, and delivering orders (such as shipping partners and payment gateways), strictly for these purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">5. Security</h2>
          <p className="text-stoneGray leading-relaxed">
            We implement industry-standard security measures, including encryption and secure server hosting, to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">6. Retention</h2>
          <p className="text-stoneGray leading-relaxed">
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with our legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">7. Customer Rights</h2>
          <p className="text-stoneGray leading-relaxed">
            You have the right to access, update, or delete your personal information. You can manage your profile details in your account dashboard. If you wish to request data deletion or have any questions about this policy, please contact us at anti.tarnish.jewel@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
