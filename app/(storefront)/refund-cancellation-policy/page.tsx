import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | LONA JEWELS",
  description: "Read the refund and cancellation terms for orders placed with LONA JEWELS.",
};

export default function RefundCancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#3A2428] mb-6">Refund & Cancellation Policy</h1>
        </div>
        <div className="bg-[#FFF9FB] rounded-2xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 p-6 sm:p-10 text-[#3A2428]/80 font-sans space-y-6 text-sm sm:text-base leading-relaxed">
          <p>This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform. Under this policy:</p>
          <ol className="list-decimal pl-5 space-y-4">
            <li>Cancellations will only be considered if the request is made <strong>1 days</strong> of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.</li>
            <li><strong>Bmst enterprise</strong> does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that the quality of the product delivered is not good.</li>
            <li>In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/ merchant listed on the Platform, has checked and determined the same at its own end. This should be reported within <strong>1 days</strong> of receipt of products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>1 days</strong> of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.</li>
            <li>In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them.</li>
            <li>In case of any refunds approved by <strong>Bmst enterprise</strong> , it will take <strong>7 days</strong> for the refund to be processed to you.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
