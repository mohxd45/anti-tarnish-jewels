const fs = require('fs');

const footerContent = `"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <h3 className="font-display text-2xl text-[var(--gold)] mb-6">Anti Tarnish Jewels</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Premium waterproof, sweatproof, and life-proof luxury jewellery designed for your everyday elegance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-6 tracking-wide">Shop</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/shop" className="hover:text-[var(--gold)] transition-colors">All Jewellery</Link></li>
            <li><Link href="/shop?category=Rings" className="hover:text-[var(--gold)] transition-colors">Rings</Link></li>
            <li><Link href="/shop?category=Necklaces" className="hover:text-[var(--gold)] transition-colors">Necklaces</Link></li>
            <li><Link href="/shop?category=Earrings" className="hover:text-[var(--gold)] transition-colors">Earrings</Link></li>
            <li><Link href="/shop?category=Bracelets" className="hover:text-[var(--gold)] transition-colors">Bracelets</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-6 tracking-wide">Support</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/contact" className="hover:text-[var(--gold)] transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-[var(--gold)] transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-[var(--gold)] transition-colors">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-[var(--gold)] transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/track-order" className="hover:text-[var(--gold)] transition-colors">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-6 tracking-wide">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <div className="flex">
            <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 w-full text-sm focus:outline-none focus:border-[var(--gold)]" />
            <button className="bg-[var(--gold)] text-[var(--ink)] px-4 py-3 rounded-r-lg font-semibold hover:bg-[var(--gold-light)] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Anti Tarnish Jewels. All rights reserved.</p>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync('components/Footer.tsx', footerContent);
