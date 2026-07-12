"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Truck, Gift, Package } from "lucide-react";

interface Milestone {
  amount: number;
  label: string;
}

interface CartRewardTrackerProps {
  subtotal: number;
}

const FALLBACK_MILESTONES: Milestone[] = [
  { amount: 599, label: "Free Shipping" },
  { amount: 699, label: "Free Gift" },
  { amount: 1199, label: "Free Organiser" }
];

export function CartRewardTracker({ subtotal }: CartRewardTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(FALLBACK_MILESTONES);
  const [isEnabled, setIsEnabled] = useState(true);
  const [currency, setCurrency] = useState("₹");

  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        const docRef = doc(db, "siteSettings", "cartRewards");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && mounted) {
          const data = docSnap.data();
          if (data.isEnabled !== undefined) setIsEnabled(data.isEnabled);
          if (data.currency) setCurrency(data.currency);
          if (data.milestones && Array.isArray(data.milestones) && data.milestones.length > 0) {
            const sorted = [...data.milestones].sort((a, b) => a.amount - b.amount);
            setMilestones(sorted);
          }
        }
      } catch (error) {
        console.error("Error fetching cart rewards settings:", error);
      }
    }
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  if (!isEnabled || milestones.length === 0) return null;

  const maxAmount = milestones[milestones.length - 1].amount;
  const progressPercent = Math.min(100, (subtotal / maxAmount) * 100);

  const nextMilestone = milestones.find(m => subtotal < m.amount);

  let message = "";
  if (subtotal === 0) {
    message = `Add ${currency}${milestones[0].amount} more to unlock ${milestones[0].label}`;
  } else if (!nextMilestone) {
    message = "✨ All cart rewards unlocked!";
  } else {
    const amountLeft = nextMilestone.amount - subtotal;
    message = `Add ${currency}${amountLeft.toLocaleString()} more to unlock ${nextMilestone.label}`;
  }

  return (
    <div className="bg-brandCardBg px-4 py-5 border-b border-brandBorder/30 rounded-b-2xl shadow-sm mb-4 mx-4 mt-2">
      <p className="mb-4 text-sm font-semibold text-brandEspresso text-center max-w-[280px] mx-auto leading-relaxed">
        {message}
      </p>
      
      {/* Tracker Bar */}
      <div className="relative w-full h-2.5 bg-stone-100 rounded-full mb-5 overflow-hidden shadow-inner border border-stone-200">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-brandGold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Vertical Milestones */}
      <div className="flex flex-col gap-2.5">
        {milestones.map((milestone, idx) => {
          const isReached = subtotal >= milestone.amount;
          const Icon = idx === 0 ? Truck : idx === 1 ? Gift : Package;
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isReached ? 'bg-brandGold/5 border-brandGold/30' : 'bg-white/50 border-stone-100'
              }`}
            >
              {/* Circle Icon */}
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-colors ${
                  isReached ? 'bg-brandGold text-white' : 'bg-stone-100 text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              
              {/* Labels */}
              <div className="flex-1 flex justify-between items-center">
                <span className={`text-sm font-semibold ${isReached ? 'text-brandEspresso' : 'text-stone-500'}`}>
                  {milestone.label}
                </span>
                <span className={`text-sm font-bold ${isReached ? 'text-brandGoldDeep' : 'text-stone-400'}`}>
                  {currency}{milestone.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
