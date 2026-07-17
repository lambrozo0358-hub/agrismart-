const fs = require('fs');
let content = fs.readFileSync('src/components/MoroccanMap.tsx', 'utf8');

const keyCheck = `
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY) ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';
`;

// we'll insert this right before the component declaration:
// export default function MoroccanMap({ lang, selectedRegion, onRegionChange, gpsCoords, onGpsDetect }: MoroccanMapProps) {
content = content.replace(
  'export default function MoroccanMap({ lang, selectedRegion, onRegionChange, gpsCoords, onGpsDetect }: MoroccanMapProps) {',
  keyCheck + '\nexport default function MoroccanMap({ lang, selectedRegion, onRegionChange, gpsCoords, onGpsDetect }: MoroccanMapProps) {'
);

const missingKeyBlock = `
  if (!hasValidKey) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
        <p className="text-slate-300 mb-2"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">Get an API Key</a></p>
        <p className="text-slate-300 mb-2"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
        <ul className="text-left text-sm text-slate-400 space-y-2 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
          <li>Select <strong>Secrets</strong></li>
          <li>Type <code className="text-emerald-300">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
          <li>Paste your API key as the value, press <strong>Enter</strong></li>
        </ul>
        <p className="text-xs text-slate-500">The app rebuilds automatically after you add the secret.</p>
      </div>
    );
  }
`;

content = content.replace(
  'const t = translations[lang];',
  missingKeyBlock + '\n  const t = translations[lang];'
);

// We need to fix the provider to use the correct API_KEY variable
content = content.replace(
  '<APIProvider apiKey={process.env.GOOGLE_MAPS_PLATFORM_KEY || \'\'} version="weekly">',
  '<APIProvider apiKey={API_KEY} version="weekly">'
);

fs.writeFileSync('src/components/MoroccanMap.tsx', content);
console.log("Updated map component with key check.");
