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
    <div className="border-b border-[#F1CFCF]/50 last:border-0 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-serif text-lg font-medium text-charcoalBrown hover:text-champagne transition-colors py-2"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="text-champagne shrink-0 ml-4" size={18} /> : <ChevronDown className="text-champagne shrink-0 ml-4" size={18} />}
      </button>
      <div className={`mt-3 text-sm md:text-base leading-7 text-stoneGray font-sans pb-2 ${isOpen ? "block" : "hidden"}`}>
        {answer}
      </div>
    </div>
  );
}

const defaultFaqs = [
  {
    question: "What is anti-tarnish jewellery?",
    answer: "Anti-tarnish jewellery is specially coated or made from materials like stainless steel and PVD gold plating that resist oxidation, keeping their shine intact for much longer."
  },
  {
    question: "Is the jewellery waterproof?",
    answer: "Yes, our jewellery is highly water-resistant. You can wear it while washing hands or in the shower without worrying about it losing its color."
  },
  {
    question: "How do I care for my jewellery?",
    answer: "Store your pieces in the provided pouches or boxes. Wipe them with a soft cloth after use to maintain their shine and avoid direct contact with harsh chemicals or perfumes."
  },
  {
    question: "Is Cash on Delivery available?",
    answer: "Yes, Cash on Delivery is available for most locations across India. You can choose this option at checkout."
  },
  {
    question: "Why do COD orders need verification?",
    answer: "To ensure the authenticity of Cash on Delivery orders and prevent fraudulent requests, we may contact you via WhatsApp or phone call to confirm your details before shipping."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you will receive a tracking ID via email or SMS. You can also log into your account or visit our Track Order page to check its live status."
  },
  {
    question: "What is the return/exchange policy?",
    answer: "We offer a 7-day easy return or exchange window for eligible products. Please visit our Return Policy page for exclusions and detailed conditions."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach out to us anytime via email at anti.tarnish.jewel@gmail.com, or through our Contact page. Our support team typically responds within 24 hours."
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
      <h1 className="text-4xl font-serif font-semibold text-charcoalBrown tracking-wide">Frequently Asked Questions</h1>
      <p className="mt-4 text-stoneGray text-sm md:text-base leading-7">
        {introText}
      </p>
      
      <div className="mt-8 rounded-[2rem] border border-[#F1CFCF]/50 bg-white/70 backdrop-blur-md p-6 md:p-10 shadow-jewel">
        <div className="divide-y divide-goldBeige">
          {defaultFaqs.map((faq, idx) => (
            <FAQAccordionItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
