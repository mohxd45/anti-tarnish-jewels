"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileFooterAccordionProps {
  brandName: string;
  logoText: string;
  footerText: string;
  settings: any;
}

export function MobileFooterAccordion({
  brandName,
  logoText,
  footerText,
  settings,
}: MobileFooterAccordionProps) {
  // Use a very short intro if the footer text is too long
  const shortIntro = "Premium anti-tarnish jewellery crafted for everyday elegance.";

  return (
    <div className="md:hidden space-y-6">
      {/* Top Brand Row */}
      <div className="bg-[#FFF9FB] rounded-2xl border border-brandBorder/30 p-5 shadow-sm text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-transparent shadow-sm overflow-hidden">
          <img src="/lona-logo.jpg" alt="LONA JEWELS" className="w-full h-full object-contain" />
        </div>
        <h3 className="font-serif text-xl text-brandEspresso mb-1">{brandName}</h3>
        <p className="text-sm text-brandMutedText max-w-[280px] mx-auto">
          {shortIntro}
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="bg-[#FFF9FB] rounded-2xl border border-brandBorder/30 shadow-sm overflow-hidden px-4">
        <Accordion type="single" collapsible className="w-full">
          
          <AccordionItem value="about" className="border-brandBorder/30 border-b">
            <AccordionTrigger className="text-brandEspresso hover:no-underline font-serif text-lg py-4">
              About
            </AccordionTrigger>
            <AccordionContent className="text-brandMutedText pb-4 space-y-3 pl-2">
              <p className="text-sm mb-4 leading-relaxed">{footerText}</p>
              <Link href="/about" className="block hover:text-brandGoldDeep transition-colors">Our Story</Link>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shop" className="border-brandBorder/30 border-b">
            <AccordionTrigger className="text-brandEspresso hover:no-underline font-serif text-lg py-4">
              Shop
            </AccordionTrigger>
            <AccordionContent className="text-brandMutedText pb-4 space-y-3 pl-2">
              <Link href="/shop?category=Rings" className="block hover:text-brandGoldDeep transition-colors">Rings</Link>
              <Link href="/shop?category=Earrings" className="block hover:text-brandGoldDeep transition-colors">Earrings</Link>
              <Link href="/shop?category=Necklaces" className="block hover:text-brandGoldDeep transition-colors">Necklaces</Link>
              <Link href="/shop?category=Bracelets" className="block hover:text-brandGoldDeep transition-colors">Bracelets</Link>
              <Link href="/sale" className="block hover:text-brandGoldDeep transition-colors">Sale</Link>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="help" className="border-brandBorder/30 border-b">
            <AccordionTrigger className="text-brandEspresso hover:no-underline font-serif text-lg py-4">
              Help
            </AccordionTrigger>
            <AccordionContent className="text-brandMutedText pb-4 space-y-3 pl-2">
              <Link href="/track-order" className="block hover:text-brandGoldDeep transition-colors">Track Order</Link>
              <Link href="/contact" className="block hover:text-brandGoldDeep transition-colors">Contact Us</Link>
              <Link href="/faq" className="block hover:text-brandGoldDeep transition-colors">FAQ</Link>
              <Link href="/return-policy" className="block hover:text-brandGoldDeep transition-colors">Returns</Link>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="connect" className="border-none">
            <AccordionTrigger className="text-brandEspresso hover:no-underline font-serif text-lg py-4">
              Connect
            </AccordionTrigger>
            <AccordionContent className="text-brandMutedText pb-4 space-y-4 pl-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brandGold shrink-0" />
                <span className="text-sm">Support@lonajewels.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brandGold shrink-0" />
                <span className="text-sm">+91 8100558024</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brandGold mt-0.5 shrink-0" />
                <span className="text-sm leading-relaxed">BMST Enterprise, 96/H/7 Cossipore Road, Kolkata, West Bengal - 700002</span>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
}
