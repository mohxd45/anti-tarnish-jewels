import { Check, Sparkles } from "lucide-react";

export function OrderSuccessAnimation() {
  return (
    <div className="relative mb-6 flex items-center justify-center">
      <div
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-champagne text-white shadow-lg animate-fade-in"
      >
        <div className="animate-fade-in animation-delay-200">
          <Check size={48} strokeWidth={3} className="text-ivory" />
        </div>
      </div>
      
      <div
        className="absolute -right-4 -top-4 text-champagne animate-fade-in animation-delay-400"
      >
        <Sparkles size={32} />
      </div>
      
      <div
        className="absolute -bottom-2 -left-4 text-dustyRose animate-fade-in animation-delay-600"
      >
        <Sparkles size={24} />
      </div>
    </div>
  );
}
