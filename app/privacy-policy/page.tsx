"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/firestore";

export default function PrivacyPolicyPage() {
  const [privacyPolicyText, setPrivacyPolicyText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getSiteContent("policies");
      if (data?.privacyPolicyText) {
        setPrivacyPolicyText(data.privacyPolicyText);
      } else {
        setPrivacyPolicyText("At Anti Tarnish Jewels, accessible from our online store, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Anti Tarnish Jewels and how we use it.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!mounted) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Privacy Policy</h1>
      <div className="mt-6 rounded-[2rem] border border-gold/15 bg-white/[0.04] p-8 leading-8 text-cream/70 font-sans text-sm md:text-base">
        <p className="mb-4 whitespace-pre-line">
          {privacyPolicyText}
        </p>
        <p className="text-xs md:text-sm">
          We use your personal information solely to process orders, manage accounts, ship items, and provide customer service notifications. We do not sell or share customer data with third parties.
        </p>
      </div>
    </section>
  );
}
