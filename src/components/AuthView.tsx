import React, { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Store, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Key, 
  AlertTriangle,
  Check,
  Edit2,
  FileCheck
} from "lucide-react";
import { UserRole, UserProfile, GUINEA_PREFECTURES } from "../types";
import { 
  auth, 
  db, 
  loginWithGoogle, 
  handleFirestoreError, 
  OperationType 
} from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";

interface AuthViewProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  onLogout: () => void;
  // This helps when transitioning tabs from external views
  setActiveTab: (tab: string) => void;
  usersList: UserProfile[];
  setUsersList: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export default function AuthView({
  currentUser,
  setCurrentUser,
  onLogout,
  setActiveTab,
  usersList,
  setUsersList
}: AuthViewProps) {
  // Auth navigation: "login" or "register"
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Registration and Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [selectedPrefecture, setSelectedPrefecture] = useState("Conakry");

  // Merchant optional store details
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  // Post-Google login modal for setting up role/phone for new google users
  const [isGoogleSignupIncomplete, setIsGoogleSignupIncomplete] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState<any>(null);

  // States for UX
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Edit states (when logged in)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedPrefecture, setEditedPrefecture] = useState("");
  const [editedStoreName, setEditedStoreName] = useState("");
  const [editedStoreDescription, setEditedStoreDescription] = useState("");
  const [editedStoreAddress, setEditedStoreAddress] = useState("");

  // Synchronize state once user is loaded
  useEffect(() => {
    if (currentUser) {
      setEditedName(currentUser.name || "");
      setEditedPhone(currentUser.phone || "");
      setEditedPrefecture(currentUser.storeAddress || "Conakry");
      setEditedStoreName(currentUser.storeName || "");
      setEditedStoreDescription(currentUser.storeDescription || "");
      setEditedStoreAddress(currentUser.storeAddress || "");
    }
  }, [currentUser]);

  // Handle standard registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Construct user profile
      const newProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        phone: phone || undefined,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        isApproved: role === UserRole.SELLER ? false : true, // Sellers require admin approval
        storeName: role === UserRole.SELLER ? storeName || `Boutique de ${name}` : undefined,
        storeDescription: role === UserRole.SELLER ? storeDescription : undefined,
        storeAddress: role === UserRole.SELLER ? `${storeAddress}, ${selectedPrefecture}` : selectedPrefecture,
        createdAt: new Date().toISOString()
      };

      // Write user details to Firestore
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      // Add to local state list to maintain dynamic updates
      setUsersList(prev => {
        if (!prev.some(u => u.id === newProfile.id)) {
          return [newProfile, ...prev];
        }
        return prev;
      });

      setCurrentUser(newProfile);
      setSuccessMsg("Félicitations ! Votre compte Guinée Market Pro a été créé avec succès.");
      
      // Auto redirect to home or seller dashboard after short delay
      setTimeout(() => {
        if (newProfile.role === UserRole.SELLER) {
          setActiveTab("seller-dashboard");
        } else {
          setActiveTab("home");
        }
      }, 1500);

    } catch (err: any) {
      console.error("Registration Error: ", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Cette adresse email est déjà enregistrée en Guinée.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setErrorMsg(err.message || "Erreur lors de la création du compte.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle standard connection
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Veuillez saisir votre e-mail et votre mot de passe.");
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Retrieve profile from Firestore
      const userRef = doc(db, "users", uid);
      let profileDoc;
      try {
        profileDoc = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      }

      if (profileDoc && profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;
        setCurrentUser(profile);
        setSuccessMsg(`Bon retour, ${profile.name} !`);
        
        setTimeout(() => {
          if (profile.role === UserRole.SELLER) {
            setActiveTab("seller-dashboard");
          } else if (profile.role === UserRole.ADMIN) {
            setActiveTab("admin-dashboard");
          } else {
            setActiveTab("home");
          }
        }, 1200);
      } else {
        // Fallback profile if Firestore is blank
        const fallbackProfile: UserProfile = {
          id: uid,
          name: userCredential.user.displayName || "Utilisateur Guinéen",
          email: userCredential.user.email || email,
          role: UserRole.BUYER,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userRef, fallbackProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
        setCurrentUser(fallbackProfile);
      }
    } catch (err: any) {
      console.error("Login Error: ", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg("Identifiants incorrects. Veuillez réessayer.");
      } else {
        setErrorMsg(err.message || "Erreur de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google popup auth
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await loginWithGoogle();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user already exists in custom profiles
      const userRef = doc(db, "users", user.uid);
      const profileDoc = await getDoc(userRef);

      if (profileDoc.exists()) {
        // Log in directly
        const profile = profileDoc.data() as UserProfile;
        setCurrentUser(profile);
        setSuccessMsg(`Connexion Réussie (Google) : Bienvenue ${profile.name} !`);
        
        setTimeout(() => {
          if (profile.role === UserRole.SELLER) {
            setActiveTab("seller-dashboard");
          } else if (profile.role === UserRole.ADMIN) {
            setActiveTab("admin-dashboard");
          } else {
            setActiveTab("home");
          }
        }, 1200);
      } else {
        // New user from Google! Must configure profile details before finalize
        setTempGoogleUser(user);
        setIsGoogleSignupIncomplete(true);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrorMsg("La connexion avec votre compte Google a été interrompue.");
    } finally {
      setLoading(false);
    }
  };

  // Complete Google Registration with role & phone
  const handleCompleteGoogleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempGoogleUser) return;

    setLoading(true);
    try {
      const newProfile: UserProfile = {
        id: tempGoogleUser.uid,
        name: tempGoogleUser.displayName || "Client Google",
        email: tempGoogleUser.email || "",
        phone: phone || undefined,
        role,
        avatarUrl: tempGoogleUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(tempGoogleUser.uid)}`,
        isApproved: role === UserRole.SELLER ? false : true,
        storeName: role === UserRole.SELLER ? storeName || `Boutique de ${tempGoogleUser.displayName}` : undefined,
        storeDescription: role === UserRole.SELLER ? storeDescription : undefined,
        storeAddress: role === UserRole.SELLER ? `${storeAddress}, ${selectedPrefecture}` : selectedPrefecture,
        createdAt: new Date().toISOString()
      };

      const userRef = doc(db, "users", tempGoogleUser.uid);
      await setDoc(userRef, newProfile);

      setUsersList(prev => {
        if (!prev.some(u => u.id === newProfile.id)) {
          return [newProfile, ...prev];
        }
        return prev;
      });

      setCurrentUser(newProfile);
      setIsGoogleSignupIncomplete(false);
      setTempGoogleUser(null);
      setSuccessMsg("Votre profil a été finalisé avec succès !");

      setTimeout(() => {
        if (newProfile.role === UserRole.SELLER) {
          setActiveTab("seller-dashboard");
        } else {
          setActiveTab("home");
        }
      }, 1500);

    } catch (err: any) {
      console.error("Failed to complete google signup:", err);
      setErrorMsg("Une erreur a eu lieu lors de l'enregistrement de vos informations de profil.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Account Emulators for reviewers and demo tests
  const handleDemoSignIn = (roleType: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let mockProfile: UserProfile;

      if (roleType === UserRole.SELLER) {
        mockProfile = {
          id: "seller_kindia_agri",
          name: "Mamadou Sylla (Syli Agro)",
          email: "sylla.agri@gmail.com",
          phone: "+224622114455",
          role: UserRole.SELLER,
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          isApproved: true,
          storeName: "Syli Agro Kindia",
          storeDescription: "Grossiste de mangues certifiées et café sauvage bio du mont Ziama.",
          storeAddress: "Quartier Tafory, Kindia, Guinée",
          createdAt: new Date().toISOString()
        };
      } else if (roleType === UserRole.ADMIN) {
        mockProfile = {
          id: "admin_superuser",
          name: "Commandant Soumah (Sûreté Numérique)",
          email: "soumah.digital@gouv.gn",
          phone: "+224620001020",
          role: UserRole.ADMIN,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          isApproved: true,
          createdAt: new Date().toISOString()
        };
      } else {
        mockProfile = {
          id: "buyer_conakry_1",
          name: "Alpha Oumar Diallo",
          email: "alpha.diallo@gmail.com",
          phone: "+224620112233",
          role: UserRole.BUYER,
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
          isApproved: true,
          storeAddress: "Kaloum, Conakry, Guinée",
          createdAt: new Date().toISOString()
        };
      }

      // Add to user list mock register
      setUsersList(prev => {
        if (!prev.some(u => u.id === mockProfile.id)) {
          return [mockProfile, ...prev];
        }
        return prev;
      });

      setCurrentUser(mockProfile);
      setSuccessMsg(`Simulateur : Connecté en tant que ${mockProfile.name} (${mockProfile.role.toUpperCase()})`);

      setTimeout(() => {
        if (mockProfile.role === UserRole.SELLER) {
          setActiveTab("seller-dashboard");
        } else if (mockProfile.role === UserRole.ADMIN) {
          setActiveTab("admin-dashboard");
        } else {
          setActiveTab("home");
        }
      }, 1000);
    } catch (err) {
      setErrorMsg("Échec de la simulation.");
    } finally {
      setLoading(false);
    }
  };

  // Update profile details dynamically on Firestore / State
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const updatedData: Partial<UserProfile> = {
      name: editedName,
      phone: editedPhone
    };

    if (currentUser.role === UserRole.SELLER) {
      updatedData.storeName = editedStoreName;
      updatedData.storeDescription = editedStoreDescription;
      updatedData.storeAddress = editedStoreAddress;
    } else {
      updatedData.storeAddress = editedPrefecture; // standard user prefecture
    }

    try {
      const userRef = doc(db, "users", currentUser.id);
      try {
        await updateDoc(userRef, updatedData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
      }

      const freshProfile: UserProfile = {
        ...currentUser,
        ...updatedData
      };

      setCurrentUser(freshProfile);
      
      // Update local state list to keep sync
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? freshProfile : u));

      setSuccessMsg("Votre profil personnel a été mise à jour avec succès.");
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setErrorMsg("Une erreur s'est produite lors de la mise à jour sur Firestore.");
    } finally {
      setLoading(false);
    }
  };

  // Standard Logout
  const handleLogoutAction = async () => {
    try {
      await signOut(auth);
      onLogout();
      setSuccessMsg("Déconnexion sécurisée.");
    } catch (err) {
      onLogout(); // local logout anyway
    }
  };

  // --- RENDERING VIEWS ---

  // Google Initial complete details form (Modal style)
  if (isGoogleSignupIncomplete) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 text-left space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#FCD116]/10 flex items-center justify-center text-[#FCD116]">
            <Sparkles size={24} />
          </div>
          <h2 className="text-lg font-black text-gray-950 dark:text-white">Finaliser votre inscription</h2>
          <p className="text-xs text-gray-500">Pour continuer sur Guinée Market Pro, veuillez choisir votre rôle et fournir votre numéro de contact.</p>
        </div>

        <form onSubmit={handleCompleteGoogleSignup} className="space-y-4 text-xs">
          {/* Role selection */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300">Quel rôle souhaitez-vous sur la plateforme ?</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.BUYER)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === UserRole.BUYER 
                    ? "border-[#009460] bg-[#009460]/5 text-[#009460] font-bold" 
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <User size={18} />
                <span>Acheteur (Client)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole(UserRole.SELLER)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === UserRole.SELLER 
                    ? "border-[#009460] bg-[#009460]/5 text-[#009460] font-bold" 
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Store size={18} />
                <span>Marchand (Vendeur)</span>
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="font-bold text-gray-500">Téléphone de contact Orignel (+224)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={14} />
              <input 
                type="tel" 
                placeholder="Ex: 622000011" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
                required 
              />
            </div>
          </div>

          {/* Seller fields */}
          {role === UserRole.SELLER && (
            <div className="p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-2xl border space-y-3">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <Store size={14} className="text-[#009460]" />
                <span>Détails de la Boutique</span>
              </h4>
              
              <div className="space-y-1">
                <label className="text-gray-500 font-bold block">Nom Commercial de la Boutique *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Coopérative Kakandé Fruits" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-bold block">Description d'activité *</label>
                <textarea 
                  placeholder="Ex: Vente en gros d'ananas de Friguiagbé et bananes de Coyah..." 
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-500 font-bold block">Adresse Physique *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Grand Marché, Boké" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-bold block">Zone administrative *</label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                  >
                    {GUINEA_PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#009460] hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? "Enregistrement en cours..." : "Finaliser et Rejoindre le Marché"}
          </button>
        </form>
      </div>
    );
  }

  // LOGGED IN: Profile & Account Manager space
  if (currentUser) {
    const isSeller = currentUser.role === UserRole.SELLER;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    return (
      <div className="max-w-4xl mx-auto space-y-6 text-left text-xs">
        {/* Banner with user's name */}
        <div className="relative p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden">
          {/* Background splash of Guinean flag */}
          <div className="absolute right-0 top-0 bottom-0 w-3 opacity-20 flex flex-col">
            <div className="bg-[#CE1126] flex-1"></div>
            <div className="bg-[#FCD116] flex-1"></div>
            <div className="bg-[#009460] flex-1"></div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center p-0.5 shrink-0">
              <img 
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.id)}`} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-950 dark:text-white leading-tight">{currentUser.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                  currentUser.role === UserRole.ADMIN 
                    ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30" 
                    : currentUser.role === UserRole.SELLER 
                      ? "bg-emerald-50 text-[#009460] dark:bg-emerald-950/20 dark:text-[#22c55e] border border-emerald-200/30" 
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/30"
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-gray-500 font-mono text-[10px]">{currentUser.email}</p>
              <p className="text-gray-400 font-sans text-[10px]">Membre inscrit depuis le {new Date(currentUser.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <Edit2 size={12} />
                <span>Modifier le Profil</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 text-gray-500 font-bold rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleLogoutAction}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <LogOut size={12} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>

        {/* Dynamic Success and Error feedback alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl text-emerald-800 dark:text-[#22c55e] flex items-center gap-2.5 font-sans">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-2xl text-red-800 dark:text-red-400 flex items-center gap-2.5 font-sans">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* PROFILE / EDIT MODULE */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-5">
            <h3 className="font-black text-gray-950 dark:text-gray-100 uppercase tracking-wider text-[11px] border-b pb-2 flex items-center gap-1.5">
              <User size={14} className="text-[#009460]" />
              <span>{isEditingProfile ? "Modifier mes informations" : "Informations personnelles"}</span>
            </h3>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Nom Complet *</label>
                    <input 
                      type="text" 
                      value={editedName} 
                      onChange={(e) => setEditedName(e.target.value)} 
                      className="w-full p-2.5 bg-gray-50 dark:bg-zinc-950 border rounded-xl outline-none"
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Téléphone de contact (+224)</label>
                    <input 
                      type="tel" 
                      value={editedPhone} 
                      onChange={(e) => setEditedPhone(e.target.value)} 
                      className="w-full p-2.5 bg-gray-50 dark:bg-zinc-950 border rounded-xl outline-none"
                    />
                  </div>
                </div>

                {!isSeller ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500">Préfecture principale de résidence</label>
                      <select 
                        value={editedPrefecture} 
                        onChange={(e) => setEditedPrefecture(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-zinc-950 border rounded-xl outline-none"
                      >
                        {GUINEA_PREFECTURES.map(pref => (
                          <option key={pref} value={pref}>{pref}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500">Adresse de Livraison standard</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Kaloum Boulbinet, Rue de la Paix" 
                        value={editedStoreAddress} 
                        onChange={(e) => setEditedStoreAddress(e.target.value)} 
                        className="w-full p-2.5 bg-gray-50 dark:bg-zinc-950 border rounded-xl outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 border border-dashed rounded-2xl space-y-3">
                    <h4 className="font-bold text-[#009460] flex items-center gap-1 text-[11px]">
                      <Store size={14} />
                      <span>Paramètres de la Boutique Marchande</span>
                    </h4>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-500">Nom de la Boutique *</label>
                      <input 
                        type="text" 
                        value={editedStoreName} 
                        onChange={(e) => setEditedStoreName(e.target.value)} 
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-500">Description commerciale *</label>
                      <textarea 
                        value={editedStoreDescription} 
                        onChange={(e) => setEditedStoreDescription(e.target.value)} 
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                        rows={3}
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-500">Adresse physique de l'établissement *</label>
                      <input 
                        type="text" 
                        value={editedStoreAddress} 
                        onChange={(e) => setEditedStoreAddress(e.target.value)} 
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none"
                        required 
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#009460] hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <FileCheck size={14} />
                  <span>{loading ? "Mise à jour en cours..." : "Sauvegarder les modifications"}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-gray-400 font-mono">Identité client</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 text-xs">{currentUser.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono">Adresse Email</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 text-xs">{currentUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-gray-400 font-mono">Téléphone de contact</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 text-xs">{currentUser.phone || "Non renseigné (+224)"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono">Zone principale</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 text-xs">{currentUser.storeAddress?.split(",").pop()?.trim() || "Toute la Guinée (Global)"}</p>
                  </div>
                </div>

                {isSeller && (
                  <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 rounded-2xl border space-y-2">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 text-[11px]">
                      <Store size={14} className="text-[#009460]" />
                      <span>Fiche Marchand Professionnelle</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1.5">
                      <p><strong className="text-gray-500">Nom de la Boutique:</strong> {currentUser.storeName || "Inconnu"}</p>
                      <p><strong className="text-gray-500">Adresse Locale:</strong> {currentUser.storeAddress || "Inconnu"}</p>
                      <p className="sm:col-span-2"><strong className="text-gray-500">Activité/Description:</strong> {currentUser.storeDescription || "Aucune description fournie"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STATUS MODULE / SIDE INFO */}
          <div className="space-y-6">
            {/* Approval and Verification Status Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 space-y-4">
              <h4 className="font-bold text-gray-950 dark:text-gray-200 text-[11px] uppercase tracking-wider">État de validation</h4>
              
              {isSeller ? (
                currentUser.isApproved ? (
                  <div className="p-4 rounded-2xl bg-[#009460]/10 border border-[#009460]/20 text-[#009460] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>Marchand Certifié de l'État</span>
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-sans">Votre boutique est active et vos transactions bénéficient d'un service d'encaissement et de protection à 100%.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/40 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <ShieldAlert size={16} className="text-amber-600" />
                      <span>En attente d'approbation</span>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-relaxed font-sans">Votre pièce d'identité et vos références de coopératives sont en cours de validation par la Sûreté Numérique de Conakry Kaloum.</p>
                  </div>
                )
              ) : isAdmin ? (
                <div className="p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Key size={16} className="text-red-600" />
                    <span>Administrateur National</span>
                  </div>
                  <p className="text-[10px] text-red-700 leading-relaxed font-sans">Accès complet à la modération du registre, vérification d'agrément, et audits de transaction monétaire.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#009460]/10 border border-[#009460]/20 text-[#009460] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Acheteur vérifié</span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-sans">Votre compte client vous permet de commander via le séquestre mobile money sécurisé de notre passerelle.</p>
                </div>
              )}

              {/* Account Quick actions */}
              <div className="space-y-2 pt-2 border-t text-[11px]">
                <span className="font-bold text-gray-500 block">Accès directs</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setActiveTab("home")} className="p-2 border text-center cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-mono font-bold">ACCUEIL</button>
                  <button onClick={() => setActiveTab("catalog")} className="p-2 border text-center cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-mono font-bold">CATALOGUE</button>
                  {isSeller && currentUser.isApproved && (
                    <button onClick={() => setActiveTab("seller-dashboard")} className="p-2 col-span-2 bg-[#009460] text-white text-center cursor-pointer rounded-lg hover:bg-green-700 transition-all font-mono font-bold uppercase">Ma Boutique</button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setActiveTab("admin-dashboard")} className="p-2 col-span-2 bg-[#CE1126] text-white text-center cursor-pointer rounded-lg hover:bg-red-700 transition-all font-mono font-bold uppercase">Console de Modération</button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // LOGGED OUT: Connection & Sign-Up Interface
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Visual welcome context */}
        <div className="md:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 text-zinc-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden">
          {/* Subtle Guinea color accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="h-full w-1/3 bg-[#CE1126]"></div>
            <div className="h-full w-1/3 bg-[#FCD116]"></div>
            <div className="h-full w-1/3 bg-[#009460]"></div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-[#009460] font-black text-xl border border-white/15">
              <span>G</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">Guinée Market Pro</h2>
              <p className="text-[11px] leading-relaxed text-zinc-400 font-sans">
                La plateforme souveraine réunissant agriculteurs de Kindia, importateurs de Conakry, et artisans du Fouta sous un protocole de paiement et de livraison certifié.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-zinc-800 text-[11px] font-mono">
            <div className="flex gap-2">
              <CheckCircle2 size={16} className="text-[#009460] shrink-0" />
              <span>Paiement Séquestre Garanti</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 size={16} className="text-[#009460] shrink-0" />
              <span>Livraisons en 24h/48h</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 size={16} className="text-[#009460] shrink-0" />
              <span>Assistance locale (Conakry Kaloum)</span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono">
            Sûreté Commerciale Intégrée v3.2
          </div>
        </div>

        {/* Right column: Tab-driven interactive Form */}
        <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
          
          {/* Tabs Selector */}
          <div className="flex border-b">
            <button
              onClick={() => { setAuthMode("login"); setErrorMsg(null); }}
              className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                authMode === "login" 
                  ? "border-[#009460] text-gray-900 dark:text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LogIn size={15} />
                <span>Se Connecter</span>
              </span>
            </button>
            
            <button
              onClick={() => { setAuthMode("register"); setErrorMsg(null); }}
              className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                authMode === "register" 
                  ? "border-[#009460] text-gray-900 dark:text-white" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <UserPlus size={15} />
                <span>S'inscrire</span>
              </span>
            </button>
          </div>

          {/* Error and Success alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-xl text-red-800 dark:text-red-400 flex items-center gap-2 text-[11px] font-sans">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-xl text-emerald-800 dark:text-[#22c55e] flex items-center gap-2 text-[11px] font-sans">
              <Check2 size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Interactive Form */}
          {authMode === "login" ? (
            /* CONNECTION FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Adresse Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={14} />
                  <input 
                    type="email" 
                    placeholder="nom@exemple.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Mot de Passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={14} />
                  <input 
                    type="password" 
                    placeholder="Saisissez votre mot de passe original" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                    required 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#009460] hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-colors"
              >
                {loading ? "Connexion sécurisée en cours..." : "Se connecter par mail"}
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Nom Complet *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Ex: Fatoumata Baldé" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Adresse Email Civile *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={14} />
                    <input 
                      type="email" 
                      placeholder="fatou@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Téléphone de contact (+224)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={14} />
                    <input 
                      type="tel" 
                      placeholder="622445566" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 font-sans">Mot de Passe Sécurisé *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={14} />
                    <input 
                      type="password" 
                      placeholder="6 caractères minimum" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-xs"
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Role selection */}
              <div className="space-y-2">
                <span className="font-bold text-gray-500">Rôle d'exercice professionnel</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.BUYER)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === UserRole.BUYER 
                        ? "border-[#009460] bg-[#009460]/5 text-[#009460] font-bold" 
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <User size={16} />
                    <span>Acheteur (Particulier/Client)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(UserRole.SELLER)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === UserRole.SELLER 
                        ? "border-[#009460] bg-[#009460]/5 text-[#009460] font-bold" 
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Store size={16} />
                    <span>Marchand professionnel (Vendeur)</span>
                  </button>
                </div>
              </div>

              {/* Merchant extra parameters */}
              {role === UserRole.SELLER && (
                <div className="p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-2xl border space-y-3">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Store size={13} className="text-[#009460]" />
                    <span>Éléments requis d'activité marchande</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold block">Nom de la Boutique / Enseigne *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Coopérative Karité Siguiri" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold block">Description de l'activité commerciale *</label>
                    <textarea 
                      placeholder="Ex: Production locale d'huile de beurre de karité bio pour livraison nationale..." 
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none text-xs"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold block">Adresse Physique Réelle *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Avenue Alpha Yaya, Siguiri" 
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold block">Zone d'expédition / Préfecture *</label>
                      <select
                        value={selectedPrefecture}
                        onChange={(e) => setSelectedPrefecture(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 border rounded-lg outline-none text-xs"
                      >
                        {GUINEA_PREFECTURES.map(pref => (
                          <option key={pref} value={pref}>{pref}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Prefecture (residence zone selection for shipping validation) */}
              {role === UserRole.BUYER && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Préfecture de livraison principale</label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-950 border rounded-xl outline-none text-xs"
                  >
                    {GUINEA_PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#009460] hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-colors"
              >
                {loading ? "Création du compte en cours..." : "Créer mon dossier de connexion"}
              </button>
            </form>
          )}

          {/* Separation line */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono"><span className="bg-white dark:bg-zinc-900 px-3 text-gray-400">Ou s'identifier via</span></div>
          </div>

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 border hover:bg-gray-50 dark:hover:bg-zinc-805 rounded-xl cursor-pointer text-center text-xs transition-all flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-bold"
          >
            {/* simple beautiful google logo icon simulation */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.91h6.63c-.28 1.54-1.15 2.85-2.45 3.73v3.1h3.94c2.31-2.13 3.62-5.26 3.62-8.67z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.94-3.1c-1.1.73-2.5 1.17-3.99 1.17-3.07 0-5.67-2.08-6.6-4.88H1.31v3.2C3.29 22.35 7.39 24 12 24z" />
              <path fill="#FBBC05" d="M5.4 14.28c-.24-.72-.38-1.5-.38-2.28s.14-1.56.38-2.28V6.52H1.31C.48 8.17 0 10.02 0 12s.48 3.83 1.31 5.48l4.09-3.2z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.29 1.65 1.31 5.48l4.09 3.2c.93-2.8 3.53-4.88 6.6-4.88z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Quick Sandbox Emulator Switches */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-400 font-bold">
              <AlertTriangle size={14} />
              <span>Simulateur & Comptes d'Essai Rapide</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal font-sans">
              Testez instantanément les différents espaces opérationnels avec des profils pré-configurés de Guinée sans devoir remplir le formulaire d'inscription.
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleDemoSignIn(UserRole.BUYER)}
                className="py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-gray-800 dark:text-gray-200 font-bold rounded-lg cursor-pointer text-center font-mono uppercase"
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn(UserRole.SELLER)}
                className="py-2 bg-emerald-50 dark:bg-emerald-950/20 text-[#009460] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold rounded-lg cursor-pointer text-center font-mono uppercase"
              >
                Vendeur
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn(UserRole.ADMIN)}
                className="py-2 bg-red-50 dark:bg-red-950/20 text-[#CE1126] hover:bg-red-100 dark:hover:bg-red-900/40 font-bold rounded-lg cursor-pointer text-center font-mono uppercase"
              >
                Admin
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Simple dynamic inline helper component since Check is named above
function Check2({ size, className }: { size?: number, className?: string }) {
  return <Check size={size || 14} className={className} />;
}
