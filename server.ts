import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Netlify path rewriter middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// Mock Database States
let users = [
  {
    id: "us_1",
    name: "Yassine El Mansouri",
    email: "yassine@farm.ma",
    phone: "+212 661-234567",
    role: "farmer",
    password: "yassine123"
  },
  {
    id: "us_2",
    name: "Mr Ayoub Baih",
    email: "mrayoubbaih@gmail.com",
    phone: "+212 661-987654",
    role: "farmer",
    password: "password123"
  }
];

let farms = [
  {
    id: "fm_1",
    userId: "us_1",
    name: "Souss El Bahia Farm",
    location: "Souss-Massa",
    sizeHectares: 12.5,
    soilType: "Sandy"
  },
  {
    id: "fm_2",
    userId: "us_1",
    name: "Saïs Olive Groves",
    location: "Saïs",
    sizeHectares: 8.2,
    soilType: "Clay"
  }
];

let crops = [
  {
    id: "cr_1",
    farmId: "fm_1",
    cropName: "Tomatoes",
    plantingDate: "2026-03-10",
    expectedHarvestDate: "2026-07-15",
    status: "Growing",
    healthScore: 94,
    irrigatedSum: 34200
  },
  {
    id: "cr_2",
    farmId: "fm_1",
    cropName: "Citrus",
    plantingDate: "2023-01-15",
    expectedHarvestDate: "2026-11-20",
    status: "Growing",
    healthScore: 88,
    irrigatedSum: 120500
  },
  {
    id: "cr_3",
    farmId: "fm_2",
    cropName: "Olives",
    plantingDate: "2020-02-28",
    expectedHarvestDate: "2026-10-10",
    status: "Growing",
    healthScore: 96,
    irrigatedSum: 48000
  }
];

let diseaseReports = [
  {
    id: "ds_1",
    cropType: "Tomatoes",
    diagnosis: "Mildiou de la Tomate (Tomato Late Blight)",
    confidenceScore: 92,
    severity: "medium",
    treatment: "1. Appliquer un fongicide biologique à base de cuivre.\n2. Éliminer toutes les feuilles inférieures infectées de manière sécuritaire.\n3. Réduire l'arrosage par aspersion au profit du goutte-à-goutte.",
    prevention: "1. Assurer une rotation des cultures tous les 3 ans.\n2. Laisser un espacement suffisant de 60cm entre les plants pour la ventilation.\n3. Éviter d'arroser le feuillage tard le soir.",
    date: "2026-06-12T14:30:00Z",
    imageUrl: ""
  }
];

let alerts = [
  {
    id: "al_1",
    type: "weather",
    severity: "danger",
    titleEn: "Extreme Chergui Heatwave Advisory",
    titleFr: "Alerte Canicule : Vent Chergui Aride",
    titleAr: "إنذار بارتفاع حاد للحرارة: رياح الشرقي الجافة",
    descEn: "Forecast predicts dry Saharan winds exceeding 42°C in Souss-Massa region. Heavy stress on tomatoes.",
    descFr: "Vagues de chaleur de plus de 42°C prévues à Souss-Massa. Irrigation nocturne fortement conseillée.",
    descAr: "توقعات بموجة حر شرقي تتجاوز 42 درجة بإقليم سوس ماسة. يوصى بالري الليلي المكثف لحماية الخضراوات.",
    date: "2026-06-16T18:00:00Z",
    read: false
  },
  {
    id: "al_2",
    type: "market",
    severity: "warning",
    titleEn: "Market Opportunity: Tomatoes Wholesale Spike",
    titleFr: "Opportunité de Marché : Flambée du cours de la tomate",
    titleAr: "فرصة تسويقية عاجلة: ارتفاع أثمان الطماطم بالجملة",
    descEn: "Wholesale index at Casablanca Sidi Othmane rose by 22% due to high export interest.",
    descFr: "Le cours au marché de gros de Casablanca a bondi de 22% suite à la forte demande internationale.",
    descAr: "ارتفع مؤشر البيع بسوق الجملة بسيدي عثمان بنسبة 22% نتيجة لطلب التصدير المرتفع.",
    date: "2026-06-17T06:15:00Z",
    read: false
  }
];

// Persistent Database Layer
const DB_PATH = path.join(process.cwd(), "server_db.json");

function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (Array.isArray(data.users)) users = data.users;
      if (Array.isArray(data.farms)) farms = data.farms;
      if (Array.isArray(data.crops)) crops = data.crops;
      if (Array.isArray(data.diseaseReports)) diseaseReports = data.diseaseReports;
      if (Array.isArray(data.alerts)) {
        // Keep initial alerts intact but merge read status if available
        data.alerts.forEach((saved: any) => {
          const match = alerts.find(a => a.id === saved.id);
          if (match) {
            match.read = saved.read;
          }
        });
      }
      console.log("Agrisma DB successfully loaded from: " + DB_PATH);
    } catch (e) {
      console.error("Failed to parse local server database, using default seeds:", e);
    }
  } else {
    saveDb();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users,
      farms,
      crops,
      diseaseReports,
      alerts
    }, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write to local server database:", e);
  }
}

// Load persisted records on boot
loadDb();

// Weather Data Mocked by Regions
const weatherData: Record<string, any> = {
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
};

