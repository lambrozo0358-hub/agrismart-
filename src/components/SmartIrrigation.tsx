import React, { useState, useEffect } from "react";
import { translations } from "../translations";
import { Language, Crop, Farm } from "../types";
import { 
  Droplets, 
  Settings, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Waves
} from "lucide-react";

interface SmartIrrigationProps {
  lang: Language;
  crops: Crop[];
  farms: Farm[];
  onIrrigate: (cropId: string, amount: number) => void;
}

export default function SmartIrrigation({ lang, crops, farms, onIrrigate }: SmartIrrigationProps) {
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [recommendation, setRecommendation] = useState<any>(null);
  const [calculatedVolume, setCalculatedVolume] = useState<number>(0);
  const [irrigateAmount, setIrrigateAmount] = useState<number>(1500);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const currentFarm = currentCrop ? farms.find(f => f.id === currentCrop.farmId) : farms[0];

  useEffect(() => {
    if (crops.length > 0 && !selectedCropId) {
      setSelectedCropId(crops[0].id);
    }
  }, [crops]);

  useEffect(() => {
    if (!currentCrop || !currentFarm) return;
    setLoading(true);
    
    // Fetch smart guidelines
    const url = `/api/irrigation/recommend?soilType=${currentFarm.soilType}&cropName=${currentCrop.cropName}&sizeHectares=${currentFarm.sizeHectares}&region=${currentFarm.location}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRecommendation(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCropId, crops]);

  const handleLogIrrigation = () => {
    if (!selectedCropId) return;
    onIrrigate(selectedCropId, irrigateAmount);
    // Visual flash confirmation
    alert(lang === "ar" 
      ? `تم تسجيل عملية ري بمقدار ${irrigateAmount} لتر لهذا الهكتار بنجاح!` 
      : `Événement d'irrigation de ${irrigateAmount} litres enregistré avec succès !`
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{t.smartIrrigation}</h3>
            <p className="text-xs text-slate-500">{t.irrigationGuide}</p>
          </div>
        </div>

        {crops.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>Veuillez d'abord configurer des cultures sur votre tableau de bord.</span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              {/* Select crop for advice */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  {lang === "ar" ? "اختر المحصول لطلب التوصية فلاحية" : "Sélectionner la culture à irriguer"}
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {crops.map((cr) => {
                    const farm = farms.find(f => f.id === cr.farmId);
                    return (
                      <option key={cr.id} value={cr.id}>
                        {cr.cropName} ({farm ? farm.name : "Ferme"}) - {cr.status}
                      </option>
                    );
                  })}
                </select>
              </div>

              {currentCrop && currentFarm && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.farmName}:</span>
                    <span className="font-semibold text-slate-800">{currentFarm.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.location}:</span>
                    <span className="font-semibold text-slate-800">{currentFarm.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.sizeHectares}:</span>
                    <span className="font-semibold text-slate-800">{currentFarm.sizeHectares} Ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.soilType}:</span>
                    <span className="font-semibold text-slate-800">{t.soilTypes[currentFarm.soilType]}</span>
                  </div>
                </div>
              )}

              {/* Log actual irrigation activity */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                <h4 className="font-bold text-blue-900 text-sm flex gap-1.5 items-center">
                  <Waves className="w-4 h-4 text-blue-600" />
                  {t.irrigateAction}
                </h4>
                <div>
                  <label className="block text-xs text-blue-700 font-medium mb-1.5">
                    {lang === "ar" ? "الحجم الإضافي المروي (لتر):" : "Volume d'eau appliqué (Litres) :"}
                  </label>
                  <input
                    type="number"
                    value={irrigateAmount}
                    onChange={(e) => setIrrigateAmount(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <button
                  onClick={handleLogIrrigation}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all cursor-pointer text-sm"
                >
                  {t.irrigateAction}
                </button>
              </div>
            </div>

            {/* Recommendation Display */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-slate-50 p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
                  <Waves className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm text-slate-500">{lang === "ar" ? "جاري تجميع دراسات التربة وبخر الأحواض..." : "Analyse du bilan hydrique en cours..."}</span>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold uppercase">
                      Recommended Advice
                    </span>

                    <div className="pt-2">
                      <div className="text-3xl font-extrabold text-slate-900 font-display">
                        {recommendation.recommendedVolumePerHectare.toLocaleString()}{" "}
                        <span className="text-sm font-medium text-slate-500">L / Ha / Week</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {t.estimatedConsumption} ({currentFarm?.sizeHectares} Ha):{" "}
                        <span className="font-semibold text-slate-700">
                          {recommendation.totalWaterRequirement.toLocaleString()} Litres
                        </span>
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 relative top-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 font-medium">{t.recommendedSchedule}</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">{recommendation.frequency}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 relative top-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 font-medium">Watering Duration</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">{recommendation.wateringDurationMinutes} Mins</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water Saving Tips */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 shadow-sm">
                    <h4 className="font-bold text-emerald-900 text-sm flex gap-1.5 items-center">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                      {t.waterSavingTip}
                    </h4>
                    <p className="text-emerald-800 text-xs mt-2.5 leading-relaxed">
                      {recommendation.waterSavingTip}
                    </p>
                  </div>

                  {/* Soil Care Optimization */}
                  <div className="bg-amber-50/70 border border-amber-100 rounded-3xl p-5 shadow-sm text-left">
                    <h4 className="font-semibold text-amber-900 text-sm">{t.organicSoilCare}</h4>
                    <p className="text-amber-800 text-xs mt-2 leading-relaxed">
                      {currentFarm?.soilType === "Sandy" 
                        ? (lang === "ar" 
                          ? "التربة الرملية لديها معامل احتفاظ ضعيف جداً بالمياه. يوصى بفرش كميات غنية من السماد العضوي المخمر وسيقان القمح لخفض بخر التربة بنسبة 40%." 
                          : "Les sols sableux ont une très faible rétention. Intégrez du compost organique pour former un complexe argilo-humique stable servant de réservoir naturel.")
                        : (lang === "ar"
                          ? "التربة الطينية تخزن المياه بقوة وقد تصاب الجذور بالعفن إذا زاد منسوب الري. يُنصح بتحسين تهوية القنوات لضمان تسريب كافٍ للمياه الراكدة."
                          : "Les sols argileux stockent fortement l'eau. Pour éviter le pourrissement des racines de tomate, espacez vos cycles de mouflage et aérez le sol.")
                      }
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Water usage tracking visualization list */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-semibold text-slate-900 text-base mb-4">{t.irrigationHistory}</h4>
        <div className="space-y-3">
          {crops.map((cr) => {
            const f = farms.find(farm => farm.id === cr.farmId);
            const size = f ? f.sizeHectares : 1;
            const percentage = Math.min(100, Math.round((cr.irrigatedSum / (15000 * size)) * 100));
            return (
              <div key={cr.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="font-semibold text-slate-800">{cr.cropName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f ? f.name : "Farm"} • {cr.plantingDate}</div>
                </div>

                <div className="flex-1 max-w-sm">
                  <div className="flex justify-between text-xs font-mono font-semibold text-slate-500 mb-1">
                    <span>{cr.irrigatedSum.toLocaleString()} L / Ha</span>
                    <span>Target: {(size * 15000).toLocaleString()} L</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${percentage}%` }} className="h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
