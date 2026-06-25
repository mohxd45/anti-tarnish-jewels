const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app', 'globals.css');
let content = fs.readFileSync(file, 'utf8');

// Append new utilities
const newUtilities = `
@layer utilities {
  .glass {
    background: linear-gradient(135deg, oklch(1 0 0 / 0.55), oklch(1 0 0 / 0.25));
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid oklch(1 0 0 / 0.55);
    box-shadow: var(--shadow-glass);
  }

  .glass-dark {
    background: linear-gradient(135deg, oklch(0.25 0.05 20 / 0.6), oklch(0.2 0.04 20 / 0.4));
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid oklch(1 0 0 / 0.15);
    box-shadow: var(--shadow-glass);
  }

  .text-gold {
    background: linear-gradient(135deg, oklch(0.86 0.08 80), oklch(0.74 0.105 45), oklch(0.88 0.07 70));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .shine {
    position: relative;
    overflow: hidden;
  }
  .shine::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(115deg, transparent 30%, oklch(1 0 0 / 0.6) 50%, transparent 70%);
    transform: translateX(-120%);
    transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }
  .shine:hover::after { transform: translateX(120%); }

  .float-slow { animation: float-slow 7s ease-in-out infinite; }
  .float-mid { animation: float-mid 5.5s ease-in-out infinite; }
  .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  
  .tilt-card {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .tilt-card:hover { 
    transform: perspective(1000px) rotateX(6deg) rotateY(-10deg) translateZ(20px); 
  }
}

@keyframes float-slow {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  50% { transform: translate3d(0, -22px, 0) rotate(3deg); }
}
@keyframes float-mid {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  50% { transform: translate3d(10px, -16px, 0) rotate(-4deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.74 0.105 45 / 0.5); }
  50% { box-shadow: 0 0 60px 10px oklch(0.74 0.105 45 / 0.25); }
}
`;

content += '\n' + newUtilities;

fs.writeFileSync(file, content, 'utf8');
console.log('globals.css updated with Lovable styles.');
