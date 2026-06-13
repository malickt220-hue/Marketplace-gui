import React, { useState, useEffect } from "react";
import { Search, Sparkles, Smartphone, Laptop, Zap, Apple, Activity, Home, Truck, Briefcase, Plus, Heart, ChevronRight, Check } from "lucide-react";
import { Product, PRODUCT_CATEGORIES } from "../types";

interface HomeViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
}

export default function HomeView({
  products,
  onProductClick,
  onAddToCart,
  favorites,
  onToggleFavorite,
  setActiveTab,
  setSearchQuery,
  setCategoryFilter,
}: HomeViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category?: string; tags?: string[]; suggestions?: string[] } | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  // Load recommendations using our backend API route
  useEffect(() => {
    async function loadRecommendations() {
      if (products.length === 0) return;
      setLoadingRecommendation(true);
      try {
        const response = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerHistory: { preferredCategories: ["Alimentation", "Téléphones"] },
            catalogMini: products.map(p => ({ id: p.id, category: p.category, name: p.name, price: p.price }))
          })
        });
        if (response.ok) {
          const data = await response.json();
          const recommendedProducts = products.filter(p => data.recommendedIds?.includes(p.id));
          if (recommendedProducts.length > 0) {
            setAiRecommendations(recommendedProducts);
          } else {
            setAiRecommendations(products.slice(0, 3));
          }
        } else {
          setAiRecommendations(products.slice(0, 3));
        }
      } catch (err) {
        setAiRecommendations(products.slice(0, 3));
      } finally {
        setLoadingRecommendation(false);
      }
    }
    loadRecommendations();
  }, [products]);

  // Handle smart search using our Gemini /smart-search API endpoint
  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setAiAnalyzing(true);
    try {
      const response = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchInput })
      });
      if (response.ok) {
        const data = await response.json();
        setAiResult(data);
        // Let's filter the catalogue tab automatically
        setSearchQuery(searchInput);
        if (data.category && PRODUCT_CATEGORIES.includes(data.category)) {
          setCategoryFilter(data.category);
        }
      }
    } catch (error) {
      console.error("Smart search failed:", error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Téléphones": return <Smartphone size={20} />;
      case "Informatique": return <Laptop size={20} />;
      case "Agriculture": return <Apple size={20} />;
      case "Alimentation": return <Zap size={20} />;
      case "Santé": return <Activity size={20} />;
      case "Maison": return <Home size={20} />;
      case "Automobile": return <Truck size={20} />;
      case "Services professionnels": return <Briefcase size={20} />;
      default: return <Plus size={20} />;
    }
  };

  const getPromoProducts = () => {
    return products.filter(p => p.promotionPrice && p.promotionPrice > 0).slice(0, 4);
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 dark:bg-black text-white py-12 md:py-16 px-6 md:px-12 shadow-xl border border-zinc-800">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(0,148,96,0.3),transparent_70%)]" />
        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-green-400">
            <Sparkles size={12} className="animate-pulse" />
            <span>Marketplace Nationale Autorisée</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            La Marketplace Guinéenne <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-[#009460]">
              Moderne & Sécurisée
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
            Achetez et vendez partout en Guinée avec livraison garantie et paiements intégrés par <strong>Orange Money</strong>, <strong>Mobile Money (MoMo)</strong> et paiements sécurisés.
          </p>

          {/* Smart IA Search Form */}
          <form onSubmit={handleSmartSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="flex-1 relative bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 flex items-center px-3.5">
              <Search className="text-gray-500 shrink-0 mr-2" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: 'Je cherche un smartphone Samsung pas cher' ou 'miel du Fouta'..."
                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs py-3.5 text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={handleSmartSearch}
                className="absolute right-1 px-2.5 py-1.5 bg-zinc-800 text-yellow-400 hover:text-white rounded-lg text-[10px] uppercase font-mono tracking-wider flex items-center gap-1"
              >
                <Sparkles size={10} />
                <span>IA</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={aiAnalyzing}
              className="px-6 py-3.5 rounded-xl bg-[#009460] hover:bg-[#007b50] text-[#fff] text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              {aiAnalyzing ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <span>Rechercher</span>
              )}
            </button>
          </form>

          {/* Search suggestions tags */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-400">Populaire :</span>
            {["Café Ziama", "Samsungs", "Miel", "Ciment Dangote"].map(tag => (
              <span 
                key={tag}
                onClick={() => {
                  setSearchInput(tag);
                  setSearchQuery(tag);
                  setActiveTab("catalog");
                }}
                className="hover:text-white cursor-pointer underline decoration-dotted transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Intelligent Classification Output if any */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                <Sparkles size={14} />
                <span>Rapport d'analyse de recherche IA :</span>
              </div>
              <p className="text-gray-300">
                Catégorie recommandée détectée : <strong className="text-white bg-[#009460]/20 border border-[#009460]/50 px-2 py-0.5 rounded ml-1">{aiResult.category}</strong>
              </p>
              {aiResult.tags && aiResult.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center mt-1">
                  <span>Tags :</span>
                  {aiResult.tags.map(t => (
                    <span key={t} className="bg-zinc-800 text-gray-400 px-2 py-0.5 rounded font-mono text-[10px]">#{t}</span>
                  ))}
                </div>
              )}
              <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Le catalogue a été pré-filtré automatiquement !</span>
                <button 
                  onClick={() => setActiveTab("catalog")} 
                  className="text-green-400 font-semibold hover:underline flex items-center"
                >
                  Ouvrir le catalogue <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Horizontal Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Découvrir les Marchés</h2>
          <button 
            onClick={() => setActiveTab("catalog")} 
            className="text-xs font-semibold text-[#009460] hover:underline flex items-center gap-1"
          >
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PRODUCT_CATEGORIES.slice(0, 12).map((category) => (
            <div
              key={category}
              onClick={() => {
                setCategoryFilter(category);
                setActiveTab("catalog");
              }}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 hover:border-[#009460]/30 hover:shadow-md cursor-pointer transition-all duration-250 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-[#009460] group-hover:bg-[#009460] group-hover:text-white transition-colors duration-200">
                {getCategoryIcon(category)}
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-2.5 truncate max-w-full">
                {category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Smart Recommendations Area */}
      <section className="p-6 md:p-8 rounded-3xl bg-emerald-50/50 dark:bg-zinc-900/30 border border-emerald-100/50 dark:border-zinc-800/80 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Pour vous • Recommandations IA</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">Modèle prédictif Gemini analysé selon des critères locaux</p>
          </div>
          <span className="text-[10px] bg-[#009460]/10 border border-[#009460]/30 text-[#009460] dark:text-emerald-400 font-mono font-bold uppercase py-1 px-2.5 rounded-full">
            IntelliMatch v2.5
          </span>
        </div>

        {loadingRecommendation ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 h-44 rounded-2xl border border-gray-100 dark:border-gray-800/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.length > 0 ? (
              aiRecommendations.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-zinc-900/85 hover:shadow-xl rounded-2xl border border-gray-150 dark:border-gray-800/80 p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#009460] dark:text-green-400 uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-500">Boutique: {product.sellerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50 pt-3 mt-3">
                    <span className="text-xs font-black text-gray-950 dark:text-white font-mono">
                      {product.price.toLocaleString()} GNF
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="text-[11px] font-semibold text-white bg-[#009460] hover:bg-[#007f50] py-1 px-3 rounded-lg cursor-pointer"
                    >
                      Ajouter +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-xs text-center text-gray-500">Aucune recommandation trouvée.</p>
            )}
          </div>
        )}
      </section>

      {/* Promotional Hot Sales Block */}
      {getPromoProducts().length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-[#CE1126]" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Promotions en Cours (Mois du Commerce)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getPromoProducts().map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Discount Badge */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#CE1126] text-white font-black text-[9px] uppercase tracking-widest font-mono">
                    PROMO GNF
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-zinc-950/80 text-gray-600 dark:text-gray-300 hover:text-red-500"
                  >
                    <Heart size={14} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">
                      {product.category}
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-gray-50 dark:border-zinc-800/50 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] line-through text-gray-400 block font-mono">
                        {product.price.toLocaleString()} GNF
                      </span>
                      <span className="text-sm font-black text-[#CE1126] font-mono leading-none">
                        {product.promotionPrice?.toLocaleString()} GNF
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="px-2.5 py-1.5 bg-[#009460] text-white rounded-lg text-xs font-bold hover:bg-[#00734a] transition-colors cursor-pointer"
                    >
                      Prendre
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secure Guinea Market Value proposition Grid */}
      <section className="col-span-full py-8 border-t border-b border-gray-150 dark:border-gray-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/20 text-[#CE1126] flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Livraison 33 Préfectures</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">De Conakry à Nzérékoré, nous acheminons vos colis par voitures rapides et moto-taxis agréés sécurisés.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Contrôle de Prix par IA</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-sans">L'intelligence artificielle compare en direct les tarifs locaux pour vous garantir la meilleure opportunité en GNF.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-15 rounded-2xl bg-green-100 dark:bg-green-950/20 text-[#009460] flex items-center justify-center shrink-0">
              <Check size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Vente 100% Certifiée</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Les vendeurs ne reçoivent les fonds Orange Money ou MoMo que lorsque vous validez la bonne réception de la commande.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
