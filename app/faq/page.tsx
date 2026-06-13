"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getSiteContent } from "@/lib/firestore";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQAccordionItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gold/15 last:border-0 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-serif text-lg font-medium text-cream hover:text-gold transition-colors py-2"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="text-gold shrink-0 ml-4" size={18} /> : <ChevronDown className="text-gold shrink-0 ml-4" size={18} />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm md:text-base leading-7 text-cream/70 font-sans pb-2">
          {answer}
        </div>
      )}
    </div>
  );
}

const defaultFaqs = [
  {
    question: "What is anti-tarnish jewellery?",
    answer: "Anti-tarnish jewellery is specially coated or made from materials like stainless steel and PVD gold plating that resist oxidation, keeping their shine intact for much longer."
  },
  {
    question: "Is it waterproof?",
    answer: "Yes, our jewellery is highly water-resistant. You can wear it while washing hands or in the shower without worrying about it losing its color."
  },
  {
    question: "How to care for jewellery?",
    answer: "Store your pieces in the provided pouches or boxes. Wipe them with a soft cloth after use to maintain their shine."
  },
  {
    question: "Cash on Delivery",
    answer: "Yes, Cash on Delivery is available for most locations across India. You can choose this option at checkout."
  },
  {
    question: "Order tracking",
    answer: "Once your order is shipped, you will receive a tracking ID. You can enter it on our Track Order page to check its live status."
  },
  {
    question: "Return/exchange",
    answer: "We offer a 7-day easy return or exchange window for eligible products. Please check our Return Policy page for exclusions and detailed conditions."
  }
];

export default function FAQPage() {
  const [introText, setIntroText] = useState("Find answers about shipping, payments, returns, order tracking, product specifications, and account support.");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getSiteContent("faq");
      if (data?.faqText) {
        setIntroText(data.faqText);
      }
    } catch (err) {
      console.error(err);
    }
  }



  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Frequently Asked Questions</h1>
      <p className="mt-4 text-cream/70 text-sm md:text-base leading-7">
        {introText}
      </p>
      
      <div className="mt-8 rounded-[2rem] border border-gold/15 bg-white/[0.04] p-6 md:p-10 shadow-jewel">
        <div className="divide-y divide-gold/15">
          {defaultFaqs.map((faq, idx) => (
            <FAQAccordionItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
