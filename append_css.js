const fs = require('fs');
const css = `
/* UI Custom Classes */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(183, 110, 121, 0.1);
}
.glass-dark {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.liquid-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(183, 110, 121, 0.15), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(183, 110, 121, 0.1);
}
.neo-input {
  background: #FAF0E6;
  border: none;
  box-shadow: inset 4px 4px 8px rgba(183, 110, 121, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}
.clay-badge {
  background: linear-gradient(145deg, #F9A8D4, #F472B6);
  box-shadow: 5px 5px 10px rgba(183, 110, 121, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.5), inset 2px 2px 4px rgba(255,255,255,0.3);
  border-radius: 20px;
}
.gold-trim {
  background: linear-gradient(135deg, #D4AF37 0%, #E8D48B 50%, #B8860B 100%);
  box-shadow: 0 2px 4px rgba(184, 134, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.4);
}
.btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  white-space: nowrap;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}
.btn-liquid {
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.6);
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-liquid:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%);
  transform: translateY(-2px);
}
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-animate {
  animation: ticker 30s linear infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-3deg); }
}
@keyframes floatReverse {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(10px) rotate(2deg); }
}
.float-anim { animation: float 6s ease-in-out infinite; }
.float-slow { animation: floatSlow 8s ease-in-out infinite; }
.float-reverse { animation: floatReverse 7s ease-in-out infinite; }
.trust-badge {
  background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}
.product-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(183, 110, 121, 0.2);
}
.qty-btn {
  width: 32px; height: 32px;
  background: #FAF0E6;
  border: none;
  box-shadow: 3px 3px 6px rgba(183, 110, 121, 0.2), -3px -3px 6px rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  color: #B76E79;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:active {
  box-shadow: inset 2px 2px 4px rgba(183, 110, 121, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.5);
}
`;
fs.appendFileSync('C:\\Users\\LG GRAM\\Downloads\\noore-jewels\\anti-tarnish-jewels-latest-antigravity\\app\\globals.css', css);
