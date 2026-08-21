import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | LONA JEWELS",
  description: "Read the shipping and delivery policy for orders placed with LONA JEWELS.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#3A2428] mb-6">Shipping Policy</h1>
        </div>
        <div className="bg-[#FFF9FB] rounded-2xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 p-6 sm:p-10 text-[#3A2428]/80 font-sans space-y-6 text-sm sm:text-base leading-relaxed">
          <p>The orders for the user are shipped through registered domestic courier companies and/or speed post only. Orders are shipped within <strong>7 days</strong> from the date of the order and/or payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, subject to courier company / post office norms. Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority. Delivery of all orders will be made to the address provided by the buyer at the time of purchase. Delivery of our services will be confirmed on your email ID as specified at the time of registration. If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is not refundable.</p>
        </div>
      </div>
    </div>
  );
}
