import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import { Language, User, Farm, Crop, DiseaseReport, Alert } from "./types";
import LandingPage from "./components/LandingPage";
import WeatherIntel from "./components/WeatherIntel";
import SmartIrrigation from "./components/SmartIrrigation";
import AiDiseaseDoctor from "./components/AiDiseaseDoctor";
import MarketPrices from "./components/MarketPrices";
import AdminPanel from "./components/AdminPanel";

import { 
  Sprout,
  Palmtree,
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  Globe, 
  MapPin, 
  Bell, 
  User as UserIcon, 
  Sliders, 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  FolderPlus,
  RefreshCw,
  LogOut,
  X,
  CreditCard,
  Menu,
  CheckCircle2,
  Lock,
  Layers,
  Locate,
  Eye,
  EyeOff
} from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<Language>("fr"); // Default to French, extremely common for Moroccan administration
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "weather" | "irrigation" | "disease" | "market" | "admin" | "faq">(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
      const validTabs = ["home", "dashboard", "weather", "irrigation", "disease", "market", "admin", "faq"];
      if (validTabs.includes(path)) {
        return path as any;
      }
    }
    return "home";
  });

  // Keep browser URL pathname synchronized with the activeTab state
  useEffect(() => {
    const currentPath = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
    const targetPath = activeTab === "home" ? "" : activeTab;
    if (currentPath !== targetPath) {
      window.history.pushState(null, "", activeTab === "home" ? "/" : `/${activeTab}`);
    }
  }, [activeTab]);

  // Handle browser back and forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
      const validTabs = ["home", "dashboard", "weather", "irrigation", "disease", "market", "admin", "faq"];
      if (validTabs.includes(path)) {
        setActiveTab(path as any);
      } else if (path === "") {
        setActiveTab("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  
  // App States
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<DiseaseReport[]>([]);
  
  // Form Modals
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  
  
  // Modals Inputs state
  const [authEmail, setAuthEmail] = useState(() => localStorage.getItem("agr_remember_email") || "");
  const [authPassword, setAuthPassword] = useState(() => localStorage.getItem("agr_remember_password") || "");
  const [authName, setAuthName] = useState("");
  const [authIsRegister, setAuthIsRegister] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Password Visibility Toggle and Captcha Security State Setup
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const refreshCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
  };

  useEffect(() => {
    if (showAuthModal) {
      refreshCaptcha();
      setShowPassword(false);
    }
  }, [showAuthModal, authIsRegister]);
  
  // Remember Me & Forgot Password Portal states
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
  const [newPasswordForReset, setNewPasswordForReset] = useState("");
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(null);
  const [isLoadingRecovery, setIsLoadingRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "verify">("request");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [simulatedReceivedCode, setSimulatedReceivedCode] = useState<string | null>(null);
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const [recoverySendError, setRecoverySendError] = useState<string | null>(null);
  
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("Souss-Massa");
  const [newFarmSize, setNewFarmSize] = useState(5);
  const [newFarmSoil, setNewFarmSoil] = useState<"Clay" | "Sandy" | "Loamy" | "Silty" | "Chalky">("Sandy");
  
  const [selectedFarmIdForCrop, setSelectedFarmIdForCrop] = useState("");
  const [newCropName, setNewCropName] = useState<"Tomatoes" | "Potatoes" | "Onions" | "Wheat" | "Olives" | "Citrus">("Tomatoes");
  const [newCropPlanting, setNewCropPlanting] = useState("2026-03-10");
  const [newCropHarvest, setNewCropHarvest] = useState("2026-07-15");

  // Load state helpers
  const [selectedRegion, setSelectedRegion] = useState("Souss-Massa");
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isUiProcessingAlert, setIsUiProcessingAlert] = useState(false);

  const getClosestRegion = (lat: number, lon: number) => {
    const regionsCoords = [
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
    ];
    let closest = regionsCoords[0];
    let minDistance = Infinity;
    for (const r of regionsCoords) {
      const d = Math.sqrt(Math.pow(r.lat - lat, 2) + Math.pow(r.lon - lon, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = r;
      }
    }
    return closest.name;
  };

  const handleGpsDetect = (coords: { latitude: number; longitude: number }) => {
    setGpsCoords(coords);
    if (coords.latitude === 0 && coords.longitude === 0) {
      // disconnected
      return;
    }
    const matched = getClosestRegion(coords.latitude, coords.longitude);
    setSelectedRegion(matched);
  };

  // Translations dictionary
  const t = translations[lang];

  const addToast = (alertObj: Alert) => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { ...alertObj, toastId }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
    }, 7000);
  };

  const triggerDailyAlertSimulation = () => {
    setIsUiProcessingAlert(true);
    fetch("/api/alerts/simulate", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setIsUiProcessingAlert(false);
        if (data.success && data.newAlert) {
          setAlerts(data.alerts);
          addToast(data.newAlert);
        }
      })
      .catch((err) => {
        setIsUiProcessingAlert(false);
        console.error("Simulation error:", err);
      });
  };

  useEffect(() => {
    // 1. Prefill credentials if Remember Me is checked
    const savedEmail = localStorage.getItem("agr_remember_email");
    const savedPassword = localStorage.getItem("agr_remember_password");
    if (savedEmail && savedPassword) {
      setAuthEmail(savedEmail);
      setAuthPassword(savedPassword);
      setRememberMe(true);
      setAuthIsRegister(false); // Returning user, switch to login tab
    }

    // 2. Load persistent logged-in session
    const storedUser = localStorage.getItem("agri_user");
    const loggedOut = localStorage.getItem("is_logged_out");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (loggedOut === "true") {
      setUser(null);
    } else {
      // Default to guest and prompt user to login
      setUser(null);
      setAuthIsRegister(false);
      setShowAuthModal(true);
    }

    // Fetch static details
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Helper to safely fetch json with fallback
    const safeFetchJson = async (url: string, fallbackData: any) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          // Ensure we don't accidentally return an error object instead of an array
          if (Array.isArray(fallbackData) && !Array.isArray(data)) {
            return fallbackData;
          }
          return data;
        }
        return fallbackData; // Static host returned HTML
      } catch (err) {
        return fallbackData; // Offline
      }
    };

    // Concurrent fetches for performance, protected against missing backend
    Promise.all([
      safeFetchJson("/api/farms", []),
      safeFetchJson("/api/crops", []),
      safeFetchJson("/api/alerts", [])
    ]).then(([farmsData, cropsData, alertsData]) => {
      // Mock data if everything is empty due to static hosting
      if (!Array.isArray(farmsData) || farmsData.length === 0) {
        farmsData = [{ id: "f1", name: "Souss-Massa Atlas", location: "Agadir", sizeHectares: 24, soilType: "Loamy" }];
      }
      if (!Array.isArray(cropsData) || cropsData.length === 0) {
        cropsData = [{ id: "c1", farmId: "f1", cropName: "Tomatoes", status: "Growing", expectedHarvestDate: "2026-07-20", plantingDate: "2026-04-10", healthScore: 92, irrigatedSum: 4500 }];
      }
      if (!Array.isArray(alertsData) || alertsData.length === 0) {
        alertsData = [{ 
          id: "a1", 
          type: "weather", 
          severity: "warning",
          titleEn: "Chergui Winds Expected",
          titleFr: "Vents Chergui Prévus",
          titleAr: "رياح الشرقي متوقعة",
          descEn: "Increase Souss-Massa irrigation by 15% to prevent transpiration stress.",
          descFr: "Augmentez l'irrigation Souss-Massa de 15% pour éviter le stress de transpiration.",
          descAr: "قم بزيادة ري سوس ماسة بنسبة 15٪ لمنع إجهاد النتح.",
          date: "1h ago",
          read: false
        }];
      }

      setFarms(farmsData);
      setCrops(cropsData);
      setAlerts(alertsData);
      setLoading(false);
    }).catch((err) => {
      console.error("Fetch initial state error:", err);
      setLoading(false);
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Human Validation (CAPTCHA verification check)
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      const errorText = lang === "ar"
        ? "رمز التحقق الأمني غير صحيح! يرجى إدخال الرمز الصحيح والمحاولة مرة أخرى."
        : "Incorrect security CAPTCHA code! Please check the code and try again.";
      setAuthError(errorText);
      refreshCaptcha();
      return;
    }

    const endpoint = authIsRegister ? "/api/auth/register" : "/api/auth/login";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: authName,
          phone: "+212 600-000000"
        })
      });

      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
        if (!res.ok) {
          let errorMsg = data.error || "Please enter the right email and password.";
          if (lang === "ar") {
            if (errorMsg.includes("Incorrect password")) {
              errorMsg = "كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور الصحيحة التي قمت بالتسجيل بها.";
            } else if (errorMsg.includes("not registered")) {
              errorMsg = "هذا البريد الإلكتروني غير مسجل. يرجى الاشتراك / التسجيل أولاً.";
            } else if (errorMsg.includes("already registered")) {
              errorMsg = "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.";
            } else {
              errorMsg = "خطأ في تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.";
            }
          }
          throw new Error(errorMsg);
        }
      } else {
        // Fallback for static hosts (like Netlify) where API routes don't exist
        console.log("Static host detected, simulating auth...");
        data = {
          user: {
            id: "us_" + Math.random().toString(36).substring(7),
            name: authName || authEmail.split("@")[0] || "Farmer",
            email: authEmail,
            role: "farmer",
            phone: "+212 600-000000"
          }
        };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("agri_user", JSON.stringify(data.user));
        localStorage.removeItem("is_logged_out");
        
        if (rememberMe) {
          localStorage.setItem("agr_remember_email", authEmail);
          localStorage.setItem("agr_remember_password", authPassword);
        } else {
          localStorage.removeItem("agr_remember_email");
          localStorage.removeItem("agr_remember_password");
        }
        
        setShowAuthModal(false);
        setAuthError(null);
        setActiveTab("dashboard");
      }
    } catch (err: any) {
      // Offline fallback
      if (err.message === "Failed to fetch" || err.toString().includes("NetworkError")) {
         console.log("Offline mode, simulating auth login...");
         const offlineUser = {
           id: "us_" + Math.random().toString(36).substring(7),
           name: authName || authEmail.split("@")[0] || "Farmer",
           email: authEmail,
           role: "farmer",
           phone: "+212 600-000000"
         };
         setUser(offlineUser);
         localStorage.setItem("agri_user", JSON.stringify(offlineUser));
         localStorage.removeItem("is_logged_out");
         
         if (rememberMe) {
           localStorage.setItem("agr_remember_email", authEmail);
           localStorage.setItem("agr_remember_password", authPassword);
         } else {
           localStorage.removeItem("agr_remember_email");
           localStorage.removeItem("agr_remember_password");
         }
         
         setShowAuthModal(false);
         setAuthError(null);
         setActiveTab("dashboard");
         return;
      }
      console.warn("Auth action failed:", err);
      setAuthError(err.message || "Please enter the right email and password.");
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccessMsg(null);
    setIsLoadingRecovery(true);

    if (recoveryStep === "request") {
      if (!newPasswordForReset || newPasswordForReset.length < 6) {
        setIsLoadingRecovery(false);
        setRecoveryError(lang === "ar" ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل." : "Password must be at least 6 characters.");
        return;
      }

      fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: newPasswordForReset })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            const errorMsg = lang === "ar" 
              ? (data.error || "البريد الإلكتروني هذا غير مسجل لدينا في النظام!") 
              : (data.errorEn || data.error || "No user with this email address.");
            throw new Error(errorMsg);
          }
          return data;
        })
        .then(data => {
          setIsLoadingRecovery(false);
          setRecoveryStep("verify");
          setRecoverySuccessMsg(
            lang === "ar"
              ? `✓ ${data.message}`
              : `✓ ${data.messageEn}`
          );
        })
        .catch(err => {
          setIsLoadingRecovery(false);
          setRecoveryError(err.message || "Failed to reset password.");
        });
    } else {
      if (!recoveryCodeInput.trim()) {
        setIsLoadingRecovery(false);
        setRecoveryError(lang === "ar" ? "يرجى إدخال رمز التحقق" : "Please enter the verification code");
        return;
      }
      if (!newPasswordForReset.trim() || newPasswordForReset.length < 4) {
        setIsLoadingRecovery(false);
        setRecoveryError(
          lang === "ar" 
            ? "يجب أن تكون كلمة المرور الجديدة 4 أحرف على الأقل." 
            : "New password must be at least 4 characters."
        );
        return;
      }

      fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: recoveryCodeInput.trim(),
          newPassword: newPasswordForReset
        })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            const errorMsg = lang === "ar" 
              ? (data.error || "رمز التحقق غير صحيح أو منتهي الصلاحية!") 
              : (data.errorEn || data.error || "Incorrect validation code.");
            throw new Error(errorMsg);
          }
          return data;
        })
        .then(data => {
          setIsLoadingRecovery(false);
          setIsResetSuccess(true);
          setRecoverySuccessMsg(
            lang === "ar" 
              ? "✓ تم تحديث كلمة المرور الخاصة بك بنجاح! يمكنك الآن تسجيل الدخول بكامِل الأمان." 
              : "✓ Your password has been successfully reset! You can now log in safely."
          );
          
          const savedEmail = localStorage.getItem("agr_remember_email");
          if (savedEmail && savedEmail.toLowerCase() === forgotEmail.toLowerCase()) {
            localStorage.setItem("agr_remember_password", newPasswordForReset);
            setAuthPassword(newPasswordForReset);
          }
          setAuthEmail(forgotEmail);
        })
        .catch(err => {
          setIsLoadingRecovery(false);
          setRecoveryError(err.message || "Failed to reset password.");
        });
    }
  };

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFarmName,
        location: newFarmLocation,
        sizeHectares: newFarmSize,
        soilType: newFarmSoil
      })
    })
      .then(res => res.json())
      .then(newFarm => {
        setFarms([...farms, newFarm]);
        setNewFarmName("");
        setShowFarmModal(false);

        // Notify user
        const alertObj: any = {
          id: "toast_farm_" + Date.now(),
          type: "farm",
          severity: "success",
          titleEn: "Farm Created Successfully",
          titleFr: "Ferme créée avec succès",
          titleAr: "تم إنشاء المزرعة بنجاح",
          descEn: `Farm "${newFarm.name}" in ${newFarm.location} has been registered.`,
          descFr: `La ferme "${newFarm.name}" à ${newFarm.location} a été enregistrée.`,
          descAr: `تم تسجيل المزرعة "${newFarm.name}" في ${newFarm.location} بنجاح.`,
          date: new Date().toISOString(),
          read: false
        };
        addToast(alertObj);
      });
  };

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmId: selectedFarmIdForCrop || farms[0]?.id,
        cropName: newCropName,
        plantingDate: newCropPlanting,
        expectedHarvestDate: newCropHarvest
      })
    })
      .then(res => res.json())
      .then(newCrop => {
        setCrops([...crops, newCrop]);
        setShowCropModal(false);

        // Notify user
        const alertObj: any = {
          id: "toast_crop_" + Date.now(),
          type: "crop",
          severity: "success",
          titleEn: "New Crop Registered",
          titleFr: "Nouvelle culture enregistrée",
          titleAr: "تم تسجيل محصول جديد",
          descEn: `Crop "${newCrop.cropName}" has been added to your field registry.`,
          descFr: `La culture de "${newCrop.cropName}" a été ajoutée à votre registre de parcelles.`,
          descAr: `تمت إضافة محصول "${newCrop.cropName}" إلى سجل حقولكم الزراعية.`,
          date: new Date().toISOString(),
          read: false
        };
        addToast(alertObj);
      });
  };

  const handleIrrigate = (cropId: string, amount: number) => {
    fetch("/api/crops/irrigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cropId, amount })
    })
      .then(res => res.json())
      .then(updatedCrop => {
        setCrops(crops.map(c => c.id === cropId ? updatedCrop : c));

        // Notify user
        const alertObj: any = {
          id: "toast_irrigate_" + Date.now(),
          type: "irrigation",
          severity: "success",
          titleEn: "Irrigation Action Logged",
          titleFr: "Irrigation enregistrée avec succès",
          titleAr: "تم تسجيل عملية الري بنجاح",
          descEn: `Applied ${amount} mm of smart watering to ${updatedCrop.cropName}.`,
          descFr: `Appliqué ${amount} mm d'arrosage intelligent à la culture de ${updatedCrop.cropName}.`,
          descAr: `تم تطبيق ${amount} ملم من الري الذكي على محصول ${updatedCrop.cropName}.`,
          date: new Date().toISOString(),
          read: false
        };
        addToast(alertObj);
      });
  };

  const handleNewDiseaseReport = (report: DiseaseReport) => {
    setDiseaseHistory([report, ...diseaseHistory]);

    // Notify user
    const alertObj: any = {
      id: "toast_disease_" + Date.now(),
      type: "disease",
      severity: report.severity === "high" ? "danger" : report.severity === "medium" ? "warning" : "info",
      titleEn: `AI Diagnostic: ${report.diagnosis}`,
      titleFr: `Diagnostic IA : ${report.diagnosis}`,
      titleAr: `تشخيص الذكاء الاصطناعي: ${report.diagnosis}`,
      descEn: `Crop: ${report.cropType}. Severity: ${report.severity.toUpperCase()}. Confidence: ${Math.round(report.confidenceScore * 100)}%`,
      descFr: `Culture : ${report.cropType}. Gravité : ${report.severity.toUpperCase()}. Précision : ${Math.round(report.confidenceScore * 100)}%`,
      descAr: `المحصول: ${report.cropType}. الخطورة: ${report.severity.toUpperCase()}. الدقة: ${Math.round(report.confidenceScore * 100)}%`,
      date: new Date().toISOString(),
      read: false
    };
    addToast(alertObj);
  };

  const isTabLocked = (tabName: string): boolean => {
    return false;
  };

  const handleMarkAlertsRead = () => {
    fetch("/api/alerts/read-all", { method: "POST" })
      .then(res => res.json())
      .then(() => {
        setAlerts(alerts.map(a => ({ ...a, read: true })));
        setShowAlertsDropdown(false);
      });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("agri_user");
    localStorage.setItem("is_logged_out", "true");
    setActiveTab("home");
  };

  const getLocalizedCropType = (name: string) => {
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

  // Safe checks for subscription boundaries

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-250/60 shadow-sm flex items-center justify-between px-6 py-4">
        <div className="flex items-center cursor-pointer select-none" onClick={() => setActiveTab("home")}>
          <div className="flex flex-col items-center justify-center">
            <Palmtree className="w-5 h-5 text-[#d4af37] mb-0.5" strokeWidth={1.5} />
            <span className="font-display font-extrabold text-[#d4af37] tracking-tight leading-none text-base">agrisma</span>
            <span className="text-[5px] font-bold text-[#d4af37] tracking-[0.2em] leading-none uppercase mt-0.5">OUR FUTURE</span>
          </div>
        </div>

        {/* Desktop navbar section */}
        <nav className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => setActiveTab("home")}
            className={`font-medium text-sm transition-all cursor-pointer ${activeTab === "home" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t.navHome}
          </button>
          
          {user && (
            <>
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`font-medium text-sm transition-all cursor-pointer ${activeTab === "dashboard" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t.navDashboard}
              </button>
              
              <button 
                onClick={() => setActiveTab("weather")}
                className={`font-medium text-sm transition-all cursor-pointer ${activeTab === "weather" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t.weatherIntel}
              </button>

              <button 
                onClick={() => setActiveTab("irrigation")}
                className={`flex items-center gap-1 font-medium text-sm transition-all cursor-pointer ${activeTab === "irrigation" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t.smartIrrigation}
                
              </button>

              <button 
                onClick={() => setActiveTab("disease")}
                className={`flex items-center gap-1 font-medium text-sm transition-all cursor-pointer ${activeTab === "disease" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t.aiDisease}
                
              </button>

              <button 
                onClick={() => setActiveTab("market")}
                className={`font-medium text-sm transition-all cursor-pointer ${activeTab === "market" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t.marketPrices}
              </button>


            </>
          )}

          {user?.role === "admin" && (
            <button 
              onClick={() => setActiveTab("admin")}
              className={`font-medium text-sm transition-all ${activeTab === "admin" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t.adminPanel}
            </button>
          )}
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Globe className="w-4 h-4 text-slate-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent border-0 font-semibold text-xs text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="fr">Français (FR)</option>
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          {/* User Specific triggers */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Alert Bell Bell drop */}
              <div className="relative">
                <button 
                  onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold font-mono text-[9px] flex items-center justify-center animate-bounce">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>

                {showAlertsDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 space-y-3 z-50 text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h4 className="font-bold text-slate-900 text-sm">{t.alertCenter}</h4>
                      <button 
                        onClick={handleMarkAlertsRead}
                        className="text-xs text-emerald-600 font-medium hover:underline"
                      >
                        {t.markAllRead}
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5">
                      {alerts.map((al) => (
                        <div key={al.id} className={`p-3 rounded-xl border text-xs relative ${
                          al.read ? "bg-slate-50 border-slate-200" : "bg-emerald-50/50 border-emerald-100/80"
                        }`}>
                          <div className="font-bold text-slate-800">
                            {lang === "ar" ? al.titleAr : lang === "fr" ? al.titleFr : al.titleEn}
                          </div>
                          <p className="text-slate-600 mt-1">
                            {lang === "ar" ? al.descAr : lang === "fr" ? al.descFr : al.descEn}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1.5">{new Date(al.date).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>



              <div className="h-4.5 w-[1px] bg-slate-200 hidden md:block"></div>

              {/* Logged user name */}
              <div className="hidden md:block text-right leading-none">
                <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{t.roles[user.role]}</span>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthIsRegister(false); setShowAuthModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UserIcon className="w-4 h-4" /> {t.login}
            </button>
          )}

        </div>
      </header>

      {/* Main Content Layout container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {activeTab === "home" ? (
          <LandingPage 
            lang={lang} 
            onGetStarted={() => {
              if (user) {
              setActiveTab("dashboard");
              } else {
                setAuthIsRegister(true);
                setShowAuthModal(true);
              }
            }}
          />
        ) : (
          <div className="space-y-6">
            
            {/* Tab view controls for logged farmers */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.navDashboard}
              </button>

              <button
                onClick={() => setActiveTab("weather")}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "weather"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.weatherIntel}
              </button>

              <button
                onClick={() => setActiveTab("irrigation")}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "irrigation"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.smartIrrigation}
                
              </button>
              
              <button
                onClick={() => setActiveTab("disease")}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "disease"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.aiDisease}
                
              </button>

              <button
                onClick={() => setActiveTab("market")}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "market"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.marketPrices}
              </button>


            </div>

            {/* TAB RENDERS */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 text-left">
                
                {/* Farmer Profile metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Farm Overview card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">{t.farmOverview}</span>
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
                      {farms.length} <span className="text-sm font-medium text-slate-500">Registered</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Total land: {farms.reduce((acc, f) => acc + f.sizeHectares, 0)} Hectares Managed
                    </p>
                  </div>

                  {/* Weather widget quick stats */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer" onClick={() => setActiveTab("weather")}>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">{t.weatherSummary}</span>
                      <Globe className="w-5 h-5 text-blue-500 animate-spin-slow" />
                    </div>
                    {/* Souss default display */}
                    <div className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
                      36°C <span className="text-xs font-bold text-red-500 font-sans">CHERGUI</span>
                    </div>
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      ⚠️ High transpiration stress risk
                    </p>
                  </div>

                  {/* Water index metrics */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer" onClick={() => setActiveTab("irrigation")}>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">{t.waterUsage}</span>
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
                      {((crops || []).reduce((acc, c) => acc + (c.irrigatedSum || 0), 0)).toLocaleString()}{" "}
                      <span className="text-xs font-medium text-slate-500">Litres</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Cumulated agricultural flow this cycle</p>
                  </div>

                  {/* Crop Health evaluation card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">{t.cropHealth}</span>
                      <Sprout className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
                      92.6% <span className="text-xs font-bold text-emerald-600 font-sans">EXCELLENT</span>
                    </div>
                    <p className="text-[10px] text-emerald-500 mt-1 font-semibold">✓ Standard leaf vigor indexes</p>
                  </div>
                </div>

                {/* Farms & Crops registers split view */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Farms List */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm">{t.farmOverview}</h4>
                      <button 
                        onClick={() => setShowFarmModal(true)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded bg-emerald-50/50 border border-emerald-200"
                        title={t.addFarm}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {farms.map((f) => (
                        <div key={f.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 relative">
                          <h5 className="font-bold text-slate-800 text-sm">{f.name}</h5>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-500 leading-normal">
                            <div>Region: <span className="font-semibold text-slate-700">{f.location}</span></div>
                            <div>Size: <span className="font-semibold text-slate-700">{f.sizeHectares} Ha</span></div>
                            <div className="col-span-2">Soil: <span className="font-semibold text-slate-700">{t.soilTypes[f.soilType]}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registered crop logs */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm">{t.activeCrops}</h4>
                      <button 
                        onClick={() => {
                          if (farms.length > 0) {
                            setSelectedFarmIdForCrop(farms[0].id);
                            setShowCropModal(true);
                          } else {
                            alert("Veuillez d'abord configurer une ferme !");
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        {t.addCrop}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {crops.map((cr) => {
                        const farmMatch = farms.find(f => f.id === cr.farmId);
                        return (
                          <div key={cr.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 space-y-3 relative text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-slate-900 text-sm">
                                  {getLocalizedCropType(cr.cropName)}
                                </h5>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {farmMatch ? farmMatch.name : "Moroccan Field"}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                {cr.status}
                              </span>
                            </div>

                            <div className="border-t border-slate-200/30 pt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 leading-normal">
                              <div>Planted: <span className="font-semibold text-slate-700">{cr.plantingDate}</span></div>
                              <div>Harvest: <span className="font-semibold text-slate-700">{cr.expectedHarvestDate}</span></div>
                              <div className="col-span-2">
                                Water: <span className="font-bold text-blue-600">{(cr.irrigatedSum || 0).toLocaleString()} Litres</span>
                              </div>
                            </div>

                            {/* Vigor meter bar */}
                            <div className="border-t border-slate-200/30 pt-2.5">
                              <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                <span>Health Score (AI)</span>
                                <span className="text-emerald-600">{cr.healthScore || 0}%</span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div style={{ width: `${cr.healthScore || 0}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Regional Alerts Feed Dashboard */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{t.recentAlerts}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {lang === "ar" 
                          ? "التحديث التلقائي اليومي: مُفعّل (كل 24 ساعة)" 
                          : lang === "fr" 
                            ? "Mise à jour automatique quotidienne : Actif (Toutes les 24h)" 
                            : "Daily Automated Advisory: Active (Updated every 24h)"}
                      </p>
                    </div>

                    <button
                      onClick={triggerDailyAlertSimulation}
                      disabled={isUiProcessingAlert}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUiProcessingAlert ? "animate-spin" : ""}`} />
                      {lang === "ar" 
                        ? "محاكاة اليوم التالي (تحديث فوري)" 
                        : lang === "fr" 
                          ? "Simuler le Jour Suivant (+24h)" 
                          : "Simulate Next Day (Fast-Forward 24h)"}
                    </button>
                  </div>

                  {/* Informational Feed Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === "ar" ? "قنوات الإنذار الذكية المنشطة" : lang === "fr" ? "Canaux d'Inondation et Vigilance Intégrés" : "Active Smart Advisory Streams"}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {lang === "ar" 
                        ? "يتلقى حسابك إنذارات مستمرة تتوافق مع الأرصاد الجوية المغربية، ورطوبة التربة لسد المسيرة، وتوقعات أسعار سوق بيع الخضراوات بإنزكان ومكناس."
                        : lang === "fr"
                          ? "Fils de surveillance automatisés : alertes chergui de Souss-Massa, humidité du bassin du Sebou, et fluctuations de la bourse maraîchère de Casablanca Sidi Othmane."
                          : "Synchronized everyday with Moroccan General Meteorology (DGM), Sebou & Souss basin telemetry, and Sidi Othmane market wholesale pricing grids."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {alerts.map((al) => (
                      <div key={al.id} className={`p-4 rounded-xl border flex gap-3 text-xs leading-normal ${
                        al.severity === "danger" ? "bg-red-50 border-red-200" : al.severity === "warning" ? "bg-amber-50/60 border-amber-200" : "bg-blue-50/50 border-blue-200"
                      }`}>
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${al.severity === "danger" ? "text-red-600 animate-pulse" : al.severity === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            {lang === "ar" ? al.titleAr : lang === "fr" ? al.titleFr : al.titleEn}
                            {new Date(al.date).getTime() > Date.now() - 60000 && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[8px] rounded uppercase animate-pulse">NEW</span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 max-w-4xl font-medium font-semibold">
                            {lang === "ar" ? al.descAr : lang === "fr" ? al.descFr : al.descEn}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-2 font-mono">
                            {new Date(al.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === "weather" && (
              <WeatherIntel 
                lang={lang} 
                selectedRegion={selectedRegion} 
                onRegionChange={(reg) => setSelectedRegion(reg)} 
                gpsCoords={gpsCoords}
                onGpsDetect={handleGpsDetect}
              />
            )}

            {activeTab === "irrigation" && (
                <SmartIrrigation 
                  lang={lang} 
                  crops={crops} 
                  farms={farms} 
                  onIrrigate={handleIrrigate} 
                />
            )}

            {activeTab === "disease" && (
                <AiDiseaseDoctor
                  lang={lang}
                  onNewReport={handleNewDiseaseReport}
                  diseaseHistory={diseaseHistory}
                />
            )}

            {activeTab === "market" && (
              <MarketPrices lang={lang} />
            )}



            {activeTab === "admin" && (
              <AdminPanel lang={lang} />
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      {activeTab !== "home" && (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-850 text-xs">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-2">
            <span className="font-display font-semibold text-white block">Agrisma OUR FUTURE</span>
            <p>{t.credits}</p>
          </div>
        </footer>
      )}

      {/* --- FORM MODALS --- */}
      
      {/* 1. Add Farm Modal */}
      {showFarmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 text-left relative overflow-hidden">
            <button 
              onClick={() => setShowFarmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-slate-950 text-lg mb-6">{t.addFarm}</h3>
            
            <form onSubmit={handleCreateFarm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">{t.farmName}</label>
                <input
                  type="text"
                  required
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  placeholder="e.g., Souss El Bahia"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5 flex justify-between items-center">
                    <span>{t.location}</span>
                    <button
                      type="button"
                      onClick={() => {

                        const fallback = () => {
                              fetch('https://get.geojs.io/v1/ip/geo.json')
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.latitude && data.longitude) {
                                    const lat = parseFloat(data.latitude);
                                    const lon = parseFloat(data.longitude);
                                    const calculatedReg = getClosestRegion(lat, lon);
                                    setNewFarmLocation(calculatedReg);
                                    setGpsCoords({ latitude: lat, longitude: lon });
                                  } else {
                                    setNewFarmLocation("Souss-Massa");
                                    setGpsCoords({ latitude: 30.4183, longitude: -9.5658 });
                                  }
                                })
                                .catch(() => {
                                  setNewFarmLocation("Souss-Massa");
                                  setGpsCoords({ latitude: 30.4183, longitude: -9.5658 });
                                });
                        };

                        if (!navigator.geolocation) {
                          fallback();
                        } else {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const calculatedReg = getClosestRegion(pos.coords.latitude, pos.coords.longitude);
                              setNewFarmLocation(calculatedReg);
                              setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                            },
                            fallback
                          );
                        }

                      }}
                      className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                    >
                      <Locate className="w-2.5 h-2.5 animate-pulse" />
                      <span>{lang === "ar" ? "تحديد تلقائي" : "GPS"}</span>
                    </button>
                  </label>
                  <select
                    value={newFarmLocation}
                    onChange={(e) => setNewFarmLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
                  {gpsCoords && gpsCoords.latitude !== 0 && (
                    <p className="text-[9px] text-emerald-600 font-mono mt-1">
                      GPS: {gpsCoords.latitude.toFixed(2)}°, {gpsCoords.longitude.toFixed(2)}° matched!
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">{t.sizeHectares}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFarmSize}
                    onChange={(e) => setNewFarmSize(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">{t.soilType}</label>
                <select
                  value={newFarmSoil}
                  onChange={(e) => setNewFarmSoil(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Candy">{t.soilTypes.Sandy}</option>
                  <option value="Clay">{t.soilTypes.Clay}</option>
                  <option value="Loamy">{t.soilTypes.Loamy}</option>
                  <option value="Silty">{t.soilTypes.Silty}</option>
                  <option value="Chalky">{t.soilTypes.Chalky}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer mt-2 text-sm"
              >
                Configure Farm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 text-left relative overflow-hidden">
            <button 
              onClick={() => setShowCropModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-slate-900 text-lg mb-6">{t.addCrop}</h3>
            
            <form onSubmit={handleCreateCrop} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Attach to Farm Location</label>
                <select
                  value={selectedFarmIdForCrop}
                  onChange={(e) => setSelectedFarmIdForCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Flora variety</label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Tomatoes">{t.tomato}</option>
                  <option value="Potatoes">{t.potato}</option>
                  <option value="Onions">{t.onion}</option>
                  <option value="Wheat">{t.wheat}</option>
                  <option value="Olives">{t.olive}</option>
                  <option value="Citrus">{t.citrus}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">{t.plantingDate}</label>
                  <input
                    type="date"
                    required
                    value={newCropPlanting}
                    onChange={(e) => setNewCropPlanting(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">{t.expectedHarvest}</label>
                  <input
                    type="date"
                    required
                    value={newCropHarvest}
                    onChange={(e) => setNewCropHarvest(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer mt-2 text-sm"
              >
                {t.addCropButton}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
              setShowForgotPassword(false);
              setRecoveredPassword(null);
              setRecoverySuccessMsg(null);
              setRecoveryError(null);
              setRecoveryStep("request");
              setSimulatedReceivedCode(null);
              setRecoveryCodeInput("");
              setNewPasswordForReset("");
              setIsRealEmailSent(false);
              setRecoverySendError(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-2xl p-6 text-left relative overflow-hidden">
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setShowForgotPassword(false);
                setRecoveredPassword(null);
                setRecoverySuccessMsg(null);
                setRecoveryError(null);
                setRecoveryStep("request");
                setSimulatedReceivedCode(null);
                setRecoveryCodeInput("");
                setNewPasswordForReset("");
                setIsRealEmailSent(false);
                setRecoverySendError(null);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {showForgotPassword ? (
              // FORGOT PASSWORD / RECOVERY PORTAL VIEW
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-slate-900 text-xl">
                    {lang === "ar" ? "استعادة كلمة المرور" : "Account Recovery"}
                  </h3>
                  {recoveryStep === "verify" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryStep("request");
                        setRecoverySuccessMsg(null);
                        setRecoveryError(null);
                        setSimulatedReceivedCode(null);
                        setIsRealEmailSent(false);
                        setRecoverySendError(null);
                      }}
                      className="text-slate-500 hover:text-emerald-600 font-bold text-[10px] uppercase border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
                    >
                      {lang === "ar" ? "← تغيير البريد" : "← Edit Email"}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {lang === "ar" 
                    ? "أدخل بريدك الإلكتروني المسجل لدينا لتوليد رمز تحقق أمني وتحديث كلمة المرور." 
                    : "Enter your registered email to receive a secure recovery code to reset your password safely."}
                </p>

                {recoveryError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-medium leading-relaxed space-y-2">
                    <div className="flex items-start gap-2 text-rose-700 font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{lang === "ar" ? "خطأ في الإرسال" : "Authentication Required"}</span>
                    </div>
                    <p>{recoveryError}</p>
                    {recoveryError.includes("App Password") && (
                      <div className="bg-white/60 p-2.5 rounded-lg border border-rose-100 mt-2 text-[11px]">
                        <strong className="block mb-1">{lang === "ar" ? "خطوات الإصلاح:" : "How to fix:"}</strong>
                        <ol className="list-decimal pl-4 space-y-1 text-rose-700">
                          <li>{lang === "ar" ? "افتح إعدادات حساب Google الخاص بك (الأمان)" : "Go to your Google Account > Security"}</li>
                          <li>{lang === "ar" ? "قم بتفعيل التحقق بخطوتين (2-Step Verification)" : "Enable 2-Step Verification"}</li>
                          <li>{lang === "ar" ? "ابحث عن 'كلمات مرور التطبيقات' (App Passwords)" : "Search for 'App Passwords'"}</li>
                          <li>{lang === "ar" ? "قم بإنشاء كلمة مرور جديدة، وانسخ الرمز المكون من 16 حرفاً" : "Create a new app password and copy the 16-character code"}</li>
                          <li>{lang === "ar" ? "قم بلصق الرمز في متغير البيئة SMTP_PASS" : "Paste the 16-character code into your SMTP_PASS secret in AI Studio"}</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {recoverySuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold leading-normal">
                    <p className="font-medium">{recoverySuccessMsg}</p>
                  </div>
                )}

                {/* Display retrieved password */}
                {recoveryStep === "verify" && (
                  <div className="bg-emerald-50 text-emerald-950 border border-emerald-200 p-4 rounded-2xl text-xs space-y-2 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{lang === "ar" ? "تم بنجاح" : "Success"}</span>
                    </div>
                    <p className="text-emerald-800 font-medium">
                      {lang === "ar"
                        ? "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
                        : "Password has been changed successfully. You can now log in with your new password."}
                    </p>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                  {recoveryStep === "request" && (
                    <>
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1.5">
                          {lang === "ar" ? "البريد الإلكتروني المسجل" : "Registered Email"}
                        </label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. yassine@farm.ma"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium mb-3"
                        />
                        
                        <label className="block text-slate-500 font-semibold mb-1.5">
                          {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                        </label>
                        <input
                          type="password"
                          required
                          value={newPasswordForReset}
                          onChange={(e) => setNewPasswordForReset(e.target.value)}
                          placeholder={lang === "ar" ? "أدخل كلمة مرور قوية" : "Enter a secure new password"}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoadingRecovery}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isLoadingRecovery ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          lang === "ar" ? "تأكيد وتغيير كلمة المرور" : "Set New Password"
                        )}
                      </button>
                    </>
                  )}
                  
                  {recoveryStep === "verify" && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setRecoveryStep("request");
                        setRecoverySuccessMsg(null);
                        setAuthEmail(forgotEmail);
                        setAuthPassword(newPasswordForReset);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
                    >
                      {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
                    </button>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setRecoveryStep("request");
                        setSimulatedReceivedCode(null);
                        setRecoveryCodeInput("");
                        setNewPasswordForReset("");
                        setIsRealEmailSent(false);
                        setRecoverySendError(null);
                        setRecoverySuccessMsg(null);
                        setRecoveryError(null);
                      }}
                      className="text-slate-500 hover:text-emerald-600 font-bold hover:underline text-[11px]"
                    >
                      {lang === "ar" ? "← العودة لصفحة تسجيل الدخول" : "← Back to Login Portal"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // STANDARD SIGN IN / SIGN UP VIEW WITH REMEMBER ME
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-xl mb-1">
                  {authIsRegister ? t.register : t.login}
                </h3>
                <p className="text-xs text-slate-500 mb-4">Enter your credentials to secure Agrisma records.</p>
                
                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold mb-4 leading-normal flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                  {authIsRegister && (
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1.5">Nom Complet</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g., Slimani Anas"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@farm.ma"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">
                      {lang === "ar" ? "كلمة المرور" : "Mot de Passe"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center p-1"
                        title={showPassword ? (lang === "ar" ? "إخفاء" : "Masquer") : (lang === "ar" ? "إظهار" : "Afficher")}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA Security validation */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold select-none text-[11px]">
                        {lang === "ar" ? "التحقق الأمني (CAPTCHA)" : "Validation de Sécurité (CAPTCHA)"}
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        title={lang === "ar" ? "تحديث الرمز" : "Générer un autre code"}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{lang === "ar" ? "تحديث" : "Actualiser"}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 border border-slate-300 rounded-xl px-4 py-2 font-mono tracking-widest text-lg font-extrabold select-none text-slate-700 italic line-through decoration-emerald-500/60 decoration-2 shadow-inner w-32 text-center">
                        {captchaCode}
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder={lang === "ar" ? "أدخل الرمز" : "Saisir le code"}
                          maxLength={5}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest uppercase font-bold text-center"
                        />
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-medium leading-normal">
                      {lang === "ar" 
                        ? "أدخل رمز التحقق المكون من 5 أحرف أعلاه لتأكيد أنك لست روبوتًا." 
                        : "Veuillez saisir le code de sécurité à 5 caractères pour certifier que vous êtes un humain."}
                    </p>
                  </div>

                  {/* Remember Me Option & Forgot Password trigger link */}
                  <div className="flex items-center justify-between py-1 text-[11px] font-bold">
                    <label className="flex items-center gap-2 text-slate-600 hover:text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>
                        {lang === "ar" ? "تذكرني كليا" : "Remember me"}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(authEmail);
                        setShowForgotPassword(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer mt-2 text-sm"
                  >
                    {authIsRegister ? "Register Account" : "Access Console"}
                  </button>

                  <div className="text-center pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={() => setAuthIsRegister(!authIsRegister)}
                      className="text-slate-500 hover:text-emerald-600 font-medium hover:underline text-[11px] block w-full"
                    >
                      {authIsRegister ? "Already configured? Sign in" : "New farmer? Register free"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(false);
                      }}
                      className="text-slate-400 hover:text-slate-700 font-medium hover:underline text-[11px] block w-full"
                    >
                      {lang === "ar" ? "تخطي والاستمرار كضيف" : "Skip and continue as guest"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Everyday Update Toast Notifications pop-up container */}
      <div id="toast-container" className="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none w-full max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            className="pointer-events-auto bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start animate-slide-in relative overflow-hidden"
          >
            {/* Ambient side glowing bar representing dynamic system feed update */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              toast.severity === 'danger' ? 'bg-red-500' : 
              toast.severity === 'warning' ? 'bg-amber-400' : 
              toast.severity === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />

            <div className="p-1 rounded-lg bg-slate-800 text-white flex-shrink-0 mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  toast.severity === 'danger' ? 'bg-red-400' : 
                  toast.severity === 'warning' ? 'bg-amber-400' : 
                  toast.severity === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  toast.severity === 'danger' ? 'bg-red-500' : 
                  toast.severity === 'warning' ? 'bg-amber-500' : 
                  toast.severity === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></span>
              </span>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  toast.severity === 'success' ? 'text-emerald-400' : 
                  toast.severity === 'danger' ? 'text-red-400' : 
                  toast.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                }`}>
                  {toast.type === 'weather' ? (lang === 'ar' ? 'نشرة جوية' : 'METEO') : 
                   toast.type === 'market' ? (lang === 'ar' ? 'سوق الجملة' : 'BOURSE CROP') : 
                   toast.type === 'farm' ? (lang === 'ar' ? 'تحديث المزرعة' : 'FERME / FARM') : 
                   toast.type === 'crop' ? (lang === 'ar' ? 'تحديث المحاصيل' : 'CULTURE / CROP') : 
                   toast.type === 'irrigation' ? (lang === 'ar' ? 'عملية السقي' : 'IRRIGATION') : 
                   toast.type === 'disease' ? (lang === 'ar' ? 'تشخيص الأمراض' : 'DIAGNOSTIC IA') : 
                   toast.type === 'subscription' ? (lang === 'ar' ? 'الاشتراك والدفع' : 'CMI SUBSCRIPTION') : 
                   (lang === 'ar' ? 'تنبيه فلاحي' : 'ADVISORY')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">LIVE / الآن</span>
              </div>
              <h5 className="font-extrabold text-xs text-white mt-1.5 leading-snug">
                {lang === "ar" ? toast.titleAr : lang === "fr" ? toast.titleFr : toast.titleEn}
              </h5>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal font-medium">
                {lang === "ar" ? toast.descAr : lang === "fr" ? toast.descFr : toast.descEn}
              </p>
            </div>

            <button
              onClick={() => setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
