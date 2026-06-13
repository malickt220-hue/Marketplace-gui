import React, { useState } from "react";
import { Filter, Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Heart, ShieldCheck, Scale, Eye, HelpCircle } from "lucide-react";
import { Product, PRODUCT_CATEGORIES, GUINEA_PREFECTURES } from "../types";

interface CatalogViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export default function CatalogView({
  products,
  onProductClick,
  onAddToCart,
  favorites,
  onToggleFavorite,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
}: CatalogViewProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "discount">("recent");
  
  // Comparisons Slots (Max 3)
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleToggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(prev => prev.filter(item => item !== id));
    } else {
      if (comparedIds.length >= 3) {
        alert("Vous pouvez comparer au maximum 3 produits en même temps.");
        return;
      }
      setComparedIds(prev => [...prev, id]);
      setShowComparison(true);
    }
  };

  const getFilteredProducts = () => {
    return products
      .filter((product) => {
        // Search text check
        if (searchQuery) {
          const s = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(s);
          const matchDesc = product.description.toLowerCase().includes(s);
          const matchCat = product.category.toLowerCase().includes(s);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category check
        if (categoryFilter && product.category !== categoryFilter) {
          return false;
        }

        // Prefecture check
        if (selectedPrefecture) {
          // Mock location filter based on seller details or preset locations in description or name
          const sLocation = selectedPrefecture.toLowerCase();
          const hasPrefectureInSeller = product.sellerName.toLowerCase().includes(sLocation);
          const hasPrefectureInDesc = product.description.toLowerCase().includes(sLocation);
          // Let's add slight randomized match for simulation richness if not specifically written
          if (!hasPrefectureInSeller && !hasPrefectureInDesc && (product.id.charCodeAt(0) % 3 !== 0)) {
            return false;
          }
        }

        // Min Price
        if (minPrice && product.price < parseFloat(minPrice)) {
          return false;
        }

        // Max Price
        if (maxPrice && product.price > parseFloat(maxPrice)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "discount") {
          const promoA = a.promotionPrice ? a.price - a.promotionPrice : 0;
          const promoB = b.promotionPrice ? b.price - b.promotionPrice : 0;
          return promoB - promoA;
        }
        return b.createdAt.localeCompare(a.createdAt); // Recent
      });
  };

  const filtered = getFilteredProducts();

  return (
    <div className="space-y-6 pb-20">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
            <Filter size={20} className="text-[#009460]" />
            <span>Catalogue National Conjoint</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono">Recherche avancée et filtres sectoriels d'articles guinéens</p>
        </div>
        
        {/* Sort option drop-down */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown size={14} className="text-gray-500" />
          <span className="text-gray-500 font-medium">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 rounded-lg py-1 px-2.5 font-semibold text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="recent">Nouveautés d'abord</option>
            <option value="price-asc">Prix croisant (GNF)</option>
            <option value="price-desc">Prix décroisant (GNF)</option>
            <option value="discount">Meilleures Promotions</option>
          </select>
        </div>
      </div>

      {/* Comparison Drawer/Overlay */}
      {showComparison && comparedIds.length > 0 && (
        <section className="p-5 rounded-2xl bg-zinc-950 dark:bg-black text-white border border-zinc-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-yellow-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Comparateur Intelligent de Produits ({comparedIds.length}/3)</h3>
            </div>
            <button 
              onClick={() => { setComparedIds([]); setShowComparison(false); }}
              className="text-[10px] uppercase font-mono text-gray-400 hover:text-white"
            >
              Fermer [X]
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparedIds.map(id => {
              const prod = products.find(p => p.id === id);
              if (!prod) return null;
              return (
                <div key={prod.id} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono font-bold text-green-400">{prod.category}</span>
                      <button 
                        onClick={() => handleToggleCompare(prod.id)}
                        className="text-red-400 hover:text-red-500 font-mono text-[9px] uppercase"
                      >
                        Enlever
                      </button>
                    </div>
                    <h4 className="font-bold text-white truncate">{prod.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">Vendeur: {prod.sellerName}</p>
                    <p className="text-[11px] font-black text-yellow-300 font-mono">{(prod.promotionPrice || prod.price).toLocaleString()} GNF</p>
                    <p className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed mt-1">{prod.description}</p>
                  </div>
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="w-full mt-3 py-1 bg-[#009460] text-white rounded font-bold text-[11px] hover:bg-green-700"
                  >
                    Mettre au panier
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Filter layout: 1 Column Filter Sidebar + 1 Grid Listings on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters */}
        <aside className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 dark:border-zinc-800/80 pb-3">
            <SlidersHorizontal size={14} className="text-[#009460]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Ajustements</h3>
          </div>

          {/* Search bar input again */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-650 dark:text-gray-400 font-mono uppercase tracking-wider">Mots clés</label>
            <div className="flex items-center bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-850 px-2.5 py-2 rounded-xl">
              <Search size={14} className="text-gray-400 shrink-0 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Ciment, Infinix..."
                className="w-full bg-transparent border-0 outline-none text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-650 dark:text-gray-400 font-mono uppercase tracking-wider">Catégorie</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 p-1.5 text-xs text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 shrink-0 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={categoryFilter === ""}
                  onChange={() => setCategoryFilter("")}
                  className="rounded text-[#009460] focus:ring-0 cursor-pointer"
                />
                <span className={categoryFilter === "" ? "font-bold text-[#009460]" : ""}>Tous les produits</span>
              </label>
              {PRODUCT_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 p-1.5 text-xs text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === cat}
                    onChange={() => setCategoryFilter(cat)}
                    className="rounded text-[#009460] focus:ring-0 cursor-pointer"
                  />
                  <span className={categoryFilter === cat ? "font-bold text-[#009460]" : ""}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prefecture Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-650 dark:text-gray-400 font-mono uppercase tracking-wider">Région / Préfecture</label>
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-850 py-2.5 px-3 rounded-xl text-xs text-gray-800 dark:text-gray-300 outline-none"
            >
              <option value="">Toute la Guinée (Global)</option>
              {GUINEA_PREFECTURES.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          {/* GNF Price budget constraint */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-650 dark:text-gray-400 font-mono uppercase tracking-wider">Tranche Budget (GNF)</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min GNF"
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-850 px-2.5 py-1.5 rounded-lg outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max GNF"
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-850 px-2.5 py-1.5 rounded-lg outline-none"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button 
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[10px] text-red-500 font-bold uppercase block mt-1 hover:underline"
              >
                Réinitialiser filtre prix
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid (3 columns on lg screen) */}
        <section className="lg:col-span-3 space-y-6">
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Resultat: <strong className="text-gray-900 dark:text-white font-black">{filtered.length}</strong> produits correspondants</span>
            {categoryFilter && (
              <span className="px-2.5 py-1 bg-[#009460]/10 border border-[#009460]/20 rounded-full text-[#009460] font-bold text-[10px]">
                Filtré par: {categoryFilter}
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-3">
              <HelpCircle size={32} className="mx-auto text-gray-400" />
              <h4 className="font-bold text-gray-800 dark:text-gray-200">Aucun produit ne correspond à ces critères</h4>
              <p className="text-xs text-gray-500">Essayez de modifier vos budgets, d'effacer les mots clés ou de réinitialiser la catégorie.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setSelectedPrefecture("");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="px-4 py-2 mt-2 rounded-xl bg-[#009460] text-white font-bold text-xs hover:bg-[#007f50] cursor-pointer"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="group bg-white dark:bg-zinc-900 text-left rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-[#009460]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Photo with hover effect */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-zinc-950">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300"
                    />
                    {product.promotionPrice && product.promotionPrice > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-[#CE1126] text-white text-[9px] font-black tracking-widest uppercase p-1 rounded-md">
                        En Promotion
                      </span>
                    )}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product.id);
                        }}
                        className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-950/90 text-gray-700 dark:text-gray-300 hover:text-red-500 shadow"
                      >
                        <Heart size={13} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
                      </button>
                      
                      {/* Compare toggle button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(product.id);
                        }}
                        className={`p-1.5 rounded-full shadow ${
                          comparedIds.includes(product.id)
                            ? "bg-yellow-400 text-black"
                            : "bg-white/90 dark:bg-zinc-950/90 text-gray-700 dark:text-gray-300 hover:text-yellow-500"
                        }`}
                        title="Comparer"
                      >
                        <Scale size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Body data */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <span>{product.category}</span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="text-red-500 dark:text-red-400 font-bold">Stock critique : {product.stock}</span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#009460] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                        <span>Boutique:</span>
                        <strong className="text-gray-800 dark:text-gray-200 font-bold truncate max-w-[124px]">{product.sellerName}</strong>
                      </div>
                    </div>

                    <div className="border-t border-gray-50 dark:border-zinc-800/50 pt-3 flex items-end justify-between">
                      <div>
                        {product.promotionPrice ? (
                          <div className="leading-none">
                            <span className="text-[9px] line-through text-gray-400 font-mono mr-1 block leading-tight">
                              {product.price.toLocaleString()}
                            </span>
                            <span className="text-sm font-black text-[#CE1126] font-mono leading-none">
                              {product.promotionPrice.toLocaleString()} <span className="text-[10px]">GNF</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-gray-950 dark:text-white font-mono leading-none">
                            {product.price.toLocaleString()} <span className="text-[10px]">GNF</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="px-3 py-1.5 bg-[#009460] hover:bg-green-700 hover:scale-102 transition-all text-white font-black text-xs rounded-xl cursor-pointer"
                      >
                        Mettre +
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
