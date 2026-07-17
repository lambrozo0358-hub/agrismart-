const fs = require('fs');

const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `  const regionDefaults: Record<string, { lat: number; lon: number }> = {
    "Souss-Massa": { lat: 30.4183, lon: -9.5658 },
    "Gharb": { lat: 34.25, lon: -6.58 },
    "Saïs": { lat: 33.9, lon: -5.0 },
    "Haouz": { lat: 31.63, lon: -8.0 }
  };`;

const newBlock = `  const regionDefaults: Record<string, { lat: number; lon: number }> = {
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
    "Dakhla-Oued Ed-Dahab": { lat: 23.71, lon: -15.93 },
    "Gharb": { lat: 34.25, lon: -6.58 },
    "Saïs": { lat: 33.9, lon: -5.0 },
    "Haouz": { lat: 31.63, lon: -8.0 }
  };`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(file, content);
console.log("Updated server.ts region coordinates");
