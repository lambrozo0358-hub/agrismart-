const fs = require('fs');
let content = fs.readFileSync('src/components/MoroccanMap.tsx', 'utf8');

content = content.replace(
  '(import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY) ||',
  '((import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY) ||'
);

fs.writeFileSync('src/components/MoroccanMap.tsx', content);