// Market Price tracker
const marketPrices = [
  {
    cropName: "Tomatoes",
    currentPrice: 6.5,
    predictedPrice: 7.8,
    bestSellingPeriod: "Late July (Export spikes)",
    historicalPrices: [
      { date: "Jan", price: 4.2 },
      { date: "Feb", price: 4.6 },
      { date: "Mar", price: 5.1 },
      { date: "Apr", price: 5.5 },
      { date: "May", price: 6.0 },
      { date: "Jun", price: 6.5 }
    ],
    predictedPrices: [
      { date: "Jun", price: 6.5 },
      { date: "Jul", price: 7.8 },
      { date: "Aug", price: 7.2 },
      { date: "Sep", price: 6.1 },
      { date: "Oct", price: 5.8 },
      { date: "Nov", price: 6.4 }
    ]
  },
  {
    cropName: "Potatoes",
    currentPrice: 4.8,
    predictedPrice: 4.2,
    bestSellingPeriod: "Mid October (Seed sowing offset)",
    historicalPrices: [
      { date: "Jan", price: 3.8 },
      { date: "Feb", price: 4.0 },
      { date: "Mar", price: 4.5 },
      { date: "Apr", price: 4.9 },
      { date: "May", price: 5.0 },
      { date: "Jun", price: 4.8 }
    ],
    predictedPrices: [
      { date: "Jun", price: 4.8 },
      { date: "Jul", price: 4.2 },
      { date: "Aug", price: 3.9 },
      { date: "Sep", price: 4.4 },
      { date: "Oct", price: 4.7 },
      { date: "Nov", price: 5.1 }
    ]
  },
  {
    cropName: "Onions",
    currentPrice: 5.2,
    predictedPrice: 6.1,
    bestSellingPeriod: "Late August (Post-harvest storage shift)",
    historicalPrices: [
      { date: "Jan", price: 3.5 },
      { date: "Feb", price: 3.9 },
      { date: "Mar", price: 4.8 },
      { date: "Apr", price: 5.4 },
      { date: "May", price: 5.5 },
      { date: "Jun", price: 5.2 }
    ],
    predictedPrices: [
      { date: "Jun", price: 5.2 },
      { date: "Jul", price: 5.8 },
      { date: "Aug", price: 6.1 },
      { date: "Sep", price: 5.9 },
      { date: "Oct", price: 4.8 },
      { date: "Nov", price: 4.5 }
    ]
  },
  {
    cropName: "Wheat",
    currentPrice: 3.4,
    predictedPrice: 3.6,
    bestSellingPeriod: "December (Rain delay imports)",
    historicalPrices: [
      { date: "Jan", price: 3.1 },
      { date: "Feb", price: 3.3 },
      { date: "Mar", price: 3.2 },
      { date: "Apr", price: 3.4 },
      { date: "May", price: 3.5 },
      { date: "Jun", price: 3.4 }
    ],
    predictedPrices: [
      { date: "Jun", price: 3.4 },
      { date: "Jul", price: 3.5 },
      { date: "Aug", price: 3.6 },
      { date: "Sep", price: 3.6 },
      { date: "Oct", price: 3.7 },
      { date: "Nov", price: 3.8 }
    ]
  },
  {
    cropName: "Olives",
    currentPrice: 14.5,
    predictedPrice: 17.2,
    bestSellingPeriod: "October/November (Early olive oil press)",
    historicalPrices: [
      { date: "Jan", price: 12.0 },
      { date: "Feb", price: 12.8 },
      { date: "Mar", price: 13.5 },
      { date: "Apr", price: 14.0 },
      { date: "May", price: 14.2 },
      { date: "Jun", price: 14.5 }
    ],
    predictedPrices: [
      { date: "Jun", price: 14.5 },
      { date: "Jul", price: 15.0 },
      { date: "Aug", price: 15.8 },
      { date: "Sep", price: 16.5 },
      { date: "Oct", price: 17.2 },
      { date: "Nov", price: 16.9 }
    ]
  },
  {
    cropName: "Citrus",
    currentPrice: 8.2,
    predictedPrice: 9.8,
    bestSellingPeriod: "December (Berkane Export harvest)",
    historicalPrices: [
      { date: "Jan", price: 7.0 },
      { date: "Feb", price: 7.2 },
      { date: "Mar", price: 7.5 },
      { date: "Apr", price: 7.8 },
      { date: "May", price: 8.0 },
      { date: "Jun", price: 8.2 }
    ],
    predictedPrices: [
      { date: "Jun", price: 8.2 },
      { date: "Jul", price: 8.7 },
      { date: "Aug", price: 9.2 },
      { date: "Sep", price: 9.5 },
      { date: "Oct", price: 9.8 },
      { date: "Nov", price: 10.4 }
    ]
  }
];

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// REST APIs
// 1. Auth API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  
  if (!cleanEmail) {
    return res.status(400).json({ error: "Email is required." });
  }

  let user = users.find(u => String(u.email || "").trim().toLowerCase() === cleanEmail);
  
  if (user) {
    if (user.password !== password) {
      return res.status(401).json({ 
        error: "Incorrect password. Please enter the correct password you signed up with." 
      });
    }
    return res.json({ token: "stub-jwt-token", user });
  } else {
    return res.status(404).json({ 
      error: "This email is not registered. Please sign up / register first." 
    });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, role, password } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  
  if (!cleanEmail) {
    return res.status(400).json({ error: "Email is required." });
  }

  let user = users.find(u => String(u.email || "").trim().toLowerCase() === cleanEmail);
  if (user) {
    if (user.password === password) {
      return res.json({ token: "stub-jwt-token", user });
    }
    return res.status(400).json({ 
      error: "This email address is already registered. Please switch to Login mode." 
    });
  }
  
  const newUser = {
    id: "us_" + (users.length + 1),
    name: name || cleanEmail.split("@")[0] || "Moroccan Farmer",
    email: cleanEmail,
    phone: phone || "+212 600-000000",
    role: role || "farmer",
    password: password || "password123"
  };
  users.push(newUser);

  // Migrate guest data (us_1) to the new user so their data remains
  farms.forEach((f) => {
    if (f.userId === "us_1") {
      f.userId = newUser.id;
    }
  });

  saveDb();
  res.json({ token: "stub-jwt-token", user: newUser });
});

// Memory store for forgot password verification codes
const recoveryCodes = new Map<string, string>();

