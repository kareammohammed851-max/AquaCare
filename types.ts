export interface UserProfile {
  id: string;
  name: string;
  password: string;
  address: string;
  apartmentNumber: string;
  floorNumber: string;
  waterMeterNumber: string;
}

export interface ConsumptionRecord {
  date: string; // ISO string for the end of the month
  consumption: number; // in cubic meters or gallons
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'badge' | 'coupon';
  icon: string; // emoji
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}