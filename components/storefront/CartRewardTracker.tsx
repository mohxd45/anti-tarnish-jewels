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
    <div className="bg-[#FFF9FB] px-2.5 py-2 border-b border-[#E8D7C8]/50 rounded-b-2xl shadow-sm mb-1 mx-2 mt-0">
      <p className="mb-1.5 text-[11px] font-semibold text-[#3A2428] text-center max-w-[280px] mx-auto leading-tight">
        {message}
      </p>
      
      {/* Tracker Bar */}
      <div className="relative w-full h-[6px] bg-[#E8D7C8]/40 rounded-full mb-2.5 overflow-hidden shadow-inner border border-[#E8D7C8]/20">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Vertical Milestones */}
      <div className="flex flex-col gap-1">
        {milestones.map((milestone, idx) => {
          const isReached = subtotal >= milestone.amount;
          const Icon = idx === 0 ? Truck : idx === 1 ? Gift : Package;
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-300 ${
                isReached 
                  ? 'bg-gradient-to-r from-[#B8955E]/10 to-transparent border-[#B8955E]/30 ring-1 ring-[#B8955E]/10 shadow-[0_0_8px_rgba(184,149,94,0.1)]' 
                  : 'bg-white/50 border-stone-100'
              }`}
            >
              {/* Circle Icon */}
              <div 
                className={`flex items-center justify-center w-[22px] h-[22px] shrink-0 rounded-full shadow-sm transition-colors duration-300 ${
                  isReached ? 'bg-[#B8955E] text-white shadow-md' : 'bg-stone-100 text-stone-400'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>
              
              {/* Labels */}
              <div className="flex-1 flex justify-between items-center">
                <span className={`text-[11px] font-semibold transition-colors duration-300 ${isReached ? 'text-[#3A2428]' : 'text-stone-500'}`}>
                  {milestone.label}
                </span>
                <span className={`text-[10px] font-bold transition-colors duration-300 ${isReached ? 'text-[#B8955E]' : 'text-stone-400'}`}>
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