// Send real recovery email via Gmail/SMTP if configured, otherwise log to console and simulate
async function sendRecoveryEmail(toEmail: string, code: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log(`[SMTP Not Configured] Verification code for ${toEmail} is: ${code}`);
    return { sent: false, reason: "SMTP credentials not provided in environment" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass
      }
    });

    const mailOptions = {
      from: `"Agrisma Security" <${user}>`,
      to: toEmail,
      subject: "رمز استرداد الحساب - Agrisma Account Recovery Code",
      text: `مرحباً،\n\nرمز التحقق الأمني لإعادة تعيين كلمة المرور الخاصة بك هو: ${code}\n\nيرجى إدخال هذا الرمز في صفحة الاسترداد لإتمام العملية.\n\n---\n\nHello,\n\nYour security recovery verification code is: ${code}\n\nPlease enter this code on the recovery page to reset your password.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 28px; font-weight: bold; color: #059669;">Agrisma 🌾</span>
          </div>
          <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">استرداد حساب Agrisma</h2>
          <p style="font-size: 16px; color: #334155; font-weight: bold;">مرحباً،</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك على منصة <strong>Agrisma</strong>. يرجى استخدام رمز التحقق السري التالي لإتمام عملية التغيير:</p>
          <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 12px; font-size: 32px; font-family: 'Courier New', Courier, monospace; letter-spacing: 6px; font-weight: 900; color: #16a34a; margin: 25px 0; border: 2px dashed #bbf7d0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
            ${code}
          </div>
          <p style="font-size: 13px; color: #64748b;">ملاحظة: هذا الرمز صالح للاستخدام مرة واحدة فقط. إذا لم تكن قد طلبت هذا الرمز بنفسك، يرجى تجاهل هذا البريد الإلكتروني بأمان للحفاظ على سرية حسابك.</p>
          
          <div style="margin-top: 35px; border-top: 2px solid #f1f5f9; padding-top: 25px; direction: ltr; text-align: left;">
            <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Agrisma Account Recovery</h2>
            <p style="font-size: 16px; color: #334155; font-weight: bold;">Hello,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">We received a request to reset your password for your <strong>Agrisma</strong> account. Please use the following security verification code to complete the process:</p>
            <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 12px; font-size: 32px; font-family: 'Courier New', Courier, monospace; letter-spacing: 6px; font-weight: 900; color: #16a34a; margin: 25px 0; border: 2px dashed #bbf7d0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
              ${code}
            </div>
            <p style="font-size: 13px; color: #64748b;">Note: This code is for one-time use only. If you didn't request this, you can safely ignore this email to keep your account secure.</p>
          </div>
          <div style="text-align: center; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 11px; color: #94a3b8;">
            © ${new Date().getFullYear()} Agrisma Inc. All rights reserved. • الذكاء الاصطناعي لخدمة الزراعة المغربية
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Recovery email successfully sent to " + toEmail + ": " + info.messageId);
    return { sent: true, info };
  } catch (err) {
    console.error("Failed to send recovery email via SMTP:", err);
    throw err;
  }
}

// Forgot password - Direct Reset
app.post("/api/auth/forgot-password/request", async (req, res) => {
  const { email, newPassword } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const user = users.find(u => String(u.email || "").trim().toLowerCase() === cleanEmail);
  
  if (!user) {
    return res.status(404).json({
      error: "البريد الإلكتروني هذا غير مسجل لدينا في النظام.",
      errorEn: "This email is not registered in our system."
    });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      errorEn: "Password must be at least 6 characters long."
    });
  }

  user.password = newPassword;
  saveDb();

  return res.json({
    success: true,
    message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
    messageEn: "Password changed successfully. You can now log in."
  });
});

// Forgot password - 2. Reset password using recovery code
app.post("/api/auth/forgot-password/reset", (req, res) => {
  const { email, code, newPassword } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const user = users.find(u => String(u.email || "").trim().toLowerCase() === cleanEmail);
  
  if (!user) {
    return res.status(404).json({
      error: "البريد الإلكتروني هذا غير مسجل لدينا في النظام.",
      errorEn: "This email is not registered in our system."
    });
  }

  const savedCode = recoveryCodes.get(cleanEmail);
  if (!savedCode || savedCode !== String(code).trim()) {
    return res.status(400).json({
      error: "رمز التحقق غير صحيح أو منتهي الصلاحية! يرجى توليد رمز جديد.",
      errorEn: "Incorrect or expired verification code! Please request a new code."
    });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({
      error: "يجب أن تكون كلمة المرور الجديدة 4 أحرف على الأقل.",
      errorEn: "New password must be at least 4 characters."
    });
  }

  user.password = newPassword;
  recoveryCodes.delete(cleanEmail);
  saveDb();

  return res.json({
    success: true,
    message: "تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكامِل الأمان.",
    messageEn: "Your password has been successfully reset! You can now log in."
  });
});

// 2. Farms API
app.get("/api/farms", (req, res) => {
  res.json(farms);
});

app.post("/api/farms", (req, res) => {
  const { name, location, sizeHectares, soilType } = req.body;
  const newFarm = {
    id: "fm_" + (farms.length + 1),
    userId: "us_1",
    name: name || "My Farm",
    location: location || "Souss-Massa",
    sizeHectares: Number(sizeHectares) || 5,
    soilType: soilType || "Clay"
  };
  farms.push(newFarm);
  saveDb();
  res.json(newFarm);
});

// 3. Crops API
app.get("/api/crops", (req, res) => {
  res.json(crops);
});

app.post("/api/crops", (req, res) => {
  const { farmId, cropName, plantingDate, expectedHarvestDate } = req.body;
  const newCrop = {
    id: "cr_" + (crops.length + 1),
    farmId: farmId || "fm_1",
    cropName: cropName || "Tomatoes",
    plantingDate: plantingDate || new Date().toISOString().split('T')[0],
    expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 120*24*60*60*1000).toISOString().split('T')[0],
    status: "Planted" as const,
    healthScore: 100,
    irrigatedSum: 0
  };
  crops.push(newCrop);
  saveDb();
  res.json(newCrop);
});

app.post("/api/crops/irrigate", (req, res) => {
  const { cropId, amount } = req.body;
  const crop = crops.find(c => c.id === cropId);
  if (crop) {
    crop.irrigatedSum += Number(amount);
    saveDb();
    res.json(crop);
  } else {
    res.status(404).json({ error: "Crop not found" });
  }
});

// 4. Weather API powered by Google Gemini dynamic parameters
app.get("/api/weather", async (req, res) => {
  const { region } = req.query;
  const regionStr = String(region || "Souss-Massa");
  const fallbackData = weatherData[regionStr] || weatherData["Souss-Massa"];

  if (ai) {
    try {
      const prompt = `You are a professional real-time meteorological computer.
      Generate the precise current weather conditions and a realistic 7-day weather forecast outlook for the agricultural region of "${regionStr}", Morocco for today (current date: June 17, 2026).
      
      Respond strictly with a single JSON block matching this exact TypeScript interface:
      {
        "region": "${regionStr}",
        "temperature": number,
        "humidity": number,
        "rainfall": number, // recent daily rainfall in mm
        "windSpeed": number, // in km/h
        "condition": "Hot" | "Sunny" | "Rainy" | "Partly Cloudy" | "Windy" | "Clear",
        "forecast": [
          { "day": "Wed", "temp": number, "condition": string },
          { "day": "Thu", "temp": number, "condition": string },
          { "day": "Fri", "temp": number, "condition": string },
          { "day": "Sat", "temp": number, "condition": string },
          { "day": "Sun", "temp": number, "condition": string },
          { "day": "Mon", "temp": number, "condition": string },
          { "day": "Tue", "temp": number, "condition": string }
        ]
      }
      Do not include any extra textual markdown wrapper outside the JSON output.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.25,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              region: { type: Type.STRING },
              temperature: { type: Type.NUMBER },
              humidity: { type: Type.NUMBER },
              rainfall: { type: Type.NUMBER },
              windSpeed: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    temp: { type: Type.NUMBER },
                    condition: { type: Type.STRING }
                  },
                  required: ["day", "temp", "condition"]
                }
              }
            },
            required: ["region", "temperature", "humidity", "rainfall", "windSpeed", "condition", "forecast"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.temperature) {
        return res.json(parsed);
      }
    } catch (e: any) {
      console.log("Notice: Serving ultra-premium offline weather fallback (Gemini busy or quota exceeded).");
    }
  }

  res.json(fallbackData);
});

