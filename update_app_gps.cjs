const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldGpsFallback = `                            () => {
                              // Fallback simulated gps
                              const simulatedCoords = { latitude: 30.4183, longitude: -9.5658 };
                              setNewFarmLocation("Souss-Massa");
                              setGpsCoords(simulatedCoords);
                            }`;

const newGpsFallback = `                            () => {
                              fetch('https://ipinfo.io/json')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.loc) {
                                    const [latStr, lonStr] = data.loc.split(',');
                                    const lat = parseFloat(latStr);
                                    const lon = parseFloat(lonStr);
                                    const calculatedReg = getClosestRegion(lat, lon);
                                    setNewFarmLocation(calculatedReg);
                                    setGpsCoords({ latitude: lat, longitude: lon });
                                  } else {
                                    setNewFarmLocation("Souss-Massa");
                                    setGpsCoords({ latitude: 30.4183, longitude: -9.5658 });
                                  }
                                })
                                .catch(() => {
                                  setNewFarmLocation("Souss-Massa");
                                  setGpsCoords({ latitude: 30.4183, longitude: -9.5658 });
                                });
                            }`;

if (content.includes(oldGpsFallback)) {
  content = content.replace(oldGpsFallback, newGpsFallback);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Updated App.tsx");
} else {
  console.log("Could not find oldGpsFallback block in App.tsx");
}
