import React from "react";
import { translations } from "../translations";
import { Language } from "../types";
import { 
  Palmtree, 
  Sprout,
  Droplets, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight, 
  MapPin, 
  HelpCircle, 
  CheckCircle2, 
  FileText,
  User,
  Activity,
  Globe2
} from "lucide-react";

interface LandingPageProps {
  lang: Language;
  onGetStarted: () => void;
}

export default function LandingPage({ lang, onGetStarted }: LandingPageProps) {
  const t = translations[lang];

  const planFeatures = {
    free: [t.basicWeather, t.farmLogLimit],
    premium: [t.basicWeather, t.farmLogLimit, t.aiDocDiagnostics, t.aiPriceModel, t.irrigationOptimization],
    enterprise: [t.basicWeather, t.farmLogLimit, t.aiDocDiagnostics, t.aiPriceModel, t.irrigationOptimization, t.cooperativeSupport, t.analyticsExport, t.apiIntegrations]
  };

  return (
    <div id="landing-container" className="bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white py-20 lg:py-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36%] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-200 to-amber-100 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 tracking-wide border border-emerald-200 uppercase">
                <Globe2 className="w-3.5 h-3.5 animate-spin-slow" /> {t.tagline}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 tracking-tight leading-none">
                {t.heroTitle}
              </h1>
              <p className="text-lg text-slate-600 sm:max-w-xl leading-relaxed">
                {t.heroDesc}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={onGetStarted}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-emerald-200 transition-all duration-200 flex items-center gap-2 text-base cursor-pointer"
                >
                  {t.getStarted} <ChevronRight className="w-5 h-5" />
                </button>
                <a 
                  href="#features"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-8 py-4 rounded-xl transition-all duration-200 text-base border border-slate-200 flex items-center justify-center"
                >
                  {t.exploreFeatures}
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 opacity-20 blur-xl"></div>
              <div className="relative bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                    Souss-Massa live feed
                  </div>
                </div>
                
                {/* Simulated live chart preview on Landing page */}
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                    <div className="text-xs text-slate-400 font-mono">SOB_FARM_INDEX</div>
                    <div className="text-xl font-display font-semibold text-white mt-1">94% Vigueur Végétale</div>
                    <div className="h-2 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                      <div className="w-[94%] h-full bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 font-mono">PROCHAINE RECOMMENDATION D'IRRIGATION</div>
                      <div className="text-sm font-semibold text-amber-400 mt-1">4,800 Litres / Hectare</div>
                      <div className="text-xs text-slate-500 mt-0.5">Sables filtrants | Tomates</div>
                    </div>
                    <div className="p-2.5 bg-blue-950/50 rounded-lg text-blue-400 border border-blue-900">
                      <Droplets className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                    <div className="text-xs text-slate-400 font-mono">DÉTECTION IA GEMINI</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-xs bg-slate-900 p-2 rounded text-slate-300 border border-slate-800">
                        ✓ Tomates Late Blight (92%)
                      </div>
                      <div className="text-xs bg-slate-900 p-2 rounded text-slate-300 border border-slate-800">
                        ✓ Oeil de paon (95%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
            {t.benefitsTitle}
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            {t.benefitsSubtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{t.benefit1Title}</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{t.benefit1Desc}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{t.benefit2Title}</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{t.benefit2Desc}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{t.benefit3Title}</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{t.benefit3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
            {t.howItWorksTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 text-left">
            <div className="space-y-4">
              <div className="text-emerald-600 font-bold font-display text-lg">{t.step1}</div>
              <p className="text-slate-600 leading-relaxed">{t.step1Desc}</p>
            </div>
            <div className="space-y-4">
              <div className="text-emerald-600 font-bold font-display text-lg">{t.step2}</div>
              <p className="text-slate-600 leading-relaxed">{t.step2Desc}</p>
            </div>
            <div className="space-y-4">
              <div className="text-emerald-600 font-bold font-display text-lg">{t.step3}</div>
              <p className="text-slate-600 leading-relaxed">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <p className="text-emerald-400 font-semibold tracking-wide uppercase text-sm">Coopérative Agro Marrakchia</p>
          <blockquote className="mt-6 text-2xl sm:text-3xl font-display font-medium leading-9 text-slate-100">
            "Grâce aux prédictions intelligentes d'irrigation et de prix, notre coopérative a réduit d'un tiers son gaspillage d'eau tout en améliorant de 18% nos marges sur la pomme de terre de gros."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold font-display text-lg shadow-inner">
              M
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Mustapha Ait-Ali</div>
              <div className="text-sm text-slate-400">Président, Coopérative Souss-Agrumes</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-slate-900 text-center">
            {t.faqTitle}
          </h2>
          <div className="mt-12 space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50">
              <h3 className="font-semibold text-lg text-slate-900 flex gap-2 items-start text-left">
                <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                {t.faqQ1}
              </h3>
              <p className="text-slate-600 mt-2.5 pl-7 leading-relaxed text-left">
                {t.faqA1}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50">
              <h3 className="font-semibold text-lg text-slate-900 flex gap-2 items-start text-left">
                <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                {t.faqQ2}
              </h3>
              <p className="text-slate-600 mt-2.5 pl-7 leading-relaxed text-left">
                {t.faqA2}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50">
              <h3 className="font-semibold text-lg text-slate-900 flex gap-2 items-start text-left">
                <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                {t.faqQ3}
              </h3>
              <p className="text-slate-600 mt-2.5 pl-7 leading-relaxed text-left">
                {t.faqA3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-4">
          <div className="flex flex-col items-center justify-center w-fit mx-auto">
            <Palmtree className="w-5 h-5 text-[#d4af37] mb-0.5" strokeWidth={1.5} />
            <span className="font-display font-extrabold text-[#d4af37] tracking-tight leading-none text-base">agrisma</span>
            <span className="text-[5px] font-bold text-[#d4af37] tracking-[0.2em] leading-none uppercase mt-0.5">OUR FUTURE</span>
          </div>
          <p>{t.credits}</p>
        </div>
      </footer>
    </div>
  );
}
