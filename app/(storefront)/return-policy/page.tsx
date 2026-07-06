"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/firestore";

import Link from "next/link";

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
    <section className="mx-auto max-w-4xl px-4 pt-16 pb-32">
      <div className="text-center mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-serif text-charcoalBrown md:text-5xl mb-6">Return & Refund Policy</h1>
        <Link href="/returns" className="btn-primary-gold px-8 py-3 w-full sm:w-auto">
          Start a Return / Exchange
        </Link>
      </div>
      <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl p-6 md:p-10">
        <p className="mb-8 whitespace-pre-line text-lg font-serif">
          {returnPolicyText}
        </p>
        
        <h2 className="text-xl font-serif text-charcoalBrown mt-8 mb-4">Conditions for Returns & exchange window:</h2>
        <ul className="list-disc list-inside space-y-3 mb-8">
          <li>Items must be returned in their original, unopened, and unused condition.</li>
          <li>All original brand packaging, price tags, manuals, and accessories must be intact.</li>
          <li>We offer a strict 7-day exchange window from the date of delivery.</li>
          <li>A valid proof of purchase (invoice copy or order confirmation) must accompany the return.</li>
        </ul>

        <h2 className="text-xl font-serif text-charcoalBrown mt-8 mb-4">Damaged item policy:</h2>
        <p className="mb-8">
          In the rare event that you receive a defective or damaged product, please contact our support team within 24 hours of delivery. A full unboxing video is required to process any claims under our damaged item policy.
        </p>

        <h2 className="text-xl font-serif text-charcoalBrown mt-8 mb-4">COD cancellation:</h2>
        <p className="mb-8">
          If you placed an order via Cash on Delivery, you may cancel it before it is dispatched. However, frequent COD cancellation or rejecting orders at the doorstep may result in the restriction of COD privileges for your account.
        </p>

        <h2 className="text-xl font-serif text-charcoalBrown mt-8 mb-4">Exclusions:</h2>
        <p className="mb-8">
          Certain product categories such as personal care goods, innerwear, beauty/cosmetics (if seal is broken), and custom gifts cannot be returned due to hygiene and safety guidelines.
        </p>

        <h2 className="text-xl font-serif text-charcoalBrown mt-8 mb-4">Support contact:</h2>
        <p className="mb-2">
          If you have any questions regarding our return and refund process, please reach out via our support contact details at <a href="mailto:support@antitarnishjewels.com" className="text-[color:var(--color-gold)] font-semibold hover:underline">support@antitarnishjewels.com</a> or use the WhatsApp chat.
        </p>
      </div>
    </section>
  );
}
