const fs = require('fs');
let content = fs.readFileSync('src/components/WeatherIntel.tsx', 'utf8');

const oldFetch = `fetch('https://ipinfo.io/json')`;
const newFetch = `fetch('/api/my-location')`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync('src/components/WeatherIntel.tsx', content);

let contentMap = fs.readFileSync('src/components/MoroccanMap.tsx', 'utf8');
contentMap = contentMap.replace(oldFetch, newFetch);
fs.writeFileSync('src/components/MoroccanMap.tsx', contentMap);

let contentApp = fs.readFileSync('src/App.tsx', 'utf8');
contentApp = contentApp.replace(oldFetch, newFetch);
fs.writeFileSync('src/App.tsx', contentApp);

console.log("Updated clients to use /api/my-location");