// Weather Gemini AI analysis & Windy.com linkage
app.post("/api/weather/analyze", async (req, res) => {
  const { region, latitude, longitude } = req.body;
  const regionStr = String(region || "Souss-Massa");
  
  // Base region coordinates
  const regionDefaults: Record<string, { lat: number; lon: number }> = {
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
  };

  const defaultCoords = regionDefaults[regionStr] || regionDefaults["Souss-Massa"];
  const lat = Number(latitude) || defaultCoords.lat;
  const lon = Number(longitude) || defaultCoords.lon;

  // Build high resolution Windy.com interactive embed URL
  const windyEmbedUrl = `https://embed.windy.com/embed2.html?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&zoom=8&level=surface&overlay=wind&menu=&message=&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  const localMeteo = weatherData[regionStr] || weatherData["Souss-Massa"];

  // Default high-quality fallback assessments
  const offlineAnalysis: Record<string, any> = {
    "Souss-Massa": {
      conclusionEn: "High-temperature alert triggered. Extreme evapotranspiration risk detected in Souss-Massa orchards. Immediate protective watering protocol required for Argan and Citrus reserves.",
      conclusionFr: "Alerte de température élevée déclenchée. Risque extrême d'évapotranspiration détecté dans les vergers de Souss-Massa. Protocole d'arrosage protecteur immédiat requis pour les réserves d'agrumes.",
      conclusionAr: "تم تفعيل إنذار ارتفاع درجات الحرارة. خطر بخر-نتح شديد يهدد بساتين سوس ماسة. يجب تطبيق بروتوكول الري الوقائي الفوري لحماية أشجار الحمضيات والأركان.",
      warnings: [
        "Sirocco wind gusts up to 21 km/h raising hydric tension",
        "Humidity levels plummeted to 28%, accelerated leaf dehydration warning",
        "Heat index exceeds 35°C critical threshold"
      ],
      recommendation: "Shift all irrigation slots to nocturnal periods (10:00 PM - 4:00 AM) using pulse drip emitters. Spray organic anti-transpirant leaf treatments if available."
    },
    "Gharb": {
      conclusionEn: "Overcast skies with persistent rainfall (12mm) in the Gharb Plain. Soil moisture is at capacity; stop any manual crop fertigation to minimize root rot occurrences.",
      conclusionFr: "Ciel couvert avec des précipitations persistantes (12mm) dans la Plaine du Gharb. L'humidité du sol est à son maximum; arrêtez toute fertigation manuelle pour limiter la pourriture racinaire.",
      conclusionAr: "سماء غائمة مع هطول أمطار مستمر (12 ملم) في سهل الغرب. رطوبة التربة في أقصى سعتها؛ يرجى إيقاف الري والتسميد اليدوي فوراً لتفادي تعفن الجذور.",
      warnings: [
        "Precipitation accumulation threshold saturated in low-lying clay plots",
        "Humidity levels elevated at 68%, high risk for late blight fungal germination",
        "Low solar radiation limits photosynthetic activities"
      ],
      recommendation: "Clear sub-surface drainage trenches to avoid water stagnation. Apply preventative copper fungicides if rain persists beyond 24 hours."
    },
    "Saïs": {
      conclusionEn: "Stable warm patterns with moderate humidity (48%) over the Saïss Plateau. Optimal photosynthetic conditions present for cereals, but monitor dry soil crust formation.",
      conclusionFr: "Conditions chaudes stables avec une humidité modérée (48%) sur le plateau du Saïs. Excellentes conditions de photosynthèse pour les céréales, mais surveillez la formation de croûtes de sol sèches.",
      conclusionAr: "ظروف دافئة مستقرة مع رطوبة معتدلة (48٪) في هضبة سايس. ظروف تمثيل ضوئي مثالية للحبوب، لكن ينصح بمراقبة تشكل قشرة التربة الجافة.",
      warnings: [
        "Slight increase in wind speed during afternoon raising topsoil drying speed",
        "Micro-climate humidity index is favorable for olive peacock spot spore release"
      ],
      recommendation: "Maintain shallow weeding (binage) to break capillary rise and conserve underground moisture blockages. Plan light irrigation for olive saplings."
    },
    "Haouz": {
      conclusionEn: "Intense solar radiation with 34°C temperatures over the Haouz-Marrakech plain. High evaporative demand on olive groves and pomegranate cultures.",
      conclusionFr: "Rayonnement solaire intense avec des températures de 34°C sur la plaine du Haouz-Marrakech. Forte demande évaporative sur les oliveraies et les cultures de grenades.",
      conclusionAr: "إشعاع شمسي مكثف مع درجات حرارة تصل إلى 34 درجة مئوية في سهل الحوز مراكش. طلب تبخر مرتفع على بساتين الزيتون وزراعة الرمان.",
      warnings: [
        "Soil water retention levels approaching wilting point in sandy fields",
        "Windy sand dust shifts from south-east causing cellular stress on leaves"
      ],
      recommendation: "Apply organic mulch (straw/compost) around root circles to decrease solar baking. Increase irrigation volumes by 15% during next 48 hours."
    }
  };

  const offline = offlineAnalysis[regionStr] || offlineAnalysis["Souss-Massa"];

  if (ai) {
    try {
      const prompt = `You are Agrisma's Advanced Agrometeorological AI Engine.
      Analyze the current localized weather parameters for "${regionStr}" region:
      Current telemetry parameters:
      - Temperature: ${localMeteo.temperature}°C
      - Relative Humidity: ${localMeteo.humidity}%
      - Recent Rainfall: ${localMeteo.rainfall} mm
      - Current Wind Speed: ${localMeteo.windSpeed} km/h
      - Meteorological Condition: ${localMeteo.condition || "Moderate"}
      If GPS coordinates are available, we are focused on precise coordinates: Latitude: ${lat}, Longitude: ${lon}.
      
      Generate a precise, live agricultural weather advice and strategic crop conclusion. 
      The report must cater to Moroccan soil types, crop sensitivities, and local microclimatic anomalies.
      
      You must respond strictly with a single JSON block conforming exactly to this schema:
      {
        "conclusionEn": "Clear actionable summary of the agricultural weather forecast, its direct threats on major Moroccan crops like olives, wheat, vegetables, and citrus in English.",
        "conclusionFr": "Le même résumé agricole et l'analyse de l'impact en Français.",
        "conclusionAr": "نفس الملخص والخلاصة الفلاحية الموجهة للمزارعين باللغة العربية الفصحى بدقة متناهية.",
        "warnings": ["Array of 2-3 specific localized microclimatic warnings (e.g. Siropic winds, fungal spore hazards, leaf burn, soil baking en route)"],
        "recommendation": "Strategic irrigation or crop preservation tip based on Windy parameters (wind direction, humidity levels, etc.)"
      }
      Do not output any markdown code blocks other than the JSON output.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.35,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conclusionEn: { type: Type.STRING },
              conclusionFr: { type: Type.STRING },
              conclusionAr: { type: Type.STRING },
              warnings: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendation: { type: Type.STRING }
            },
            required: ["conclusionEn", "conclusionFr", "conclusionAr", "warnings", "recommendation"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.conclusionEn) {
        return res.json({
          ...parsed,
          windyEmbedUrl,
          lat,
          lon,
          fromAi: true
        });
      }
    } catch (err: any) {
      console.log("Notice: Switching to offline meteorological fallback (Gemini busy or quota exceeded).");
    }
  }

  // Fallback response inside express
  res.json({
    ...offline,
    windyEmbedUrl,
    lat,
    lon,
    fromAi: false
  });
});

