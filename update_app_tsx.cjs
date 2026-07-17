const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newRegionsCoords = `const regionsCoords = [
      { name: "Tanger-Tétouan-Al Hoceïma", lat: 35.75, lon: -5.83 },
      { name: "Oriental", lat: 34.68, lon: -1.91 },
      { name: "Fès-Meknès", lat: 34.03, lon: -5.00 },
      { name: "Rabat-Salé-Kénitra", lat: 34.02, lon: -6.83 },
      { name: "Béni Mellal-Khénifra", lat: 32.33, lon: -6.36 },
      { name: "Casablanca-Settat", lat: 33.57, lon: -7.58 },
      { name: "Marrakech-Safi", lat: 31.62, lon: -7.98 },
      { name: "Drâa-Tafilalet", lat: 31.93, lon: -4.42 },
      { name: "Souss-Massa", lat: 30.42, lon: -9.59 },
      { name: "Guelmim-Oued Noun", lat: 28.98, lon: -10.05 },
      { name: "Laâyoune-Sakia El Hamra", lat: 27.12, lon: -13.16 },
      { name: "Dakhla-Oued Ed-Dahab", lat: 23.71, lon: -15.93 },
    ];`;

const startCoords = content.indexOf('const regionsCoords = [');
const endCoords = content.indexOf('];', startCoords) + 2;
content = content.substring(0, startCoords) + newRegionsCoords + content.substring(endCoords);

const newSelectOptions = `<option value="Tanger-Tétouan-Al Hoceïma">Tanger-Tétouan-Al Hoceïma</option>
                    <option value="Oriental">Oriental</option>
                    <option value="Fès-Meknès">Fès-Meknès</option>
                    <option value="Rabat-Salé-Kénitra">Rabat-Salé-Kénitra</option>
                    <option value="Béni Mellal-Khénifra">Béni Mellal-Khénifra</option>
                    <option value="Casablanca-Settat">Casablanca-Settat</option>
                    <option value="Marrakech-Safi">Marrakech-Safi</option>
                    <option value="Drâa-Tafilalet">Drâa-Tafilalet</option>
                    <option value="Souss-Massa">Souss-Massa</option>
                    <option value="Guelmim-Oued Noun">Guelmim-Oued Noun</option>
                    <option value="Laâyoune-Sakia El Hamra">Laâyoune-Sakia El Hamra</option>
                    <option value="Dakhla-Oued Ed-Dahab">Dakhla-Oued Ed-Dahab</option>`;

const startSelect = content.indexOf('<option value="Souss-Massa">Souss-Massa</option>');
const endSelect = content.indexOf('</select>', startSelect);
content = content.substring(0, startSelect) + newSelectOptions + '\n                  ' + content.substring(endSelect);

fs.writeFileSync('src/App.tsx', content);
