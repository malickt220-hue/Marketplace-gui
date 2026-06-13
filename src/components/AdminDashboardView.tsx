import React, { useState } from "react";
import { ShieldCheck, Users, ClipboardList, ShieldAlert, Sparkles, Check, CheckSquare, Trash, RefreshCw } from "lucide-react";
import { UserProfile, Product, AuditLog } from "../types";

interface AdminDashboardViewProps {
  usersList: UserProfile[];
  onApproveSeller: (userId: string) => void;
  products: Product[];
  onDeleteProduct: (productId: string) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, details: string) => void;
}

export default function AdminDashboardView({
  usersList,
  onApproveSeller,
  products,
  onDeleteProduct,
  auditLogs,
  onAddAuditLog,
}: AdminDashboardViewProps) {
  const [selectedTab, setSelectedTab] = useState<"sellers" | "products" | "logs" | "fraud">("sellers");
  
  // AI Fraud check state
  const [fraudLoading, setFraudLoading] = useState(false);
  const [targetProdId, setTargetProdId] = useState("");
  const [fraudReport, setFraudReport] = useState<{ riskScore: number; isSuspicious: boolean; warnings: string[]; details: string } | null>(null);

  const handleApprove = (userId: string, name: string) => {
    onApproveSeller(userId);
    onAddAuditLog("Approbation Vendeur", `Le vendeur ${name} (${userId}) a été approuvé officiellement par l'administrateur.`);
  };

  const handleDeclineProduct = (productId: string, name: string) => {
    onDeleteProduct(productId);
    onAddAuditLog("Refus Produit", `L'article "${name}" (${productId}) a été modéré et supprimé pour non-conformité.`);
  };

  const runFraudCheck = async (product: Product) => {
    setFraudLoading(true);
    setTargetProdId(product.id);
    try {
      const response = await fetch("/api/ai/fraud-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "product",
          entityData: {
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            seller: product.sellerName
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setFraudReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFraudLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="border-b border-gray-150 dark:border-gray-800 pb-5 text-left">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="text-[#CE1126]" size={22} />
          <span>Console d'Administration Nationale</span>
        </h1>
        <p className="text-xs text-gray-500 font-mono">Modération du catalogue Guinéen, vérification réglementaire et audit de sécurité</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedTab("sellers")}
          className={`px-4 py-3 border-b-2 transition-all ${
            selectedTab === "sellers"
              ? "border-[#CE1126] text-[#CE1126] dark:text-red-400 font-bold"
              : "border-transparent hover:text-gray-900"
          }`}
        >
          Validation Vendeurs ({usersList.filter(u => u.role === "seller" && !u.isApproved).length})
        </button>
        
        <button
          onClick={() => setSelectedTab("products")}
          className={`px-4 py-3 border-b-2 transition-all ${
            selectedTab === "products"
              ? "border-[#CE1126] text-[#CE1126] dark:text-red-400 font-bold"
              : "border-transparent hover:text-gray-900"
          }`}
        >
          Modération Produits ({products.length})
        </button>

        <button
          onClick={() => setSelectedTab("logs")}
          className={`px-4 py-3 border-b-2 transition-all ${
            selectedTab === "logs"
              ? "border-[#CE1126] text-[#CE1126] dark:text-red-400 font-bold"
              : "border-transparent hover:text-gray-900"
          }`}
        >
          Journal d'Audit ({auditLogs.length})
        </button>

        <button
          onClick={() => setSelectedTab("fraud")}
          className={`px-4 py-3 border-b-2 transition-all ${
            selectedTab === "fraud"
              ? "border-[#CE1126] text-[#CE1126] dark:text-red-400 font-bold"
              : "border-transparent hover:text-gray-900"
          }`}
        >
          Intelligence Fraude (IA)
        </button>
      </div>

      {/* Sellers validation list */}
      {selectedTab === "sellers" && (
        <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white border-b pb-3 mb-4">Vendeurs en attente d'approbation d'accès</h3>
          
          {usersList.filter(u => u.role === "seller" && !u.isApproved).length === 0 ? (
            <p className="text-xs text-mono text-center py-6 text-gray-500">Aucune demande d'approbation disponible. Tous les marchands guinéens sont certifiés.</p>
          ) : (
            <div className="space-y-4">
              {usersList.filter(u => u.role === "seller" && !u.isApproved).map(user => (
                <div key={user.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{user.name} ({user.email})</h4>
                    <p className="text-gray-500 mt-1"><strong>Magasin:</strong> {user.storeName || "Non renseigné"}</p>
                    <p className="text-gray-500 font-mono"><strong>Téléphone:</strong> {user.phone}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Inscrit le : {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(user.id, user.name)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-green-600 hover:opacity-90 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Approuver Vendeur pro
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Products moderation */}
      {selectedTab === "products" && (
        <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white border-b pb-3 mb-4">Modération active d'annonces de produits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-mono">
                  <th className="py-2.5">Image</th>
                  <th className="py-2.5">Nom de l'Annonce</th>
                  <th className="py-2.5">Catégorie</th>
                  <th className="py-2.5">Boutique</th>
                  <th className="py-2.5 text-right">Prix (GNF)</th>
                  <th className="py-2.5 text-right">Contrôles</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-zinc-805">
                    <td className="py-2.5">
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded object-cover border" />
                    </td>
                    <td className="py-2.5 font-bold text-gray-950 dark:text-white">{p.name}</td>
                    <td className="py-2.5">{p.category}</td>
                    <td className="py-2.5 text-gray-500 font-mono">{p.sellerName}</td>
                    <td className="py-2.5 text-right font-bold">{p.price.toLocaleString()} GNF</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeclineProduct(p.id, p.name)}
                        className="p-1 px-2.5 bg-red-100 text-[#CE1126] font-bold rounded hover:bg-red-200 transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Audit journal */}
      {selectedTab === "logs" && (
        <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white border-b pb-3 mb-4">Journal de traçabilité d'audit</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 border-l-2 border-red-500 bg-gray-55/40 dark:bg-zinc-950/20 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <span className="font-mono bg-red-500/10 px-2 py-0.5 rounded text-[#CE1126] font-bold text-[10px] uppercase align-middle mr-1.5">{log.action}</span>
                  <span className="text-gray-800 dark:text-gray-200">{log.details}</span>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-mono">
                  <span>Opérateur: {log.userName}</span><br />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fraud detection checking with Gemini AI */}
      {selectedTab === "fraud" && (
        <section className="p-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-6 text-left">
          <div className="flex items-center gap-2 border-b pb-2">
            <Sparkles className="text-yellow-500" size={18} />
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Détecteur de Risques & de Fraude par Modèle IA</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">Sélectionnez un produit de notre catalogue actif pour analyser sa description, son prix et sa localisation avec le modèle d'évaluation Gemini.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Products Selector */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {products.map(p => (
                <div
                  key={p.id}
                  onClick={() => runFraudCheck(p)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    targetProdId === p.id
                      ? "border-amber-400 bg-amber-500/10"
                      : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{p.name}</h4>
                    <span className="text-[10px] text-gray-400">Boutique : {p.sellerName}</span>
                  </div>
                  <span className="font-bold font-mono text-gray-700 dark:text-gray-300 shrink-0">{p.price.toLocaleString()} GNF</span>
                </div>
              ))}
            </div>

            {/* AI report result box */}
            <div className="p-5 rounded-2xl bg-zinc-950 dark:bg-black text-white border border-zinc-800 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider font-mono text-yellow-400 flex items-center gap-1.5">
                <ShieldAlert size={14} className="animate-pulse" />
                <span>Rapport Sécurité Guinée Pro IA</span>
              </h4>

              {fraudLoading ? (
                <div className="space-y-2 animate-pulse py-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/3" />
                  <div className="h-2.5 bg-zinc-800 rounded w-5/6" />
                  <div className="h-2 bg-zinc-800 rounded w-4/5" />
                </div>
              ) : fraudReport ? (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span>Score de Risque Détecté :</span>
                    <strong className={`px-2.5 py-1 rounded text-sm ${
                      fraudReport.riskScore > 40 ? "bg-red-950/50 text-red-400 border border-red-500/20" : "bg-green-950/50 text-green-400"
                    }`}>
                      {fraudReport.riskScore} / 100
                    </strong>
                  </div>
                  <p className="text-zinc-300 leading-relaxed italic">
                    "{fraudReport.details}"
                  </p>
                  {fraudReport.warnings && fraudReport.warnings.length > 0 && (
                    <div className="space-y-1 bg-zinc-900 p-3 rounded-xl border border-zinc-850">
                      <span className="font-bold text-red-400 block pb-1">Points de vigilance :</span>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                        {fraudReport.warnings.map((w, index) => (
                          <li key={index}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs text-center py-6">Veuillez sélectionner un article à gauche pour obtenir le diagnostic.</p>
              )}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
