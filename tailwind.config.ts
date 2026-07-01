import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./context/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },

      colors: {
        // Lovable Radiant Showroom Palette Exact
        blush: "oklch(0.93 0.045 20)",
        "blush-deep": "oklch(0.83 0.08 18)",
        rose: "oklch(0.72 0.13 12)",
        "rose-gold": "oklch(0.74 0.105 45)",
        champagne: "oklch(0.86 0.08 80)",
        gold: "oklch(0.78 0.13 75)",
        ink: "oklch(0.18 0.03 20)",

        // Hardcoded Soft Pink Girly Luxury Theme (No more dynamic CSS variables)
        noir: "#FFF0F5", // Site Background
        charcoal: "#FFF9FB", // Card Background
        brandGoldOriginal: "#B8955E", // Gold Accent
        cream: "#3A2428", // Primary Text
        mutedGold: "#D8A7B1", // Secondary Color
        
        // Semantic quiet luxury color definitions
        brandMainBg: "#FFF0F5",
        brandSectionBg: "#FFE6EE",
        brandCardBg: "#FFF9FB",
        brandGold: "#B8955E",
        brandGoldDeep: "#A98245",
        brandTaupe: "#D8A7B1",
        brandEspresso: "#3A2428",
        brandMutedText: "#8A626B",
        brandBorder: "#F2C8D3",
        brandSale: "#E89AAA",
        brandSuccess: "#4F8F73",
        brandWarning: "#D6A84F",

        // Keep old static keys mapped to new values to minimize layout breakages
        ivory: "#FFE6EE",
        beige: "#FFF0F5",
        warmwhite: "#FFF9FB",
        taupe: "#D8A7B1",
        charcoalBrown: "#3A2428",
        stoneGray: "#8A626B",
        goldBeige: "#F2C8D3",
        dustyRose: "#F3B6C6"
      },
      boxShadow: {
        glow: "0 20px 60px -15px oklch(0.74 0.105 45 / 0.45)",
        soft: "0 30px 80px -30px oklch(0.5 0.1 20 / 0.35)",
        glass: "0 8px 32px oklch(0.5 0.08 20 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.5)",

        jewel: "0 15px 50px -10px rgba(232, 154, 170, 0.15), 0 4px 12px -5px rgba(58, 36, 40, 0.04)",
        glassOriginal: "0 12px 40px -8px rgba(58, 36, 40, 0.05), 0 2px 8px -3px rgba(58, 36, 40, 0.02)"
      },
      backgroundImage: {
        "gradient-luxe": "linear-gradient(135deg, oklch(0.93 0.06 20) 0%, oklch(0.86 0.09 35) 50%, oklch(0.82 0.11 55) 100%)",
        "gradient-gold": "linear-gradient(135deg, oklch(0.86 0.08 80), oklch(0.74 0.105 45), oklch(0.88 0.07 70))",
        "gradient-spotlight": "radial-gradient(ellipse at top, oklch(0.95 0.05 30 / 0.9), oklch(0.88 0.07 20 / 0.4) 40%, transparent 70%)",
        "gradient-deep": "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.86 0.08 18) 100%)",

        "gold-radial": "radial-gradient(circle at top left, rgba(232, 154, 170, 0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(216, 167, 177, 0.08), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
