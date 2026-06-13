export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin"
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  
  // Seller-specific details
  isApproved?: boolean;
  storeName?: string;
  storeDescription?: string;
  storeAddress?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number; // in GNF (Franc Guinéen)
  stock: number;
  category: string;
  imageUrl: string;
  rating: number;
  ratingsCount: number;
  createdAt: string;
  promotionPrice?: number; // Optional promo price
  isApproved?: boolean; // Admin approved
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // price at purchase time
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "orange_money" | "momo" | "card" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
  receiptUrl?: string;
}

export interface Message {
  id: string;
  chatId: string; // sorted composite of uids (e.g. uid1_uid2)
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  createdAt: string;
}

export const PRODUCT_CATEGORIES = [
  "Électronique",
  "Téléphones",
  "Informatique",
  "Mode",
  "Beauté",
  "Santé",
  "Maison",
  "Automobile",
  "Agriculture",
  "Construction",
  "Alimentation",
  "Services professionnels"
];

export const GUINEA_PREFECTURES = [
  "Conakry",
  "Labé",
  "Kankan",
  "Nzérékoré",
  "Siguiri",
  "Mamou",
  "Kindia",
  "Boké",
  "Faranah",
  "Macenta",
  "Kissidougou",
  "Guéckédou",
  "Kouroussa",
  "Coyah",
  "Dubréka",
  "Pita",
  "Dalaba",
  "Mali",
  "Tougué",
  "Koundara",
  "Gaoual",
  "Boffa",
  "Fria",
  "Télimélé",
  "Forécariah",
  "Dabola",
  "Dinguiraye",
  "Kerouane",
  "Mandiana"
];
