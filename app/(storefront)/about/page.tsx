"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/firestore";
import { Protected } from "@/components/Protected";

export default function AboutPage() {
  const [aboutText, setAboutText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getSiteContent("about");
      if (data?.aboutText) {
        setAboutText(data.aboutText);
      } else {
        setAboutText("Welcome to LONA JEWELS, your premium destination for anti-tarnish jewellery. We offer carefully curated collections of rings, necklaces, bracelets, earrings, and accessories that stay beautiful forever.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!mounted) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">About LONA JEWELS</h1>
      <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white/[0.04] p-8 leading-8 text-stone-600 font-sans text-sm md:text-base">
        <p className="whitespace-pre-line">
          {aboutText}
        </p>
        <p className="mt-4">
          Our mission is to combine luxury aesthetics with daily utility, offering state-of-the-art products at affordable price points. With express shipping, secure payment checkouts, and premium packaging, we ensure every shopping experience is memorable.
        </p>
      </div>
    </section>
  );
}
