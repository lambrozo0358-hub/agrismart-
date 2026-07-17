const fs = require('fs');
let file = 'src/components/MoroccanMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const regionsCoordsBlock = `
  const moroccoRegionsCoords: Record<string, { lat: number; lng: number }> = {
    "Tanger-Tétouan-Al Hoceïma": { lat: 35.75, lng: -5.83 },
    "Oriental": { lat: 34.68, lng: -1.91 },
    "Fès-Meknès": { lat: 34.03, lng: -5.00 },
    "Rabat-Salé-Kénitra": { lat: 34.02, lng: -6.83 },
    "Béni Mellal-Khénifra": { lat: 32.33, lng: -6.36 },
    "Casablanca-Settat": { lat: 33.57, lng: -7.58 },
    "Marrakech-Safi": { lat: 31.62, lng: -7.98 },
    "Drâa-Tafilalet": { lat: 31.93, lng: -4.42 },
    "Souss-Massa": { lat: 30.42, lng: -9.59 },
    "Guelmim-Oued Noun": { lat: 28.98, lng: -10.05 },
    "Laâyoune-Sakia El Hamra": { lat: 27.12, lng: -13.16 },
    "Dakhla-Oued Ed-Dahab": { lat: 23.71, lng: -15.93 },
  };

  const getClosestRegion = (lat: number, lon: number) => {
    let closest = "Souss-Massa";
    let minDistance = Infinity;
    for (const [name, coords] of Object.entries(moroccoRegionsCoords)) {
      const d = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lon, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = name;
      }
    }
    return closest;
  };

  let mapCenter = { lat: 31.7917, lng: -7.0926 };
  let mapZoom = 5;

  const currentRegionName = selectedRegion || (internalRegionId && regionIdToName[internalRegionId]);

  if (currentRegionName && moroccoRegionsCoords[currentRegionName]) {
    // If we have a GPS location and it belongs to the currently selected region, center on the exact GPS.
    if (gpsCoords && gpsCoords.latitude !== 0 && getClosestRegion(gpsCoords.latitude, gpsCoords.longitude) === currentRegionName) {
      mapCenter = { lat: gpsCoords.latitude, lng: gpsCoords.longitude };
      mapZoom = 9;
    } else {
      // Center on the region's default coordinate
      mapCenter = moroccoRegionsCoords[currentRegionName];
      mapZoom = 7;
    }
  } else if (gpsCoords && gpsCoords.latitude !== 0) {
    mapCenter = { lat: gpsCoords.latitude, lng: gpsCoords.longitude };
    mapZoom = 9;
  }
`;

const oldGoogleMap = `<GoogleMap
                  defaultCenter={{ lat: gpsCoords?.latitude || 31.7917, lng: gpsCoords?.longitude || -7.0926 }}
                  center={gpsCoords && gpsCoords.latitude !== 0 ? { lat: gpsCoords.latitude, lng: gpsCoords.longitude } : { lat: 31.7917, lng: -7.0926 }}
                  defaultZoom={5}
                  zoom={gpsCoords && gpsCoords.latitude !== 0 ? 9 : 5}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  disableDefaultUI={true}
                  style={{ width: '100%', height: '100%' }}
                >`;

const newGoogleMap = `<GoogleMap
                  defaultCenter={{ lat: 31.7917, lng: -7.0926 }}
                  center={mapCenter}
                  defaultZoom={5}
                  zoom={mapZoom}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  disableDefaultUI={true}
                  style={{ width: '100%', height: '100%' }}
                >`;

content = content.replace('const t = translations[lang];', 'const t = translations[lang];\n' + regionsCoordsBlock);
content = content.replace(oldGoogleMap, newGoogleMap);

fs.writeFileSync(file, content);
console.log("Updated map centering logic in MoroccanMap.tsx");
