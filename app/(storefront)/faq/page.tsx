"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItemProps[] = [
  {
    category: "Shopping",
    question: "Why should I buy from LONA JEWELS?",
    answer: "LONA JEWELS offers trendy, high-quality, and budget-friendly fashion jewellery designed for everyday style. Our pieces are crafted with skin-friendly alloys, giving you a gorgeous look without breaking the bank."
  },
  {
    category: "Shopping",
    question: "What type of jewellery do you sell?",
    answer: "We specialize in trendy imitation jewellery, including earrings, rings, necklaces, bracelets, and a wide variety of stylish hair accessories. Our collection features the latest Korean designs and daily-wear fashion pieces."
  },
  {
    category: "Shopping",
    question: "Are your products suitable for daily wear?",
    answer: "Yes, our jewellery is perfect for daily wear! Since these are fashion accessories (not real gold/silver), their shine will last a very long time if kept away from direct water, perfume, sweat, and harsh chemicals. Store them in a dry pouch after use to enjoy their beauty for years."
  },
  {
    category: "Payments",
    question: "How does Cash on Delivery (COD) work?",
    answer: "Yes, we offer Partial COD! To confirm your Cash on Delivery order, a minor advance payment of ₹100 is required online, and you can pay the remaining balance at the time of delivery. This helps us filter genuine buyers and avoid courier rejection."
  },
  {
    category: "Payments",
    question: "Why do COD orders need confirmation?",
    answer: "To ensure a smooth delivery experience and prevent fraudulent requests, we may contact you to confirm your COD order before dispatching it."
  },
  {
    category: "Delivery",
    question: "How long does delivery take?",
    answer: "Orders are typically dispatched within 24-48 hours. Depending on your location, delivery usually takes 3-7 business days."
  },
  {
    category: "Orders",
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking link via email or SMS. You can also visit our Track Order page to check its live status."
  },
  {
    category: "Returns",
    question: "Can I return or exchange my order?",
    answer: "Yes, we offer a 7-day easy return and exchange policy for eligible items. Please check our Return Policy page for exclusions."
  },
  {
    category: "Returns",
    question: "What should I do if I receive a damaged product?",
    answer: "If you receive a damaged item, please contact our support team within 24 hours of delivery. A full unboxing video is required to process claims."
  },
  {
    category: "Payments",
    question: "Are online payments safe?",
    answer: "Yes, all online payments are securely processed through trusted payment gateways using industry-standard encryption to protect your details."
  },
  {
    category: "Orders",
    question: "Can I cancel my order?",
    answer: "You can cancel your order before it has been dispatched. For prepaid orders, the refund will be initiated to your original payment method."
  },
  {
    category: "Support",
    question: "How can I contact support?",
    answer: "You can reach out to us via the Contact page, WhatsApp, or email us directly at support. Our team typically responds within 24 hours."
  }
];

const categories = ["All", "Shopping", "Delivery", "Payments", "Returns", "Orders", "Support"];

function FAQAccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#FFF9FB] rounded-2xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left p-5 sm:p-6"
      >
        <span className="font-serif text-[#3A2428] sm:text-lg pr-4">{question}</span>
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
        {answer}
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFaqs = faqs.filter(
    (faq) => activeCategory === "All" || faq.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        {/* Header Card */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#3A2428]">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#3A2428]/70 max-w-2xl mx-auto">
            Find answers about shopping, delivery, payments, returns, and support at LONA JEWELS.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#B8955E] text-white shadow-md"
                  : "bg-[#FFF9FB] text-[#3A2428] hover:bg-[#FFF0F5] border border-[#B8955E]/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <FAQAccordionItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center p-12 bg-[#FFF9FB] rounded-2xl border border-[#B8955E]/10">
              <p className="text-[#3A2428]/70">No questions found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
