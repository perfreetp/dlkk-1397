export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  avatar: string;
  vaccineStatus: boolean;
  sterilizationStatus: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  features: string[];
  image: string;
}

export interface Booking {
  id: string;
  petId: string;
  petName: string;
  petAvatar: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  days: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalPrice: number;
  feedingSchedule: FeedingItem[];
  medications: MedicationItem[];
  walkRequirements: string;
  dietaryRestrictions: string;
  notes: string;
  photos: string[];
  createdAt: string;
}

export interface FeedingItem {
  time: string;
  food: string;
  amount: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
}

export interface HandoverItem {
  id: string;
  bookingId: string;
  type: 'check_in' | 'check_out';
  itemsList: HandoverGoods[];
  healthStatus: string;
  moodStatus: string;
  ownerConfirmed: boolean;
  staffConfirmed: boolean;
  confirmedAt?: string;
}

export interface HandoverGoods {
  id: string;
  name: string;
  category: string;
  quantity: number;
  checked: boolean;
}

export interface DailyRecord {
  id: string;
  date: string;
  bookingId: string;
  petId: string;
  meals: MealRecord[];
  water: string;
  poop: string;
  pee: string;
  walk: WalkRecord;
  mood: string;
  health: string;
  notes: string;
  photos: string[];
  staffName: string;
  createdAt: string;
}

export interface MealRecord {
  time: string;
  food: string;
  amount: string;
  finished: boolean;
}

export interface WalkRecord {
  time: string;
  duration: number;
  distance: string;
  notes: string;
}

export interface Message {
  id: string;
  type: 'system' | 'alert' | 'chat' | 'daily';
  title: string;
  content: string;
  time: string;
  read: boolean;
  relatedBookingId?: string;
}

export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'grooming' | 'walking' | 'medical' | 'other';
  icon: string;
}

export interface FeeItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'room' | 'service' | 'extra' | 'deposit';
}

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  memberLevel: string;
  totalBookings: number;
  totalDays: number;
}
