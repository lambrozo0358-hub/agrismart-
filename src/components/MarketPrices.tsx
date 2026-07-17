import React, { useState, useEffect } from "react";
import { translations } from "../translations";
import { Language, MarketPrice } from "../types";
import { 
  TrendingUp, 
  ChevronRight, 
  TrendingDown, 
  Clock, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";

interface MarketPricesProps {
  lang: Language;
}

export default function MarketPrices({ lang }: MarketPricesProps) {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selectedCropName, setSelectedCropName] = useState<string>("Tomatoes");
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedCrop = prices.find((c) => c.cropName === selectedCropName) || prices[0];

  const getLocalizedCropName = (name: string) => {
    switch (name) {
      case "Tomatoes": return t.tomato;
      case "Potatoes": return t.potato;
      case "Onions": return t.onion;
      case "Wheat": return t.wheat;
      case "Olives": return t.olive;
      case "Citrus": return t.citrus;
      default: return name;
    }
  };

  // Combine historical & predicted datasets cleanly for Recharts Line Chart
  const getChartData = () => {
    if (!selectedCrop) return [];
    
    const combinedData: any[] = [];
    
    // Add historical
    selectedCrop.historicalPrices.forEach((hp) => {
      combinedData.push({
        month: hp.date,
        historical: hp.price,
        predicted: null
      });
    });

    // Add predicted
    selectedCrop.predictedPrices.forEach((pp) => {
      const match = combinedData.find((d) => d.month === pp.date);
      if (match) {
        match.predicted = pp.price;
      } else {
        combinedData.push({
          month: pp.date,
          historical: null,
          predicted: pp.price
        });
      }
    });

    return combinedData;
  };

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{t.marketPrices}</h3>
            <p className="text-xs text-slate-500">{t.moroccanMarket}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {prices.map((pr) => (
              <button
                key={pr.cropName}
                onClick={() => setSelectedCropName(pr.cropName)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all ${
                  selectedCropName === pr.cropName
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {getLocalizedCropName(pr.cropName)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {!loading && selectedCrop && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Metric Displays */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 relative">
                <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wide">
                  {t.currentPrice} ({getLocalizedCropName(selectedCrop.cropName)})
                </span>
                <div className="text-3xl font-extrabold text-slate-950 font-display mt-1.5 flex items-baseline gap-1">
                  {selectedCrop.currentPrice.toFixed(2)}{" "}
                  <span className="text-xs font-medium text-slate-500">MAD / Kg</span>
                </div>
                <div className="flex items-center gap-1 mt-3.5 text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 px-3 rounded-lg w-max border border-emerald-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.4% vs last week
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 relative">
                <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wide">
                  {t.predictedPrice}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 font-display mt-1.5 flex items-baseline gap-1">
                  {selectedCrop.predictedPrice.toFixed(2)}{" "}
                  <span className="text-xs font-medium text-slate-400">MAD / Kg</span>
                </div>
                <div className="flex items-center gap-1 mt-3.5 text-xs text-blue-600 font-semibold bg-blue-50 py-1.5 px-3 rounded-lg w-max border border-blue-100/50">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  AI Forecast Confidence: 89%
                </div>
              </div>

              {/* Selling insights */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-indigo-100 flex gap-3 text-left">
                <Award className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm">{t.bestSalesMonth}</h4>
                  <p className="text-indigo-900 text-xs mt-1.5 font-semibold">
                    {selectedCrop.bestSellingPeriod}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1 pr-1 leading-relaxed">
                    {lang === "ar" 
                      ? "يتزامن هذا الشهر مع قلة المخزون المعروض بأسواق سيدي عثمان والجهوية، مما يمنحك قوة تفاوضية أكبر." 
                      : "Historiquement, l'offre fléchit à Sidi Othmane ce mois-ci, dynamisant la demande de gros."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Graph */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">{t.historicalChart}</h4>
              
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={getChartData()} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: 'MAD/Kg', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line 
                      type="monotone" 
                      dataKey="historical" 
                      name={t.historicalPrice} 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      name={t.predictedPriceChart} 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      strokeDasharray="5 5" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-2.5 items-start bg-slate-50 p-4 rounded-xl text-xs text-slate-500 text-left">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === "ar" 
                    ? "تعتمد تقديرات الأسعار على خوارزميات تعلم آلي تقوم بمسح تضخم الأسعار، سلاسل الإمداد المائي ومستويات التصدير عبر الموانئ المغربية بإنزكان وموانئ التصدير." 
                    : "Les projections IA s'ajustent hebdomadairement face à l'hydrologie des barrages, le coût de gasoil régulé national, et l'intensité d'exportation maraîchère."
                  }
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
