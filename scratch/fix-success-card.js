const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../components/ui/OrderSuccessCard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace all framer motion imports and usages
content = `import React, { ReactNode } from "react";

interface OrderSuccessCardProps {
  children: ReactNode;
}

export function OrderSuccessCard({ children }: OrderSuccessCardProps) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white/95 backdrop-blur-sm p-10 shadow-sm flex flex-col items-center overflow-hidden relative animate-fade-in">
      {children}
    </div>
  );
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed OrderSuccessCard.');
