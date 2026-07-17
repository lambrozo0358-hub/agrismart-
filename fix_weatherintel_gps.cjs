const fs = require('fs');

const file = 'src/components/WeatherIntel.tsx';
let content = fs.readFileSync(file, 'utf8');

const getClosestRegionBlock = `
  const moroccoRegionsCoords: Record<string, { lat: number; lon: number }> = {
    "Tanger-Tétouan-Al Hoceïma": { lat: 35.75, lon: -5.83 },
    "Oriental": { lat: 34.68, lon: -1.91 },
    "Fès-Meknès": { lat: 34.03, lon: -5.00 },
    "Rabat-Salé-Kénitra": { lat: 34.02, lon: -6.83 },
    "Béni Mellal-Khénifra": { lat: 32.33, lon: -6.36 },
    "Casablanca-Settat": { lat: 33.57, lon: -7.58 },
    "Marrakech-Safi": { lat: 31.62, lon: -7.98 },
    "Drâa-Tafilalet": { lat: 31.93, lon: -4.42 },
    "Souss-Massa": { lat: 30.42, lon: -9.59 },
    "Guelmim-Oued Noun": { lat: 28.98, lon: -10.05 },
    "Laâyoune-Sakia El Hamra": { lat: 27.12, lon: -13.16 },
    "Dakhla-Oued Ed-Dahab": { lat: 23.71, lon: -15.93 }
  };

  const getClosestRegion = (lat: number, lon: number) => {
    let closest = "Souss-Massa";
    let minDistance = Infinity;
    for (const [name, coords] of Object.entries(moroccoRegionsCoords)) {
      const d = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lon - lon, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = name;
      }
    }
    return closest;
  };
`;

const fetchBlockOld = `
    fetch("/api/weather/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: selectedRegion,
        latitude: gpsCoords?.latitude || 0,
        longitude: gpsCoords?.longitude || 0
      })
    })
`;

const fetchBlockNew = `
    let sendLat = gpsCoords?.latitude || 0;
    let sendLon = gpsCoords?.longitude || 0;

    // If user has GPS but selected a DIFFERENT region manually, we should center on the selected region, not the GPS
    if (gpsCoords && gpsCoords.latitude !== 0) {
       const gpsRegion = getClosestRegion(gpsCoords.latitude, gpsCoords.longitude);
       if (gpsRegion !== selectedRegion) {
         sendLat = moroccoRegionsCoords[selectedRegion]?.lat || 0;
         sendLon = moroccoRegionsCoords[selectedRegion]?.lon || 0;
       }
    } else if (moroccoRegionsCoords[selectedRegion]) {
       sendLat = moroccoRegionsCoords[selectedRegion].lat;
       sendLon = moroccoRegionsCoords[selectedRegion].lon;
    }

    fetch("/api/weather/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: selectedRegion,
        latitude: sendLat,
        longitude: sendLon
      })
    })
`;

content = content.replace('const t = translations[lang];', 'const t = translations[lang];\n' + getClosestRegionBlock);
content = content.replace(fetchBlockOld, fetchBlockNew);

fs.writeFileSync(file, content);
console.log("Updated WeatherIntel.tsx");
