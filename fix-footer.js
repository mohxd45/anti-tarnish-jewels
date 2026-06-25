const fs = require('fs');
let c = fs.readFileSync('components/Footer.tsx', 'utf8');
c = c.replace(
  'import { usePathname } from "next/navigation";',
  'import { usePathname } from "next/navigation";\nimport { PublicJewelryBackground } from "./ui/PublicJewelryBackground";'
);
c = c.replace(
  '<footer className="mt-20 border-t border-goldBeige/40 bg-beige px-4 pt-12 pb-28 lg:pb-12">\n      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">',
  '<PublicJewelryBackground variant="footer" intensity="low" className="mt-20 border-t border-goldBeige/40" contentClassName="px-4 pt-12 pb-28 lg:pb-12 bg-beige/80 backdrop-blur-sm">\n      <footer className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4 relative z-10">'
);
c = c.replace(
  '<footer className="mt-20 border-t border-goldBeige/40 bg-beige px-4 pt-12 pb-28 lg:pb-12">\r\n      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">',
  '<PublicJewelryBackground variant="footer" intensity="low" className="mt-20 border-t border-goldBeige/40" contentClassName="px-4 pt-12 pb-28 lg:pb-12 bg-beige/80 backdrop-blur-sm">\r\n      <footer className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4 relative z-10">'
);
c = c.replace(
  '        </div>\n      </footer>\n    );\n}',
  '      </footer>\n    </PublicJewelryBackground>\n  );\n}'
);
c = c.replace(
  '        </div>\r\n      </footer>\r\n    );\r\n}',
  '      </footer>\r\n    </PublicJewelryBackground>\r\n  );\r\n}'
);
fs.writeFileSync('components/Footer.tsx', c);
