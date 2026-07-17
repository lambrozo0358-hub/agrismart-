const fs = require('fs');
let content = fs.readFileSync('src/components/MoroccanMap.tsx', 'utf8');

const oldMapGpsFallback = `      (err) => {
        setLocating(false);
        // Fallback simulated gps
        if (onGpsDetect) {
          onGpsDetect({ latitude: 30.4183, longitude: -9.5658 });
        }
      }`;

const newMapGpsFallback = `      (err) => {
        fetch('https://ipinfo.io/json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            if (data && data.loc) {
              const [latStr, lonStr] = data.loc.split(',');
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(latStr), longitude: parseFloat(lonStr) });
              }
            } else if (onGpsDetect) {
              onGpsDetect({ latitude: 30.4183, longitude: -9.5658 });
            }
          })
          .catch(() => {
            setLocating(false);
            if (onGpsDetect) {
              onGpsDetect({ latitude: 30.4183, longitude: -9.5658 });
            }
          });
      }`;

if (content.includes(oldMapGpsFallback)) {
  content = content.replace(oldMapGpsFallback, newMapGpsFallback);
  fs.writeFileSync('src/components/MoroccanMap.tsx', content);
  console.log("Updated MoroccanMap.tsx");
} else {
  console.log("Could not find oldMapGpsFallback block in MoroccanMap.tsx");
}
