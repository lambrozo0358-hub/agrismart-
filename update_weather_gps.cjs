const fs = require('fs');
let content = fs.readFileSync('src/components/WeatherIntel.tsx', 'utf8');

const oldGpsError = `        setLocating(false);
        // Fallback simulate to make it work beautifully even in restricted/sandboxed iframe!
        setGpsError("Simulating standard agricultural plot calibration...");
        const simulatedCoords = { latitude: 30.4183, longitude: -9.5658 }; // Default Agadir
        if (onGpsDetect) {
          setTimeout(() => {
            onGpsDetect(simulatedCoords);
          }, 600);
        }`;

const newGpsError = `        // Fallback to IP geolocation if GPS is restricted (e.g. in iframe)
        setGpsError(lang === "ar" ? "تعذر الوصول لـ GPS، جاري تحديد الموقع عبر IP..." : "GPS restricted, locating via IP...");
        fetch('https://ipinfo.io/json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.loc) {
              const [latStr, lonStr] = data.loc.split(',');
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(latStr), longitude: parseFloat(lonStr) });
              }
            } else {
              setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
            }
          })
          .catch(err => {
            setLocating(false);
            console.error("IP Loc Error:", err);
            setGpsError(lang === "ar" ? "محاكاة الموقع..." : "Simulating location...");
            const simulatedCoords = { latitude: 30.4183, longitude: -9.5658 };
            if (onGpsDetect) {
              setTimeout(() => onGpsDetect(simulatedCoords), 600);
            }
          });`;

if (content.includes(oldGpsError)) {
  content = content.replace(oldGpsError, newGpsError);
  fs.writeFileSync('src/components/WeatherIntel.tsx', content);
  console.log("Updated WeatherIntel.tsx");
} else {
  console.log("Could not find oldGpsError block in WeatherIntel.tsx");
}
