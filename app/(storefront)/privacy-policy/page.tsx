export const metadata = {
  title: "Privacy Policy | LONA JEWELS",
  description: "Learn how LONA JEWELS collects, uses, and protects your personal data.",
};

function PolicyBox({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#FFF9FB] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20">
      <h2 className="text-xl sm:text-2xl font-serif text-[#3A2428] mb-4">{title}</h2>
      <div className="text-[#3A2428]/80 text-sm sm:text-base leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-[#B8955E] uppercase">Legal</span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-serif text-[#3A2428] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#3A2428]/70 text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        
        <div className="space-y-6">
          <PolicyBox title="1. Information We Collect">
            <p>
              We collect information you provide directly to us when you create an account, place an order, contact customer support, or interact with our website. This includes your name, email address, phone number, shipping and billing addresses, and payment details.
            </p>
          </PolicyBox>

          <PolicyBox title="2. How We Use Your Information">
            <p>
              We use the collected information to process and fulfill your orders, provide customer support, send transactional notifications (like order confirmations and tracking updates), and improve our premium products and services. If you opt-in, we may also send you exclusive offers and newsletters.
            </p>
          </PolicyBox>

          <PolicyBox title="3. Payment Security & Verification">
            <p>
              To ensure the authenticity of Cash on Delivery (COD) orders and prevent fraud, we may use your phone number to verify your order before shipping. All online prepaid transactions are processed through highly secure, encrypted gateways.
            </p>
          </PolicyBox>

          <PolicyBox title="4. Cookies & Tracking">
            <p>
              We use cookies to remember your cart items, keep you logged in, and understand how you interact with our website. This allows us to deliver a seamless luxury shopping experience tailored to your preferences.
            </p>
          </PolicyBox>

          <PolicyBox title="5. Data Sharing">
            <p>
              We do not sell or rent your personal information to third parties. We only share your data with trusted service providers who assist us in operating our website, processing payments, and delivering orders (such as our logistics partners), strictly for fulfillment purposes.
            </p>
          </PolicyBox>

          <PolicyBox title="6. Contact & Rights">
            <p>
              You have the right to access, update, or delete your personal information. You can manage your profile details in your account dashboard. If you wish to request data deletion or have any questions about this policy, please contact our support team at <strong>support@lonajewels.com</strong>.
            </p>
          </PolicyBox>
        </div>
      </div>
    </div>
  );
}
