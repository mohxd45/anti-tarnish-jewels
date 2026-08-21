import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | LONA JEWELS",
  description: "Read the return, exchange and damaged-product claim policy for LONA JEWELS orders.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#3A2428] mb-6">Return Policy</h1>
        </div>
        <div className="bg-[#FFF9FB] rounded-2xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 p-6 sm:p-10 text-[#3A2428]/80 font-sans space-y-6 text-sm sm:text-base leading-relaxed">
          <p>We offer refund / exchange within first <strong>1 days</strong> from the date of your purchase. If <strong>1 days</strong> have passed since your purchase, you will not be offered a return, exchange or refund of any kind. In order to become eligible for a return or an exchange, (i) the purchased item should be unused and in the same condition as you received it, (ii) the item must have original packaging, (iii) if the item that you purchased on a sale, then the item may not be eligible for a return / exchange. Further, only such items are replaced by us (based on an exchange request), if such items are found defective or damaged.</p>
          
          <p>In case of receipt of damaged or defective items, please report to our customer service team within 3 days of receipt of products. A clear unboxing video showing the opening of the package from start to finish is mandatory for processing any damage or defect claims.</p>

          <p>You agree that there may be a certain category of products / items that are exempted from returns or refunds. Such categories of the products would be identified to you at the item of purchase. For exchange / return accepted request(s) (as applicable), once your returned product / item is received and inspected by us, we will send you an email to notify you about receipt of the returned / exchanged product. Further. If the same has been approved after the quality check at our end, your request (i.e. return / exchange) will be processed in accordance with our policies.</p>
        </div>
      </div>
    </div>
  );
}
