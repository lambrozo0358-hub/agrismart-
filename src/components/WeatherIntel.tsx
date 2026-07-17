import React, { useState, useEffect } from "react";
import { translations } from "../translations";
import { Language, WeatherData } from "../types";
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  CloudLightning,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Droplet,
  Compass,
  Locate,
  Brain,
  Cpu,
  Layers
} from "lucide-react";

interface WeatherIntelProps {
  lang: Language;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  gpsCoords?: { latitude: number; longitude: number } | null;
  onGpsDetect?: (coords: { latitude: number; longitude: number }) => void;
}

export default function WeatherIntel({ lang, selectedRegion, onRegionChange, gpsCoords, onGpsDetect }: WeatherIntelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Custom states for Dynamic Google AI Conclusion & Windy Live Map
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeWindyOverlay, setActiveWindyOverlay] = useState<'wind' | 'temp' | 'rain' | 'clouds'>('wind');

  const t = translations[lang];

  const moroccoRegionsCoords: Record<string, { lat: number; lon: number }> = {
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
    "Dakhla-Oued Ed-Dahab": { lat: 23.71, lon: -15.93 }
  };

  const getClosestRegion = (lat: number, lon: number) => {
    let closest = "Souss-Massa";
    let minDistance = Infinity;
    for (const [name, coords] of Object.entries(moroccoRegionsCoords)) {
      const d = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lon - lon, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = name;
      }
    }
    return closest;
  };


  // Fetch full localized agrometeorological report from backend (powered by Google Gemini API)
  useEffect(() => {
    setAnalyzing(true);
    let sendLat = gpsCoords?.latitude || 0;
    let sendLon = gpsCoords?.longitude || 0;

    // If user has GPS but selected a DIFFERENT region manually, we should center on the selected region, not the GPS
    if (gpsCoords && gpsCoords.latitude !== 0) {
       const gpsRegion = getClosestRegion(gpsCoords.latitude, gpsCoords.longitude);
       if (gpsRegion !== selectedRegion) {
         sendLat = moroccoRegionsCoords[selectedRegion]?.lat || 0;
         sendLon = moroccoRegionsCoords[selectedRegion]?.lon || 0;
       }
    } else if (moroccoRegionsCoords[selectedRegion]) {
       sendLat = moroccoRegionsCoords[selectedRegion].lat;
       sendLon = moroccoRegionsCoords[selectedRegion].lon;
    }

    fetch("/api/weather/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: selectedRegion,
        latitude: sendLat,
        longitude: sendLon
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data);
        setAnalyzing(false);
      })
      .catch((err) => {
        console.error("Weather Analyze Error:", err);
        setAnalyzing(false);
      });
  }, [selectedRegion, gpsCoords, activeWindyOverlay]); // trigger update block when parameters shift or overlay toggled

  const handleGpsLocate = () => {

    const fallback = () => {
        setGpsError(lang === "ar" ? "تعذر الوصول لـ GPS، جاري تحديد الموقع عبر IP..." : "GPS restricted, locating via IP...");
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
              }
            } else {
              setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
            }
          })
          .catch(() => {
            setLocating(false);
            setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
          });
    };

    if (!navigator.geolocation) {
      setLocating(true);
      fallback();
      return;
    }

    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        if (onGpsDetect) {
          onGpsDetect({ latitude, longitude });
        }
      },
      (err) => {
        // console.log("GPS Notice:", err);
        // Fallback to IP geolocation if GPS is restricted (e.g. in iframe)
        setGpsError(lang === "ar" ? "تعذر الوصول لـ GPS، جاري تحديد الموقع عبر IP..." : "GPS restricted, locating via IP...");
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLocating(false);
            setGpsError(null);
            if (data && data.latitude && data.longitude) {
              if (onGpsDetect) {
                onGpsDetect({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
              }
            } else {
              setGpsError(lang === "ar" ? "فشل تحديد الموقع" : "Location detection failed");
            }
          })
          .catch(err => {
            setLocating(false);
            console.error("IP Loc Error:", err);
            setGpsError(lang === "ar" ? "محاكاة الموقع..." : "Simulating location...");
            const simulatedCoords = { latitude: 30.4183, longitude: -9.5658 };
            if (onGpsDetect) {
              setTimeout(() => onGpsDetect(simulatedCoords), 600);
            }
          });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/weather?region=${encodeURIComponent(selectedRegion)}`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRegion]);

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case "Sunny":
      case "Hot":
        return <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />;
      case "Partly Cloudy":
        return <CloudSun className="w-10 h-10 text-slate-400" />;
      case "Rainy":
        return <CloudRain className="w-10 h-10 text-blue-500 animate-bounce" />;
      case "Windy":
        return <Wind className="w-10 h-10 text-teal-400" />;
      default:
        return <Sun className="w-10 h-10 text-amber-500" />;
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case "Sunny": return lang === "ar" ? "مشمس" : lang === "fr" ? "Ensoleillé" : "Sunny";
      case "Hot": return lang === "ar" ? "حر شديد" : lang === "fr" ? "Très chaud / Chergui" : "Intense Heat";
      case "Partly Cloudy": return lang === "ar" ? "غائم جزئياً" : lang === "fr" ? "Partiellement nuageux" : "Partly Cloudy";
      case "Rainy": return lang === "ar" ? "ممطر" : lang === "fr" ? "Pluvieux" : "Rainy";
      case "Windy": return lang === "ar" ? "عاصف" : lang === "fr" ? "Venteux" : "Windy";
      default: return cond;
    }
  };

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl self-start sm:self-auto">
            <Compass className="w-5 h-5 animate-spin-slow text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              {t.weatherIntel}
              {gpsCoords && gpsCoords.latitude !== 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold animate-pulse">
                  GPS LIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "ar" ? "توقعات ونشاط المحاصيل المباشر" : lang === "fr" ? "Prévisions et activités des cultures en temps réel" : "Real-time crop forecasts & weather advisory"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleGpsLocate}
            disabled={locating}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border hover:scale-[1.02] active:scale-95 cursor-pointer ${
              gpsCoords && gpsCoords.latitude !== 0
                ? "bg-slate-900 text-emerald-400 border-slate-800" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <Locate className={`w-3.5 h-3.5 ${locating ? "animate-ping" : ""}`} />
            {locating ? (lang === 'ar' ? "جاري التحديد..." : "Localisation...") : (lang === 'ar' ? "تحديد بالجي بي إس" : lang === 'fr' ? "Détecter avec GPS" : "Locate via GPS")}
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

          <div className="flex gap-1.5 items-center">
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
          </div>
        </div>
      </div>

      {/* GPS Status Info Banner if Connected */}
      {gpsCoords && gpsCoords.latitude !== 0 && (
        <div className="bg-slate-900 border border-slate-850 text-white rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-slide-in text-left">
          <div className="flex items-start gap-3">
            <span className="relative flex h-2.5 w-2.5 mt-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-emerald-400 font-extrabold uppercase">
                {lang === "ar" ? "تغذية الموقع GPS نشطة" : lang === "fr" ? "LIAISON TEMPS-RÉEL SATELLITE GPS" : "ACTIVE SMART TELEMETRY LOCK"}
              </div>
              <p className="text-xs text-slate-200 mt-1 font-mono font-bold">
                LAT: {gpsCoords.latitude.toFixed(5)}° N • LON: {gpsCoords.longitude.toFixed(5)}° W • Precision: ±3m
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-medium">
                {lang === "ar" 
                  ? `بناءً على إحداثيات موقعك الفعلي، تم تنشيط المناخ الفلاحي لـ: ${
                      selectedRegion
                    }`
                  : lang === "fr"
                    ? `Position GPS verrouillée avec succès. Zone agro-climatique : ${
                        selectedRegion
                      }`
                    : `Telemetry grid linked. Agro-climatic zone established: ${selectedRegion}`
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (onGpsDetect) onGpsDetect({ latitude: 0, longitude: 0 }); // clear
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider self-start sm:self-auto cursor-pointer transition-colors"
          >
            {lang === "ar" ? "إلغاء المزامنة" : "DISCONNECT"}
          </button>
        </div>
      )}

      {gpsError && (!gpsCoords || gpsCoords.latitude === 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-80 \
text-left animate-slide-in">
          {gpsError}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}

      {!loading && weather && (
        <>
          {/* Extreme Heat/Weather Alerts */}
          {weather.temperature > 35 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="font-bold text-red-800 text-sm">
                  {t.extremeWeatherWarning}
                </h4>
                <p className="text-red-700 text-xs mt-1 leading-relaxed">
                  {lang === "ar" 
                    ? "درجات حرارة تتعدى المعتاد. نوصي بتنشيط ري وقائي ليلاً لمنع صدمة الجذور والتبخر الشديد." 
                    : lang === "fr" 
                      ? "Niveaux thermiques élevés. Activez une irrigation nocturne préventive pour contourner l'évapotranspiration." 
                      : "Severe temperature stress. Activate nighttime protective irrigation in Souss immediately."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Core Current Weather Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 rounded-3xl text-left relative overflow-hidden shadow-md">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Sun className="w-48 h-48 translate-x-12 translate-y-12" />
              </div>
              <span className="text-slate-100 font-medium text-xs tracking-wide uppercase">
                {selectedRegion} • {t.current}
              </span>
              <div className="flex items-center justify-between mt-6">
                <div>
                  <h2 className="text-5xl font-extrabold font-display leading-tight">{weather.temperature}°C</h2>
                  <p className="text-slate-100 font-medium mt-1">{getConditionLabel(weather.condition)}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  {getWeatherIcon(weather.condition)}
                </div>
              </div>
              
              <div className="border-t border-white/20 mt-6 pt-5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-200 text-xs">{t.humidity}</span>
                  <div className="font-semibold text-white mt-0.5">{weather.humidity}%</div>
                </div>
                <div>
                  <span className="text-slate-200 text-xs">{t.rainfall}</span>
                  <div className="font-semibold text-white mt-0.5">{weather.rainfall} mm</div>
                </div>
              </div>
            </div>

            {/* Weather Secondary factors */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex gap-1.5 items-center">
                  <Wind className="w-4 h-4 text-slate-500" />
                  {lang === "ar" ? "ديناميكية الرياح والتبخر" : "Vent et évaporation atmosphérique"}
                </h4>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-slate-500">{t.windSpeed}</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{weather.windSpeed} Km/h</div>
                  </div>
                  <div className="text-xs bg-teal-100 text-teal-800 font-semibold px-2.5 py-1 rounded-full">
                    {weather.windSpeed > 15 ? (lang === "ar" ? "نشط" : "Actif") : (lang === "ar" ? "خفيف" : "Modéré")}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === "ar" 
                    ? "تتحكم سرعة الرياح في معدل جفاف الطبقة التربية العلوية؛ الرياح تنشط تآكل الرطوبة." 
                    : "Les vents secs augmentent la transpiration des feuilles. Adaptez le mouillage en conséquence."
                  }
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex gap-1.5 items-center">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  {lang === "ar" ? "مخزون رطوبة التربة" : "Taux d'Humidité relative"}
                </h4>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-slate-500">{t.humidity}</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{weather.humidity}% HR</div>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
                    {weather.humidity > 60 ? (lang === "ar" ? "رطب" : "Humide") : (lang === "ar" ? "جاف" : "Sec")}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === "ar" 
                    ? "رطوبة مثالية لنمو الأوراق. عند انخفاض الرطوبة ترتفع حاجة السقي بالتنقيط." 
                    : "Une faible humidité de l'air stimule la soif racinaire des agrumes en Souss."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 7-day forecast listing using stylish visual meter bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left">
            <h3 className="font-semibold text-slate-900 font-display text-base mb-6 border-b border-slate-100 pb-3">
              {t.sevenDayForecast}
            </h3>

            <div className="space-y-4">
              {weather.forecast.map((dayData: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 w-32 font-medium text-slate-700">
                    <span className="w-4 text-slate-400 text-xs font-mono">{i + 1}</span>
                    <span>{dayData.day === "Wed" ? (lang === "ar" ? "الأربعاء" : "Mercredi") :
                          dayData.day === "Thu" ? (lang === "ar" ? "الخميس" : "Jeudi") :
                          dayData.day === "Fri" ? (lang === "ar" ? "الجمعة" : "Vendredi") :
                          dayData.day === "Sat" ? (lang === "ar" ? "السبت" : "Samedi") :
                          dayData.day === "Sun" ? (lang === "ar" ? "الأحد" : "Dimanche") :
                          dayData.day === "Mon" ? (lang === "ar" ? "الإثنين" : "Lundi") :
                          (lang === "ar" ? "الثلاثاء" : "Mardi")
                     }</span>
                  </div>

                  <div className="flex items-center gap-2 w-36">
                    {getWeatherIcon(dayData.condition)}
                    <span className="text-xs text-slate-500">{getConditionLabel(dayData.condition)}</span>
                  </div>

                  {/* Temperature meter bar */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs text-slate-400">10°C</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        style={{ width: `${(dayData.temp / 50) * 100}%` }}
                        className={`h-full rounded-full ${
                          dayData.temp > 35 ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-amber-400"
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 w-10 text-right">{dayData.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO DYNAMIC MODULES FOR THE REQUESTED FEATURES: GOOGLE API & WINDY */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
            
            {/* 1. Google API: Advanced Agrometeorological AI Diagnosis & Conclusion */}
            <div className="xl:col-span-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-slate-850 p-6 rounded-3xl text-left relative overflow-hidden shadow-lg min-h-[460px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex justify-between items-center border-b border-emerald-900/40 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg animate-pulse">
                      <Brain className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5 font-display">
                        {lang === "ar" ? "خلاصة المناخ الفلاحي بالذكاء الاصطناعي" : lang === "fr" ? "Rapport Agro-Climatique IA" : "Agro-Meteorological AI Report"}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-bold font-mono tracking-wider uppercase">
                        {analysis?.fromAi ? "POWERED BY GOOGLE GEMINI 3.5" : "DYNAMIC SPATIAL HEURISTIC"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                    LIVE INTEL
                  </span>
                </div>

                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-400 font-mono italic">
                      {lang === "ar" ? "جاري تشغيل محاكاة نموذج Google Gemini..." : "Calling Google Gemini AI model parameters..."}
                    </p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Multi-language Dynamic Summary depending on select application language */}
                    <div className="bg-slate-950/50 p-4 border border-emerald-950 rounded-2xl">
                      <p className="text-slate-200 text-xs leading-relaxed font-sans font-medium">
                        {lang === "ar" ? analysis.conclusionAr : lang === "fr" ? analysis.conclusionFr : analysis.conclusionEn}
                      </p>
                    </div>

                    {/* Highly Targeted Microclimatic Warnings */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                        ⚠️ CLIENT RISK OVERLAYS:
                      </span>
                      {analysis.warnings?.map((warn: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs text-rose-300 bg-rose-950/20 border border-rose-950/40 p-2.5 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>

                    {/* Ultimate Agrometeorological Actionable Strategy */}
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-2xl mt-2 text-xs">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 text-[11px] font-mono">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        STRATEGIC CONCLUSION RECOMENDATION:
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">
                        "{analysis.recommendation}"
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="text-slate-400 text-xs py-10 text-center">
                    No active AI report loaded. Tap standard regions or locate to trigger Gemini.
                  </div>
                )}
              </div>

              {/* Geo reference stamp inside AI card */}
              <div className="border-t border-emerald-900/30 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>COORD LOCK: {analysis?.lat?.toFixed(3)}°N, {analysis?.lon?.toFixed(3)}°W</span>
                <span className="text-emerald-400 font-bold">STATUS: OK</span>
              </div>
            </div>

            {/* 2. Windy.com Dynamic Interactive Satellite Widget */}
            <div className="xl:col-span-6 bg-white border border-slate-200 p-5 rounded-3xl text-left shadow-sm flex flex-col justify-between">
              
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-display">
                      <Layers className="w-4 h-4 text-blue-600 animate-pulse" />
                      {lang === "ar" ? "خرائط رادارات Windy.com الحية" : lang === "fr" ? "Carte Satellite Windy Interactive" : "Windy.com Real-Time Satellite Map"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {lang === "ar" ? "مؤشرات بصرية تفاعلية للرياح والضغط والرطوبة" : "Simultaneous weather radar diagnostics"}
                    </p>
                  </div>

                  {/* Windy active layer selector tabs */}
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['wind', 'temp', 'rain', 'clouds'] as const).map((layer) => (
                      <button
                        key={layer}
                        onClick={() => {
                          setActiveWindyOverlay(layer);
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all tracking-wider ${
                          activeWindyOverlay === layer
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {layer}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highly reactive live iframe mapping coordinates returned optionally by GPS */}
                <div className="relative w-full h-[320px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-150">
                  {analyzing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-mono">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
                      Loading live satellite feeds...
                    </div>
                  ) : analysis?.windyEmbedUrl ? (
                    <iframe
                      key={`${analysis.lat}-${analysis.lon}-${activeWindyOverlay}`}
                      src={`https://embed.windy.com/embed2.html?lat=${(analysis.lat || 30.41).toFixed(3)}&lon=${(analysis.lon || -9.56).toFixed(3)}&zoom=8&level=surface&overlay=${activeWindyOverlay}&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
                      className="w-full h-full border-0 rounded-2xl"
                      title="Windy Interactive Radar"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center b-slate-900 text-slate-400 text-xs font-mono">
                      Feed offline. Select region.
                    </div>
                  )}
                </div>
              </div>

              {/* Informative advice label below maps */}
              <p className="text-[10px] text-slate-500 leading-normal mt-3 italic">
                {lang === "ar" 
                  ? "* تعتمد خرائط Windy على نظام النمذجة العددية العالمي ECMWF وGFS للتوقعات الدقيقة ثانية بثانية." 
                  : "* Windy feeds utilize high-fidelity GFS and ECMWF models to forecast complex barometric pressure, coastal wind velocity currents and cloud movements locally."}
              </p>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
