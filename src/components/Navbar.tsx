import React from "react";
import { ShoppingCart, User, LogOut, Moon, Sun, MessageSquare, ShieldAlert, Store, AlertCircle } from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface NavbarProps {
  currentUser: UserProfile | null;
  onLogin: (role?: UserRole) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  cartCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedSellerId: (id: string | null) => void;
  unreadMessagesCount: number;
}

export default function Navbar({
  currentUser,
  onLogin,
  onLogout,
  darkMode,
  toggleDarkMode,
  cartCount,
  activeTab,
  setActiveTab,
  setSelectedSellerId,
  unreadMessagesCount
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200">
      {/* Guinea colors accent bar */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#CE1126]"></div> {/* Red */}
        <div className="h-full w-1/3 bg-[#FCD116]"></div> {/* Yellow */}
        <div className="h-full w-1/3 bg-[#009460]"></div> {/* Green */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div 
            onClick={() => {
              setActiveTab("home");
              setSelectedSellerId(null);
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#CE1126] via-[#FCD116] to-[#009460] text-white font-black text-xl shadow-md p-0.5">
              <div className="w-full h-full bg-zinc-900 dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 bg-clip-text text-transparent">G</span>
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-gray-950 dark:text-gray-50">
                Guinée <span className="text-[#009460] dark:text-[#00b073]">Market</span><span className="text-[#CE1126] font-semibold text-xs ml-1 uppercase border border-red-500/20 px-1 py-0.5 rounded">Pro</span>
              </span>
              <p className="hidden xs:block text-[9px] text-gray-500 font-mono tracking-widest uppercase">Commerce National Évolué</p>
            </div>
          </div>

          {/* Center navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => { setActiveTab("home"); setSelectedSellerId(null); }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "home"
                  ? "bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "catalog"
                  ? "bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              Catalogue
            </button>
            <button
              onClick={() => { setActiveTab("faq"); setSelectedSellerId(null); }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "faq"
                  ? "bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              Aide & FAQ
            </button>
            <button
              onClick={() => { setActiveTab("contact"); setSelectedSellerId(null); }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "contact"
                  ? "bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Quick Demo-Swapper context notice */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 px-2 py-1 rounded-md text-amber-800 dark:text-amber-400 font-mono">
              <AlertCircle size={12} className="shrink-0" />
              <span>Simulateur Actif</span>
            </div>

            {/* Dark mode switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              title="Changer de thème"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Chat discussions shortcut */}
            {currentUser && (
              <button
                onClick={() => { setActiveTab("chat"); setSelectedSellerId(null); }}
                className={`relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors ${
                  activeTab === "chat" ? "bg-gray-100 dark:bg-zinc-900" : ""
                }`}
                title="Messages"
              >
                <MessageSquare size={18} />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#CE1126] text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart badge icon */}
            <button
              onClick={() => { setActiveTab("cart"); setSelectedSellerId(null); }}
              className={`relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors ${
                activeTab === "cart" ? "bg-gray-100 dark:bg-zinc-900" : ""
              }`}
              title="Votre Panier"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#009460] text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Role Quick-Access Swapper or Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-gray-200 dark:border-gray-800">
                <div 
                  onClick={() => {
                    setActiveTab("auth");
                  }}
                  className="hidden sm:flex flex-col text-right cursor-pointer hover:opacity-80 transition-opacity"
                  title="Mon Profil & Compte"
                >
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-widest flex items-center justify-end gap-1">
                    {currentUser.role === UserRole.ADMIN && <ShieldAlert size={10} className="text-[#CE1126]" />}
                    {currentUser.role === UserRole.SELLER && <Store size={10} className="text-[#009460]" />}
                    {currentUser.role}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div 
                    onClick={() => setActiveTab("auth")}
                    className="shrink-0 w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-zinc-900 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    title="Mon Profil"
                  >
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  
                  {/* Dashboard link according to role */}
                  {currentUser.role === UserRole.SELLER && (
                    <button
                      onClick={() => setActiveTab("seller-dashboard")}
                      className={`text-xs px-2 py-1 hidden sm:block font-medium rounded border border-[#009460]/20 hover:bg-[#009460]/5 text-[#009460] dark:text-[#22c55e]`}
                    >
                      Boutique Pro
                    </button>
                  )}
                  {currentUser.role === UserRole.ADMIN && (
                    <button
                      onClick={() => setActiveTab("admin-dashboard")}
                      className={`text-xs px-2 py-1 hidden sm:block font-medium rounded border border-[#CE1126]/20 hover:bg-[#CE1126]/5 text-[#CE1126] dark:text-red-400`}
                    >
                      Console Admin
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Se Déconnecter"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("auth")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#009460] hover:bg-green-700 transition-all cursor-pointer shadow-sm shadow-green-500/10"
                >
                  <User size={13} />
                  <span>Se connecter</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sub navigation for categories */}
      <div className="bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 overflow-x-auto scrollbar-none flex items-center gap-5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-300 shrink-0">Boutiques Express :</span>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">Tout Voir</a>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">⚡ Promotions Chaudes</a>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">📍 Conakry Direct</a>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">☕ Café Ziama Bio</a>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">💊 Parapharmacy</a>
          <a onClick={() => { setActiveTab("catalog"); setSelectedSellerId(null); }} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors shrink-0">🏗️ Matériaux de Chantier</a>
        </div>
      </div>
    </header>
  );
}