// 5. Smart Irrigation Advisory API
app.get("/api/irrigation/recommend", (req, res) => {
  const { soilType, cropName, sizeHectares, region } = req.query;
  
  const soil = String(soilType || "Clay");
  const crop = String(cropName || "Tomatoes");
  const size = Number(sizeHectares || 10);
  const reg = String(region || "Souss-Massa");

  const localMeteo = weatherData[reg] || weatherData["Souss-Massa"];
  const tempFactor = localMeteo.temperature > 35 ? 1.4 : localMeteo.temperature > 25 ? 1.1 : 0.8;
  const windFactor = localMeteo.windSpeed > 18 ? 1.2 : 1.0;
  
  let cropBaseHydric = 5000; // liters per hectare per week base
  if (crop === "Olives") cropBaseHydric = 3000;
  if (crop === "Citrus") cropBaseHydric = 6000;
  if (crop === "Wheat") cropBaseHydric = 3500;
  if (crop === "Onions") cropBaseHydric = 4000;

  let soilRetentionBonus = 1.0;
  if (soil === "Clay") soilRetentionBonus = 0.85; // holds water well
  if (soil === "Sandy") soilRetentionBonus = 1.35; // drains extremely fast, needs more water

  const recommendedVolumePerHectare = Math.round(cropBaseHydric * tempFactor * windFactor * soilRetentionBonus);
  const totalWaterRequirement = recommendedVolumePerHectare * size;

  res.json({
    recommendedVolumePerHectare,
    totalWaterRequirement,
    frequency: localMeteo.temperature > 38 ? "3 times a week (night only)" : "2 times a week (morning preferred)",
    wateringDurationMinutes: localMeteo.temperature > 35 ? 60 : 45,
    waterSavingTip: crop === "Olives" 
      ? "Utilize subsurface drip irrigation around olive roots to suppress evapotranspiration in dry zones." 
      : "In sandy Moroccan soils, irrigate in 3 split doses instead of a single heavy dose to prevent pesticide and nutrients leaching."
  });
});

