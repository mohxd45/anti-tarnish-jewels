import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./context/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Hardcoded Soft Pink Girly Luxury Theme (No more dynamic CSS variables)
        noir: "#FFF0F5", // Site Background
        charcoal: "#FFF9FB", // Card Background
        gold: "#B8955E", // Gold Accent
        rose: "#E89AAA", // Primary Theme (Pink)
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
        champagne: "#E89AAA", // Mapped to Primary Pink so buttons/accents become pink
        taupe: "#D8A7B1",
        charcoalBrown: "#3A2428",
        stoneGray: "#8A626B",
        goldBeige: "#F2C8D3",
        dustyRose: "#F3B6C6"
      },
      boxShadow: {
        jewel: "0 15px 50px -10px rgba(232, 154, 170, 0.15), 0 4px 12px -5px rgba(58, 36, 40, 0.04)",
        glass: "0 12px 40px -8px rgba(58, 36, 40, 0.05), 0 2px 8px -3px rgba(58, 36, 40, 0.02)"
      },
      backgroundImage: {
        "gold-radial": "radial-gradient(circle at top left, rgba(232, 154, 170, 0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(216, 167, 177, 0.08), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
