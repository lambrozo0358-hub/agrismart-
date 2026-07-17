const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
// 10. IP Geolocation proxy to bypass adblockers
app.get("/api/my-location", async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof ip === 'string') {
      ip = ip.split(',')[0].trim();
    }
    const url = ip && ip !== '::1' && ip !== '127.0.0.1' ? \`https://ipinfo.io/\${ip}/json\` : 'https://ipinfo.io/json';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to locate IP' });
  }
});

// Vite middleware mapping
`;

content = content.replace('// Vite middleware mapping', newEndpoint);

fs.writeFileSync('server.ts', content);
console.log("Added /api/my-location endpoint.");
