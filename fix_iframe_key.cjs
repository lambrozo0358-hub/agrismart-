const fs = require('fs');
let file = 'src/components/WeatherIntel.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldIframe = `<iframe
                      src={\`https://embed.windy.com/embed2.html?lat=\${(analysis.lat || 30.41).toFixed(3)}&lon=\${(analysis.lon || -9.56).toFixed(3)}&zoom=8&level=surface&overlay=\${activeWindyOverlay}&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1\`}
                      className="w-full h-full border-0 rounded-2xl"
                      title="Windy Interactive Radar"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                    />`;

const newIframe = `<iframe
                      key={\`\${analysis.lat}-\${analysis.lon}-\${activeWindyOverlay}\`}
                      src={\`https://embed.windy.com/embed2.html?lat=\${(analysis.lat || 30.41).toFixed(3)}&lon=\${(analysis.lon || -9.56).toFixed(3)}&zoom=8&level=surface&overlay=\${activeWindyOverlay}&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1\`}
                      className="w-full h-full border-0 rounded-2xl"
                      title="Windy Interactive Radar"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                    />`;

content = content.replace(oldIframe, newIframe);
fs.writeFileSync(file, content);
console.log("Updated WeatherIntel.tsx iframe key");
