const fs = require('fs');

let file = 'src/components/MoroccanMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `    if (!navigator.geolocation) return;`;

const newBlock = `
    const fallback = () => {
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
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
    };

    if (!navigator.geolocation) {
      setLocating(true);
      fallback();
      return;
    }
`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log("Fixed MoroccanMap.tsx");
