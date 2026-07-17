import React, { useState } from "react";
import { translations } from "../translations";
import { Language, DiseaseReport } from "../types";
import { 
  Sprout, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Clock,
  Shield,
  HelpCircle,
  Camera,
  Layers
} from "lucide-react";

interface AiDiseaseDoctorProps {
  lang: Language;
  onNewReport: (report: DiseaseReport) => void;
  diseaseHistory: DiseaseReport[];
}

export default function AiDiseaseDoctor({ lang, onNewReport, diseaseHistory }: AiDiseaseDoctorProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomatoes");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<DiseaseReport | null>(null);
  const t = translations[lang];

  // Predefined Botanical leaf photos for Moroccan simulation testing
  const sampleLeaves = [
    {
      id: "leaf_1",
      name: t.tomatoMildew,
      crop: "Tomatoes",
      img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "ورقة طماطم ذابلة وجافة" : lang === "fr" ? "Feuille de tomate flétrie" : "Withered tomato leaf",
      isHealthy: false
    },
    {
      id: "leaf_healthy_tomato",
      name: lang === "ar" ? "طماطم سليمة ممتازة" : lang === "fr" ? "Tomate Saine Premium" : "Healthy Premium Tomato",
      crop: "Tomatoes",
      img: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "نبات طماطم حيوي سليم" : lang === "fr" ? "Plant vigoureux et sain" : "Vigorous healthy tomato plant",
      isHealthy: true
    },
    {
      id: "leaf_2",
      name: t.olivePeacock,
      crop: "Olives",
      img: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "بقع عين الطاووس على الزيتون" : lang === "fr" ? "Oeil de paon de l'olivier" : "Olive peacock spot disease",
      isHealthy: false
    },
    {
      id: "leaf_healthy_olive",
      name: lang === "ar" ? "زيتون سليم ممتاز" : lang === "fr" ? "Olivier Sain Premium" : "Healthy Premium Olive",
      crop: "Olives",
      img: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "غصن زيتون بلدي يانع" : lang === "fr" ? "Olivier vert vigoureux" : "Vibrant green olive branch",
      isHealthy: true
    },
    {
      id: "leaf_3",
      name: t.wheatRust,
      crop: "Wheat",
      img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "صدأ القمح على السنابل" : lang === "fr" ? "Pustules de rouille sur épi" : "Rust pustules on wheat spike",
      isHealthy: false
    },
    {
      id: "leaf_healthy_wheat",
      name: lang === "ar" ? "قمح سليم ممتاز" : lang === "fr" ? "Blé Sain Premium" : "Healthy Premium Wheat",
      crop: "Wheat",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "سنابل قمح ذهبية سليمة" : lang === "fr" ? "Blé doré vigoureux" : "Vigorous golden wheat",
      isHealthy: true
    },
    {
      id: "leaf_4",
      name: t.citrusCanker,
      crop: "Citrus",
      img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "تقرح بكتيري على الليمون" : lang === "fr" ? "Chancre sur citronnier" : "Bacterial canker on lemon leaf",
      isHealthy: false
    },
    {
      id: "leaf_healthy_citrus",
      name: lang === "ar" ? "حمضيات سليمة ممتازة" : lang === "fr" ? "Agrumes Sains Premium" : "Healthy Premium Citrus",
      crop: "Citrus",
      img: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "شجرة برتقال يانعة ومثمرة" : lang === "fr" ? "Oranger vigoureux et sain" : "Vigorous orange tree",
      isHealthy: true
    },
    {
      id: "leaf_5",
      name: lang === "ar" ? "لفحة البطاطس المتأخرة" : lang === "fr" ? "Mildiou de la Pomme de Terre" : "Potato Late Blight",
      crop: "Potatoes",
      img: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "أوراق بطاطس مصابة بالميلديو" : lang === "fr" ? "Feuilles de pdt altérées" : "Infected potato plant leaves",
      isHealthy: false
    },
    {
      id: "leaf_healthy_potato",
      name: lang === "ar" ? "بطاطس سليمة ممتازة" : lang === "fr" ? "Pomme de Terre Saine" : "Healthy Premium Potato",
      crop: "Potatoes",
      img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300",
      desc: lang === "ar" ? "شجيرة بطاطس خضراء سليمة" : lang === "fr" ? "Plant de pomme de terre vigoureux" : "Vigorous potato foliage",
      isHealthy: true
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result as string;
        setUploadedImage(imageSrc);
        executeAnalysis(imageSrc, selectedCrop);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeAnalysis = (imageSrc: string | null, cropType: string, isHealthyMock?: boolean) => {
    setAnalyzing(true);
    setCurrentReport(null);

    // Call server disease diagnosis endpoint
    fetch("/api/disease/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: imageSrc || "",
        cropName: cropType,
        isHealthyMock: isHealthyMock
      })
    })
      .then((res) => res.json())
      .then((report) => {
        setCurrentReport(report);
        onNewReport(report);
        setAnalyzing(false);
      })
      .catch((err) => {
        console.error(err);
        setAnalyzing(false);
      });
  };

  const handleTriggerAnalysis = () => {
    executeAnalysis(uploadedImage, selectedCrop);
  };

  const handleSelectSample = (sample: any) => {
    setUploadedImage(sample.img);
    setSelectedCrop(sample.crop);
    executeAnalysis(sample.img, sample.crop, sample.isHealthy);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{t.aiDisease}</h3>
            <p className="text-xs text-slate-500">{t.diseaseDesc}</p>
          </div>
        </div>

        {/* Diagnostic workspace */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Diagnostic upload panels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                {lang === "ar" ? "اختر صنف المحصول المراد فحصه" : "Type de culture cultivée"}
              </label>
              <input
                type="text"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                placeholder={lang === "ar" ? "أدخل اسم النبات (مثال: طماطم، تفاح)" : "Entrez le nom de la plante (ex: Tomate, Pomme)"}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Drag & Drop uploader area */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-emerald-500 transition-colors text-center relative bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mx-auto border border-slate-200 shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-slate-700">{t.dragAndDrop}</div>
                <div className="text-xs text-slate-500">Supports JPG, PNG (Max 5MB)</div>
              </div>
            </div>

            {/* Uploaded picture showcase */}
            {uploadedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center shadow-lg">
                <img 
                  src={uploadedImage} 
                  alt="Aperçu échantillon" 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-3 right-3 bg-red-600/90 text-white rounded-full p-2 hover:bg-red-700 active:scale-95 text-xs font-semibold cursor-pointer"
                >
                  Clear Photo
                </button>
              </div>
            )}

            <button
              onClick={handleTriggerAnalysis}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {lang === "ar" ? "تشغيل طبيب النبات الفوري" : "Diagnostiquer avec l'IA"}
            </button>
          </div>

          {/* Results outputs panel */}
          <div className="lg:col-span-7">
            {analyzing ? (
              <div className="bg-slate-50 p-16 rounded-2xl border border-slate-200/60 text-center flex flex-col items-center justify-center h-full">
                <Sparkles className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <h4 className="font-semibold text-slate-800 text-lg">{t.analyzing}</h4>
                <p className="text-xs text-slate-500 mt-2">Connecting with Google Gemini neural pathways...</p>
              </div>
            ) : currentReport ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {t.diagnosisResult}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1">{currentReport.diagnosis}</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-center">
                      <div className="text-[9px] text-slate-400 font-semibold">{t.confidence}</div>
                      <div className="text-sm font-bold text-emerald-600">{currentReport.confidenceScore}%</div>
                    </div>

                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-center">
                      <div className="text-[9px] text-slate-400 font-semibold">{t.severity}</div>
                      <div className={`text-sm font-bold capitalize ${
                        currentReport.severity === "high" ? "text-red-600 animate-pulse" :
                        currentReport.severity === "medium" ? "text-amber-500" : "text-emerald-600"
                      }`}>{t[currentReport.severity] || currentReport.severity}</div>
                    </div>
                  </div>
                </div>

                {/* Nice vs Bad Product Quality Badge & Assessment */}
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start gap-4 shadow-sm transition-all ${
                  currentReport.status === 'nice' || currentReport.severity === 'low'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                }`}>
                  <div className={`p-3 rounded-xl shrink-0 ${
                    currentReport.status === 'nice' || currentReport.severity === 'low'
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {currentReport.status === 'nice' || currentReport.severity === 'low' ? (
                      <CheckCircle className="w-6 h-6 shrink-0 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                        currentReport.status === 'nice' || currentReport.severity === 'low'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                          : 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                      }`}>
                        {lang === "ar" ? (
                          currentReport.status === 'nice' || currentReport.severity === 'low' ? "✨ منتوج ممتاز وسليم" : "⚠️ منتوج رديء / مصاب"
                        ) : lang === "fr" ? (
                          currentReport.status === 'nice' || currentReport.severity === 'low' ? "✨ NICE PRODUCT" : "⚠️ BAD PRODUCT"
                        ) : (
                          currentReport.status === 'nice' || currentReport.severity === 'low' ? "✨ NICE PRODUCT" : "⚠️ BAD PRODUCT"
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {lang === "ar" ? "تقييم جودة المنتج الفوري" : lang === "fr" ? "Évaluation Qualité Instantanée" : "Instant Quality Assessment"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium pt-1">
                      {currentReport.qualityAssessment || (
                        currentReport.status === 'nice' || currentReport.severity === 'low'
                          ? "L'analyse d'image confirme que l'échantillon ne présente aucun symptôme pathologique visible. Les feuilles et fruits sont sains et de haute valeur commerciale."
                          : "L'analyse d'image a détecté des anomalies foliaires actives, taches de mildiou ou altérations biologiques qui diminuent la qualité marchande du produit."
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Curative / Product protection card */}
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                    <h4 className="font-bold text-amber-900 text-xs flex gap-2 items-center mb-3 uppercase tracking-wider">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {lang === "ar" 
                          ? "🛡️ حماية المنتوج والنبات (بروتوكول المعالجة)" 
                          : lang === "fr" 
                            ? "🛡️ PROTÉGER LE PRODUIT & LA PLANTE (Traitement)" 
                            : "🛡️ PROTECT PRODUCT & PLANT (Treatment)"}
                      </span>
                    </h4>
                    <div className="text-xs text-amber-950 whitespace-pre-line leading-relaxed pl-1 font-medium space-y-1.5">
                      {currentReport.treatment}
                    </div>
                  </div>

                  {/* Preventive / Field protection card */}
                  <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                    <h4 className="font-bold text-emerald-900 text-xs flex gap-2 items-center mb-3 uppercase tracking-wider">
                      <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {lang === "ar" 
                          ? "🌾 حماية الحقل والتربة (التدابير الوقائية)" 
                          : lang === "fr" 
                            ? "🌾 PROTÉGER LE CHAMP & LE SOL (Prévention)" 
                            : "🌾 PROTECT FIELD & SOIL (Prevention)"}
                      </span>
                    </h4>
                    <div className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed pl-1 font-medium space-y-1.5">
                      {currentReport.prevention}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-12 rounded-2xl border border-slate-200/60 text-center flex flex-col items-center justify-center h-full">
                <Camera className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="font-semibold text-slate-700 text-sm">Prêt pour diagnostic</h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                  Sélectionnez une culture, importez la photo de votre feuille malade, ou cliquez sur l'un de nos échantillons d'essais marocains ci-dessous pour tester.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Crop Samples */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-semibold text-slate-900 text-base mb-4 flex gap-1.5 items-center">
          <Layers className="w-4.5 h-4.5 text-emerald-600" />
          {t.samplePhotos}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {sampleLeaves.map((leaf) => (
            <div 
              key={leaf.id}
              onClick={() => handleSelectSample(leaf)}
              className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all text-left bg-slate-50"
            >
              <div className="h-28 overflow-hidden bg-slate-150">
                <img 
                  src={leaf.img} 
                  alt={leaf.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-slate-800 truncate">{leaf.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{leaf.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Reports History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-semibold text-slate-900 text-base mb-4">Dossier des Diagnostics botanique stockés</h4>
        {diseaseHistory.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">Aucun diagnostic récent.</div>
        ) : (
          <div className="space-y-3">
            {diseaseHistory.map((rep) => (
              <div key={rep.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{rep.diagnosis}</div>
                  <div className="text-slate-500 mt-0.5">Culture : {rep.cropType} • {new Date(rep.date).toLocaleDateString()}</div>
                </div>

                <div className="flex gap-3">
                  <span className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] ${
                    rep.severity === "high" ? "bg-red-100 text-red-800" :
                    rep.severity === "medium" ? "bg-amber-100 text-amber-800" :
                    "bg-emerald-100 text-emerald-800"
                  }`}>
                    {rep.severity}
                  </span>
                  <span className="font-mono text-slate-600 bg-slate-200 px-2.5 py-1 rounded font-bold">
                    Confiance : {rep.confidenceScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
