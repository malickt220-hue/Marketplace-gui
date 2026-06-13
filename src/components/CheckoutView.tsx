import React, { useState } from "react";
import { CreditCard, Truck, Wallet, ShieldCheck, ShoppingBag, ArrowLeft, Loader2, FileDown, CheckCircle2 } from "lucide-react";
import { Order, OrderItem, UserProfile, GUINEA_PREFECTURES } from "../types";
import { printReceipt } from "../utils/receipt";

interface CheckoutViewProps {
  cartItems: Array<{ id: string; name: string; price: number; quantity: number }>;
  currentUser: UserProfile | null;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  setActiveTab: (tab: string) => void;
}

export default function CheckoutView({
  cartItems,
  currentUser,
  onClearCart,
  onPlaceOrder,
  setActiveTab,
}: CheckoutViewProps) {
  const [buyerName, setBuyerName] = useState(currentUser?.name || "");
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || "");
  const [selectedPrefecture, setSelectedPrefecture] = useState("Conakry");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"orange_money" | "momo" | "card" | "cod">("orange_money");
  
  // Simulated steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsTriggered, setSmsTriggered] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    // Simulated Orange Money / Mobile Money OTP prompt sequence
    setTimeout(() => {
      if (paymentMethod === "orange_money" || paymentMethod === "momo") {
        setSmsTriggered(true);
      }
      
      const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
        buyerId: currentUser?.id || "guest_buyer",
        buyerName,
        buyerPhone,
        sellerId: "seller_kindia_agri", // Simulating primary merchant route
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        status: "pending",
        deliveryAddress: `${selectedPrefecture} - ${detailedAddress}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTimeout(() => {
        setIsProcessing(false);
        setCompletedOrder(newOrder);
        onPlaceOrder(newOrder); // pass to app general logs & Firestore mock
        onClearCart();
      }, 2000);

    }, 1500);

  };

  const handleDownloadInvoice = () => {
    if (completedOrder) {
      printReceipt(completedOrder);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 text-center space-y-6 shadow-md animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#009460]">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-950 dark:text-white">Paiement Reçu avec Succès !</h2>
          <p className="text-xs text-gray-400 font-mono">ID Commande: {completedOrder.id}</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-gray-850 text-xs text-left max-w-md mx-auto space-y-3">
          <h4 className="font-bold border-b pb-2">Récapitulatif de Livraison :</h4>
          <p><strong>Destinataire :</strong> {completedOrder.buyerName}</p>
          <p><strong>Téléphone :</strong> {completedOrder.buyerPhone}</p>
          <p><strong>Adresse d'acheminement :</strong> {completedOrder.deliveryAddress}</p>
          <p><strong>Méthode de paiement :</strong> {completedOrder.paymentMethod.toUpperCase()}</p>
          <p className="font-bold"><strong>Total Débité :</strong> {completedOrder.totalAmount.toLocaleString()} GNF</p>
          
          <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200/40 text-amber-800 dark:text-amber-400 text-[10px] uppercase font-mono">
            {completedOrder.paymentMethod === "orange_money" || completedOrder.paymentMethod === "momo" ? (
              <span>Orange Money Alert: SMS de facture envoyé au {completedOrder.buyerPhone}</span>
            ) : (
              <span>Facturation validée avec succès. Paiement sécurisé d'échange actif.</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={handleDownloadInvoice}
            className="px-6 py-3 rounded-xl bg-[#009460] hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileDown size={14} />
            <span>Imprimer / Facture PDF</span>
          </button>
          
          <button
            onClick={() => setActiveTab("home")}
            className="px-6 py-3 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 text-xs font-semibold"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Return link */}
      <div>
        <button
          onClick={() => setActiveTab("cart")}
          className="inline-flex items-center gap-1 text-xs font-semibold hover:underline text-[#009460]"
        >
          <ArrowLeft size={14} />
          Retour au panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Form Details */}
        <form onSubmit={handleSubmitCheckout} className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 md:p-8 space-y-6 text-left text-xs">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Formulaire de Livraison & Clôture</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Nom Complet du Destinataire</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ex: Amadou Diallo"
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-xs outline-none"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Téléphone de Contact (Fonds Mobiles)</label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="Ex: +224 620 11 22 33"
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-xs outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-500">Préfecture Destination</label>
              <select
                value={selectedPrefecture}
                onChange={(e) => setSelectedPrefecture(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-xs outline-none"
              >
                {GUINEA_PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-gray-500">Adresse Précise (Quartier, Secteur, Repère)</label>
              <input
                type="text"
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                placeholder="Ex: Dixinn Terrasse, près de la corniche"
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-xs outline-none"
                required
              />
            </div>
          </div>

          <hr className="border-gray-55 dark:border-gray-800" />

          {/* Payment gateway selection */}
          <div className="space-y-3">
            <label className="font-bold text-gray-650 dark:text-gray-400 block uppercase tracking-wider text-[11px] font-mono">Portefeuille de Règlement électronique</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  id: "orange_money",
                  title: "Orange Money",
                  sub: "Guinée Code *144#",
                  color: "border-orange-500/20 bg-orange-50/5 text-orange-650"
                },
                {
                  id: "momo",
                  title: "Mobile Money",
                  sub: "MTN Code *146#",
                  color: "border-yellow-500/20 bg-yellow-50/5 text-yellow-600"
                },
                {
                  id: "card",
                  title: "Carte Bancaire",
                  sub: "Visa / Mastercard",
                  color: "border-blue-500/20 bg-blue-50/5 text-blue-650"
                },
                {
                  id: "cod",
                  title: "À la Livraison",
                  sub: "Espèces à Conakry",
                  color: "border-green-500/20 bg-green-50/5 text-green-650"
                }
              ].map((gateway) => (
                <div
                  key={gateway.id}
                  onClick={() => setPaymentMethod(gateway.id as any)}
                  className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                    paymentMethod === gateway.id
                      ? "ring-2 ring-[#009460] bg-gray-50 dark:bg-zinc-950 shadow-sm"
                      : "bg-white dark:bg-zinc-900 border-gray-150 dark:border-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="font-bold block text-gray-900 dark:text-white">{gateway.title}</span>
                  <span className="text-[10px] text-gray-500 mt-1 block font-mono">{gateway.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated prompt message for Orange Money / momo */}
          {(paymentMethod === "orange_money" || paymentMethod === "momo") && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
              <strong>Simulateur actif :</strong> Un SMS de confirmation push vous parviendra au <strong>{buyerPhone || "(Veuiilez saisir votre téléphone)"}</strong> pour simuler la validation du code PIN secret.
            </div>
          )}

          {/* Progress bar or Place click */}
          <button
            type="submit"
            disabled={isProcessing || cartItems.length === 0}
            className="w-full py-4 text-xs font-bold text-white bg-[#009460] hover:bg-green-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Réglement électronique en cours par API...</span>
              </>
            ) : (
              <span>Finaliser et Débiter {totalAmount.toLocaleString()} GNF</span>
            )}
          </button>
        </form>

        {/* Right Side: basket overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 self-start space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white border-b pb-2">Résumé du panier</h3>
          <div className="space-y-3 text-xs max-h-56 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-semibold text-gray-950 dark:text-white truncate max-w-[140px]">{item.name}</h4>
                  <span className="text-gray-400 text-[10px] font-mono">Qté: {item.quantity}</span>
                </div>
                <span className="font-bold font-mono text-gray-800 dark:text-gray-250">{(item.price * item.quantity).toLocaleString()} GNF</span>
              </div>
            ))}
          </div>

          <hr className="border-gray-50 dark:border-zinc-805" />

          {/* Pricing breakdowns */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Sous-total</span>
              <span className="font-mono">{totalAmount.toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Frais de livraison</span>
              <span className="text-[#009460] font-bold">Gratuit</span>
            </div>
            <div className="flex justify-between text-gray-950 dark:text-white font-bold text-sm pt-2 border-t">
              <span>Total à débiter</span>
              <span className="font-mono text-[#009460] font-black">{totalAmount.toLocaleString()} GNF</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