// 6. Gemini Bot / AI Crop Disease Diagnostic API
app.post("/api/disease/analyze", async (req, res) => {
  const { imageBase64, cropName, mockSample, isHealthyMock } = req.body;
  
  // High quality local fallback logic
  const localDiagnoses: Record<string, any> = {
    "Tomatoes": {
      status: "bad",
      diagnosis: "Mildiou de la Tomate (Tomato Late Blight - Phytophthora infestans)",
      confidenceScore: 98,
      severity: "high",
      qualityAssessment: "L'échantillon présente d'importantes taches brunes nécrotiques et un flétrissement foliaire avancé, indiquant un produit de mauvaise qualité infecté par le mildiou.",
      treatment: "1. Appliquez immédiatement de l'hydroxyde de cuivre ou un fongicide à base de propamocarbe.\n2. Retirez et brûlez toutes les feuilles inférieures mouillées ou flétries.\n3. Évitez l'arrosage par aspersion ; installez des tuyaux de goutte-à-goutte sous film de paillage.",
      prevention: "1. Pratiquez une rotation triennale stricte de vos parcelles.\n2. Espacez vos tuteurs d'au moins 65cm pour fluidifier la circulation de l'air chaud.\n3. Privilégiez des variétés hybrides résistantes locales."
    },
    "Olives": {
      status: "bad",
      diagnosis: "Œil de Paon de l'Olivier (Olive Peacock Spot - Spilocaea oleagina)",
      confidenceScore: 95,
      severity: "medium",
      qualityAssessment: "Présence de cercles concentriques sombres sur les feuilles de l'olivier, réduisant la photosynthèse et la qualité globale de la récolte d'olives à venir.",
      treatment: "1. Pulvériser de la bouillie bordelaise (2%) immédiatement après la récolte d'automne.\n2. Effectuer des tailles d'éclaircissage pour réduire l'humidité retenue par les couronnes d'arbres touffues.",
      prevention: "1. Maintenir un niveau de potassium du sol équilibré en Saïs.\n2. Planter des variétés moins sensibles comme la Picholine Marocaine.\n3. Ratisser et enterrer les feuilles mortes tombées au sol."
    },
    "Wheat": {
      status: "bad",
      diagnosis: "Rouille Jaune du Blé (Wheat Stripe Rust - Puccinia striiformis)",
      confidenceScore: 96,
      severity: "high",
      qualityAssessment: "Pustules orangées alignées sur les nervures des feuilles, perturbant gravement le remplissage des grains de blé, ce qui nuit à la qualité de la récolte.",
      treatment: "1. Appliquer des fongicides systémiques à base de triazoles dès l'apparition des premières pustules jaunes.\n2. Désherber totalement les graminées adventices environnantes pour limiter l'hébergement de spores.",
      prevention: "1. Utiliser des semences certifiées de blé tendre résistantes de l'INRA Maroc.\n2. Semer tôt en novembre pour échapper aux pics d'humidité printaniers.\n3. Supprimer les repousses spontanées avant le semis principal."
    },
    "Citrus": {
      status: "bad",
      diagnosis: "Chancre des Agrumes (Citrus Canker - Xanthomonas citri)",
      confidenceScore: 94,
      severity: "high",
      qualityAssessment: "Présence de lésions liégeuses surélevées entourées d'un halo jaune sur l'échantillon, compromettant l'aspect esthétique et la qualité commerciale du fruit.",
      treatment: "1. Pulvériser un bactéricide cuprique biologique sur les jeunes pousses pour créer une barrière protectrice.\n2. Émonder avec précaution les petites branches infectées avec des outils préalablement désinfectés dans l'alcool.",
      prevention: "1. Établir des brise-vents de cyprès ou de casuarinas autour des vergers d'agrumes pour bloquer les pluies portées par le vent.\n2. Contrôler rigoureusement le foyer des mineuses des feuilles d'agrumes qui créent des failles d'entrée bactéricides."
    },
    "Potatoes": {
      status: "bad",
      diagnosis: "Mildiou de la Pomme de Terre (Potato Late Blight)",
      confidenceScore: 93,
      severity: "medium",
      qualityAssessment: "Feuilles brunies avec un duvet blanc sur le revers, entraînant une pourriture rapide des tubercules si non traitée.",
      treatment: "1. Appliquer une solution de cuivre bio à intervalle de 8 jours si le temps chaud et humide persiste.\n2. Faucher et détruire les fanes de pommes de terre infectées avant de procéder à l'arrachage final et au stockage.",
      prevention: "1. Ne jamais utiliser de tubercules de semence issus de parcelles contaminées l'année passée.\n2. Butter correctement les plants pour couvrir les tubercules en croissance contre les spores ruisselant du feuillage."
    }
  };

  const healthyDiagnoses: Record<string, any> = {
    "Tomatoes": {
      status: "nice",
      diagnosis: "Healthy & Premium Quality Tomato (Culture de Tomate Saine et de Qualité Supérieure)",
      confidenceScore: 99,
      severity: "low",
      qualityAssessment: "L'échantillon présente une structure foliaire parfaitement saine. Le feuillage est vert foncé uniforme, sans aucune trace de champignon ni flétrissement. Le produit est idéal pour la vente au marché de gros ou l'exportation.",
      treatment: "1. Poursuivre l'irrigation par goutte-à-goutte selon le calendrier planifié.\n2. Continuer l'apport de fertilisants potassiques organiques.\n3. Aucun traitement curatif n'est nécessaire.",
      prevention: "1. Continuer les inspections hebdomadaires du feuillage inférieur.\n2. Maintenir une bonne aération entre les plants pour éviter l'accumulation d'humidité."
    },
    "Olives": {
      status: "nice",
      diagnosis: "Healthy & Premium Quality Olive Tree (Feuillage d'Olivier Sain & Vigoureux)",
      confidenceScore: 98,
      severity: "low",
      qualityAssessment: "Les feuilles d'olivier montrent une excellente vigueur végétative, exemptes d'œil de paon ou d'attaques parasitaires. La couleur et l'épaisseur de la feuille indiquent une excellente nutrition minérale.",
      treatment: "1. Continuer la fertilisation azotée et potassique équilibrée.\n2. Effectuer des arrosages d'appoint légers si le stress thermique augmente.",
      prevention: "1. Veiller à la propreté sous le houppier.\n2. Prévoir une pulvérisation préventive cuprique légère après les récoltes."
    },
    "Wheat": {
      status: "nice",
      diagnosis: "Healthy & Premium Quality Wheat (Épis de Blé Sains et Excellente Qualité)",
      confidenceScore: 97,
      severity: "low",
      qualityAssessment: "Les épis de blé sont denses, vigoureux et indemnes de rouille jaune ou de carie. Excellente rigidité de la tige, promettant un rendement optimal en grains de classe A.",
      treatment: "1. Surveiller la maturité des grains pour planifier une récolte à faible taux d'humidité.\n2. Aucun traitement chimique n'est requis.",
      prevention: "1. Poursuivre l'utilisation de semences résistantes certifiées de l'INRA.\n2. Éliminer les herbes adventices hôtes de maladies."
    },
    "Citrus": {
      status: "nice",
      diagnosis: "Healthy & Premium Quality Citrus (Feuillage d'Agrumes Sain et Vigoureux)",
      confidenceScore: 99,
      severity: "low",
      qualityAssessment: "Feuillage d'un vert profond, luisant et très dense, indiquant une photosynthèse optimale. Zéro tache de chancre bactérien ou de dégâts de mineuse. Produit d'excellence commerciale.",
      treatment: "1. Maintenir le plan de micro-irrigation actuel.\n2. Poursuivre l'apport équilibré d'oligo-éléments (Zinc et Fer).",
      prevention: "1. Inspecter les jeunes pousses lors des vagues de croissance.\n2. Tailler régulièrement pour aérer le centre de l'arbre."
    },
    "Potatoes": {
      status: "nice",
      diagnosis: "Healthy & Premium Quality Potato (Plants de Pomme de Terre Sains)",
      confidenceScore: 98,
      severity: "low",
      qualityAssessment: "La structure foliaire de la pomme de terre est vigoureuse, sans flétrissement ni jaunissement précoce. Excellente photosynthèse favorisant le grossissement optimal des tubercules.",
      treatment: "1. Continuer le buttage régulier des plants pour protéger les tubercules de la lumière.\n2. Éviter d'irriguer le feuillage tard le soir.",
      prevention: "1. Utiliser exclusivement des semences de pomme de terre certifiées.\n2. Pratiquer des rotations de culture régulières."
    }
  };

  const chosenCrop = cropName || "Tomatoes";
  const matchedLocal = isHealthyMock ? (healthyDiagnoses[chosenCrop] || healthyDiagnoses["Tomatoes"]) : (localDiagnoses[chosenCrop] || localDiagnoses["Tomatoes"]);

  if (ai) {
    try {
      let prompt = `You are an expert Agricultural AI and Quality Control System. A user has uploaded a photo of a plant, leaf, fruit, or vegetable.
      Hint of crop group (if provided by user): ${chosenCrop}. If the image clearly shows a different fruit or vegetable, identify it accurately based on the image itself.
      ${isHealthyMock ? "NOTE: This is a healthy specimen demo. You MUST analyze this as a healthy, high-quality, premium product, return status 'nice', low severity, and explain its excellent health features." : ""}
      
      Your task is to meticulously analyze the image:
      1. Identify the fruit or vegetable shown in the image.
      2. Carefully examine the image and determine its state:
         - Is it "clean and nice" (healthy, pristine, excellent commercial quality, safe to eat)?
         - Is it "bad" (diseased, defective, pest-damaged, rotten, poor quality)?
         - Is it "poisonous" or extremely dangerous to consume/touch?
      3. Set "status" to either "nice" (healthy/clean) or "bad" (diseased/poisonous).
      4. Set "diagnosis" to:
         - "Healthy & Clean [Identified Plant/Fruit]" if status is "nice".
         - The specific disease, defect, or "Poisonous / Dangerous" (in French & English) if status is "bad".
      5. Set "qualityAssessment" to a meticulous and detailed visual analysis explaining exactly why it is clean/nice or bad/poisonous (discussing colors, spots, texture, safety, commercial value).
      6. Provide tailored "treatment" (or actions like "discard immediately" if poisonous) and "prevention" advice.
      
      Structure your response ONLY in a JSON block matching this exact type schema:
      {
        "status": "nice" | "bad",
        "diagnosis": "Name of disease or Healthy status summary (in French and English)",
        "confidenceScore": number between 80 and 99,
        "severity": "low" | "medium" | "high",
        "qualityAssessment": "Detailed visual analysis explaining the premium/healthy aspects (nice product) or disease/defects (bad product) seen in the picture",
        "treatment": "Actionable care / treatment / safety instructions",
        "prevention": "Preventive measures to maintain premium product standards or avoid toxicity"
      }
      If the image is purely blank/green or simple leaf, perform a realistic assessment based on visual indicators. Do not write markdown blocks other than JSON.`;

      let parts: any[] = [{ text: prompt }];
      
      if (imageBase64 && imageBase64.includes(",")) {
        const base64Data = imageBase64.split(",")[1];
        const mime = imageBase64.split(";")[0].split(":")[1] || "image/jpeg";
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mime
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.diagnosis) {
        // Log to reports
        const record = {
          id: "ds_" + (diseaseReports.length + 1),
          cropType: chosenCrop,
          status: parsed.status || (parsed.severity === "low" ? "nice" : "bad"),
          diagnosis: parsed.diagnosis,
          confidenceScore: Number(parsed.confidenceScore) || 90,
          severity: parsed.severity || "medium",
          qualityAssessment: parsed.qualityAssessment || "Analyse visuelle complétée avec succès.",
          treatment: parsed.treatment,
          prevention: parsed.prevention,
          date: new Date().toISOString(),
          imageUrl: imageBase64 ? "user-uploaded-snapshot" : ""
        };
        diseaseReports.unshift(record);
        saveDb();
        return res.json(record);
      }
    } catch (err: any) {
      console.log("Notice: Switching to smart offline disease diagnostics fallback (Gemini busy or quota exceeded).");
    }
  }

  // Fallback to offline databases
  const record = {
    id: "ds_" + (diseaseReports.length + 1),
    cropType: chosenCrop,
    status: matchedLocal.status || "bad",
    diagnosis: matchedLocal.diagnosis,
    confidenceScore: matchedLocal.confidenceScore,
    severity: matchedLocal.severity,
    qualityAssessment: matchedLocal.qualityAssessment || "Analyse hors-ligne standard.",
    treatment: matchedLocal.treatment,
    prevention: matchedLocal.prevention,
    date: new Date().toISOString(),
    imageUrl: imageBase64 ? "user-uploaded-snapshot" : ""
  };
  diseaseReports.unshift(record);
  saveDb();
  res.json(record);
});

