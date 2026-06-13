import React, { useState, useEffect } from "react";
import { UserRole, UserProfile, Product, Order, Review, Message, AuditLog } from "./types";
import { SEED_PRODUCTS, SEED_SELLERS } from "./data/mockData";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import HomeView from "./components/HomeView";
import CatalogView from "./components/CatalogView";
import ProductDetailView from "./components/ProductDetailView";
import CheckoutView from "./components/CheckoutView";
import SellerDashboardView from "./components/SellerDashboardView";
import AdminDashboardView from "./components/AdminDashboardView";
import AuthView from "./components/AuthView";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShoppingCart, Star, MessageSquare, Send, Sparkles, BookOpen, MapPin, Phone, HelpCircle } from "lucide-react";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // App primary States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: "buyer_conakry_1",
    name: "Alpha Oumar Diallo",
    email: "alpha.diallo@gmail.com",
    phone: "+224620112233",
    role: UserRole.BUYER,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    isApproved: true,
    createdAt: new Date().toISOString()
  });

  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [favorites, setFavorites] = useState<string[]>(["prod_cafe_ziama"]);

  // Listen to Firebase Auth state on mount for real-time authentication spaces
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user profile on Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        try {
          const profileDoc = await getDoc(userRef);
          if (profileDoc.exists()) {
            setCurrentUser(profileDoc.data() as UserProfile);
          } else {
            // Profile does not exist yet (will be completed in registration or use basic buyer fallback)
            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Client Guinée Market",
              email: firebaseUser.email || "",
              role: UserRole.BUYER,
              avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.error("Error syncing Firestore profile on auth change:", err);
        }
      } else {
        // If logged out from Firebase, clear currentUser unless it is a mock profile
        setCurrentUser(prev => {
          if (prev && ["buyer_conakry_1", "seller_kindia_agri", "admin_superuser"].includes(prev.id)) {
            return prev; // maintain mock simulator profile for testing
          }
          return null;
        });
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Cart: stores product reference and current selected qty
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  
  // Orders history
  const [orders, setOrders] = useState<Order[]>([]);
  
  // System general reviews
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "rev_1",
      productId: "prod_mangue_kindia",
      userId: "buyer_test",
      userName: "Kadiatou Camara",
      rating: 5,
      comment: "Mangues incroyablement mielleuses, livrées en 24h à Kaloum Conakry ! Je recommande vivement.",
      createdAt: new Date().toISOString()
    },
    {
      id: "rev_2",
      productId: "prod_cafe_ziama",
      userId: "buyer_an",
      userName: "Thierno Souleymane",
      rating: 4,
      comment: "L'arôme du mont Ziama est intact. Très bon café torréfié.",
      createdAt: new Date().toISOString()
    }
  ]);

  // Seller messaging threads
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_init_1",
      chatId: "seller_kindia_agri_buyer_conakry_1",
      senderId: "seller_kindia_agri",
      senderName: "Syli Agro Kindia",
      receiverId: "buyer_conakry_1",
      content: "Bonjour ! Nous disposons de nouveaux stocks frais de mangues et de café Ziama prêts à être expédiés à Conakry.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    }
  ]);

  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Administrative users verification and security audit logs
  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      id: "seller_unapproved_1",
      name: "Coopérative Rizicole de Forecariah",
      email: "riz.forecariah@gmail.com",
      phone: "+224622778899",
      role: UserRole.SELLER,
      isApproved: false,
      storeName: "Riz de Guinée Direct",
      storeDescription: "Riz local blanchi de Forecariah, sacs de 25kg et 50kg.",
      createdAt: new Date().toISOString()
    },
    ...SEED_SELLERS,
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log_1",
      action: "Création Plateforme",
      details: "Initialisation sécurisée du grand registre Guinée Market Pro.",
      userId: "admin_system",
      userName: "Directeur de l'Audit",
      createdAt: new Date().toISOString()
    }
  ]);

  // Shared state filters for general search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Auth Swapping for quick testing
  const handleLogin = (role?: UserRole) => {
    if (role === UserRole.SELLER) {
      setCurrentUser({
        id: "seller_kindia_agri",
        name: "Mamadou Sylla (Syli Agro)",
        email: "sylla.agri@gmail.com",
        phone: "+224622114455",
        role: UserRole.SELLER,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        isApproved: true,
        storeName: "Syli Agro Kindia",
        createdAt: new Date().toISOString()
      });
      setActiveTab("seller-dashboard");
    } else if (role === UserRole.ADMIN) {
      setCurrentUser({
        id: "admin_superuser",
        name: "Commandant Soumah (Sûreté Numérique)",
        email: "soumah.digital@gouv.gn",
        phone: "+224620001020",
        role: UserRole.ADMIN,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        isApproved: true,
        createdAt: new Date().toISOString()
      });
      setActiveTab("admin-dashboard");
    } else {
      setCurrentUser({
        id: "buyer_conakry_1",
        name: "Alpha Oumar Diallo",
        email: "alpha.diallo@gmail.com",
        phone: "+224620112233",
        role: UserRole.BUYER,
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        isApproved: true,
        createdAt: new Date().toISOString()
      });
      setActiveTab("home");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("home");
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { id: product.id, name: product.name, price: product.promotionPrice || product.price, quantity }];
    });
    alert(`L'article "${product.name}" (${quantity}x) a été ajouté au panier.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  // Favorite toggle
  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Reviews CRUD
  const handleAddReview = (productId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userId: currentUser?.id || "guest_reviewer",
      userName: currentUser?.name || "Client Anonyme",
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);
  };

  // Chat initiation with seller
  const handleContactSeller = (sellerId: string, sellerName: string) => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour envoyer un message au vendeur.");
      return;
    }
    setActiveTab("chat");
    setSelectedSellerId(sellerId);
  };

  // Chat sending state
  const [chatInput, setChatInput] = useState("");
  const handleSendDirectMessage = (sellerId: string) => {
    if (!chatInput.trim()) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId: `${sellerId}_${currentUser?.id || "guest"}`,
      senderId: currentUser?.id || "guest",
      senderName: currentUser?.name || "Client",
      receiverId: sellerId,
      content: chatInput,
      createdAt: new Date().toISOString(),
      isRead: true
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");

    // Simulate instant seller feedback reply
    setTimeout(() => {
      const respMsg: Message = {
        id: `msg_resp_${Date.now()}`,
        chatId: `${sellerId}_${currentUser?.id || "guest"}`,
        senderId: sellerId,
        senderName: "Boutique Partenaire Corrélation",
        receiverId: currentUser?.id || "guest",
        content: `Merci pour votre message ! Un conseiller est en cours de traitement de votre requête pour validation immédiate des stocks à livrer.`,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setMessages(prev => [...prev, respMsg]);
    }, 1500);
  };

  // Seller Dashboard CRUD functions
  const handleAddProduct = (newProd: Omit<Product, "id" | "sellerId" | "sellerName" | "rating" | "ratingsCount" | "createdAt">) => {
    const fresh: Product = {
      ...newProd,
      id: `prod_${Date.now()}`,
      sellerId: currentUser?.id || "seller_default",
      sellerName: (currentUser as any)?.storeName || currentUser?.name || "Boutique Partenaire",
      rating: 5.0,
      ratingsCount: 0,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [fresh, ...prev]);
    alert("Votre nouveau produit a été publié avec succès sur Guinée Market Pro !");
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    alert("Produit retiré du catalogue.");
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  // Admin approval
  const handleApproveSeller = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
    alert("Le vendeur a été approuvé officiellement.");
  };

  const handleAddAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: `audit_${Date.now()}`,
      action,
      details,
      userId: currentUser?.id || "admin",
      userName: currentUser?.name || "Commandant",
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Filter messages for active chat discussion
  const activeSellerId = selectedSellerId || "seller_kindia_agri";
  const sellerObj = usersList.find(u => u.id === activeSellerId);
  const filteredChats = messages.filter(
    (m) => (m.senderId === currentUser?.id && m.receiverId === activeSellerId) ||
           (m.senderId === activeSellerId && m.receiverId === currentUser?.id)
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-250 ${darkMode ? "dark bg-zinc-950 text-zinc-100" : "bg-gray-50/50 text-zinc-900"}`}>
      
      {/* Top site-wide header */}
      <Navbar
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedSellerId={setSelectedSellerId}
        unreadMessagesCount={messages.filter(m => m.receiverId === currentUser?.id && !m.isRead).length}
      />

      {/* Primary Container Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME */}
        {activeTab === "home" && (
          <HomeView
            products={products}
            onProductClick={(p) => { setSelectedProduct(p); setActiveTab("detail"); }}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            setActiveTab={setActiveTab}
            setSearchQuery={setSearchQuery}
            setCategoryFilter={setCategoryFilter}
          />
        )}

        {/* VIEW 2: PRODUCT CATALOGUE */}
        {activeTab === "catalog" && (
          <CatalogView
            products={products}
            onProductClick={(p) => { setSelectedProduct(p); setActiveTab("detail"); }}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        )}

        {/* VIEW 3: DETAIL PRODUCT */}
        {activeTab === "detail" && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => setActiveTab("catalog")}
            onAddToCart={handleAddToCart}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            reviews={reviews}
            onAddReview={handleAddReview}
            onContactSeller={handleContactSeller}
            onSellerClick={(id) => { setSelectedSellerId(id); setActiveTab("chat"); }}
          />
        )}

        {/* VIEW 4: CART */}
        {activeTab === "cart" && (
          <section className="space-y-6 text-left max-w-4xl mx-auto">
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={22} className="text-[#009460]" />
              <span>Votre Panier d'Achat</span>
            </h1>

            {cart.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-gray-150 rounded-2xl space-y-3">
                <p className="text-sm text-gray-500">Votre panier est actuellement vide.</p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="px-4 py-2 bg-[#009460] text-white rounded-xl text-xs font-bold hover:bg-green-700 cursor-pointer"
                >
                  Découvrir le Catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  {cart.map((item) => {
                    const match = products.find(p => p.id === item.id);
                    return (
                      <div key={item.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 flex justify-between items-center gap-4 text-xs">
                        {match && (
                          <img src={match.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover shrink-0 border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                          <span className="font-mono text-gray-500 font-bold">{item.price.toLocaleString()} GNF / unité</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartQty(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 bg-gray-50 dark:bg-zinc-950 border border-gray-200 text-center rounded p-1"
                            min="1"
                          />
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 font-bold text-xs uppercase"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white dark:bg-zinc-900 border p-6 rounded-2xl self-start space-y-4">
                  <h3 className="font-bold border-b pb-2 text-xs uppercase tracking-wider">Récapitulatif financier</h3>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Articles</span>
                    <span className="font-mono font-bold">
                      {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} GNF
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#009460]">
                    <span>Total Général</span>
                    <span className="font-mono">
                      {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} GNF
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab("checkout")}
                    className="w-full py-3 bg-[#009460] text-white rounded-xl font-bold text-xs hover:bg-green-700 cursor-pointer text-center block"
                  >
                    Valider la commande (Orange / MTN Money)
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VIEW AUTH / PROFILE / ACCOUNT SPACE */}
        {activeTab === "auth" && (
          <AuthView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onLogout={handleLogout}
            setActiveTab={setActiveTab}
            usersList={usersList}
            setUsersList={setUsersList}
          />
        )}

        {/* VIEW 5: CHECKOUT / COUPLING WITH ORANGE MONEY */}
        {activeTab === "checkout" && (
          <CheckoutView
            cartItems={cart}
            currentUser={currentUser}
            onClearCart={() => setCart([])}
            onPlaceOrder={handlePlaceOrder}
            setActiveTab={setActiveTab}
          />
        )}

        {/* VIEW 6: SELLER PROFESSIONAL DASHBOARD */}
        {activeTab === "seller-dashboard" && currentUser?.role === UserRole.SELLER && (
          <SellerDashboardView
            sellerId={currentUser.id}
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {/* VIEW 7: ADMINISTRATIVE PORTAL */}
        {activeTab === "admin-dashboard" && currentUser?.role === UserRole.ADMIN && (
          <AdminDashboardView
            usersList={usersList}
            onApproveSeller={handleApproveSeller}
            products={products}
            onDeleteProduct={handleDeleteProduct}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {/* VIEW 8: FAQ HELP */}
        {activeTab === "faq" && (
          <section className="max-w-3xl mx-auto space-y-6 text-left text-xs">
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-3.5">
              <BookOpen size={20} className="text-[#009460]" />
              <span>Centre de Support & Service Logistique</span>
            </h1>

            <div className="space-y-4">
              {[
                {
                  q: "Quels sont les délais de livraison à Conakry et en province ?",
                  a: "Pour Conakry (Kaloum, Dixinn, Ratoma, Matam, Matoto), la livraison est effectuée en 24h par nos partenaires livreurs. Pour l'intérieur de la Guinée (Kindia, Labé, Kankan, Nzérékoré), comptez 48h à 72h via les transports rapides agréés."
                },
                {
                  q: "Comment fonctionne le paiement par Orange Money et Mobile Money ?",
                  a: "Vous initiez l'achat en ligne, notre passerelle génère un SMS push de validation sur votre téléphone. Pour plus de confiance, l'argent reste sous séquestre sécurisé de Guinée Market Pro et n'est transmis au vendeur qu'une fois votre colis réceptionné."
                },
                {
                  q: "Comment m'inscrire comme vendeur professionnel ?",
                  a: "Cliquez sur 'Démo Seller' en haut pour simuler le profil vendeur ou contactez nos modérateurs administratifs. Toute nouvelle boutique doit soumettre sa pièce d'identité guinéenne et son agrément commercial avant d'être validée par l'administrateur."
                },
                {
                  q: "Le Café de Macenta et le Miel du Fouta sont-ils certifiés d'origine ?",
                  a: "Oui, notre coopérative 'Syli Agro Kindia' s'approvisionne directement auprès des agriculteurs du mont Ziama et des apiculteurs locaux de Labé pour vous garantir des produits authentiques et biologiques."
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 space-y-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">{faq.q}</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 9: CONTACT PREFECTURES */}
        {activeTab === "contact" && (
          <section className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 p-6 md:p-8 text-left text-xs space-y-5">
            <h1 className="text-lg font-black text-gray-950 dark:text-white border-b pb-2">Contacter le Bureau Principal</h1>
            <p className="text-gray-500 leading-relaxed font-sans">Notre équipe est à votre disposition pour arbitrer un différend commercial, valider votre agrément de vente ou suivre un envoi.</p>
            
            <div className="space-y-3 font-mono">
              <div className="flex gap-2 items-center">
                <MapPin size={16} className="text-[#CE1126] shrink-0" />
                <span>Kaloum Centre, en face du Palais du Peuple, Conakry - Guinée</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone size={16} className="text-[#009460] shrink-0" />
                <span>+224 622 00 00 11 (Support Client Standard)</span>
              </div>
            </div>

            <hr />

            <form onSubmit={(e) => { e.preventDefault(); alert("Votre ticket d'assistance a été enregistré par nos équipes de Conakry."); }} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Sujet du Message</label>
                <input type="text" placeholder="Ex: Devenir distributeur exclusif à Kankan" className="w-full border p-2.5 rounded-xl bg-gray-50 text-xs outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Message explicatif</label>
                <textarea rows={4} placeholder="Veuillez détailler votre demande commerciale..." className="w-full border p-2.5 rounded-xl bg-gray-50 text-xs outline-none" required />
              </div>
              <button type="submit" className="w-full py-3 bg-[#009460] text-white font-bold rounded-xl cursor-pointer">
                Soumettre le Ticket National
              </button>
            </form>
          </section>
        )}

        {/* VIEW 10: SELLER-BUYER REAL CHAT SIMULATOR */}
        {activeTab === "chat" && (
          <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm aspect-video sm:aspect-auto">
            
            {/* Sidebar of sellers */}
            <div className="border-r border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/50 p-4 text-xs text-left space-y-3">
              <h3 className="font-black text-gray-500 uppercase tracking-widest text-[10px] pb-2 border-b">Marchands Recommandés</h3>
              <div className="space-y-1">
                {usersList.filter(u => u.role === "seller" && u.isApproved).map(sell => (
                  <div
                    key={sell.id}
                    onClick={() => setSelectedSellerId(sell.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      activeSellerId === sell.id ? "bg-[#009460]/10 border-l-4 border-[#009460]" : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <strong className="block text-gray-950 dark:text-gray-100">{sell.storeName || sell.name}</strong>
                    <span className="text-[10px] text-gray-400 font-mono">{sell.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversational Screen */}
            <div className="md:col-span-2 flex flex-col justify-between h-[420px] bg-white dark:bg-zinc-950/20 text-left">
              {/* Top Banner info */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{sellerObj?.storeName || sellerObj?.name || "Boutique d'échanges"}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">Conseils de prix direct et livraisons collectives</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#009460]/15 text-[#009460] font-mono font-bold text-[10px]">LIGNE ACTIVE</span>
              </div>

              {/* Chat bubbles list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {filteredChats.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.senderId === currentUser?.id
                        ? "bg-[#009460] text-white rounded-tr-none"
                        : "bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-gray-700 rounded-tl-none text-gray-900 dark:text-zinc-100"
                    }`}>
                      <p>{m.content}</p>
                      <span className="text-[9px] text-white/60 dark:text-gray-500 block text-right mt-1 font-mono">
                        {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input box */}
              <div className="p-3 border-t border-gray-150 dark:border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez votre question sur la livraison à Kindia ou un rabais de prix..."
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendDirectMessage(activeSellerId); }}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 outline-none focus:ring-1 focus:ring-green-500 p-2.5 text-xs text-gray-900 dark:text-white rounded-xl"
                />
                <button
                  onClick={() => handleSendDirectMessage(activeSellerId)}
                  className="p-3 rounded-xl bg-[#009460] hover:bg-green-700 text-white transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Floating Smart AI Consultation agent */}
      <Chatbot currentUser={currentUser} />

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-850 py-12 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-4">
            <span className="font-bold text-white text-sm">Guinée Market Pro</span>
            <p className="text-gray-500 leading-relaxed font-sans text-[11px]">
              La souveraineté numérique du commerce en République de Guinée. Une expérience fluide de Conakry à Nzérékoré.
            </p>
            {/* flag graphic */}
            <div className="h-1 w-20 flex">
              <div className="bg-[#CE1126] flex-1"></div>
              <div className="bg-[#FCD116] flex-1"></div>
              <div className="bg-[#009460] flex-1"></div>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-white text-xs block">Ressources</span>
            <p onClick={() => setActiveTab("faq")} className="hover:text-white cursor-pointer transition-colors text-[11px]">Aide & FAQ logistiques</p>
            <p onClick={() => setActiveTab("contact")} className="hover:text-white cursor-pointer transition-colors text-[11px]">Bureaux régionaux</p>
            <p onClick={() => setActiveTab("catalog")} className="hover:text-white cursor-pointer transition-colors text-[11px]">Promotions locales</p>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-white text-xs block">Sécurité & Confiance</span>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Tous nos terminaux de paiement supportent le protocole de cryptage des transactions de l'État Guinéen avec contrôle des commissions de 0.5%.
            </p>
          </div>

          <div className="space-y-2.5 font-mono">
            <span className="font-bold text-white text-xs block">Assistance Technique</span>
            <span className="text-[11px] text-gray-500 block">Prefecture d'assistance : Conakry Kaloum</span>
            <span className="text-[10px] text-gray-600 block">Version 3.2.0 • Propulsé par Google AI Studio</span>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-zinc-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-600 font-mono gap-4">
          <span>© 2026 Guinée Market Pro. Tous droits réservés. République de Guinée.</span>
          <span>Souveraineté Numérique et Commerce Équitable d'Afrique de l'Ouest</span>
        </div>
      </footer>

    </div>
  );
}
