import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, TrendingUp, DollarSign, Package, ShoppingCart, Sparkles, RefreshCw, BarChart2, AlertCircle } from "lucide-react";
import { Product, PRODUCT_CATEGORIES } from "../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

interface SellerDashboardViewProps {
  sellerId: string;
  products: Product[];
  onAddProduct: (prod: Omit<Product, "id" | "sellerId" | "sellerName" | "rating" | "ratingsCount" | "createdAt">) => void;
  onDeleteProduct: (prodId: string) => void;
  onUpdateStock: (prodId: string, newStock: number) => void;
}

export default function SellerDashboardView({
  sellerId,
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateStock,
}: SellerDashboardViewProps) {
  // Filter seller's products
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Électronique");
  const [imageUrl, setImageUrl] = useState("");

  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastData, setForecastData] = useState<{ forecastText: string; criticalStockIds: string[]; estimatedGrowthPercent: number } | null>(null);

  // Suggested price range by IA helper
  const [priceHelperLoading, setPriceHelperLoading] = useState(false);
  const [priceHelperText, setPriceHelperText] = useState("");

  // Load forecasting on load
  const loadForecastAnalysis = async () => {
    setForecastLoading(true);
    try {
      const mockSales = [
        { month: "Janvier", sales: 12 },
        { month: "Février", sales: 19 },
        { month: "Mars", sales: 15 },
        { month: "Avril", sales: 27 },
        { month: "Mai", sales: 34 }
      ];
      const response = await fetch("/api/ai/sales-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesHistory: mockSales,
          catalogMini: sellerProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock, category: p.category }))
        })
      });
      if (response.ok) {
        const data = await response.json();
        setForecastData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (sellerProducts.length > 0) {
      loadForecastAnalysis();
    }
  }, [products]);

  // Request price suggestion dynamically
  const fetchPriceAdvice = async () => {
    if (!name) return;
    setPriceHelperLoading(true);
    try {
      const response = await fetch("/api/ai/price-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name, category, description })
      });
      if (response.ok) {
        const data = await response.json();
        setPriceHelperText(`Estimation conseillée : ${data.suggestedMinPrice.toLocaleString()} - ${data.suggestedMaxPrice.toLocaleString()} GNF. Note: ${data.reasoning}`);
      }
    } catch (error) {
      setPriceHelperText("Erreur lors de la suggestion de prix.");
    } finally {
      setPriceHelperLoading(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !imageUrl) return;

    onAddProduct({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      imageUrl,
    });

    // Clear form
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setPriceHelperText("");
  };

  // Stats calculation
  const totalItems = sellerProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = sellerProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

  const mockRevenueHistory = [
    { label: "Semaine 1", Rev: 1200000 },
    { label: "Semaine 2", Rev: 1850000 },
    { label: "Semaine 3", Rev: 2400000 },
    { label: "Semaine 4", Rev: 4100000 }
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="border-b border-gray-150 dark:border-gray-800 pb-5">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
          <Package className="text-[#009460]" size={22} />
          <span>Tableau de Bord Vendeur Pro</span>
        </h1>
        <p className="text-xs text-gray-500 font-mono">Pilotez votre commerce et analysez vos stocks grâce aux prévisions d'intelligence artificielle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-850 flex items-center gap-4 text-left">
          <div className="p-3 bg-[#009460]/10 rounded-xl text-[#009460]">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500">Valeur Totale du Stock</span>
            <p className="text-sm font-black font-mono text-gray-900 dark:text-white mt-0.5">{totalValue.toLocaleString()} GNF</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-850 flex items-center gap-4 text-left">
          <div className="p-3 bg-[#CE1126]/10 rounded-xl text-[#CE1126]">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500">Références en vitrine</span>
            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">{sellerProducts.length} articles</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-850 flex items-center gap-4 text-left">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-950/20 rounded-xl text-yellow-600">
            <ShoppingCart size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500">Unités Physiques Disponibles</span>
            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">{totalItems} unités</p>
          </div>
        </div>
      </div>

      {/* 2 Column Content layout: Add Product + Real-time AI Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Submitting form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 space-y-4 text-left text-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white pb-2 border-b">Ajouter un Produit</h3>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Nom du produit</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sac de Riz de Forecariah premium"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={fetchPriceAdvice}
                  className="px-2.5 bg-yellow-450 hover:bg-yellow-500 rounded-xl text-xs font-bold text-white shrink-0 flex items-center gap-1"
                  title="Demander conseil de prix par IA"
                >
                  <Sparkles size={12} />
                  <span>Avis Prix</span>
                </button>
              </div>
              {priceHelperLoading && <p className="text-[10px] text-yellow-500 font-mono">Interrogation de l'estimateur de Guinée...</p>}
              {priceHelperText && (
                <div className="p-2 bg-amber-50 dark:bg-amber-950/25 text-amber-800 dark:text-amber-400 rounded-lg text-[10px] font-mono leading-relaxed border border-yellow-300/40">
                  {priceHelperText}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Stock Initial</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Ex: 100"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Prix public (GNF)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 80000"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Photo URL (Placeholders acceptés)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Lien d'image ou Unsplash"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-500">Description Commerciale</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spécifications, origine, délais d'expédition."
                rows={3}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#009460] hover:bg-green-700 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Publier l'annonce maintenant
            </button>
          </form>
        </div>

        {/* AI Forecasting Report */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 flex flex-col justify-between text-left text-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-500 shrink-0" size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Prévisions de Stock & Rapport de Ventes par IA</h3>
            </div>
            <button 
              onClick={loadForecastAnalysis}
              className="p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded text-gray-500"
              title="Rafraîchir l'analyse"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Revenue Chart */}
          <div className="h-44 bg-gray-50/50 dark:bg-zinc-950/20 p-2 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                <XAxis dataKey="label" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="Rev" stroke="#009460" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast textual analysis */}
          {forecastLoading ? (
            <div className="space-y-1.5 animate-pulse">
              <div className="h-3.5 bg-gray-200 dark:bg-zinc-800 rounded w-2/3" />
              <div className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-2 w-5/6 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
          ) : forecastData ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/10 dark:bg-zinc-950/30 rounded-xl border border-yellow-500/20 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="font-bold text-yellow-600 dark:text-yellow-400 block mb-1">Analyse du Conseiller IA Guinée :</span>
                "{forecastData.forecastText}"
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-emerald-400">
                <TrendingUp size={14} />
                <span>Croissance prévisionnelle estimée : +{forecastData.estimatedGrowthPercent}% pour le chalandise guinéen local.</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Ajoutez des produits pour initialiser les rapports d'analyse IA de prévision d'activités.</p>
          )}
        </div>

      </div>

      {/* Inventory Listings */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 text-left">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white pb-3 border-b mb-4">Votre Vitrine d'Articles ({sellerProducts.length})</h3>
        
        {sellerProducts.length === 0 ? (
          <p className="text-xs text-center text-gray-500 py-8">Aucun article publié. Remplissez le formulaire de gauche pour lister votre premier produit !</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-mono">
                  <th className="py-2.5">Visuel</th>
                  <th className="py-2.5">Nom de l'Article</th>
                  <th className="py-2.5 text-center">Stock Actuel</th>
                  <th className="py-2.5 text-right">Prix (GNF)</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellerProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-zinc-805">
                    <td className="py-2.5">
                      <img src={p.imageUrl} alt={p.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-lg border" />
                    </td>
                    <td className="py-2.5 font-bold text-gray-950 dark:text-white">{p.name}</td>
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 5))}
                          className="px-1.5 py-0.5 border rounded hover:bg-gray-100 dark:bg-zinc-800"
                        >
                          -5
                        </button>
                        <span className="font-bold underline">{p.stock}</span>
                        <button
                          onClick={() => onUpdateStock(p.id, p.stock + 10)}
                          className="px-1.5 py-0.5 border rounded hover:bg-gray-100 dark:bg-zinc-800"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-bold font-mono">{p.price.toLocaleString()} GNF</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1 px-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-lg shrink-0 cursor-pointer"
                        title="Supprimer l'article"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
