"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Truck } from "lucide-react";

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
    message = `Add ${currency} ${milestones[0].amount} more to get ${milestones[0].label} on this order`;
  } else if (!nextMilestone) {
    message = "✨ All cart rewards unlocked!";
  } else {
    const amountLeft = nextMilestone.amount - subtotal;
    message = `Add ${currency} ${amountLeft.toLocaleString()} more to get ${nextMilestone.label} on this order`;
  }

  // To prevent the first milestone from being placed too close to 0 or 100
  // we will map them using space-around logic. 
  // In the reference image, the bar doesn't start at 0 = ₹0.
  // The first milestone is around 25% of the bar, second is 60%, third is 100%.
  // We can calculate left percent relative to max amount, but give it a bit of padding.
  
  return (
    <div className="bg-white px-4 py-6 border-b border-stone-100">
      <p className="mb-8 text-[13px] md:text-sm font-medium text-[#4A4A4A] text-center max-w-[280px] mx-auto leading-relaxed">
        {message}
      </p>
      
      {/* Tracker Bar Container */}
      <div className="relative w-[85%] mx-auto pb-10">
        
        {/* Background Grey Line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-[#D3D9CF] rounded-full" />
        
        {/* Filled Pink Line */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-[#FA9A9C] rounded-full z-0"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Milestones */}
        {milestones.map((milestone, idx) => {
          const isReached = subtotal >= milestone.amount;
          const leftPercent = (milestone.amount / maxAmount) * 100;
          
          return (
            <div 
              key={idx} 
              className="absolute top-1/2 flex flex-col items-center z-10"
              style={{ 
                left: `${leftPercent}%`,
                transform: `translate(-50%, -50%)`
              }}
            >
              {/* Circle with Truck */}
              <div 
                className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-500 z-10 ${
                  isReached ? 'bg-[#FA9A9C]' : 'bg-[#D3D9CF]'
                }`}
              >
                <Truck className={`w-3.5 h-3.5 ${isReached ? 'text-white fill-white' : 'text-[#303940] fill-[#303940]'}`} />
              </div>
              
              {/* Text Label Below */}
              <div className="absolute top-8 w-24 text-center">
                <div className="text-[11px] leading-[1.3] text-[#4A4A4A] font-medium whitespace-pre-wrap">
                  {milestone.label}
                  <br />
                  on {currency}{milestone.amount}!
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
