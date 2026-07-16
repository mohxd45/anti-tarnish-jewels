"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/firestore";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

function PolicyAccordionItem({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#FFF9FB] rounded-2xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left p-5 sm:p-6"
      >
        <span className="font-serif text-[#3A2428] sm:text-lg pr-4">{title}</span>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FFF0F5] flex items-center justify-center">
          {isOpen ? (
            <ChevronUp className="text-[#B8955E]" size={18} />
          ) : (
            <ChevronDown className="text-[#B8955E]" size={18} />
          )}
        </div>
      </button>
      <div 
        className={`px-5 sm:px-6 pb-6 text-sm sm:text-base leading-7 text-[#3A2428]/80 font-sans transition-all duration-300 ease-in-out ${isOpen ? "block" : "hidden"}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ReturnPolicyPage() {
  const [returnPolicyText, setReturnPolicyText] = useState("At LONA JEWELS, customer satisfaction is our top priority. We offer a 7-day easy return and replacement policy for eligible products.");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getSiteContent("policies");
      if (data?.returnPolicyText) {
        setReturnPolicyText(data.returnPolicyText);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        
        {/* Header Card */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#3A2428] mb-6">
            Return & Refund Policy
          </h1>
          <p className="text-[#3A2428]/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 whitespace-pre-line">
            {returnPolicyText}
          </p>
          <Link 
            href="/returns" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#B8955E] hover:bg-[#A38250] text-white rounded-full font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            Start a Return / Exchange
          </Link>
        </div>

        {/* Policy Accordion Container */}
        <div className="space-y-4">
          <PolicyAccordionItem title="Return Eligibility">
            <ul className="list-disc list-inside space-y-2">
              <li>Items must be returned in their original, unopened, and unused condition.</li>
              <li>The product must be returned in its original packaging.</li>
              <li>We offer a strict 7-day window from the date of delivery to initiate a request.</li>
              <li>A valid proof of purchase (invoice copy or order confirmation) must accompany the return.</li>
            </ul>
          </PolicyAccordionItem>

          <PolicyAccordionItem title="Exchange Process">
            <p>
              Once your exchange request is approved via our Returns portal, our courier partner will pick up the item within 1-3 business days. After the item reaches our warehouse and passes quality checks, the replacement product will be dispatched immediately.
            </p>
          </PolicyAccordionItem>

          <PolicyAccordionItem title="Damaged Product">
            <p>
              In the rare event that you receive a defective or damaged product, please contact our support team within 24 hours of delivery. A full, uncut unboxing video is mandatory to process any claims under our damaged item policy.
            </p>
          </PolicyAccordionItem>

          <PolicyAccordionItem title="Non-Returnable Items">
            <p>
              Certain product categories cannot be returned due to hygiene and safety guidelines. These include:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Pierced earrings (for hygiene reasons)</li>
              <li>Customized or engraved jewelry</li>
              <li>Items bought during clearance or flash sales</li>
              <li>Products showing signs of wear or perfume damage</li>
            </ul>
          </PolicyAccordionItem>

          <PolicyAccordionItem title="Refund Timeline">
            <p>
              Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed and automatically applied to your original method of payment within 5-7 business days. For Cash on Delivery orders, you will be asked to provide a UPI ID or bank account for the refund transfer.
            </p>
          </PolicyAccordionItem>
        </div>

      </div>
    </div>
  );
}
