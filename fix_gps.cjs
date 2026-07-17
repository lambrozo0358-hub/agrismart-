const fs = require('fs');

let file = 'src/components/WeatherIntel.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }`;

const newBlock = `
    const fallback = () => {
        setGpsError(lang === "ar" ? "تعذر الوصول لـ GPS، جاري تحديد الموقع عبر IP..." : "GPS restricted, locating via IP...");
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
              }
            } else {
              setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
            }
          })
          .catch(() => {
            setLocating(false);
            setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
          });
    };

    if (!navigator.geolocation) {
      setLocating(true);
      fallback();
      return;
    }
`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log("Fixed WeatherIntel.tsx");
