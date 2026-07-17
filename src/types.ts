export type Language = 'en' | 'fr' | 'ar';

export type UserRole = 'farmer' | 'cooperative' | 'consultant' | 'agency' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Farm {
  id: string;
  name: string;
  location: string; // e.g., 'Souss-Massa', 'Gharb', 'Moulouya', 'Saïs'
  sizeHectares: number;
  soilType: 'Clay' | 'Sandy' | 'Loamy' | 'Silty' | 'Chalky';
}

export interface Crop {
  id: string;
  farmId: string;
  cropName: 'Tomatoes' | 'Potatoes' | 'Onions' | 'Wheat' | 'Olives' | 'Citrus';
  plantingDate: string;
  expectedHarvestDate: string;
  status: 'Growing' | 'Harvested' | 'Planted';
  healthScore: number; // 0-100%
  irrigatedSum: number; // Litres/Hectare
}

export interface DiseaseReport {
  id: string;
  cropType: string;
  diagnosis: string;
  confidenceScore: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
  prevention: string;
  date: string;
  imageUrl?: string;
  status?: 'nice' | 'bad';
  qualityAssessment?: string;
}

export interface WeatherData {
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Windy' | 'Hot';
  forecast: {
    day: string;
    temp: number;
    condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Windy' | 'Hot';
  }[];
}

export interface MarketPrice {
  cropName: string;
  currentPrice: number; // MAD per kg
  predictedPrice: number; // MAD per kg for next month
  historicalPrices: { date: string; price: number }[];
  predictedPrices: { date: string; price: number }[];
  bestSellingPeriod: string;
}

export interface Alert {
  id: string;
  type: 'disease' | 'weather' | 'irrigation' | 'market';
  severity: 'info' | 'warning' | 'danger';
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  date: string;
  read: boolean;
}
