const fs = require('fs');

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  // We need to handle the response format of geojs
  // geojs returns { latitude: "51.5", longitude: "-0.1" } instead of loc: "lat,lon"
  
  const oldBlock1 = `fetch('/api/my-location')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.loc) {
              const [latStr, lonStr] = data.loc.split(',');
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(latStr), longitude: parseFloat(lonStr) });
              }
            } else {`;
            
  const newBlock1 = `fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
              }
            } else {`;
            
  const oldBlock2 = `fetch('/api/my-location')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.loc) {
                                    const [latStr, lonStr] = data.loc.split(',');
                                    const lat = parseFloat(latStr);
                                    const lon = parseFloat(lonStr);
                                    const calculatedReg = getClosestRegion(lat, lon);
                                    setNewFarmLocation(calculatedReg);
                                    setGpsCoords({ latitude: lat, longitude: lon });
                                  } else {`;

  const newBlock2 = `fetch('https://get.geojs.io/v1/ip/geo.json')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.latitude && data.longitude) {
                                    const lat = parseFloat(data.latitude);
                                    const lon = parseFloat(data.longitude);
                                    const calculatedReg = getClosestRegion(lat, lon);
                                    setNewFarmLocation(calculatedReg);
                                    setGpsCoords({ latitude: lat, longitude: lon });
                                  } else {`;

  const oldBlock3 = `fetch('/api/my-location')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            if (data && data.loc) {
              const [latStr, lonStr] = data.loc.split(',');
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(latStr), longitude: parseFloat(lonStr) });
              }
            } else if (onGpsDetect) {`;
            
  const newBlock3 = `fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
              }
            } else if (onGpsDetect) {`;

  if (content.includes(oldBlock1)) content = content.replace(oldBlock1, newBlock1);
  if (content.includes(oldBlock2)) content = content.replace(oldBlock2, newBlock2);
  if (content.includes(oldBlock3)) content = content.replace(oldBlock3, newBlock3);
  
  fs.writeFileSync(file, content);
}

replaceInFile('src/components/WeatherIntel.tsx');
replaceInFile('src/components/MoroccanMap.tsx');
replaceInFile('src/App.tsx');

console.log("Updated to use geojs");
