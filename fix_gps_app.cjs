const fs = require('fs');

let file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const calculatedReg = getClosestRegion(pos.coords.latitude, pos.coords.longitude);
                              setNewFarmLocation(calculatedReg);
                              setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                            },
                            () => {
                              fetch('https://get.geojs.io/v1/ip/geo.json')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.latitude && data.longitude) {
                                    const lat = parseFloat(data.latitude);
                                    const lon = parseFloat(data.longitude);
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
                            }
                          );
                        }`;

const newBlock = `
                        const fallback = () => {
                              fetch('https://get.geojs.io/v1/ip/geo.json')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.latitude && data.longitude) {
                                    const lat = parseFloat(data.latitude);
                                    const lon = parseFloat(data.longitude);
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
                        };

                        if (!navigator.geolocation) {
                          fallback();
                        } else {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const calculatedReg = getClosestRegion(pos.coords.latitude, pos.coords.longitude);
                              setNewFarmLocation(calculatedReg);
                              setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                            },
                            fallback
                          );
                        }
`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log("Fixed App.tsx");
