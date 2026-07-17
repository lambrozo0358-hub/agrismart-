const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newWeatherData = `const weatherData: Record<string, any> = {
  "Tanger-Tétouan-Al Hoceïma": {
    region: "Tanger-Tétouan-Al Hoceïma", temperature: 24, humidity: 60, rainfall: 5, windSpeed: 18, condition: "Partly Cloudy",
    forecast: [{day:"Wed",temp:24,condition:"Partly Cloudy"}, {day:"Thu",temp:25,condition:"Sunny"}, {day:"Fri",temp:26,condition:"Sunny"}, {day:"Sat",temp:23,condition:"Rainy"}, {day:"Sun",temp:24,condition:"Partly Cloudy"}, {day:"Mon",temp:25,condition:"Sunny"}, {day:"Tue",temp:26,condition:"Sunny"}]
  },
  "Oriental": {
    region: "Oriental", temperature: 28, humidity: 40, rainfall: 0, windSpeed: 12, condition: "Sunny",
    forecast: [{day:"Wed",temp:28,condition:"Sunny"}, {day:"Thu",temp:30,condition:"Sunny"}, {day:"Fri",temp:32,condition:"Hot"}, {day:"Sat",temp:29,condition:"Partly Cloudy"}, {day:"Sun",temp:28,condition:"Sunny"}, {day:"Mon",temp:27,condition:"Sunny"}, {day:"Tue",temp:29,condition:"Sunny"}]
  },
  "Fès-Meknès": {
    region: "Fès-Meknès", temperature: 29, humidity: 48, rainfall: 2, windSpeed: 9, condition: "Partly Cloudy",
    forecast: [{day:"Wed",temp:29,condition:"Partly Cloudy"}, {day:"Thu",temp:31,condition:"Sunny"}, {day:"Fri",temp:32,condition:"Sunny"}, {day:"Sat",temp:30,condition:"Partly Cloudy"}, {day:"Sun",temp:28,condition:"Sunny"}, {day:"Mon",temp:28,condition:"Sunny"}, {day:"Tue",temp:29,condition:"Sunny"}]
  },
  "Rabat-Salé-Kénitra": {
    region: "Rabat-Salé-Kénitra", temperature: 26, humidity: 68, rainfall: 12, windSpeed: 14, condition: "Rainy",
    forecast: [{day:"Wed",temp:26,condition:"Rainy"}, {day:"Thu",temp:25,condition:"Rainy"}, {day:"Fri",temp:28,condition:"Partly Cloudy"}, {day:"Sat",temp:29,condition:"Sunny"}, {day:"Sun",temp:30,condition:"Sunny"}, {day:"Mon",temp:29,condition:"Sunny"}, {day:"Tue",temp:28,condition:"Sunny"}]
  },
  "Béni Mellal-Khénifra": {
    region: "Béni Mellal-Khénifra", temperature: 32, humidity: 35, rainfall: 0, windSpeed: 10, condition: "Sunny",
    forecast: [{day:"Wed",temp:32,condition:"Sunny"}, {day:"Thu",temp:34,condition:"Sunny"}, {day:"Fri",temp:35,condition:"Hot"}, {day:"Sat",temp:33,condition:"Sunny"}, {day:"Sun",temp:31,condition:"Sunny"}, {day:"Mon",temp:30,condition:"Sunny"}, {day:"Tue",temp:32,condition:"Sunny"}]
  },
  "Casablanca-Settat": {
    region: "Casablanca-Settat", temperature: 25, humidity: 70, rainfall: 0, windSpeed: 16, condition: "Partly Cloudy",
    forecast: [{day:"Wed",temp:25,condition:"Partly Cloudy"}, {day:"Thu",temp:26,condition:"Sunny"}, {day:"Fri",temp:27,condition:"Sunny"}, {day:"Sat",temp:25,condition:"Partly Cloudy"}, {day:"Sun",temp:24,condition:"Rainy"}, {day:"Mon",temp:25,condition:"Partly Cloudy"}, {day:"Tue",temp:26,condition:"Sunny"}]
  },
  "Marrakech-Safi": {
    region: "Marrakech-Safi", temperature: 34, humidity: 31, rainfall: 0, windSpeed: 15, condition: "Sunny",
    forecast: [{day:"Wed",temp:34,condition:"Sunny"}, {day:"Thu",temp:36,condition:"Sunny"}, {day:"Fri",temp:39,condition:"Hot"}, {day:"Sat",temp:37,condition:"Hot"}, {day:"Sun",temp:33,condition:"Sunny"}, {day:"Mon",temp:32,condition:"Sunny"}, {day:"Tue",temp:33,condition:"Sunny"}]
  },
  "Drâa-Tafilalet": {
    region: "Drâa-Tafilalet", temperature: 35, humidity: 20, rainfall: 0, windSpeed: 14, condition: "Hot",
    forecast: [{day:"Wed",temp:35,condition:"Hot"}, {day:"Thu",temp:37,condition:"Hot"}, {day:"Fri",temp:38,condition:"Hot"}, {day:"Sat",temp:36,condition:"Hot"}, {day:"Sun",temp:34,condition:"Sunny"}, {day:"Mon",temp:33,condition:"Sunny"}, {day:"Tue",temp:35,condition:"Hot"}]
  },
  "Souss-Massa": {
    region: "Souss-Massa", temperature: 36, humidity: 28, rainfall: 0, windSpeed: 21, condition: "Hot",
    forecast: [{day:"Wed",temp:36,condition:"Hot"}, {day:"Thu",temp:38,condition:"Hot"}, {day:"Fri",temp:42,condition:"Hot"}, {day:"Sat",temp:39,condition:"Hot"}, {day:"Sun",temp:34,condition:"Sunny"}, {day:"Mon",temp:32,condition:"Sunny"}, {day:"Tue",temp:33,condition:"Sunny"}]
  },
  "Guelmim-Oued Noun": {
    region: "Guelmim-Oued Noun", temperature: 32, humidity: 45, rainfall: 0, windSpeed: 25, condition: "Windy",
    forecast: [{day:"Wed",temp:32,condition:"Windy"}, {day:"Thu",temp:33,condition:"Windy"}, {day:"Fri",temp:35,condition:"Hot"}, {day:"Sat",temp:31,condition:"Sunny"}, {day:"Sun",temp:30,condition:"Sunny"}, {day:"Mon",temp:29,condition:"Sunny"}, {day:"Tue",temp:31,condition:"Sunny"}]
  },
  "Laâyoune-Sakia El Hamra": {
    region: "Laâyoune-Sakia El Hamra", temperature: 29, humidity: 55, rainfall: 0, windSpeed: 22, condition: "Windy",
    forecast: [{day:"Wed",temp:29,condition:"Windy"}, {day:"Thu",temp:30,condition:"Windy"}, {day:"Fri",temp:32,condition:"Sunny"}, {day:"Sat",temp:28,condition:"Partly Cloudy"}, {day:"Sun",temp:27,condition:"Sunny"}, {day:"Mon",temp:27,condition:"Sunny"}, {day:"Tue",temp:28,condition:"Sunny"}]
  },
  "Dakhla-Oued Ed-Dahab": {
    region: "Dakhla-Oued Ed-Dahab", temperature: 23, humidity: 65, rainfall: 0, windSpeed: 28, condition: "Windy",
    forecast: [{day:"Wed",temp:23,condition:"Windy"}, {day:"Thu",temp:24,condition:"Windy"}, {day:"Fri",temp:25,condition:"Windy"}, {day:"Sat",temp:23,condition:"Windy"}, {day:"Sun",temp:22,condition:"Windy"}, {day:"Mon",temp:22,condition:"Partly Cloudy"}, {day:"Tue",temp:23,condition:"Sunny"}]
  }
};`;

// replace from `const weatherData: Record<string, any> = {` to `};`
const startIdx = content.indexOf('const weatherData: Record<string, any> = {');
const endIdx = content.indexOf('};', startIdx) + 2;

content = content.substring(0, startIdx) + newWeatherData + content.substring(endIdx);
fs.writeFileSync('server.ts', content);
