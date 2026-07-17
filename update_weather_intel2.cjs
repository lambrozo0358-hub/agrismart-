const fs = require('fs');
let content = fs.readFileSync('src/components/WeatherIntel.tsx', 'utf8');

const newRegionsDropdown = `<div className="flex gap-1.5 items-center">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Tanger-Tétouan-Al Hoceïma">Tanger-Tétouan-Al Hoceïma</option>
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
              <option value="Dakhla-Oued Ed-Dahab">Dakhla-Oued Ed-Dahab</option>
            </select>
          </div>`;

const startDiv = content.indexOf('<div className="flex gap-1.5">');
const endDiv = content.indexOf('</div>', startDiv) + 6;
// But wait, the `</div>` matches the map closing div? Wait, the map returns `<button>...</button>`.
// So the first `</div>` after startDiv is the correct one. Let's find `</div>` after `</button>`.
const mapEnd = content.indexOf('))}');
const finalEnd = content.indexOf('</div>', mapEnd) + 6;

content = content.substring(0, startDiv) + newRegionsDropdown + content.substring(finalEnd);

// Also need to update the text when GPS is locked
content = content.replace(/selectedRegion === "Souss-Massa" \? "سوس ماسة" :\n                      selectedRegion === "Gharb" \? "سهل الغرب" :\n                      selectedRegion === "Saïs" \? "هضبة سايس" : "منطقة الحوز"/g, 'selectedRegion');
content = content.replace(/selectedRegion === "Souss-Massa" \? "Souss-Massa" :\n                        selectedRegion === "Gharb" \? "Plaine du Gharb" :\n                        selectedRegion === "Saïs" \? "Plateau de Saïss" : "Haouz Marrakech"/g, 'selectedRegion');

fs.writeFileSync('src/components/WeatherIntel.tsx', content);