// 7. Market prices API
app.get("/api/prices", (req, res) => {
  res.json(marketPrices);
});

// 8. Alerts API
app.get("/api/alerts", (req, res) => {
  res.json(alerts);
});

app.post("/api/alerts/read-all", (req, res) => {
  alerts = alerts.map(a => ({ ...a, read: true }));
  saveDb();
  res.json({ success: true, count: alerts.length });
});

// Daily Automated Advisory Notification update simulation
app.post("/api/alerts/simulate", (req, res) => {
  const simulationPool = [
    {
      type: "weather",
      severity: "warning",
      titleEn: "Souss-Massa: High Evapotranspiration Alert",
      titleFr: "Souss-Massa : Alerte d'Évapotranspiration Élevée",
      titleAr: "سوس ماسة: إنذار بارتفاع نسبة التبخر المائي",
      descEn: "Soil sensors detect rapid water loss. Dynamic irrigation booster suggested for melon and tomato crops.",
      descFr: "Perte d'humidité rapide détectée. Augmentation conseillée des plages horaires d'arrosage.",
      descAr: "أجهزة الاستشعار ترصد فقداناً سريعاً لرطوبة التربة. يُنصح بزيادة وتيرة ري الشمام والطماطم."
    },
    {
      type: "weather",
      severity: "danger",
      titleEn: "Gharb Region: Torrential Rain Advisory",
      titleFr: "Région du Gharb : Alerte aux Pluies Diluviennes",
      titleAr: "منطقة الغرب: نشرة إنذارية بأمطار طوفانية قادمة",
      descEn: "Heavy rainfall over 45mm expected. Clean secondary drainage canals to protect young tomato stems.",
      descFr: "Cumuls de pluie de 45mm prévus. Veuillez dégager les canaux d'évacuation pour protéger les racines.",
      descAr: "أمطار غزيرة تفوق 45 ملم مرتقبة. يُرجى تنظيف قنوات صرف المياه لحماية الجذور من التلف."
    },
    {
      type: "disease",
      severity: "warning",
      titleEn: "Saïs Olive Fly Infestation Warning",
      titleFr: "Alerte Saïs : Infection active de la Mouche de l'Olive",
      titleAr: "إقليم سايس: إنذار مبكر بانتشار ذبابة الزيتون",
      descEn: "Local traps in Sefrou and El Hajeb indicate increased olive fly activity. Apply organic bait treatment immediately.",
      descFr: "Hausse d'activité de la mouche de l'olive signalée à El Hajeb. Posez les pièges à phéromones.",
      descAr: "زيادة كبيرة في نشاط ذبابة الزيتون بالحاجب وصفرو. يرجى المباشرة بوضع المصائد العضوية فورا."
    },
    {
      type: "weather",
      severity: "danger",
      titleEn: "Southern Oasis: Intensive UV Radiation warning",
      titleFr: "Oasis du Sud : Alerte à l'index UV Extrême",
      titleAr: "الواحات الجنوبية: تحذير من مؤشر أشعة فوق بنفسجية قياسي",
      descEn: "Extreme sunlight predicted. Deploy shading nets on young date palm sprouts to protect growth leaves.",
      descFr: "Index UV record prévu. Utilisez des filets d'ombrage de 40% sur les jeunes bourgeons de palmiers d'Agadir et Ouarzazate.",
      descAr: "مؤشر أشعة فوق بنفسجية قياسي مرتقب. يوصى بتركيب شباك التظليل لحماية فسائل النخيل الفتية."
    },
    {
      type: "market",
      severity: "info",
      titleEn: "Casablanca Market: Olive Oil Supply Deficit",
      titleFr: "Marché Casablanca : Pénurie active de l'huile d'olive",
      titleAr: "بورصة الدار البيضاء: عجز في إمدادات زيت الزيتون",
      descEn: "Unprecedented demand. General price index rose to 110 MAD/Liter. Excellent selling window for cooperative holdings.",
      descFr: "Demande très importante. Prix moyen grimpé à 110 Dh/Litre. Opportunité idéale de vente en gros.",
      descAr: "طلب قياسي مرتفع والأسعار تقفز إلى 110 درهم للتر. فرصة ربحية ممتازة للتعاونيات الفلاحية المغربية للبيع."
    },
    {
      type: "weather",
      severity: "warning",
      titleEn: "Haouz Basin: Regional Water Allotment Updates",
      titleFr: "Bassin du Haouz : Ajustement officiel des quotas d'irrigation",
      titleAr: "حوض الحوز: تعديل جديد للحصص المائية المخصصة للري",
      descEn: "ORMVA announces a smart scheduled opening of Al-Massira Dam water gates starting tomorrow morning.",
      descFr: "L'ORMVA annonce un lâcher d'eau contrôlé du barrage Al-Massira dès demain matin pour recharger les nappes.",
      descAr: "المكتب الجهوي للاستثمار الفلاحي يعلن عن إطلاق حصص مائية إضافية من سد المسيرة ابتداء من الغد."
    }
  ];

  // Pick one based on random or length to make sure it rotates beautifully
  const index = Math.floor(Math.random() * simulationPool.length);
  const template = simulationPool[index];
  
  const newAlert = {
    id: "al_sim_" + (alerts.length + 1) + "_" + Math.floor(Math.random() * 1000),
    type: template.type,
    severity: template.severity,
    titleEn: template.titleEn,
    titleFr: template.titleFr,
    titleAr: template.titleAr,
    descEn: template.descEn,
    descFr: template.descFr,
    descAr: template.descAr,
    date: new Date().toISOString(),
    read: false
  };

  alerts.unshift(newAlert);
  res.json({ success: true, newAlert, alerts });
});

// 9. Admin panel analytics API
app.get("/api/admin/metrics", (req, res) => {
  res.json({
    totalUsers: users.length * 142 + 814, // Simulated Moroccan scale
    totalFarmsHectares: Math.round(farms.reduce((acc, f) => acc + f.sizeHectares, 0) * 115) + 3845,
    systemLoadPct: Math.round(Math.random() * 10) + 12,
    premiumPlanRatio: 64 // percentage
  });
});




// 10. IP Geolocation proxy to bypass adblockers
app.get("/api/my-location", async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof ip === 'string') {
      ip = ip.split(',')[0].trim();
    }
    const url = ip && ip !== '::1' && ip !== '127.0.0.1' ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to locate IP' });
  }
});

// Vite middleware mapping

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  if (!process.env.NETLIFY) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Agrisma Server] Full-Stack listening at http://0.0.0.0:${PORT}`);
    });
  }
}
setupVite();
export default app;
