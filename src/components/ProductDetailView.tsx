import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, Truck, Scale, Sparkles, MessageSquare, Plus, Minus, ArrowLeft, Heart, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Product, Review } from "../types";

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  reviews: Review[];
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onContactSeller: (sellerId: string, sellerName: string) => void;
  onSellerClick: (sellerId: string) => void;
}

export default function ProductDetailView({
  product,
  onBack,
  onAddToCart,
  favorites,
  onToggleFavorite,
  reviews,
  onAddReview,
  onContactSeller,
  onSellerClick,
}: ProductDetailViewProps) {
  const [qty, setQty] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // AI pricing suggestion state
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiPriceRange, setAiPriceRange] = useState<{ suggestedMinPrice: number; suggestedMaxPrice: number; reasoning: string } | null>(null);

  // Load AI price recommendations in real-time in GNF
  useEffect(() => {
    async function loadAiPriceSuggestion() {
      setAiPriceLoading(true);
      try {
        const response = await fetch("/api/ai/price-suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: product.name,
            description: product.description,
            category: product.category,
          })
        });
        if (response.ok) {
          const data = await response.json();
          setAiPriceRange(data);
        }
      } catch (err) {
        console.error("Failed to load AI pricing advice:", err);
      } finally {
        setAiPriceLoading(false);
      }
    }
    loadAiPriceSuggestion();
  }, [product]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingReview(true);
    setTimeout(() => {
      onAddReview(product.id, ratingInput, commentInput);
      setCommentInput("");
      setSubmittingReview(false);
    }, 400);
  };

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating = productReviews.length > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#009460] hover:underline cursor-pointer border border-[#009460]/20 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900"
        >
          <ArrowLeft size={14} />
          <span>Retour au catalogue</span>
        </button>
      </div>

      {/* Main product box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 md:p-8 shadow-sm">
        
        {/* Left Side: Photo with indicators */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-gray-800">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.promotionPrice && product.promotionPrice > 0 && (
              <span className="absolute top-3 left-3 bg-[#CE1126] text-white text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-lg">
                Super Promotion Actonnelle
              </span>
            )}
            <button
              onClick={() => onToggleFavorite(product.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-950/90 text-gray-700 dark:text-gray-300 hover:text-red-500 shadow-md"
            >
              <Heart size={16} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#009460]/20 bg-emerald-50/20 text-[#009460] text-xs font-mono">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Paiement à la livraison ou dépôt Mobile Money protégé par Guinée Market Confiance.</span>
          </div>
        </div>

        {/* Right Side: details and checkout simulation */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#009460]/10 border border-[#009460]/20 text-[#009460] dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                {product.category}
              </span>
              <span className="text-gray-400 font-mono text-[11px]">Réf. {product.id}</span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Seller profile link */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Boutique :</span>
              <button 
                onClick={() => onSellerClick(product.sellerId)} 
                className="font-bold text-gray-800 dark:text-gray-200 hover:text-[#009460] underline flex items-center gap-0.5"
              >
                <span>{product.sellerName}</span>
                <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Stars rating */}
            <div className="flex items-center gap-1.5 py-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= parseFloat(avgRating) ? "fill-current" : "text-gray-200 dark:text-gray-800"}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-250">{avgRating} / 5.0</span>
              <span className="text-xs text-gray-400">({productReviews.length} avis clients)</span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-850" />

          {/* Pricing GNF */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">Tarification d'échange</span>
            <div className="flex items-center gap-3">
              {product.promotionPrice ? (
                <>
                  <span className="text-2xl font-black text-[#CE1126] font-mono">
                    {product.promotionPrice.toLocaleString()} GNF
                  </span>
                  <span className="text-xs line-through text-gray-400 font-mono">
                    {product.price.toLocaleString()} GNF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-black text-gray-950 dark:text-white font-mono">
                  {product.price.toLocaleString()} GNF
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-sans">Taxe de transaction nationale incluse, frais de port non inclus.</p>
          </div>

          {/* Interactive AI Pricing advisor */}
          <div className="p-4 rounded-2xl bg-amber-55/10 dark:bg-zinc-950/30 border border-yellow-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 font-mono">
                <Sparkles size={14} className="animate-pulse" />
                <span>Estimateur Conseiller IA Guinée :</span>
              </span>
              <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500">MOTEUR GEMINI</span>
            </div>

            {aiPriceLoading ? (
              <div className="space-y-1.5 animate-pulse pt-1">
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-2.5 bg-gray-200 dark:bg-zinc-800 rounded w-5/6" />
              </div>
            ) : aiPriceRange ? (
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <p className="font-mono text-gray-900 dark:text-white font-semibold">
                  Gamme de prix conseillée dans les préfectures : <span className="text-green-600 dark:text-green-400">{aiPriceRange.suggestedMinPrice.toLocaleString()}</span> ~ <span className="text-green-600 dark:text-green-400">{aiPriceRange.suggestedMaxPrice.toLocaleString()} GNF</span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic pr-2">
                  "{aiPriceRange.reasoning}"
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">Données comparatrices inaccessibles. Demandez au support.</p>
            )}
          </div>

          {/* Quantity selector and Cart button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden self-start">
              <button
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 transition-colors cursor-pointer"
              >
                <Minus size={12} />
              </button>
              <span className="px-4 py-1.5 text-xs font-black font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950">
                {qty}
              </span>
              <button
                onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 transition-colors cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="flex-1 flex gap-2">
              <button
                onClick={() => onAddToCart(product, qty)}
                className="flex-1 py-3.5 bg-[#009460] hover:bg-green-700 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
              >
                <ShoppingBag size={14} />
                <span>Ajouter {(qty * (product.promotionPrice || product.price)).toLocaleString()} GNF</span>
              </button>
              
              <button
                onClick={() => onContactSeller(product.sellerId, product.sellerName)}
                className="p-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                title="Contacter le Vendeur par Chat"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Description details */}
          <div className="space-y-1 pt-2 border-t border-gray-50 dark:border-zinc-800/50">
            <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">Fiche Technique & Description</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

        </div>

      </div>

      {/* Review area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Review input form */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-5 self-start space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Laisser un avis certifié</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs text-left">
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Note d'évaluation</label>
              <div className="flex gap-1.5 text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRatingInput(s)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={20}
                      className={s <= ratingInput ? "fill-current" : "text-gray-250 dark:text-gray-800"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 mt-1">
              <label className="font-bold text-gray-500">Votre évaluation (critiques honnêtes)</label>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Décrivez votre expérience d'achat. Qualité, livraison rapide à Conakry ? Commande conforme ?"
                rows={4}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-850 p-2.5 rounded-xl text-xs outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 rounded-xl bg-[#009460] hover:bg-[#007f50] text-[#fff] font-bold cursor-pointer transition-colors"
            >
              {submittingReview ? "Envoi..." : "Publier l'avis certifié"}
            </button>
          </form>
        </div>

        {/* Existing product reviews listing */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Avis de Consommateurs ({productReviews.length})</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {productReviews.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-6">Aucun avis publié pour le moment. Soyez le premier à évaluer ce produit !</p>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-gray-850 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white font-mono">{rev.userName}</span>
                    <span className="text-[10px] text-gray-500">{new Date(rev.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={s <= rev.rating ? "fill-current" : "text-gray-250 dark:text-gray-800"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
