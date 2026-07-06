import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Search,
  MessageSquare,
  Sparkles,
  Award,
  Truck,
  RotateCcw,
  Star,
  User,
  X,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowRight,
  MapPin,
  Flame,
  Globe,
  Store,
  PhoneCall,
  Lock,
  Home,
  ShoppingBag,
  Bot,
  Crown,
  Grid,
  Scissors,
  Eye,
  Gem,
  Droplet,
  Gift,
  Wind,
  Disc,
  Smile,
  BookOpen,
  Clock,
  Instagram,
  Facebook
} from "lucide-react";
import { Product, Review, BlogPost, CartItem } from "./types";
import AICoach from "./components/AICoach";
import BridalCorner from "./components/BridalCorner";
import Checkout from "./components/Checkout";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<"home" | "categories" | "coach" | "bridal" | "wishlist" | "checkout" | "admin">("home");

  // App Loading splash state
  const [appLoading, setAppLoading] = useState<boolean>(true);

  // Policy modal states
  const [activePolicyModal, setActivePolicyModal] = useState<"privacy" | "terms" | "returns" | "faqs" | null>(null);

  // Selected Product Detail Modal state
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // Selected Category filter (for categories view or category clicks)
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Language State: 'en' for English, 'hi' for Hindi
  const [language, setLanguage] = useState<"hi" | "en">("hi");

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [homepageSearch, setHomepageSearch] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Advanced search suggestions pool
  const suggestionsPool = [
    { en: "Lakme Foundation", hi: "लक्मे फाउंडेशन", category: "Makeup" },
    { en: "Glass Bangles", hi: "कांच की चूड़ियां", category: "Bangles" },
    { en: "Bridal Kit", hi: "ब्राइडल किट", category: "Bridal" },
    { en: "Sunscreen", hi: "सनस्क्रीन", category: "Skincare" },
    { en: "Maybelline Lipstick", hi: "मेबेलिन लिपस्टिक", category: "Lips" },
    { en: "Kajal", hi: "काजल", category: "Eyes" },
    { en: "Eyeliner", hi: "आईलाइनर", category: "Eyes" },
    { en: "Shringar Box", hi: "शृंगार बॉक्स", category: "Bridal" },
    { en: "Swiss Beauty", hi: "स्विस ब्यूटी", category: "Makeup" },
    { en: "Mamaearth Face Wash", hi: "ममाअर्थ फेस वॉश", category: "Skincare" }
  ];

  // Cart & Wishlist states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Custom Toast Notification state for premium feedback
  const [toast, setToast] = useState<{ message: string; show: boolean; type: "success" | "info" }>({
    message: "",
    show: false,
    type: "success"
  });

  const triggerToast = (msg: string, type: "success" | "info" = "success") => {
    setToast({ message: msg, show: true, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.message]);

  // Products & Reviews Data loaded from Backend API
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);

  // Active product filter on home tab (Best Sellers, under 499, etc.)
  const [homeProductFilter, setHomeProductFilter] = useState<"best" | "new" | "under499" | "premium">("best");

  const isHindi = language === "hi";

  // Fetch initial data from full stack endpoints
  useEffect(() => {
    const fetchData = async () => {
      // Record start time
      const startTime = Date.now();
      try {
        const prodRes = await fetch("/api/products");
        const prodData = await prodRes.json();
        const localProducts = localStorage.getItem("anmol_custom_products");
        if (localProducts) {
          setProducts(JSON.parse(localProducts));
        } else {
          setProducts(prodData);
          localStorage.setItem("anmol_custom_products", JSON.stringify(prodData));
        }

        const revRes = await fetch("/api/reviews");
        const revData = await revRes.json();
        const localReviews = localStorage.getItem("anmol_custom_reviews");
        if (localReviews) {
          setReviews(JSON.parse(localReviews));
        } else {
          setReviews(revData);
          localStorage.setItem("anmol_custom_reviews", JSON.stringify(revData));
        }

        const blogRes = await fetch("/api/blogs");
        const blogData = await blogRes.json();
        const localBlogs = localStorage.getItem("anmol_custom_blogs");
        if (localBlogs) {
          setBlogs(JSON.parse(localBlogs));
        } else {
          setBlogs(blogData);
          localStorage.setItem("anmol_custom_blogs", JSON.stringify(blogData));
        }
      } catch (err) {
        console.error("Failed to load initial server data", err);
      } finally {
        setProductsLoading(false);
        // Ensure the high-end loading splash screen stays for at least 1500ms
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1500 - elapsed);
        setTimeout(() => {
          setAppLoading(false);
        }, remaining);
      }
    };
    fetchData();
  }, []);

  // Category List
  const categoriesList = [
    { key: "All", label_en: "All Items", label_hi: "सभी उत्पाद" },
    { key: "Makeup", label_en: "Makeup", label_hi: "मेकअप" },
    { key: "Skincare", label_en: "Skincare", label_hi: "स्किनकेयर" },
    { key: "Hair Care", label_en: "Hair Care", label_hi: "हेयर केयर" },
    { key: "Lipsticks", label_en: "Lipsticks", label_hi: "लिपस्टिक्स" },
    { key: "Eye Makeup", label_en: "Eye Makeup", label_hi: "ऑय मेकअप" },
    { key: "Shringar Box", label_en: "Shringar Box", label_hi: "शृंगार बॉक्स" },
    { key: "Glass Bangles", label_en: "Glass Bangles", label_hi: "कांच की चूड़ियां" },
    { key: "Kundan Jewellery", label_en: "Kundan Jewellery", label_hi: "कुंदन ज्वेलरी" },
    { key: "Perfumes", label_en: "Perfumes", label_hi: "परफ्यूम्स" },
  ];

  const renderCategoryIcon = (key: string) => {
    switch (key) {
      case "All":
        return <ShoppingBag className="h-6 w-6 text-amber-500 mx-auto" />;
      case "Makeup":
        return <Sparkles className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Skincare":
        return <Droplet className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Hair Care":
        return <Scissors className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Lipsticks":
        return <Smile className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Eye Makeup":
        return <Eye className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Shringar Box":
        return <Gift className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Glass Bangles":
        return <Disc className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300 animate-[spin_8s_linear_infinite]" />;
      case "Kundan Jewellery":
        return <Gem className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      case "Perfumes":
        return <Wind className="h-6 w-6 text-amber-500 mx-auto group-hover:scale-110 transition duration-300" />;
      default:
        return <Grid className="h-6 w-6 text-amber-500 mx-auto" />;
    }
  };

  // Brand logos
  const brandLogos = [
    { name: "Lakme", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&auto=format&fit=crop&q=80" },
    { name: "Maybelline", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format&fit=crop&q=80" },
    { name: "Mamaearth", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&auto=format&fit=crop&q=80" },
    { name: "Sugar", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100&auto=format&fit=crop&q=80" },
    { name: "Swiss Beauty", image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=100&auto=format&fit=crop&q=80" },
    { name: "Insight", image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=100&auto=format&fit=crop&q=80" },
  ];

  // Filtered products list based on search & category selection
  const getFilteredProducts = () => {
    let result = products;

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  };

  // Static homepage highlight lists
  const getTrendingProducts = () => {
    return products.filter((p) => p.badge === "Trending" || p.badge === "New" || p.id.startsWith("m") || p.price <= 499).slice(0, 4);
  };

  const getBestSellers = () => {
    return products.filter((p) => p.badge === "Best Seller" || p.rating >= 4.7).slice(0, 4);
  };

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    // Visual pop up cue
    triggerToast(
      isHindi 
        ? `${product.name} सफलतापूर्वक कार्ट में जोड़ा गया! 🛍️` 
        : `${product.name} successfully added to cart! 🛍️`,
      "success"
    );
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Toggle item in Wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((p) => p.id === product.id);
      if (exists) {
        triggerToast(
          isHindi ? "विशलिस्ट से हटाया गया।" : "Removed from wishlist.",
          "info"
        );
        return prevWishlist.filter((p) => p.id !== product.id);
      } else {
        triggerToast(
          isHindi ? "विशलिस्ट में जोड़ा गया! ❤️" : "Added to wishlist! ❤️",
          "success"
        );
        return [...prevWishlist, product];
      }
    });
  };

  // Handle WhatsApp quick product order
  const handleWhatsAppQuickOrder = (product: Product) => {
    const text = `Namaste Anmol Cosmetics Mau! 🛍\nI want to order this product:\n• *${product.name}* (${product.brand}) - Price: *₹${product.price}*\n\nPlease confirm availability for same-day delivery in Mau. Thank you!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919455321567?text=${encoded}`, "_blank");
  };

  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B1020] z-50 flex flex-col items-center justify-center space-y-6 select-none">
        <div className="relative">
          {/* Circular gold glowing ring */}
          <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-xl animate-pulse"></div>
          {/* Rotating outer ring */}
          <div className="w-20 h-20 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
          {/* Centered Premium Store Icon */}
          <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
            <Store className="h-7 w-7 text-amber-500" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-widest bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
            Anmol Cosmetics
          </h1>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.25em] font-sans">
            {isHindi ? "मऊ का डिजिटल हब" : "Mau's Premium Digital Hub"}
          </p>
        </div>
        
        {/* Glowing Progress bar indicator */}
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            width: '60%'
          }} />
        </div>
        
        <p className="text-xs text-amber-500/80 tracking-wide font-sans animate-pulse font-medium">
          {isHindi ? "प्रीमियम ब्यूटी हब लोड हो रहा है..." : "Loading Premium Beauty Hub..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP PREMIUM HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-900 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Brand Logo & Slogan */}
          <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer shrink-0" onClick={() => setCurrentView("home")}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20 border border-yellow-300/40 shrink-0">
              <Store className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 text-slate-950 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg md:text-2xl font-serif font-black tracking-tight bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent drop-shadow truncate">
                Anmol Cosmetics
              </h1>
              <p className="text-[7.5px] sm:text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest leading-none font-bold truncate">Mau's Premium Digital Hub</p>
            </div>
          </div>
 
          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder={isHindi ? "प्रोडक्ट, ब्रांड या कैटेगरी खोजें..." : "Search brands, products, glass bangles..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== "categories") setCurrentView("categories");
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-4 pr-10 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Search className="absolute right-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
          </div>
 
          {/* Action Icons (Language, Wishlist, Cart, Profile) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 md:space-x-4 shrink-0">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
              className="flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold text-amber-400 transition shrink-0"
              title="Change Language"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">{isHindi ? "English" : "हिंदी"}</span>
              <span className="sm:hidden">{isHindi ? "EN" : "HI"}</span>
            </button>
 
            {/* Wishlist Icon */}
            <button
              onClick={() => setCurrentView("wishlist")}
              className="relative p-1 sm:p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-300 transition shrink-0"
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-slate-100 text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>
 
            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 sm:p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-300 transition shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
 
            {/* Custom Admin Login trigger */}
            <button
              onClick={() => setCurrentView("admin")}
              className="p-1 sm:p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-300 transition shrink-0"
              title="Admin CRM Dashboard"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEW ROUTER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* VIEW A: HOME PAGE */}
        {currentView === "home" && (
          <div className="space-y-10">
            
            {/* 1. HERO PREMIUM BANNER */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/10 shadow-2xl">
              {/* Premium Bridal/Model image backdrop with high quality styling */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-40 lg:opacity-95 bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=80')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent"></div>
              </div>

              <div className="relative p-6 sm:p-10 lg:p-14 lg:max-w-2xl space-y-7">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 via-fuchsia-650 to-pink-600 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm md:text-base font-black uppercase tracking-wide shadow-[0_0_25px_rgba(219,39,119,0.4)] border-2 border-fuchsia-400 animate-pulse transform hover:scale-105 transition duration-300 select-none">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-spin" />
                  <span className="drop-shadow-sm font-extrabold text-white">
                    {isHindi ? "🤖 भारत का पहला AI युक्त ANMOL COSMETICS स्टोर" : "🤖 India's First AI-Powered ANMOL COSMETICS Hub"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black tracking-tight bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl select-none leading-none animate-fade-in uppercase">
                    Anmol Cosmetics
                  </h1>
                  <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-slate-300 font-extrabold flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>{isHindi ? "मऊ का नंबर #1 ब्यूटी और एआई डेस्टिनेशन" : "Mau's #1 Premium Beauty & AI Destination"}</span>
                  </p>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-tight leading-tight text-slate-300">
                  {isHindi ? "AI की मदद से अपनी Skin के लिए सही Product चुनें।" : "Choose the perfect cosmetics verified by AI Diagnostics."}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-sans font-normal border-l-2 border-amber-500/50 pl-3.5">
                  {isHindi 
                    ? "100% असली ब्रांडेड कॉस्मेटिक्स (Lakme, Maybelline, Shringar Kits) और पारंपरिक कांच की चूड़ियां। मऊ शहर में Same-Day सुपरफास्ट होम डिलीवरी।"
                    : "100% Genuine Branded Cosmetics & handmade fine glass bangles. Access expert dermatological skincare guides and instant same-day delivery in Mau."}
                </p>

                {/* Hero CTA Action buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setCurrentView("categories");
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold rounded-full text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition transform hover:scale-[1.02] active:scale-95"
                  >
                    🛍 {isHindi ? "शॉप नाउ (Shop Now)" : "Shop Collection"}
                  </button>
                  <button
                    onClick={() => setCurrentView("coach")}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-black rounded-full text-xs sm:text-sm transition-all duration-300 flex items-center space-x-2 transform hover:scale-[1.05] active:scale-95 shadow-[0_0_25px_rgba(168,85,247,0.45)] border-2 border-fuchsia-300"
                  >
                    <Sparkles className="h-4.5 w-4.5 text-yellow-300 animate-spin" />
                    <span className="tracking-wide">{isHindi ? "एआई ब्यूटी कोच (प्रारंभ करें)" : "Try AI Beauty Coach Now"}</span>
                  </button>
                  <a
                    href="https://wa.me/919455321567?text=Namaste%20Anmol%20Cosmetics!%20I%20want%20to%20place%20an%20order."
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold rounded-full text-xs sm:text-sm transition flex items-center space-x-2 hover:border-amber-500/40 active:scale-95 shadow-md"
                  >
                    <MessageSquare className="h-4 w-4 text-green-500 fill-green-500/10" />
                    <span>{isHindi ? "व्हाट्सएप ऑर्डर" : "WhatsApp Order"}</span>
                  </a>
                </div>

                {/* TRUST BADGES IN HERO SECTION */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="font-medium">{isHindi ? "5000+ खुश ग्राहक" : "5000+ Happy Customers"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <Truck className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium">{isHindi ? "सेम डे डिलीवरी" : "Same Day Delivery"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium">{isHindi ? "100% असली उत्पाद" : "100% Original Brands"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium">{isHindi ? "सुरक्षित पेमेंट" : "Secure Payment"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. BENTO-GRID ICON CATEGORIES */}
            <section className="space-y-4">
              <h3 className="text-lg md:text-xl font-serif font-semibold text-slate-200 flex items-center space-x-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>{isHindi ? "कैटेगरी के अनुसार शॉपिंग करें" : "Shop by Category"}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      setCurrentView("categories");
                    }}
                    className="group bg-slate-900/50 border border-slate-900 hover:border-amber-500/30 p-4 rounded-2xl text-center cursor-pointer transition duration-300 hover:-translate-y-1 shadow-md hover:shadow-amber-500/5"
                  >
                    {renderCategoryIcon(cat.key)}
                    <span className="block text-xs font-bold text-slate-300 group-hover:text-amber-400 mt-2 transition">
                      {isHindi ? cat.label_hi : cat.label_en}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* INTEGRATED PREMIUM SEARCH SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/25 p-6 md:p-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
              {/* Very Light Luxury background details (opacity 3-5%) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                <Sparkles className="absolute top-5 left-8 text-amber-500/[0.04] h-20 w-20 animate-pulse" />
                <Sparkles className="absolute bottom-6 right-10 text-amber-500/[0.04] h-16 w-16 animate-pulse" />
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-amber-500/[0.03] to-transparent rounded-full blur-2xl"></div>
                <div className="absolute -right-12 top-1/3 w-32 h-32 bg-gradient-to-bl from-pink-500/[0.03] to-transparent rounded-full blur-2xl"></div>
              </div>

              <div className="max-w-2xl mx-auto text-center space-y-2.5 relative z-10">
                <h3 className="text-lg md:text-2xl font-serif font-black tracking-tight text-slate-100 flex items-center justify-center space-x-2">
                  <span className="text-xl sm:text-2xl">🔍</span>
                  <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-amber-200 bg-clip-text text-transparent">
                    {isHindi ? "मनचाहा ब्यूटी प्रोडक्ट खोजें" : "Discover Your Ideal Beauty Companion"}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {isHindi ? "5000+ ब्रांडेड प्रोडक्ट्स और एआई-सजेस्टेड स्किन्स सोलूशन्स में से चुनें" : "Explore across 5000+ certified cosmetics and skin solutions"}
                </p>
              </div>

              {/* Subheading Badge - Use AI Advice or start typing */}
              <div className="text-center pb-1 relative z-10">
                <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 rounded-full text-[10px] sm:text-xs text-amber-400 font-extrabold tracking-wider uppercase animate-pulse shadow-md shadow-amber-500/5 select-none">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  <span>{isHindi ? "🤖 AI की मदद से सही प्रोडक्ट खोजें या नाम टाइप करें" : "🤖 Use AI to discover the perfect product or start typing..."}</span>
                </span>
              </div>

              {/* Interactive Search input wrapper */}
              <div className="max-w-xl mx-auto relative z-20">
                <div className={`relative flex items-center border-2 rounded-full bg-slate-950 transition-all duration-300 ${isSearchFocused ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.22)] scale-[1.01]' : 'border-slate-800'}`}>
                  <input
                    type="text"
                    placeholder={isHindi ? "उत्पाद, ब्रांड, काजल या कांच की चूड़ियां खोजें..." : "Search brands, lipsticks, glass bangles, bridal kit..."}
                    value={homepageSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => {
                      // Small timeout to allow suggestion click
                      setTimeout(() => setIsSearchFocused(false), 200);
                    }}
                    onChange={(e) => {
                      setHomepageSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchQuery(homepageSearch);
                        setSelectedCategory("All");
                        setCurrentView("categories");
                        setIsSearchFocused(false);
                      }
                    }}
                    className="w-full bg-transparent py-4 pl-6 pr-14 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  {homepageSearch && (
                    <button
                      onClick={() => setHomepageSearch("")}
                      className="absolute right-14 text-slate-500 hover:text-slate-300 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery(homepageSearch);
                      setSelectedCategory("All");
                      setCurrentView("categories");
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:via-yellow-500 hover:to-amber-700 text-slate-950 font-black rounded-full text-xs transition duration-300 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* SEARCH SUGGESTIONS PORTAL */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-fade-in divide-y divide-slate-850">
                    <div className="px-4 py-2 bg-slate-950 text-[10px] font-extrabold text-amber-500/80 uppercase tracking-widest">
                      {isHindi ? "सुझाए गए खोज शब्द (Suggestions)" : "Suggested Search Terms"}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {(homepageSearch.trim() === ""
                        ? [
                            { en: "Lakme Foundation", hi: "लक्मे फाउंडेशन", desc: isHindi ? "लक्मे मेकअप बेस" : "Premium Lakme Makeup base" },
                            { en: "Glass Bangles", hi: "कांच की चूड़ियां", desc: isHindi ? "मऊ की प्रसिद्ध पारंपरिक चूड़ियां" : "Mau's famous premium bangles" },
                            { en: "Bridal Kit", hi: "ब्राइडल किट", desc: isHindi ? "दुल्हन शृंगार और कस्टमाइज्ड किट" : "Complete personalized bridal kits" },
                            { en: "Sunscreen", hi: "सनस्क्रीन", desc: isHindi ? "त्वचा की सुरक्षा और ग्लो" : "Essential anti-tan shield" },
                            { en: "Maybelline Lipstick", hi: "मेबेलिन लिपस्टिक", desc: isHindi ? "लंबे समय तक चलने वाली लिपस्टिक" : "Long lasting premium matte lipstick" }
                          ]
                        : suggestionsPool.filter(item => 
                            item.en.toLowerCase().includes(homepageSearch.toLowerCase()) || 
                            item.hi.includes(homepageSearch)
                          ).map(item => ({
                            en: item.en,
                            hi: item.hi,
                            desc: isHindi ? `लोकप्रिय ${item.category} श्रेणी में` : `Popular beauty item in ${item.category}`
                          }))
                      ).map((item, index) => (
                        <div
                          key={index}
                          onMouseDown={(e) => {
                            // Prevent loss of focus before handler
                            e.preventDefault();
                            setSearchQuery(item.en);
                            setHomepageSearch(item.en);
                            setSelectedCategory("All");
                            setCurrentView("categories");
                            setIsSearchFocused(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-7 w-7 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition duration-300">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition">
                                {isHindi ? item.hi : item.en}
                              </p>
                              <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <Search className="h-3 w-3 text-slate-600 group-hover:text-amber-400 transition" />
                        </div>
                      ))}
                      {homepageSearch.trim() !== "" && suggestionsPool.filter(item => 
                        item.en.toLowerCase().includes(homepageSearch.toLowerCase()) || 
                        item.hi.includes(homepageSearch)
                      ).length === 0 && (
                        <div className="px-4 py-4 text-center text-xs text-slate-500">
                          {isHindi ? "कोई मिलान नहीं मिला, खोजना जारी रखने के लिए एंटर दबाएं।" : "No matches found. Press enter to search anyway."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK TAG SUGGESTIONS */}
              <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-1 text-xs relative z-10">
                <span className="text-slate-500 text-[11px] font-bold">{isHindi ? "लोकप्रिय:" : "Popular Searches:"}</span>
                {[
                  { en: "Glass Bangles", hi: "कांच की चूड़ियां" },
                  { en: "Lipstick", hi: "लिपस्टिक" },
                  { en: "Bridal Kit", hi: "ब्राइडल किट" },
                  { en: "Sunscreen", hi: "सनस्क्रीन" },
                  { en: "Lakme", hi: "लक्मे" }
                ].map((tag) => {
                  const isActive = searchQuery.toLowerCase() === tag.en.toLowerCase();
                  return (
                    <button
                      key={tag.en}
                      onClick={() => {
                        setSearchQuery(tag.en);
                        setHomepageSearch(tag.en);
                        setSelectedCategory("All");
                        setCurrentView("categories");
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm border ${
                        isActive 
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                          : "bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 border-slate-800/80 hover:border-amber-400 text-slate-300"
                      }`}
                    >
                      {isHindi ? tag.hi : tag.en}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. TRENDING PRODUCTS */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-serif font-semibold text-slate-200 flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <span>{isHindi ? "ट्रेडिंग उत्पाद (Trending Products)" : "Trending Products"}</span>
                </h3>
                <button 
                  onClick={() => { setSelectedCategory("All"); setCurrentView("categories"); }}
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>{isHindi ? "सभी देखें" : "View All"}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {productsLoading ? (
                <p className="text-center text-xs text-slate-500">Loading catalog...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {getTrendingProducts().map((product) => (
                    <div
                      key={product.id}
                      className="group bg-slate-900/50 border border-slate-900 hover:border-amber-500/20 rounded-2xl p-3 flex flex-col justify-between transition relative overflow-hidden"
                    >
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                          {product.badge}
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-red-500 transition"
                      >
                        <Heart className={`h-4 w-4 ${wishlist.some((p) => p.id === product.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      <div className="space-y-2 cursor-pointer" onClick={() => setSelectedProductDetail(product)}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-44 object-cover rounded-xl border border-slate-800/20 group-hover:scale-[1.02] transition duration-300"
                        />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{product.brand}</p>
                          <h4 className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-xs text-amber-500 font-bold flex items-center">
                              ⭐ {product.rating}
                            </span>
                            <span className="text-[10px] text-slate-500">({product.reviewsCount})</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-950/20 flex items-center justify-between">
                        <div>
                          <span className="text-xs md:text-sm font-bold text-slate-100 font-mono">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-500 line-through block font-mono">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleWhatsAppQuickOrder(product)}
                            className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-slate-200 hover:text-amber-400 rounded-lg text-xs transition flex items-center justify-center"
                            title="Quick Buy on WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-green-500 fill-green-500/10" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md transition"
                          >
                            + {isHindi ? "जोड़ें" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. BEST SELLERS */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-serif font-semibold text-slate-200 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>{isHindi ? "बेस्ट सेलर्स (Best Sellers)" : "Best Sellers"}</span>
                </h3>
                <button 
                  onClick={() => { setSelectedCategory("All"); setCurrentView("categories"); }}
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>{isHindi ? "सभी देखें" : "View All"}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {productsLoading ? (
                <p className="text-center text-xs text-slate-500">Loading catalog...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {getBestSellers().map((product) => (
                    <div
                      key={product.id}
                      className="group bg-slate-900/50 border border-slate-900 hover:border-amber-500/20 rounded-2xl p-3 flex flex-col justify-between transition relative overflow-hidden"
                    >
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                          {product.badge}
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-red-500 transition"
                      >
                        <Heart className={`h-4 w-4 ${wishlist.some((p) => p.id === product.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      <div className="space-y-2 cursor-pointer" onClick={() => setSelectedProductDetail(product)}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-44 object-cover rounded-xl border border-slate-800/20 group-hover:scale-[1.02] transition duration-300"
                        />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{product.brand}</p>
                          <h4 className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-xs text-amber-500 font-bold flex items-center">
                              ⭐ {product.rating}
                            </span>
                            <span className="text-[10px] text-slate-500">({product.reviewsCount})</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-950/20 flex items-center justify-between">
                        <div>
                          <span className="text-xs md:text-sm font-bold text-slate-100 font-mono">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-500 line-through block font-mono">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleWhatsAppQuickOrder(product)}
                            className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-slate-200 hover:text-amber-400 rounded-lg text-xs transition flex items-center justify-center"
                            title="Quick Buy on WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-green-500 fill-green-500/10" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md transition"
                          >
                            + {isHindi ? "जोड़ें" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 5. TODAY'S FLASH DEAL / OFFERS BANNER */}
            <section className="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-red-500/20 shadow-xl">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-black/20 rounded-xl text-slate-100 animate-pulse">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black bg-black/30 px-2 py-0.5 rounded-full tracking-widest text-slate-100 font-mono">
                    {isHindi ? "आज का धमाका ऑफर" : "Today's Flash Deal"}
                  </span>
                  <h4 className="text-base md:text-xl font-bold text-slate-50 mt-1">
                    {isHindi ? "विवाह स्पेशल: कूपन 'ANMOL10' से 10% की अतिरिक्त छूट!" : "Bridal Special: Flat 10% Extra Off on Coupon ANMOL10!"}
                  </h4>
                  <p className="text-xs text-slate-100/90">{isHindi ? "मऊ शहर में सेम-डे डिलीवरी फ्री।" : "Free same-day local shipping in Mau on checkout."}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setCurrentView("categories");
                }}
                className="px-5 py-2 bg-slate-950 hover:bg-black text-amber-400 font-bold rounded-full text-xs md:text-sm shrink-0 transition border border-amber-500/30"
              >
                {isHindi ? "ऑफर लूटें 🛍" : "Claim Offer 🛍"}
              </button>
            </section>

            {/* 6. BRANDS PARTNERS BAR */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 text-center">
                {isHindi ? "हमारे प्रीमियम ब्रांड पार्टनर" : "Our Premium Brand Partners"}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 py-5 bg-slate-900/40 rounded-2xl border border-slate-900 px-4 shadow-inner">
                {brandLogos.map((brand) => (
                  <div key={brand.name} className="flex flex-col items-center justify-center space-y-1 group cursor-pointer">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full grayscale hover:grayscale-0 border border-slate-800 hover:border-amber-500/50 transition duration-300 shadow"
                    />
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-400 font-bold transition">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. AI BEAUTY COACH GLOWING SHINY CARD */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
              
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 animate-spin" />
                  <span>{isHindi ? "जेमिनी एआई टेक्नोलॉजी" : "Gemini AI Technology"}</span>
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-black text-slate-100">
                  🤖 {isHindi ? "AI Beauty Coach – 30 सेकंड में अपनी Skin के अनुसार Product जानें।" : "AI Beauty Coach – Get Custom Skincare & Beauty Match in 30 Secs"}
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  {isHindi
                    ? "अपने चेहरे के अनुसार सबसे सही शेड्स, लिपस्टिक कलर्स और स्किनकेयर रूटीन पाएं। हमारे जेमिनी एआई ब्यूटी कोच से बात करें।"
                    : "Instant diagnostic recommendation engine for your unique skin type. Consult our virtual stylist for personalized advice."}
                </p>
              </div>
              
              <button
                onClick={() => setCurrentView("coach")}
                className="relative z-10 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-full text-xs shrink-0 shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.01]"
              >
                ✨ {isHindi ? "फ्री एआई स्किन टेस्ट शुरू करें" : "Start Free AI Skin Consultation"}
              </button>
            </section>

            {/* 8. BRIDAL COLLECTION BANNER */}
            <section className="bg-gradient-to-tr from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
              <div className="space-y-4 max-w-lg text-center md:text-left">
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {isHindi ? "दुल्हन शृंगार गाइड" : "Traditional Shringar Plan"}
                </span>
                <h3 className="text-2xl font-serif font-black tracking-tight text-amber-300 leading-tight">
                  {isHindi ? "शादी-ब्याह के लिए तैयार करें अपनी विशेष सुंदरता" : "Automate Your Perfect Bridal Look with AI"}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                  {isHindi 
                    ? "हमारे प्रसिद्ध विवाह कॉर्नर में मऊ स्पेशल कांच की चूड़ियां, कुंदन ज्वेलरी और सुहाग शृंगार बॉक्स उपलब्ध हैं। एआई ब्राइडल प्लानर की मदद से बनाएं अपनी शादी का सम्पूर्ण सौंदर्य प्लान।"
                    : "Access traditional Mau Specials - handmade glass bangles, shringar boxes, and royal Kundan neckpieces. Plan your ceremony look with our AI assistant."}
                </p>
                <button
                  onClick={() => setCurrentView("bridal")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full text-xs transition inline-flex items-center space-x-1 shadow"
                >
                  <span>{isHindi ? "ब्राइडल कॉर्नर खोलें" : "Enter Bridal Corner"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80"
                alt="Indian Bridal Look"
                className="w-full md:w-56 h-48 object-cover rounded-2xl border border-amber-500/20 shrink-0 shadow-lg"
              />
            </section>

            {/* 9. CUSTOMER VERIFIED REVIEW WALL */}
            <section className="space-y-4">
              <h3 className="text-lg md:text-xl font-serif font-semibold text-slate-200 flex items-center space-x-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>{isHindi ? "ग्राहकों की सच्ची समीक्षाएं (Verified Reviews)" : "Real Customer Photo Reviews"}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 space-y-3 shadow">
                    <div className="flex items-center space-x-2.5">
                      <img src={rev.avatar} alt={rev.userName} className="w-9 h-9 object-cover rounded-full border border-amber-500/20" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{rev.userName}</h4>
                        <div className="flex text-yellow-400 text-[10px] mt-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rev.tags?.map((tag, i) => (
                        <span key={i} className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. BEAUTY BLOG TIPS */}
            <section className="space-y-4">
              <h3 className="text-lg md:text-xl font-serif font-semibold text-slate-200 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                <span>{isHindi ? "ब्यूटी टिप्स और स्किन केयर ब्लॉग" : "Skin Care & Hair Beauty Tips"}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row gap-3 shadow hover:border-amber-500/10 transition">
                    <img src={blog.image} alt={blog.title} className="w-full sm:w-28 h-24 object-cover rounded-xl" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">{blog.category}</span>
                      <h4 className="text-xs md:text-sm font-semibold text-slate-200 leading-tight">{blog.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{blog.excerpt}</p>
                      <p className="text-[9px] text-slate-500 pt-1">{blog.date} • {blog.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* VIEW B: ALL PRODUCTS / CATEGORIES VIEW */}
        {currentView === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-3xl font-serif font-bold text-slate-100">
                  {isHindi ? "उत्पाद संग्रह (All Cosmetics Catalog)" : "Premium Cosmetics Catalog"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isHindi ? `${getFilteredProducts().length} उत्कृष्ट सौंदर्य उत्पाद उपलब्ध हैं` : `${getFilteredProducts().length} handpicked premium products found`}
                </p>
              </div>

              {/* Horizontal scroll Categories Selection */}
              <div className="flex space-x-2 overflow-x-auto max-w-full pb-1 scrollbar-none shrink-0">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.key
                        ? "bg-amber-500 text-slate-950 font-bold shadow"
                        : "bg-slate-900 hover:bg-slate-850 text-slate-400"
                    }`}
                  >
                    {isHindi ? cat.label_hi : cat.label_en}
                  </button>
                ))}
              </div>
            </div>

            {getFilteredProducts().length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-12">No products match your search/category selections.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {getFilteredProducts().map((product) => (
                  <div
                    key={product.id}
                    className="group bg-slate-900/50 border border-slate-900 hover:border-amber-500/20 rounded-2xl p-3 flex flex-col justify-between transition relative overflow-hidden"
                  >
                    {product.badge && (
                      <span className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {product.badge}
                      </span>
                    )}

                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-red-500 transition"
                    >
                      <Heart className={`h-4 w-4 ${wishlist.some((p) => p.id === product.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    <div className="space-y-2 cursor-pointer" onClick={() => setSelectedProductDetail(product)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-44 object-cover rounded-xl border border-slate-800/20 group-hover:scale-[1.02] transition duration-300"
                      />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{product.brand}</p>
                        <h4 className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="text-xs text-amber-500 font-bold flex items-center">
                            ⭐ {product.rating}
                          </span>
                          <span className="text-[10px] text-slate-500">({product.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-950/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs md:text-sm font-bold text-slate-100">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-slate-500 line-through block">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleWhatsAppQuickOrder(product)}
                          className="p-1.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-slate-950 rounded-lg text-xs transition border border-green-500/20"
                          title="Quick Buy on WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md transition"
                        >
                          + {isHindi ? "जोड़ें" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW C: AI BEAUTY COACH WORKSPACE */}
        {currentView === "coach" && (
          <AICoach products={products} onAddToCart={handleAddToCart} language={language} />
        )}

        {/* VIEW D: BRIDAL SPECIAL CORNER */}
        {currentView === "bridal" && (
          <BridalCorner products={products} onAddToCart={handleAddToCart} language={language} />
        )}

        {/* VIEW E: WISHLIST WORKSPACE */}
        {currentView === "wishlist" && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-3xl font-serif font-bold text-slate-100">
              ❤️ {isHindi ? "आपकी विशलिस्ट (Wishlist)" : "Your Premium Wishlist"}
            </h2>

            {wishlist.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate-500 text-sm">{isHindi ? "आपकी विशलिस्ट अभी खाली है।" : "Your wishlist is currently empty."}</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setCurrentView("categories");
                  }}
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-amber-400 hover:text-amber-300"
                >
                  {isHindi ? "उत्पाद ब्राउज़ करें" : "Browse Cosmetics"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map((product) => (
                  <div key={product.id} className="bg-slate-900/50 border border-slate-900 rounded-2xl p-3 flex flex-col justify-between">
                    <div className="space-y-2 relative">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute top-2 right-2 p-1.5 bg-slate-950/80 rounded-full text-red-500"
                      >
                        <Heart className="h-4 w-4 fill-red-500" />
                      </button>
                      <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">{product.brand}</span>
                        <h4 className="text-xs md:text-sm font-semibold text-slate-200 line-clamp-1">{product.name}</h4>
                      </div>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-slate-950/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">₹{product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs transition"
                      >
                        + {isHindi ? "जोड़ें" : "Add"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW F: CHECKOUT FORM AND REDIRECT WORKSPACE */}
        {currentView === "checkout" && (
          <Checkout cart={cart} onClearCart={() => setCart([])} language={language} />
        )}

        {/* VIEW G: ADMIN CRM DASHBOARD */}
        {currentView === "admin" && (
          <AdminPanel language={language} />
        )}

      </main>

      {/* 3. FLOATING SHOPPING CART SIDEBAR DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-950 h-full flex flex-col justify-between border-l border-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-900 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">{isHindi ? "आपका शॉपिंग कार्ट" : "Your Shopping Cart"}</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-slate-900 rounded-full text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-slate-500 text-xs">{isHindi ? "कार्ट में कोई आइटम नहीं है।" : "Your cart is empty."}</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCurrentView("categories");
                    }}
                    className="px-4 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-amber-400 hover:text-amber-300"
                  >
                    {isHindi ? "उत्पाद देखें" : "View Collection"}
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex bg-slate-900/40 p-2.5 rounded-xl border border-slate-900 justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-md" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.product.name}</h4>
                        <p className="text-[10px] text-amber-400 font-semibold">₹{item.product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <div className="flex bg-slate-950 rounded-lg p-1 items-center border border-slate-850">
                        <button onClick={() => handleUpdateQuantity(item.product.id, -1)} className="p-0.5 text-slate-400 hover:text-slate-200">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2 text-slate-200">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.product.id, 1)} className="p-0.5 text-slate-400 hover:text-slate-200">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom calculation summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-900 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{isHindi ? "सबटोटल (Subtotal):" : "Subtotal:"}</span>
                  <span className="text-slate-200 font-bold">₹{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView("checkout");
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow-lg text-xs md:text-sm"
                >
                  <span>{isHindi ? "चेकआउट और फास्ट डिलीवरी (Checkout)" : "Proceed to Quick Delivery"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FOOTER DETAILED SECTION */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-serif tracking-wider uppercase">{isHindi ? "अनमोल कॉस्मेटिक्स मऊ" : "Anmol Cosmetics Mau"}</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {isHindi
                ? "मऊ की सबसे प्रतिष्ठित और भरोसेमंद कॉस्मेटिक्स दुकान। अब आधुनिक एआई स्किन कोच और लोकल सुपरफास्ट होम डिलीवरी के साथ आपके डिजिटल हब पर।"
                : "Mau's highly trusted beauty destination. Discover genuine makeup, hand-made glass bangles, and bridal collections backed by our AI Beauty Coach."}
            </p>
            {/* Rich Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://wa.me/919455321567" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-green-500 hover:text-green-400 transition hover:scale-105"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="h-4 w-4 fill-green-500/10" />
              </a>
              <a 
                href="https://instagram.com/anmol_cosmetics" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-pink-500 hover:text-pink-400 transition hover:scale-105"
                title="Follow on Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://facebook.com/anmol_cosmetics_mau" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-blue-500 hover:text-blue-400 transition hover:scale-105"
                title="Follow on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] text-slate-600">© 2026 Anmol Cosmetics Mau. All rights reserved.</p>
          </div>

          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 font-serif tracking-wider uppercase">{isHindi ? "पॉलिसी और सेवाएँ" : "Policies & Customer Service"}</h3>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => setActivePolicyModal("privacy")}
                  className="hover:text-amber-400 transition cursor-pointer text-left"
                >
                  {isHindi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal("terms")}
                  className="hover:text-amber-400 transition cursor-pointer text-left"
                >
                  {isHindi ? "नियम और शर्तें (Terms & Conditions)" : "Terms of Service"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal("returns")}
                  className="hover:text-amber-400 transition cursor-pointer text-left"
                >
                  {isHindi ? "रिटर्न और रिफंड नीति (Returns)" : "Returns & Refund Policy"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal("faqs")}
                  className="hover:text-amber-400 transition cursor-pointer text-left"
                >
                  {isHindi ? "डिलीवरी प्रश्न (Delivery FAQs)" : "Delivery FAQs & Support"}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 font-serif tracking-wider uppercase">{isHindi ? "स्टोर का विवरण" : "Store Timings & Contact"}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{isHindi ? "अनमोल काम्प्लेक्स, संस्कृत पाठशाला रोड, मऊ, उत्तर प्रदेश 275101" : "Anmol Complex, Sanskrit Pathshala Road, Mau, UP, 275101"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{isHindi ? "सोमवार - रविवार: 10:00 AM - 08:30 PM" : "Monday - Sunday: 10:00 AM - 08:30 PM"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneCall className="h-4 w-4 text-amber-500 shrink-0" />
                <span>+91 94553 21567</span>
              </div>
            </div>
          </div>

          {/* Premium Map Representation */}
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-100 font-serif tracking-wider uppercase">{isHindi ? "हमारा लाइव मऊ स्टोर" : "Locate Store in Mau"}</h3>
            <div className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between p-2 group">
              <div className="absolute inset-0 bg-[radial-gradient(#2E3C63_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-40"></div>
              {/* Fake road paths for premium design */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-950/80 -translate-y-1/2"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-1.5 bg-slate-950/80"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <span className="bg-slate-950/90 text-[9px] px-1.5 py-0.5 rounded text-slate-400 border border-slate-850">Sanskrit Rd</span>
                <span className="bg-slate-950/90 text-[9px] px-1.5 py-0.5 rounded text-amber-500 border border-amber-500/20">Anmol Complex</span>
              </div>
              
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="p-1.5 bg-slate-950 border border-amber-500 rounded-full shadow-lg shadow-amber-500/20 animate-pulse">
                  <MapPin className="h-4 w-4 text-red-500 animate-bounce" />
                </div>
              </div>

              <div className="relative z-10">
                <a 
                  href="https://maps.google.com/?q=Anmol+Cosmetics+Mau+Uttar+Pradesh"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center bg-slate-950/90 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 py-1.5 rounded text-[10px] text-amber-400 font-bold transition duration-300"
                >
                  📍 {isHindi ? "गूगल मैप पर खोलें" : "Open in Google Maps"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* POLICY MODALS OVERLAYS */}
      {activePolicyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setActivePolicyModal(null)} 
              className="absolute top-4 right-4 p-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
            
            {activePolicyModal === "privacy" && (
              <div className="space-y-3 font-sans text-left">
                <h3 className="text-base md:text-lg font-serif font-bold text-amber-400 border-b border-slate-800 pb-2">
                  {isHindi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy"}
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed space-y-3">
                  <p>
                    {isHindi 
                      ? "अनमोल कॉस्मेटिक्स में हम आपकी गोपनीयता का पूरा आदर करते हैं। एआई ब्यूटी कोच स्किन एनालिसिस के दौरान अपलोड की जाने वाली कोई भी सेल्फी या डेटा हमारे सर्वर पर स्थाई रूप से सुरक्षित नहीं की जाती है।"
                      : "At Anmol Cosmetics, your privacy is our supreme concern. Any selfies, skin profile inputs, or text details analyzed by the AI Beauty Coach are processed securely and deleted automatically."}
                  </p>
                  <p className="font-semibold text-slate-205">
                    {isHindi ? "हम कौन सा डेटा एकत्र करते हैं:" : "What data we collect:"}
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{isHindi ? "स्किन कंसल्टेशन के लिए आपका नाम और स्किन टाइप प्राथमिक डेटा।" : "Your name and basic skin type preferences for personal skin diagnostic."}</li>
                    <li>{isHindi ? "सिर्फ स्थानीय मऊ होम डिलीवरी के लिए आपका फ़ोन नंबर और पता।" : "Delivery address, contact info for Mau local home delivery execution."}</li>
                  </ul>
                  <p>
                    {isHindi 
                      ? "हम आपका व्यक्तिगत डेटा कभी भी किसी तीसरे पक्ष को नहीं बेचते या साझा नहीं करते हैं।"
                      : "We never share, lease, or sell customer telemetry data with third parties."}
                  </p>
                </div>
              </div>
            )}

            {activePolicyModal === "terms" && (
              <div className="space-y-3 font-sans text-left">
                <h3 className="text-base md:text-lg font-serif font-bold text-amber-400 border-b border-slate-800 pb-2">
                  {isHindi ? "नियम और शर्तें (Terms of Service)" : "Terms & Conditions"}
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed space-y-3">
                  <p>
                    {isHindi
                      ? "इस डिजिटल ब्यूटी प्लेटफॉर्म का उपयोग करके आप निम्नलिखित शर्तों से सहमत होते हैं:"
                      : "By utilizing this digital platform, you agree to comply with the terms set forth below:"}
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{isHindi ? "सभी उत्पाद 100% असली हैं और सीधे अधिकृत डिस्ट्रीब्यूटर्स से लिए गए हैं।" : "All listed products are guaranteed 100% original and verified authentic."}</li>
                    <li>{isHindi ? "सेम डे डिलीवरी केवल मऊ शहर और उपनगरीय क्षेत्रों (5 किमी सीमा) में मान्य है।" : "Same-day home delivery is applicable only within Mau municipal boundaries."}</li>
                    <li>{isHindi ? "शाम 4:00 बजे के बाद प्राप्त ऑर्डर्स को अगले दिन डिलीवर किया जाएगा।" : "Orders received after 4:00 PM will be dispatched on the next calendar day."}</li>
                  </ul>
                </div>
              </div>
            )}

            {activePolicyModal === "returns" && (
              <div className="space-y-3 font-sans text-left">
                <h3 className="text-base md:text-lg font-serif font-bold text-amber-400 border-b border-slate-800 pb-2">
                  {isHindi ? "रिटर्न और रिफंड नीति" : "Returns & Refund Policy"}
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed space-y-3">
                  <p>
                    {isHindi
                      ? "चूंकि कॉस्मेटिक्स हाइजीन और सौंदर्य उत्पाद हैं, इसलिए हमारी रिटर्न नीतियां इस प्रकार हैं:"
                      : "Because cosmetics are hygiene-sensitive, our return policies comply with absolute wellness standards:"}
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>
                      <span className="font-bold text-slate-200">{isHindi ? "48 घंटे की खिड़की:" : "48-Hour Local Exchange:"}</span>{" "}
                      {isHindi ? "यदि उत्पाद सीलबंद और बिना उपयोग किया हुआ है, तो आप 48 घंटे के भीतर स्टोर पर एक्सचेंज कर सकते हैं।" : "Unopened, sealed products can be returned/exchanged locally within 48 hours."}
                    </li>
                    <li>
                      <span className="font-bold text-slate-200">{isHindi ? "दोषपूर्ण उत्पाद:" : "Defective Items:"}</span>{" "}
                      {isHindi ? "यदि कोई कांच की चूड़ी टूटी हुई मिले या डैमेज हो, तो तत्काल रिप्लेसमेंट प्रदान किया जाएगा।" : "Broken glass bangles or damaged items will be replaced immediately for free."}
                    </li>
                    <li>
                      <span className="font-bold text-slate-200">{isHindi ? "कोई रिफंड शुल्क नहीं:" : "Refund execution:"}</span>{" "}
                      {isHindi ? "रिफंड सीधे आपके यूपीआई या स्टोर वॉलेट में क्रेडिट किया जाएगा।" : "Refunds are dispatched straight to your UPI or store credit wallet."}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activePolicyModal === "faqs" && (
              <div className="space-y-3 font-sans text-left">
                <h3 className="text-base md:text-lg font-serif font-bold text-amber-400 border-b border-slate-800 pb-2">
                  {isHindi ? "अक्सर पूछे जाने वाले सवाल (FAQs)" : "Delivery FAQs & Support"}
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed space-y-3.5">
                  <div>
                    <p className="font-bold text-slate-200">{isHindi ? "प्र: क्या डिलीवरी के समय कैश ऑन डिलीवरी उपलब्ध है?" : "Q: Do you support Cash on Delivery (COD)?"}</p>
                    <p>{isHindi ? "उ: हाँ! हम मऊ में कैश ऑन डिलीवरी और गूगल पे/फ़ोन पे डिलीवरी बॉय को भुगतान स्वीकार करते हैं।" : "A: Yes! We fully support COD and on-the-spot GPay/PhonePe payments."}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{isHindi ? "प्र: चूड़ियों का सही साइज़ कैसे चुनूं?" : "Q: How do I select the right glass bangles size?"}</p>
                    <p>{isHindi ? "उ: आप हमारी गाइड देख सकते हैं या हमारे व्हाट्सएप नंबर पर अपनी हथेली की फोटो भेज सकते हैं, हमारी टीम सहायता करेगी।" : "A: You can reference standard sizes (2.4, 2.6, 2.8) or send a palm photo on WhatsApp for instant manual sizing helper."}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{isHindi ? "प्र: क्या एआई ब्यूटी कोच की राय मुफ़्त है?" : "Q: Is the AI Beauty Coach completely free to use?"}</p>
                    <p>{isHindi ? "उ: बिल्कुल! हमारी एआई स्किन डायग्नोस्टिक्स प्रणाली सभी ग्राहकों के लिए 100% मुफ़्त है।" : "A: Yes, our advanced diagnostic engine is 100% free for all Anmol Cosmetics visitors!"}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setActivePolicyModal(null)} 
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs transition"
              >
                {isHindi ? "समझ गया" : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.5 PRODUCT DETAILS MODAL */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden relative shadow-2xl my-8">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProductDetail(null)} 
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition hover:scale-105 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image Section */}
              <div className="relative h-64 md:h-full min-h-[300px] bg-slate-950 flex items-center justify-center p-4">
                <img 
                  src={selectedProductDetail.image} 
                  alt={selectedProductDetail.name} 
                  className="w-full h-full object-cover rounded-2xl border border-slate-800"
                />
                {selectedProductDetail.badge && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    {selectedProductDetail.badge}
                  </span>
                )}
              </div>

              {/* Product Info Section */}
              <div className="p-6 flex flex-col justify-between space-y-4 font-sans text-left">
                <div className="space-y-2">
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{selectedProductDetail.brand}</p>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-100 leading-tight">
                    {selectedProductDetail.name}
                  </h3>
                  
                  {/* Rating Block */}
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(selectedProductDetail.rating) ? "fill-amber-500 text-amber-500" : ""}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-300 font-bold">{selectedProductDetail.rating}</span>
                    <span className="text-slate-600 text-xs">|</span>
                    <span className="text-xs text-slate-400">{selectedProductDetail.reviewsCount} {isHindi ? "समीक्षाएं" : "Verified Customer Reviews"}</span>
                  </div>

                  {/* Pricing Block */}
                  <div className="flex items-baseline space-x-3 pt-1">
                    <span className="text-2xl font-mono font-bold text-amber-400">₹{selectedProductDetail.price}</span>
                    {selectedProductDetail.originalPrice > selectedProductDetail.price && (
                      <>
                        <span className="text-sm text-slate-500 line-through font-mono">₹{selectedProductDetail.originalPrice}</span>
                        <span className="text-[11px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                          {Math.round(((selectedProductDetail.originalPrice - selectedProductDetail.price) / selectedProductDetail.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Highlights Bullet Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedProductDetail.category === "Skincare" ? (
                      <>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">🌱 Cruelty Free</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">🧪 Dermatologist Tested</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">💧 High Hydration</span>
                      </>
                    ) : selectedProductDetail.category === "Makeup" || selectedProductDetail.category === "Lipsticks" ? (
                      <>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">⏳ 12H Long Stay</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">✨ Super Matte</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">💄 Rich Pigmentation</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">💎 Handcrafted in Mau</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">🌟 Premium Glasswork</span>
                        <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">🎁 Free Shringar Box Match</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                    {selectedProductDetail.description}
                  </p>

                  {/* Realistic reviews widget inside detail modal */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isHindi ? "टॉप ग्राहक समीक्षाएं" : "Top Customer Reviews"}
                    </h4>
                    <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span className="font-bold text-slate-200">★ Priyanka S. (Mau)</span>
                        <span className="text-[9px] text-amber-500">★★★★★</span>
                      </div>
                      <p className="text-slate-300 italic">
                        {selectedProductDetail.category === "Glass Bangles" 
                          ? (isHindi ? "चूड़ियों की चमक कमाल की है! साइज़ बिल्कुल परफेक्ट आया।" : "Outstanding finish! The glitter details are beautiful.")
                          : (isHindi ? "बिल्कुल ओरिजिनल प्रोडक्ट है। डिलीवरी भी बहुत फ़ास्ट मिली।" : "100% genuine and fresh stock. Superb packaging.")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      handleWhatsAppQuickOrder(selectedProductDetail);
                    }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-850 border border-green-500/30 text-slate-100 hover:text-green-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <MessageSquare className="h-4 w-4 text-green-500 fill-green-500/10" />
                    <span>{isHindi ? "व्हाट्सएप ऑर्डर" : "WhatsApp Buy"}</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCart(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/15"
                  >
                    {isHindi ? "कार्ट में जोड़ें (+)" : "Add to Cart (+)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STICKY BOTTOM NAVIGATION (हर समय नीचे दिखाई दे) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-900 py-1.5 flex justify-around items-center text-slate-400 backdrop-blur-md shadow-2xl">
        
        {/* Home */}
        <button
          onClick={() => {
            setCurrentView("home");
            setSelectedCategory("All");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentView === "home" ? "text-amber-500" : "hover:text-slate-200"
          }`}
        >
          <Home className="h-4.5 w-4.5 mb-1" />
          <span className="text-[9px] font-bold tracking-wide">{isHindi ? "होम" : "Home"}</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => {
            setCurrentView("categories");
            setSelectedCategory("All");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentView === "categories" ? "text-amber-500" : "hover:text-slate-200"
          }`}
        >
          <ShoppingBag className="h-4.5 w-4.5 mb-1" />
          <span className="text-[9px] font-bold tracking-wide">{isHindi ? "कैटेगरी" : "Categories"}</span>
        </button>

        {/* AI Coach */}
        <button
          onClick={() => setCurrentView("coach")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
            currentView === "coach" ? "text-fuchsia-400 font-black scale-105" : "text-slate-400 hover:text-fuchsia-300"
          }`}
        >
          <span className="absolute -top-0.5 right-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          <Bot className={`h-4.5 w-4.5 mb-1 ${currentView === "coach" ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]" : "text-slate-400"}`} />
          <span className="text-[9px] font-bold tracking-wide">{isHindi ? "एआई कोच" : "AI Coach"}</span>
        </button>

        {/* Bridal Corner */}
        <button
          onClick={() => setCurrentView("bridal")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentView === "bridal" ? "text-amber-500" : "hover:text-slate-200"
          }`}
        >
          <Crown className="h-4.5 w-4.5 mb-1" />
          <span className="text-[9px] font-bold tracking-wide">{isHindi ? "ब्राइडल" : "Bridal"}</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => setCurrentView("wishlist")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentView === "wishlist" ? "text-amber-500" : "hover:text-slate-200"
          }`}
        >
          <Heart className={`h-4.5 w-4.5 mb-1 ${wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-[9px] font-bold tracking-wide">{isHindi ? "विशलिस्ट" : "Wishlist"}</span>
        </button>
      </nav>

      {/* Dynamic Gold/Pink Toast Feedback Portal */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[bounce_0.5s_ease-out] w-[90%] max-w-sm">
          <div className={`bg-slate-950 border ${toast.type === 'info' ? 'border-pink-500/40' : 'border-amber-500/40'} rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex items-center space-x-3 text-slate-100`}>
            <div className={`h-8 w-8 ${toast.type === 'info' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} rounded-full flex items-center justify-center border shrink-0`}>
              {toast.type === 'info' ? (
                <Heart className="h-4 w-4 fill-pink-500 stroke-[3]" />
              ) : (
                <Check className="h-4 w-4 stroke-[3]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black ${toast.type === 'info' ? 'text-pink-400' : 'text-amber-400'} uppercase tracking-wider leading-none mb-1`}>
                {toast.type === 'info' ? (isHindi ? "विशलिस्ट" : "Wishlist") : (isHindi ? "सफलतापूर्वक" : "Added Successfully")}
              </p>
              <p className="text-xs font-bold text-slate-200 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
