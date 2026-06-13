"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/firestore";

export default function ReturnPolicyPage() {
  const [returnPolicyText, setReturnPolicyText] = useState("At Anti Tarnish Jewels, customer satisfaction is our top priority. We offer a 7-day easy return and replacement policy for eligible products.");

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
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Return & Refund Policy</h1>
      <div className="mt-6 rounded-[2rem] border border-gold/15 bg-white/[0.04] p-8 leading-8 text-cream/70 font-sans text-sm md:text-base">
        <p className="mb-4 whitespace-pre-line">
          {returnPolicyText}
        </p>
        
        <h2 className="text-lg font-serif font-semibold text-gold mt-6 mb-2">Conditions for Returns & exchange window:</h2>
        <ul className="list-disc list-inside space-y-2 mb-4 text-xs md:text-sm">
          <li>Items must be returned in their original, unopened, and unused condition.</li>
          <li>All original brand packaging, price tags, manuals, and accessories must be intact.</li>
          <li>We offer a strict 7-day exchange window from the date of delivery.</li>
          <li>A valid proof of purchase (invoice copy or order confirmation) must accompany the return.</li>
        </ul>

        <h2 className="text-lg font-serif font-semibold text-gold mt-6 mb-2">damaged item policy:</h2>
        <p className="text-xs md:text-sm mb-4">
          In the rare event that you receive a defective or damaged product, please contact our support team within 24 hours of delivery. A full unboxing video is required to process any claims under our damaged item policy.
        </p>

        <h2 className="text-lg font-serif font-semibold text-gold mt-6 mb-2">COD cancellation:</h2>
        <p className="text-xs md:text-sm mb-4">
          If you placed an order via Cash on Delivery, you may cancel it before it is dispatched. However, frequent COD cancellation or rejecting orders at the doorstep may result in the restriction of COD privileges for your account.
        </p>

        <h2 className="text-lg font-serif font-semibold text-gold mt-6 mb-2">Exclusions:</h2>
        <p className="text-xs md:text-sm mb-4">
          Certain product categories such as personal care goods, innerwear, beauty/cosmetics (if seal is broken), and custom gifts cannot be returned due to hygiene and safety guidelines.
        </p>

        <h2 className="text-lg font-serif font-semibold text-gold mt-6 mb-2">support contact:</h2>
        <p className="text-xs md:text-sm">
          If you have any questions regarding our return and refund process, please reach out via our support contact details at support@antitarnishjewels.com or use the WhatsApp chat.
        </p>
      </div>
    </section>
  );
}
