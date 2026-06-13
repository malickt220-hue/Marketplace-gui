import { Product, UserProfile, UserRole } from "../types";

export const SEED_SELLERS: UserProfile[] = [
  {
    id: "seller_kindia_agri",
    name: "Mamadou Sylla (Kindia Agri-Coop)",
    email: "sylla.agri@gmail.com",
    phone: "+224622114455",
    role: UserRole.SELLER,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    isApproved: true,
    storeName: "Syli Agro Kindia",
    storeDescription: " Coopérative agricole de Kindia. Fruits frais, mangues séchées, miel du Fouta et café Ziama 100% biologique.",
    storeAddress: "Quartier Tafory, Kindia Centre",
    createdAt: new Date().toISOString()
  },
  {
    id: "seller_madina_electro",
    name: "Diallo & Frères Électronique",
    email: "diallo.madina@gmail.com",
    phone: "+224664889900",
    role: UserRole.SELLER,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    isApproved: true,
    storeName: "Diallo Madina Tech",
    storeDescription: "Vente de smartphones, ordinateurs haut de gamme, tablettes et accessoires importés de Dubaï et d'Europe.",
    storeAddress: "Grand Marché de Madina, Conakry",
    createdAt: new Date().toISOString()
  },
  {
    id: "seller_pharmacie_pro",
    name: "Dr. Aminata Kourouma",
    email: "pharmacieduprogres@gmail.com",
    phone: "+224620556677",
    role: UserRole.SELLER,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    isApproved: true,
    storeName: "Pharmacie du Progrès & Cosmétiques",
    storeDescription: "Parapharmacie, produits de santé certifiés, soins dermatologiques et hygiène pour toute la famille.",
    storeAddress: "Avenue de la République, Kaloum, Conakry",
    createdAt: new Date().toISOString()
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod_mangue_kindia",
    sellerId: "seller_kindia_agri",
    sellerName: "Syli Agro Kindia",
    name: "Mangues de Kindia (Carton de 10kg)",
    description: "Mangues de Kindia variété Kent, calibrées, sucrées et récoltées à maturité optimale. Idéal pour familles et revendeurs.",
    price: 95000,
    stock: 50,
    category: "Agriculture",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
    rating: 4.8,
    ratingsCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_cafe_ziama",
    sellerId: "seller_kindia_agri",
    sellerName: "Syli Agro Kindia",
    name: "Café Ziama Macenta - Torréfié (500g)",
    description: "Café de terroir cultivé dans les hauteurs du mont Ziama à Macenta. Arôme intense, notes de chocolat noir et d'épices locales. Torréfaction artisanale.",
    price: 65000,
    stock: 120,
    category: "Alimentation",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
    rating: 4.9,
    ratingsCount: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_miel_fouta",
    sellerId: "seller_kindia_agri",
    sellerName: "Syli Agro Kindia",
    name: "Miel Pur du Fouta Djallon (1 Litre)",
    description: "Miel pur d'abeilles sauvages, récolté à la main dans la région de Labé. Excellent remède naturel et substitut de sucre gourmet.",
    price: 80000,
    stock: 80,
    category: "Alimentation",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",
    rating: 4.7,
    ratingsCount: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_samsung_s23",
    sellerId: "seller_madina_electro",
    sellerName: "Diallo Madina Tech",
    name: "Samsung Galaxy S23 Ultra - 256GB",
    description: "Smartphone Android ultra performant, capteur photo intelligent de 200MP, stylet S Pen intégré, écran AMOLED 120Hz. Garantie boutique de 12 mois.",
    price: 9800000,
    stock: 15,
    category: "Téléphones",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
    rating: 5.0,
    ratingsCount: 5,
    createdAt: new Date().toISOString(),
    promotionPrice: 9200000
  },
  {
    id: "prod_dell_latitude",
    sellerId: "seller_madina_electro",
    sellerName: "Diallo Madina Tech",
    name: "Dell Latitude Intel Core i7 - 16GB RAM",
    description: "Ordinateur portable professionnel robuste avec processeur Intel Core i7, stockage SSD ultra-rapide de 512GB, clavier rétroéclairé. Parfait pour étudiants ou entreprises guinéennes.",
    price: 6500000,
    stock: 8,
    category: "Informatique",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    rating: 4.5,
    ratingsCount: 11,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_lait_bebe",
    sellerId: "seller_pharmacie_pro",
    sellerName: "Pharmacie du Progrès & Cosmétiques",
    name: "Lait Infantile Novalac Premium 1er Âge",
    description: "Lait en poudre pour nourrissons de 0 à 6 mois enrichi en fer et acides gras essentiels. Produit de santé importé sous chaîne de froid contrôlée.",
    price: 135000,
    stock: 45,
    category: "Santé",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
    rating: 4.6,
    ratingsCount: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_huile_argan",
    sellerId: "seller_pharmacie_pro",
    sellerName: "Pharmacie du Progrès & Cosmétiques",
    name: "Sérum Anti-Imperfections & Éclat",
    description: "Sérum dermatologique haute efficacité, resserre les pores et illumine le teint. Adapté aux peaux sensibles sous climat tropical chaud.",
    price: 190000,
    stock: 30,
    category: "Beauté",
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500",
    rating: 4.2,
    ratingsCount: 8,
    createdAt: new Date().toISOString(),
    promotionPrice: 175000
  },
  {
    id: "prod_ciment_dangote",
    sellerId: "seller_madina_electro", // seller Diallo has industrial imports
    sellerName: "Diallo Import-Export",
    name: "Sac de Ciment Dangote CPJ 42.5r (50kg)",
    description: "Sac de ciment de haute résistance idéal pour dalles, voiles, pavés et fondations solides partout en Guinée. Tarifs dégressifs pour chantiers de grande taille.",
    price: 85000,
    stock: 1000,
    category: "Construction",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
    rating: 4.7,
    ratingsCount: 35,
    createdAt: new Date().toISOString()
  }
];
