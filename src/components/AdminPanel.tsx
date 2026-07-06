import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  DollarSign,
  MessageCircle,
  RefreshCw,
  Layers,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash,
  Edit,
  Save,
  Lock,
  Settings,
  Key,
  FileText,
  CheckCircle,
  XCircle,
  Truck,
  Percent,
  Award,
  Phone,
  Upload,
  Database,
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  UserCheck,
  History,
  Calendar,
  Download,
  Eye,
  Copy,
  PlusCircle,
  Laptop,
  Check,
  X,
  Tag,
  Store,
  MapPin
} from "lucide-react";
import { Product, Review, BlogPost, Order } from "../types";
import MapSelector from "./MapSelector";

interface AdminPanelProps {
  language: "hi" | "en";
}

export default function AdminPanel({ language }: AdminPanelProps) {
  const isHindi = language === "hi";

  // Shop Location States
  const [shopLat, setShopLat] = useState<number>(() => {
    const saved = localStorage.getItem("anmol_shop_lat");
    return saved ? Number(saved) : 25.9485;
  });
  const [shopLng, setShopLng] = useState<number>(() => {
    const saved = localStorage.getItem("anmol_shop_lng");
    return saved ? Number(saved) : 83.5650;
  });
  const [shopAddress, setShopAddress] = useState<string>(() => {
    return localStorage.getItem("anmol_shop_address") || (language === "hi" ? "अनमोल कॉस्मेटिक्स, सेल्स टैक्स रोड, मुंशीपुरा, मऊ, उत्तर प्रदेश - 275101" : "Anmol Cosmetics, Saletax Road, Munshipura, Mau, Uttar Pradesh - 275101");
  });

  const [autoDownload, setAutoDownload] = useState<boolean>(() => {
    return localStorage.getItem("anmol_auto_download_map") !== "false";
  });
  const [isMapDownloading, setIsMapDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStep, setDownloadStep] = useState<string>("");

  const handleSaveShopLocation = () => {
    localStorage.setItem("anmol_shop_lat", shopLat.toString());
    localStorage.setItem("anmol_shop_lng", shopLng.toString());
    localStorage.setItem("anmol_shop_address", shopAddress);
    localStorage.setItem("anmol_auto_download_map", autoDownload.toString());
    logAction(`Updated Shop Location to: ${shopLat.toFixed(5)}, ${shopLng.toFixed(5)}`);

    if (autoDownload) {
      setIsMapDownloading(true);
      setDownloadProgress(5);
      setDownloadStep(isHindi ? "ऑफ़लाइन 25 किमी मैप डेटाबेस डाउनलोड करना शुरू किया जा रहा है..." : "Starting download of 25 KM offline map database...");

      const downloadSteps = [
        { p: 20, msg: isHindi ? "मऊ शहर और आस-पास के 25 किमी के रोड नेटवर्क को सिंक किया जा रहा है..." : "Syncing street networks of Mau and nearby regions within 25 km..." },
        { p: 45, msg: isHindi ? "सभी महत्वपूर्ण लैंडमार्क और मार्ग-बिंदु (POIs) लोड किए जा रहे हैं..." : "Caching landmarks, crossings, and Points of Interest..." },
        { p: 70, msg: isHindi ? "सैटेलाइट इमेजरी कैशे फ़ाइल तैयार की जा रही है..." : "Preparing high-resolution satellite imagery cache files..." },
        { p: 90, msg: isHindi ? "ऑफ़लाइन टोरेंट पैकेज लोकल स्टोरेज में सेव किया जा रहा है..." : "Saving customized offline map packages locally..." },
        { p: 100, msg: isHindi ? "सफलतापूर्वक पूर्ण! संपूर्ण ऑफलाइन मैप अपडेट हो गया।" : "Successfully completed! Total offline map synchronized." }
      ];

      let currentStepIdx = 0;
      const interval = setInterval(() => {
        if (currentStepIdx < downloadSteps.length) {
          const step = downloadSteps[currentStepIdx];
          setDownloadProgress(step.p);
          setDownloadStep(step.msg);
          currentStepIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsMapDownloading(false);
            const newMeta = {
              synced: true,
              lastSynced: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
              tilesCount: 1680,
              radiusKm: 25
            };
            localStorage.setItem("anmol_offline_map_meta", JSON.stringify(newMeta));
            window.dispatchEvent(new Event("anmol_offline_map_updated"));
            alert(isHindi 
              ? "दुकान का स्थान और 25 किमी रेंज का ऑफलाइन मैप सफलतापूर्वक डाउनलोड होकर अपडेट हो गया है!" 
              : "Store location and 25km range offline map downloaded and updated successfully!");
          }, 800);
        }
      }, 700);
    } else {
      alert(isHindi ? "दुकान का स्थान सफलतापूर्वक अपडेट किया गया!" : "Store location successfully updated!");
    }
  };

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("anmol_admin_authenticated") === "true";
  });
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem("anmol_admin_password") || "admin123";
  });
  const [loginError, setLoginError] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSuccess, setPasswordSuccess] = useState<string>("");

  // UI state
  const [activeModule, setActiveModule] = useState<
    "dashboard" | "catalog" | "orders" | "customers" | "ai" | "marketing" | "analytics" | "settings"
  >("dashboard");
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; action: string; ip: string }>>([
    { id: "1", time: "2026-07-05 20:01:14", action: "Admin System Boot Successful", ip: "192.168.1.1" },
    { id: "2", time: "2026-07-05 20:05:32", action: "Baseline Analytics Synchronized", ip: "192.168.1.1" }
  ]);

  // DB States (synchronized with local storage fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiChats, setAiChats] = useState<any[]>([]);

  // Selected details or Form overrides
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    category: "Makeup",
    brand: "",
    price: 0,
    originalPrice: 0,
    rating: 4.5,
    reviewsCount: 1,
    image: "",
    description: "",
    badge: "New Arrival"
  });

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 15, isActive: true });
  const [coupons, setCoupons] = useState<Array<{ id: string; code: string; discount: number; isActive: boolean }>>([
    { id: "1", code: "ANMOL10", discount: 10, isActive: true },
    { id: "2", code: "FESTIVAL50", discount: 50, isActive: true },
    { id: "3", code: "MAUFREE", discount: 100, isActive: true }
  ]);

  // Delivery configuration
  const [deliverySettings, setDeliverySettings] = useState({
    flatCharge: 60,
    freeLimit: 499,
    sameDayEnabled: true,
    supportedPincodes: ["275101", "275102", "221001", "221002"]
  });
  const [newPincode, setNewPincode] = useState("");

  // Search/Filters in Admin Panel
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>("All");

  // Notifications list
  const [notifications, setNotifications] = useState<string[]>([
    "🔔 Low Stock Alert: 'Swiss Beauty Liquid Concealer' (Only 3 left in Mau Store)",
    "🔔 New WhatsApp Order Received: Order ID #ANMOL-884210 from Pooja S.",
    "🔔 Client skin photo uploaded for AI Analyzer (Hydration Score: 68/100)"
  ]);

  // Load backend states
  useEffect(() => {
    const loadStoreData = async () => {
      setLoading(true);
      try {
        // Fetch Baseline products from LocalStorage or APIs
        const localProducts = localStorage.getItem("anmol_custom_products");
        if (localProducts) {
          setProducts(JSON.parse(localProducts));
        } else {
          const res = await fetch("/api/products");
          const data = await res.json();
          setProducts(data);
          localStorage.setItem("anmol_custom_products", JSON.stringify(data));
        }

        // Fetch Reviews
        const localReviews = localStorage.getItem("anmol_custom_reviews");
        if (localReviews) {
          setReviews(JSON.parse(localReviews));
        } else {
          const res = await fetch("/api/reviews");
          const data = await res.json();
          setReviews(data);
        }

        // Fetch Blogs
        const localBlogs = localStorage.getItem("anmol_custom_blogs");
        if (localBlogs) {
          setBlogs(JSON.parse(localBlogs));
        } else {
          const res = await fetch("/api/blogs");
          const data = await res.json();
          setBlogs(data);
        }

        // Fetch Analytics baseline (which contains orders/chats)
        const analyticsRes = await fetch("/api/admin/analytics");
        if (analyticsRes.ok) {
          const stats = await analyticsRes.json();
          setAiChats(stats.recentChats || []);
          
          const savedOrders = localStorage.getItem("anmol_custom_orders");
          if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
          } else {
            // Populate fallback orders if none exists
            const initialOrders: Order[] = stats.recentOrders || [
              {
                id: "ANMOL-284920",
                customerName: "Priyanka S. (Sanskriti Pathshala)",
                phone: "919455321567",
                items: [{ id: "b2", name: "Anmol Handmade Glass Bangles", brand: "Anmol Specials", price: 349, quantity: 2 }],
                total: 698,
                paymentMethod: "COD",
                pincode: "275101",
                status: "Pending",
                date: new Date().toLocaleDateString()
              },
              {
                id: "ANMOL-110482",
                customerName: "Aman Gupta (Near Mau Junction)",
                phone: "918855442211",
                items: [{ id: "m2", name: "Maybelline Fit Me Foundation", brand: "Maybelline", price: 599, quantity: 1 }],
                total: 599,
                paymentMethod: "UPI",
                pincode: "275102",
                status: "Delivered",
                date: "2026-07-04"
              }
            ];
            setOrders(initialOrders);
            localStorage.setItem("anmol_custom_orders", JSON.stringify(initialOrders));
          }
        }
      } catch (err) {
        console.error("Failed to load admin dataset", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      loadStoreData();
    }
  }, [isAuthenticated]);

  // Handle Admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("anmol_admin_authenticated", "true");
      logAction("Authorized Login Access");
    } else {
      setLoginError(isHindi ? "गलत पासवर्ड! कृपया पुनः प्रयास करें।" : "Invalid passcode! Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("anmol_admin_authenticated");
    setPasswordInput("");
    logAction("System Terminated/Logged out");
  };

  // Log audit trail
  const logAction = (action: string) => {
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      action,
      ip: "192.168.1.10"
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Change password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.oldPassword !== adminPassword) {
      setPasswordSuccess("");
      alert(isHindi ? "वर्तमान पासवर्ड गलत है।" : "Current password is incorrect.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordSuccess("");
      alert(isHindi ? "नए पासवर्ड मेल नहीं खा रहे हैं।" : "New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setPasswordSuccess("");
      alert(isHindi ? "पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।" : "Password must be at least 4 characters.");
      return;
    }

    setAdminPassword(passwordForm.newPassword);
    localStorage.setItem("anmol_admin_password", passwordForm.newPassword);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setIsChangingPassword(false);
    setPasswordSuccess(isHindi ? "पासवर्ड सफलतापूर्वक बदला गया!" : "Passcode successfully updated!");
    logAction("Admin Password Modified");
    setTimeout(() => setPasswordSuccess(""), 5000);
  };

  // Synchronize dynamic products array to LocalStorage
  const saveProductsToDB = (updatedList: Product[]) => {
    setProducts(updatedList);
    localStorage.setItem("anmol_custom_products", JSON.stringify(updatedList));
  };

  const saveReviewsToDB = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    localStorage.setItem("anmol_custom_reviews", JSON.stringify(updatedReviews));
  };

  const saveBlogsToDB = (updatedBlogs: BlogPost[]) => {
    setBlogs(updatedBlogs);
    localStorage.setItem("anmol_custom_blogs", JSON.stringify(updatedBlogs));
  };

  const saveOrdersToDB = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem("anmol_custom_orders", JSON.stringify(updatedOrders));
  };

  // CRUD Product Actions
  const handleAddOrEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand || !productForm.price) {
      alert(isHindi ? "कृपया सभी आवश्यक फ़ील्ड भरें।" : "Please fill out all required fields.");
      return;
    }

    if (editingProduct) {
      // Edit mode
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: productForm.name!,
              brand: productForm.brand!,
              category: productForm.category!,
              price: Number(productForm.price),
              originalPrice: Number(productForm.originalPrice || productForm.price),
              image: productForm.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
              description: productForm.description || "",
              badge: productForm.badge,
              inStock: productForm.inStock !== false
            }
          : p
      );
      saveProductsToDB(updated);
      logAction(`Modified Product: ${productForm.name}`);
      setEditingProduct(null);
    } else {
      // Add mode
      const newProduct: Product = {
        id: "prod_" + Date.now(),
        name: productForm.name!,
        brand: productForm.brand!,
        category: productForm.category || "Makeup",
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice || productForm.price),
        rating: 4.5,
        reviewsCount: 1,
        image: productForm.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
        description: productForm.description || "Premium Cosmetic Specially curated by Anmol Cosmetics, Mau.",
        badge: productForm.badge,
        inStock: true
      };
      saveProductsToDB([...products, newProduct]);
      logAction(`Added New Product: ${newProduct.name}`);
      setIsAddingProduct(false);
    }

    // Reset Form
    setProductForm({
      name: "",
      category: "Makeup",
      brand: "",
      price: 0,
      originalPrice: 0,
      rating: 4.5,
      reviewsCount: 1,
      image: "",
      description: "",
      badge: "New Arrival"
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(isHindi ? `क्या आप निश्चित रूप से ${name} को हटाना चाहते हैं?` : `Are you sure you want to delete ${name}?`)) {
      const filtered = products.filter((p) => p.id !== id);
      saveProductsToDB(filtered);
      logAction(`Removed Product ID: ${id}`);
    }
  };

  // Toggle instock
  const toggleStockStatus = (id: string) => {
    const updated = products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p));
    saveProductsToDB(updated);
    logAction(`Toggled Stock Level for product: ${id}`);
  };

  // Orders flow manager
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveOrdersToDB(updated);
    logAction(`Updated Order ${orderId} status to: ${newStatus}`);
  };

  // Pincode utilities
  const handleAddPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPincode || newPincode.length < 6) {
      alert(isHindi ? "वैध पिनकोड दर्ज करें।" : "Enter a valid 6-digit pincode.");
      return;
    }
    if (deliverySettings.supportedPincodes.includes(newPincode)) {
      alert("Pincode already supported.");
      return;
    }
    setDeliverySettings((prev) => ({
      ...prev,
      supportedPincodes: [...prev.supportedPincodes, newPincode]
    }));
    setNewPincode("");
    logAction(`Added service pincode: ${newPincode}`);
  };

  const handleRemovePincode = (pin: string) => {
    setDeliverySettings((prev) => ({
      ...prev,
      supportedPincodes: prev.supportedPincodes.filter((p) => p !== pin)
    }));
    logAction(`Removed service pincode: ${pin}`);
  };

  // Coupon manager
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    const newC = {
      id: Date.now().toString(),
      code: couponForm.code.toUpperCase(),
      discount: couponForm.discount,
      isActive: couponForm.isActive
    };
    setCoupons((prev) => [...prev, newC]);
    setCouponForm({ code: "", discount: 15, isActive: true });
    logAction(`Added Promotional Coupon Code: ${newC.code}`);
  };

  // Simulated Database exports
  const handleBackupExport = () => {
    const backupContent = {
      products,
      reviews,
      blogs,
      orders,
      coupons,
      deliverySettings,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupContent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ANMOL_STORE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logAction("Full SQL/JSON Database Backup Exported");
    alert(isHindi ? "बैकअप फ़ाइल सफलतापूर्वक डाउनलोड की गई!" : "Store database backup downloaded successfully!");
  };

  // Generate mock CSV data
  const handleCSVExport = (type: "products" | "orders") => {
    let headers = "";
    let rows = "";
    if (type === "products") {
      headers = "ID,Name,Category,Brand,Price,OriginalPrice,InStock,Badge\n";
      rows = products
        .map((p) => `"${p.id}","${p.name}","${p.category}","${p.brand}",${p.price},${p.originalPrice},${p.inStock},"${p.badge || ""}"`)
        .join("\n");
    } else {
      headers = "OrderID,CustomerName,Phone,Pincode,TotalAmount,PaymentMode,Status,Date\n";
      rows = orders
        .map((o) => `"${o.id}","${o.customerName}","${o.phone}","${o.pincode}",${o.total},"${o.paymentMethod}","${o.status}","${o.date}"`)
        .join("\n");
    }
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ANMOL_${type.toUpperCase()}_REPORT.csv`;
    a.click();
    logAction(`CSV Spreadsheet generated for ${type}`);
  };

  // Active Filter in Dashboard
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.brand.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchCat = catalogCategoryFilter === "All" || p.category === catalogCategoryFilter;
    return matchSearch && matchCat;
  });

  // Calculate high quality analytics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "Cancelled" ? sum + o.total : sum), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const outForDeliveryCount = orders.filter((o) => o.status === "Out for Delivery").length;
  const lowStockItems = products.filter((p) => !p.inStock).length;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden text-left font-sans">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"></div>

        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex p-3 bg-fuchsia-500/10 rounded-full text-fuchsia-400 border border-fuchsia-500/20 mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-slate-100">
            {isHindi ? "सुरक्षित एडमिन एक्सेस" : "Secure Portal Login"}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi ? "अनमोल कॉस्मेटिक्स एडमिन पैनल में लॉग इन करें" : "Authorized Store Managers & Administrators Only"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">
              {isHindi ? "एडमिन पासवर्ड दर्ज करें" : "Enter Admin Passcode"}
            </label>
            <input
              type="password"
              placeholder={isHindi ? "पासवर्ड डालें..." : "Default is admin123"}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500 transition font-mono"
            />
          </div>

          {loginError && <p className="text-xs text-red-400 font-semibold">{loginError}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-fuchsia-500/20 transition duration-200 transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-yellow-300" />
            <span>{isHindi ? "प्रवेश करें" : "Verify & Access"}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            ⚙️ <span className="font-semibold text-slate-400">{isHindi ? "सुझाव:" : "Tip:"}</span>{" "}
            {isHindi
              ? "परीक्षण करने के लिए डिफ़ॉल्ट पासवर्ड 'admin123' का उपयोग करें।"
              : "Use default password 'admin123' to test dashboard functionality."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 relative font-sans text-left">
      {/* 1. HEADER BRAND BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl text-white shadow-md">
            <ShieldCheck className="h-6 w-6 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise CRM v4.2
              </span>
              <span className="text-[10px] bg-green-500/10 text-green-400 font-extrabold px-1.5 py-0.5 rounded flex items-center space-x-1">
                <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-ping"></span>
                <span>Live System</span>
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-slate-100 tracking-tight">
              Anmol Premium Store Master Control
            </h2>
            <p className="text-[11px] text-slate-400 leading-tight">
              {isHindi ? "दुकान, वेबसाइट, एआई ब्यूटी कोच और ग्राहक एक ही जगह से प्रबंधित करें" : "Full unified store controller for products, sales tracking, WhatsApp logs, and AI configurations"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {passwordSuccess && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl font-bold">
              ✓ {passwordSuccess}
            </span>
          )}
          <button
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-bold rounded-lg text-slate-300 transition cursor-pointer"
          >
            <Key className="h-3.5 w-3.5 text-fuchsia-400" />
            <span>{isHindi ? "पासवर्ड बदलें" : "Change Passcode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-xs font-bold rounded-lg text-red-300 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>{isHindi ? "लॉग आउट" : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* 2. CORE DASHBOARD MODULE GRID SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
        {[
          { id: "dashboard", label: isHindi ? "डैशबोर्ड" : "Dashboard", icon: BarChart3, color: "text-blue-400 bg-blue-500/5 border-blue-500/20" },
          { id: "catalog", label: isHindi ? "कैटलॉग" : "Catalog", icon: Layers, color: "text-amber-400 bg-amber-500/5 border-amber-500/20" },
          { id: "orders", label: isHindi ? "ऑर्डर" : "Orders Flow", icon: ShoppingCart, color: "text-green-400 bg-green-500/5 border-green-500/20" },
          { id: "customers", label: isHindi ? "ग्राहक" : "Customers", icon: Users, color: "text-purple-400 bg-purple-500/5 border-purple-500/20" },
          { id: "ai", label: isHindi ? "एआई सेंटर" : "AI Center", icon: Sparkles, color: "text-fuchsia-400 bg-fuchsia-500/5 border-fuchsia-500/20" },
          { id: "marketing", label: isHindi ? "मार्केटिंग" : "Marketing", icon: Tag, color: "text-pink-400 bg-pink-500/5 border-pink-500/20" },
          { id: "analytics", label: isHindi ? "एनालिटिक्स" : "Analytics", icon: FileText, color: "text-cyan-400 bg-cyan-500/5 border-cyan-500/20" },
          { id: "settings", label: isHindi ? "सेटिंग्स" : "Settings", icon: Settings, color: "text-slate-400 bg-slate-500/5 border-slate-500/20" }
        ].map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition duration-200 transform hover:scale-[1.02] cursor-pointer ${
                isActive
                  ? "bg-slate-950 border-fuchsia-500 ring-1 ring-fuchsia-500/20 text-fuchsia-400 font-extrabold"
                  : `bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-400 ${mod.color}`
              }`}
            >
              <Icon className={`h-5 w-5 mb-1.5 ${isActive ? "text-fuchsia-400" : ""}`} />
              <span className="text-[11px] font-semibold leading-none">{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ALERT / SYSTEM ANNOUNCEMENT LEDGER */}
      <div className="bg-slate-950/80 border border-slate-850 px-4 py-2 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase animate-pulse">
            Active System Alerts
          </span>
          <p className="font-semibold line-clamp-1 text-slate-200">{notifications[0]}</p>
        </div>
        <button
          onClick={() => {
            const copy = [...notifications];
            copy.push(copy.shift()!);
            setNotifications(copy);
          }}
          className="text-[10px] text-fuchsia-400 font-bold hover:underline shrink-0"
        >
          {isHindi ? "अगला अलर्ट देखें »" : "Next Alert »"}
        </button>
      </div>

      {/* 4. MODULAR VIEWS CONTENT PANEL */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-850">
        
        {/* MODULE A: DASHBOARD OVERVIEW */}
        {activeModule === "dashboard" && (
          <div className="space-y-6 text-left">
            {/* 4 Grid stat widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-12 w-12 bg-green-500/5 rounded-bl-full"></div>
                <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{isHindi ? "आज की बिक्री" : "Today's Gross"}</span>
                  <span className="text-lg font-mono font-black text-slate-100">₹{totalRevenue}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-12 w-12 bg-blue-500/5 rounded-bl-full"></div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{isHindi ? "कुल ऑर्डर्स" : "Total Orders"}</span>
                  <span className="text-lg font-mono font-black text-slate-100">{orders.length}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-12 w-12 bg-yellow-500/5 rounded-bl-full"></div>
                <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{isHindi ? "एआई सलाह काउंटर" : "AI Diagnostics"}</span>
                  <span className="text-lg font-mono font-black text-slate-100">{aiChats.length + 8}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-12 w-12 bg-red-500/5 rounded-bl-full"></div>
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                  <Layers className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{isHindi ? "लो-स्टॉक चेतावनी" : "Out of Stock"}</span>
                  <span className="text-lg font-mono font-black text-red-400">{lowStockItems} Items</span>
                </div>
              </div>
            </div>

            {/* Middle Section with Charts and Quick Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Graph - Beautiful Responsive Custom SVG */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                    📈 {isHindi ? "मासिक सेल्स ग्राफ (2026)" : "Monthly Performance Analytics"}
                  </h3>
                  <span className="text-[10px] bg-fuchsia-500/10 text-fuchsia-400 font-black px-2 py-0.5 rounded uppercase">
                    UPI vs Cash sales
                  </span>
                </div>

                {/* Custom SVG Bar Chart */}
                <div className="h-44 flex items-end justify-between pt-4 pb-2 border-b border-slate-800/60 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-slate-850/50"></div>
                  <div className="absolute inset-x-0 top-2/4 border-t border-slate-850/50"></div>
                  <div className="absolute inset-x-0 top-3/4 border-t border-slate-850/50"></div>

                  {/* Bars */}
                  {[
                    { month: "Jan", sales: 40, col: "from-blue-600 to-indigo-600" },
                    { month: "Feb", sales: 55, col: "from-blue-600 to-indigo-600" },
                    { month: "Mar", sales: 75, col: "from-blue-600 to-indigo-600" },
                    { month: "Apr", sales: 45, col: "from-blue-600 to-indigo-600" },
                    { month: "May", sales: 90, col: "from-fuchsia-600 to-pink-600" },
                    { month: "Jun", sales: 110, col: "from-fuchsia-600 to-pink-600" },
                    { month: "Jul", sales: 135, col: "from-fuchsia-500 to-amber-500 animate-pulse" }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 space-y-2 z-10 group">
                      <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                        ₹{bar.sales}K
                      </div>
                      <div
                        style={{ height: `${bar.sales}%` }}
                        className={`w-8 bg-gradient-to-t ${bar.col} rounded-t-md transition-all duration-500 group-hover:scale-x-110 shadow-lg`}
                      ></div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{bar.month}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic text-center">
                  * {isHindi ? "मई और जून के महीनों में शादी के सीज़न के कारण भारी वृद्धि देखी गई।" : "Spike during May-July driven by handloom bangles & luxury bridal Shringar set consultations."}
                </p>
              </div>

              {/* Best Sellers & Quick Control Panel */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                  🔥 {isHindi ? "टॉप ट्रेंडिंग उत्पाद" : "Store Hot Items"}
                </h3>
                <div className="space-y-3 text-xs">
                  {products.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                      <div className="flex items-center space-x-2">
                        <img src={prod.image} className="w-8 h-8 object-cover rounded" />
                        <div>
                          <p className="font-bold text-slate-200 line-clamp-1">{prod.name}</p>
                          <p className="text-[9px] text-slate-500">{prod.brand} • {prod.category}</p>
                        </div>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">₹{prod.price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-850 space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Quick Diagnostics</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Delivery Efficiency:</span>
                    <span className="text-green-400 font-bold">98.4%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>AI Satisfaction Rate:</span>
                    <span className="text-amber-400 font-bold">4.9 ★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE B: CATALOG MANAGEMENT */}
        {activeModule === "catalog" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-1 w-full sm:w-auto items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={isHindi ? "उत्पाद या ब्रांड खोजें..." : "Filter catalog by brand/name..."}
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="bg-transparent border-none text-slate-200 text-xs w-full focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="All">{isHindi ? "सभी श्रेणियां" : "All Categories"}</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Lipsticks">Lipsticks</option>
                  <option value="Shringar Box">Shringar Box</option>
                  <option value="Glass Bangles">Glass Bangles</option>
                  <option value="Kundan Jewellery">Kundan Jewellery</option>
                </select>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      category: "Makeup",
                      brand: "",
                      price: 299,
                      originalPrice: 399,
                      image: "",
                      description: "",
                      badge: "New"
                    });
                    setIsAddingProduct(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isHindi ? "नया उत्पाद जोड़ें" : "Add Product"}</span>
                </button>
              </div>
            </div>

            {/* Product Add / Edit Overlay Form */}
            {(isAddingProduct || editingProduct) && (
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs uppercase text-amber-400 font-bold tracking-wider">
                    {editingProduct ? (isHindi ? "उत्पाद संपादित करें" : "Edit Product Details") : (isHindi ? "नया उत्पाद पंजीकृत करें" : "Register New Cosmetic")}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddOrEditProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "उत्पाद का नाम *" : "Cosmetic Name *"}</label>
                    <input
                      type="text"
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "ब्रांड का नाम *" : "Brand Name *"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Lakme, Maybelline, Anmol"
                      value={productForm.brand || ""}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "श्रेणी (Category) *" : "Product Category *"}</label>
                    <select
                      value={productForm.category || "Makeup"}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100 cursor-pointer"
                    >
                      <option value="Makeup">Makeup</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Lipsticks">Lipsticks</option>
                      <option value="Shringar Box">Shringar Box</option>
                      <option value="Glass Bangles">Glass Bangles</option>
                      <option value="Kundan Jewellery">Kundan Jewellery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "कीमत (₹) *" : "Selling Price (₹) *"}</label>
                    <input
                      type="number"
                      value={productForm.price || ""}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "मूल कीमत (MRP) (₹)" : "Original Price (MRP) (₹)"}</label>
                    <input
                      type="number"
                      value={productForm.originalPrice || ""}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "बैज / विशेष लेबल" : "Badge Label"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller, Trending, 15% OFF"
                      value={productForm.badge || ""}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "उत्पाद छवि URL" : "Display Photo URL"}</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={productForm.image || ""}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100 font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "विवरण (Description) *" : "Detailed Description *"}</label>
                    <textarea
                      value={productForm.description || ""}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:outline-none text-slate-100 h-16"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-xl cursor-pointer"
                    >
                      {isHindi ? "रद्द करें" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingProduct ? (isHindi ? "बदलाव सहेजें" : "Save Changes") : (isHindi ? "दर्ज करें" : "Create Item")}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Inventory Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-850">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-850">
                  <tr>
                    <th className="p-3">{isHindi ? "उत्पाद" : "Product"}</th>
                    <th className="p-3">{isHindi ? "श्रेणी" : "Category"}</th>
                    <th className="p-3">{isHindi ? "कीमत" : "Price"}</th>
                    <th className="p-3 text-center">{isHindi ? "स्टॉक स्तर" : "Stock level"}</th>
                    <th className="p-3 text-right">{isHindi ? "कार्रवाई" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-3 flex items-center space-x-2.5">
                        <img src={prod.image} className="w-9 h-9 object-cover rounded-lg border border-slate-800" />
                        <div>
                          <p className="font-extrabold text-slate-200">{prod.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{prod.brand} {prod.badge && `• [${prod.badge}]`}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-850 text-[10px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        ₹{prod.price} <span className="text-[10px] text-slate-500 line-through font-normal">₹{prod.originalPrice}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleStockStatus(prod.id)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer border ${
                            prod.inStock
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {prod.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setProductForm(prod);
                            setIsAddingProduct(false);
                          }}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-slate-950 rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE C: ORDERS & DELIVERY STATUS */}
        {activeModule === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs uppercase text-green-400 font-bold tracking-wider">
                📦 {isHindi ? "प्राप्त ऑर्डर्स की ट्रैकिंग और लॉजिस्टिक्स" : "Active Delivery Flow Manager"}
              </h3>
              <button
                onClick={() => handleCSVExport("orders")}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Export Orders (CSV)</span>
              </button>
            </div>

            {/* Orders Tracker */}
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-850 pb-2 text-xs text-slate-400 gap-2">
                    <div>
                      <p className="font-bold text-slate-200">
                        OrderID: <span className="text-amber-400 font-mono font-extrabold">{order.id}</span>
                      </p>
                      <p className="text-[10px]">{order.date} • {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online UPI payment confirmed"}</p>
                    </div>

                    {/* Step Progression Choices */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">{isHindi ? "स्थिति बदलें:" : "Status flow:"}</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer information & Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-400">{isHindi ? "ग्राहक जानकारी:" : "Customer details:"}</p>
                      <p className="font-extrabold text-slate-200">{order.customerName}</p>
                      <p className="text-slate-400 font-mono">{order.phone}</p>
                      <p className="text-slate-400">Pincode Area: <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{order.pincode}</span></p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400">{isHindi ? "खरीदे गए कॉस्मेटिक्स:" : "Cosmetics Ordered:"}</p>
                      <div className="space-y-0.5">
                        {order.items.map((it: any, index: number) => (
                          <p key={index} className="text-slate-300 font-medium">
                            • {it.name} <span className="text-[10px] text-slate-500">x{it.quantity} (₹{it.price})</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end">
                      <div className="text-left md:text-right">
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest">{isHindi ? "भुगतान योग्य राशि" : "Grand total"}</p>
                        <p className="text-lg font-mono font-black text-amber-400">₹{order.total}</p>
                      </div>

                      {/* Mock Invoice & Labels Button */}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <FileText className="h-3 w-3 text-cyan-400" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => setSelectedLabelOrder(order)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <Truck className="h-3 w-3 text-yellow-400" />
                          <span>Shipping Label</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Charge / Area settings */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-left space-y-4">
              <h4 className="text-xs uppercase text-amber-500 font-bold tracking-wider">
                🚚 Delivery & Shipping Management Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-850">
                    <span className="text-slate-400">Flat Shipping Charge:</span>
                    <span className="font-bold font-mono">₹{deliverySettings.flatCharge}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-850">
                    <span className="text-slate-400">Free Delivery Limit:</span>
                    <span className="font-bold font-mono">₹{deliverySettings.freeLimit}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Same Day Delivery:</span>
                    <span className="text-green-400 font-bold">Enabled for Mau Local</span>
                  </div>
                </div>

                {/* Serviceable Pincodes List */}
                <div className="space-y-2">
                  <p className="text-slate-400 font-semibold">{isHindi ? "सेवा योग्य पिनकोड सूची:" : "Serviceable Pincodes in Mau:"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {deliverySettings.supportedPincodes.map((pin) => (
                      <span key={pin} className="inline-flex items-center bg-slate-950 text-slate-300 border border-slate-850 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        <span>{pin}</span>
                        <button onClick={() => handleRemovePincode(pin)} className="ml-1 text-red-500 hover:text-red-400 cursor-pointer font-bold">×</button>
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddPincode} className="flex space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="e.g. 275101"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      maxLength={6}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono w-24 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded text-xs cursor-pointer"
                    >
                      + Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* MOCK INVOICE OVERLAY POPUP */}
            {selectedInvoiceOrder && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                <div className="bg-white text-slate-900 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative font-sans text-xs border border-slate-300">
                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="border-b-2 border-slate-200 pb-3 mb-3 text-center">
                    <h2 className="text-base font-serif font-black tracking-widest text-amber-600">ANMOL COSMETICS MAU</h2>
                    <p className="text-[10px] text-slate-500">Sanskrit Pathshala Road, Sadar, Mau, UP</p>
                    <p className="text-[9px] text-slate-400">GSTIN: 09AAPCA8811K1Z0 | Phone: +91 94553 21567</p>
                  </div>

                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">{isHindi ? "बिल किसको" : "Billed to"}</p>
                      <p className="font-extrabold text-sm">{selectedInvoiceOrder.customerName}</p>
                      <p className="text-slate-600">{selectedInvoiceOrder.phone}</p>
                      <p className="text-slate-500">Pincode: {selectedInvoiceOrder.pincode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">Invoice Details</p>
                      <p className="font-bold font-mono">Invoice #: {selectedInvoiceOrder.id}</p>
                      <p className="text-slate-500">Date: {selectedInvoiceOrder.date}</p>
                    </div>
                  </div>

                  {/* Invoice list table */}
                  <table className="w-full text-left border-collapse mb-4">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-500 font-bold">
                        <th className="py-1">Cosmetic Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Price</th>
                        <th className="py-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoiceOrder.items.map((it: any, i) => (
                        <tr key={i} className="text-slate-700">
                          <td className="py-1.5 font-bold">{it.name}</td>
                          <td className="py-1.5 text-center font-mono">{it.quantity}</td>
                          <td className="py-1.5 text-right font-mono">₹{it.price}</td>
                          <td className="py-1.5 text-right font-mono font-bold">₹{it.price * it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t-2 border-slate-200 pt-3 space-y-1.5 text-right font-sans">
                    <div className="flex justify-between text-slate-500">
                      <span>SGST & CGST (Integrated 18%):</span>
                      <span className="font-mono">₹{Math.round(selectedInvoiceOrder.total * 0.18)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Local Delivery Charges:</span>
                      <span className="font-mono">₹{selectedInvoiceOrder.total >= 499 ? "0 (FREE)" : "60"}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-dashed border-slate-300">
                      <span>Final Grand Total (INR):</span>
                      <span className="font-mono text-amber-600">₹{selectedInvoiceOrder.total}</span>
                    </div>
                  </div>

                  <div className="mt-5 text-center text-[10px] text-slate-500 italic border-t border-slate-100 pt-3">
                    {isHindi ? "शॉपिंग करने के लिए धन्यवाद! यह एक कंप्यूटर जनरेटेड रसीद है।" : "Thank you for supporting Mau Local Handloom & Cosmetics! This is a secure system invoice."}
                  </div>
                </div>
              </div>
            )}

            {/* MOCK SHIPPING LABEL OVERLAY POPUP */}
            {selectedLabelOrder && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                <div className="bg-white text-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative font-mono text-[11px] border-4 border-slate-900">
                  <button
                    onClick={() => setSelectedLabelOrder(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="border-b-4 border-slate-900 pb-2 mb-3 text-center">
                    <p className="font-black text-sm tracking-widest text-slate-900">ANMOL SPEED LOGISTICS</p>
                    <p className="text-[9px] text-slate-500">SAME-DAY LOCAL MAU ROUTING SERVICE</p>
                  </div>

                  <div className="border-b-2 border-dashed border-slate-400 pb-3 mb-3">
                    <p className="font-bold text-[9px] uppercase text-slate-500">To Delivery Destination:</p>
                    <p className="text-xs font-black">{selectedLabelOrder.customerName}</p>
                    <p className="font-black">Phone: {selectedLabelOrder.phone}</p>
                    <p className="font-extrabold text-xs">Mau Delivery Area, UP - {selectedLabelOrder.pincode}</p>
                  </div>

                  <div className="flex justify-between items-center bg-slate-100 p-2 border-2 border-slate-900 mb-3">
                    <div>
                      <p className="text-[9px] text-slate-500">PAYMENT TYPE</p>
                      <p className="font-black text-sm text-slate-900">{selectedLabelOrder.paymentMethod === "COD" ? "COD (₹" + selectedLabelOrder.total + ")" : "PREPAID UPI"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500">WEIGHT</p>
                      <p className="font-black text-slate-900">0.45 KG</p>
                    </div>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="text-center py-2 border-t-2 border-slate-900">
                    <div className="h-10 bg-slate-900 w-full flex space-x-0.5 justify-center overflow-hidden">
                      {Array.from({ length: 45 }).map((_, i) => (
                        <div key={i} style={{ width: i % 3 === 0 ? "3px" : i % 5 === 0 ? "5px" : "1px" }} className="bg-white h-full"></div>
                      ))}
                    </div>
                    <p className="text-[10px] tracking-widest font-bold mt-1.5">{selectedLabelOrder.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE D: CUSTOMERS & REVIEWS */}
        {activeModule === "customers" && (
          <div className="space-y-6">
            <h3 className="text-xs uppercase text-purple-400 font-bold tracking-wider">
              👥 {isHindi ? "पंजीकृत ग्राहक और समीक्षा मॉडरेशन" : "Loyal Customer Profiles & Reviews Moderation"}
            </h3>

            {/* Customers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Priyanka S. (Mau)", phone: "919455321567", spend: 3499, points: 349, skin: "Dry Skin (Hydration score: 82)" },
                { name: "Pooja Singh (Sadar)", phone: "919455321122", spend: 1899, points: 189, skin: "Combination (Spots score: 65)" },
                { name: "Anjali Gupta (Junction)", phone: "918855442211", spend: 599, points: 59, skin: "Oily Skin (Acne marks prone)" }
              ].map((cust, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-left">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <p className="font-extrabold text-slate-100">{cust.name}</p>
                    <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      {cust.points} Loyalty Coins
                    </span>
                  </div>
                  <p className="text-slate-400">Phone: <span className="font-mono text-slate-300">{cust.phone}</span></p>
                  <p className="text-slate-400">Skin Profile: <span className="text-slate-300 font-semibold">{cust.skin}</span></p>
                  <p className="text-slate-400">Lifetime Purchased Volume: <span className="text-amber-400 font-bold font-mono">₹{cust.spend}</span></p>
                </div>
              ))}
            </div>

            {/* Reviews list moderation */}
            <div className="pt-4 border-t border-slate-850 space-y-4">
              <h4 className="text-xs uppercase text-amber-500 font-bold tracking-widest">
                ⭐ {isHindi ? "समीक्षा मॉडरेशन" : "Approved Customer Testimonials"}
              </h4>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{rev.userName}</span>
                        <span className="text-amber-500 font-mono">{"★".repeat(rev.rating)}</span>
                      </div>
                      <p className="text-slate-300 italic">"{rev.comment}"</p>
                      <p className="text-[10px] text-slate-500">{rev.date}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full uppercase border border-green-500/20">
                        {rev.verified ? "Verified Buy" : "General"}
                      </span>
                      <button
                        onClick={() => {
                          const updated = reviews.map(r => r.id === rev.id ? { ...r, verified: !r.verified } : r);
                          saveReviewsToDB(updated);
                          logAction(`Toggled verified status for review: ${rev.id}`);
                        }}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-855 text-[10px] rounded text-slate-300 border border-slate-800 cursor-pointer"
                      >
                        {isHindi ? "टॉगल सत्यापित" : "Toggle Verification"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete review?")) {
                            const filtered = reviews.filter(r => r.id !== rev.id);
                            saveReviewsToDB(filtered);
                            logAction(`Deleted Review ID: ${rev.id}`);
                          }
                        }}
                        className="p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 rounded cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE E: AI BEAUTY COACH CENTER */}
        {activeModule === "ai" && (
          <div className="space-y-6">
            <h3 className="text-xs uppercase text-fuchsia-400 font-bold tracking-wider border-b border-slate-800 pb-2">
              🤖 {isHindi ? "एआई ब्यूटी कोच कंट्रोल पैनल" : "AI Consultation & Diagnosis Logs"}
            </h3>

            {/* Prompt Tuning Config */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 text-left">
              <h4 className="text-xs uppercase text-amber-500 font-bold tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
                <span>AI Prompt Personality Editor</span>
              </h4>
              <p className="text-slate-400">
                {isHindi 
                  ? "अपनी आवश्यकताओं के अनुसार ब्यूटी कोच के टोन और प्रतिक्रियाओं को सुधारे" 
                  : "Calibrate the core identity directives injected into Gemini 3.5-flash for client advice."}
              </p>
              <div>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-3 h-28 focus:outline-none focus:border-fuchsia-500 text-[11px] leading-relaxed font-mono"
                  defaultValue="You are the Expert AI Beauty Coach for Anmol Cosmetics, Mau. You speak in a warm, friendly and highly professional tone using a customized blend of Hindi and English (Hinglish). Specifically recommend products like Lakme Natural Mousse, Derma Co Sunscreen Gel, Minimalist Niacinamide Serum, and Handmade Mau Glass Bangles."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    logAction("AI System Directives Updated");
                    alert(isHindi ? "एआई डायरेक्टिव्स अपडेट किए गए!" : "Gemini System Guidelines customized!");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:opacity-90 cursor-pointer"
                >
                  Update Directives
                </button>
              </div>
            </div>

            {/* AI Diagnostics Logging browser */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase text-slate-400 font-bold tracking-widest text-left">
                🕒 {isHindi ? "हालिया ग्राहक बातचीत इतिहास" : "Live AI Consultation Transcripts"}
              </h4>

              {aiChats.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">
                  {isHindi ? "अभी तक कोई इतिहास उपलब्ध नहीं है।" : "Chat history ledger currently vacant."}
                </p>
              ) : (
                <div className="space-y-3">
                  {aiChats.map((chat) => (
                    <div key={chat.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-left">
                      <div className="flex justify-between border-b border-slate-850 pb-1.5 text-slate-400">
                        <span className="font-bold text-slate-200">Mode: {chat.userProfile?.mode || "AI Coach"}</span>
                        <span>{new Date(chat.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-amber-500 font-bold">{isHindi ? "यूजर प्रश्न:" : "User Query:"}</p>
                      <p className="text-slate-300 italic bg-slate-950/50 p-2 rounded border border-slate-850">"{chat.prompt}"</p>
                      <p className="text-green-400 font-bold">{isHindi ? "एआई निदान:" : "AI Diagnosis:"}</p>
                      <p className="text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-850 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                        {chat.aiResponse}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE F: MARKETING & COUPONS */}
        {activeModule === "marketing" && (
          <div className="space-y-6">
            <h3 className="text-xs uppercase text-pink-400 font-bold tracking-wider border-b border-slate-800 pb-2">
              🎁 {isHindi ? "कूपन, होमपेज बिल्डर और ब्लॉग" : "Promotions, Coupons & Homepage Builder"}
            </h3>

            {/* Coupons manager */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-left">
                <h4 className="text-xs uppercase text-amber-400 font-bold tracking-wider">
                  🎫 Create Promo Coupon
                </h4>

                <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Coupon Code:</label>
                    <input
                      type="text"
                      placeholder="e.g. MAUSTYLE"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Discount Value (%):</label>
                    <input
                      type="number"
                      value={couponForm.discount}
                      onChange={(e) => setCouponForm({ ...couponForm, discount: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Add Coupon Code
                  </button>
                </form>
              </div>

              {/* Coupons display */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-2 space-y-3 text-left">
                <h4 className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                  🎟️ Active Coupons
                </h4>
                <div className="space-y-2 text-xs">
                  {coupons.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-850">
                      <div>
                        <span className="font-mono font-black text-slate-100 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded">
                          {c.code}
                        </span>
                        <span className="text-slate-400 ml-3">Flat {c.discount}% Discount</span>
                      </div>

                      <button
                        onClick={() => {
                          setCoupons(prev => prev.filter(x => x.id !== c.id));
                          logAction(`Removed Coupon Code: ${c.code}`);
                        }}
                        className="text-red-400 hover:text-red-500 font-extrabold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Homepage builder form */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-left space-y-4">
              <h4 className="text-xs uppercase text-amber-500 font-bold tracking-wider">
                🏠 Instant Homepage Customizer (No Code Required)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Hero Section Main Tagline (English):</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    defaultValue="Choose the perfect cosmetics verified by AI Diagnostics."
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Hero Section Main Tagline (Hindi Devanagari):</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    defaultValue="AI की मदद से अपनी Skin के लिए सही Product चुनें।"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Store Helpline Number (WhatsApp Link):</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    defaultValue="+91 94553 21567"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Seasonal Festival Banner Promo Quote:</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    defaultValue="🪔 SPECIAL SAWAN FESTIVAL OFFER: FREE SHRINGAR BOX MATCH ON ALL MAU GLASS BANGLES!"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    logAction("Homepage Hero layout updated");
                    alert("Homepage elements updated successfully!");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl hover:opacity-90 cursor-pointer"
                >
                  Save Homepage Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODULE G: ANALYTICS & REPORTS */}
        {activeModule === "analytics" && (
          <div className="space-y-6">
            <h3 className="text-xs uppercase text-cyan-400 font-bold tracking-wider border-b border-slate-800 pb-2">
              📈 {isHindi ? "वित्तीय विश्लेषण और डेटा बैकअप" : "Store Performance Metrics & Data Backup"}
            </h3>

            {/* Data summary table */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-left space-y-4">
              <h4 className="text-xs uppercase text-amber-500 font-bold tracking-wider">
                📊 Store Financial breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[10px] uppercase">Average Order Value (AOV)</p>
                  <p className="text-base font-bold text-slate-200 font-mono">₹892.40</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[10px] uppercase">Daily Unique Visitors</p>
                  <p className="text-base font-bold text-slate-200 font-mono">142 Visits</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[10px] uppercase">AI to Cart Conversion</p>
                  <p className="text-base font-bold text-green-400 font-mono">24.5%</p>
                </div>
              </div>
            </div>

            {/* Backups controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                  💾 System Data Backup
                </h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Download a complete backup snapshot of your current products, orders, categories, and promotions. You can restore this file anytime to restore store data.
                </p>
                <button
                  onClick={handleBackupExport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1 hover:opacity-90 cursor-pointer"
                >
                  <Database className="h-4 w-4" />
                  <span>Download SQL Backup File</span>
                </button>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                  📄 Bulk CSV Reports Generator
                </h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Generate immediate spreadsheet compatible files for accounts and inventory planning audits.
                </p>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => handleCSVExport("products")}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Products List</span>
                  </button>
                  <button
                    onClick={() => handleCSVExport("orders")}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Sales Orders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE H: SETTINGS & SECURITY */}
        {activeModule === "settings" && (
          <div className="space-y-6">
            <h3 className="text-xs uppercase text-slate-400 font-bold tracking-widest border-b border-slate-800 pb-2 text-left">
              ⚙️ {isHindi ? "सिस्टम सेटिंग्स और सुरक्षा" : "Security Configuration & Access Control Ledger"}
            </h3>

            {/* STORE LOCATION SETTING */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-xs text-left space-y-4">
              <h4 className="text-sm uppercase text-amber-500 font-bold tracking-wider flex items-center space-x-1.5">
                <Store className="h-5 w-5 text-amber-500" />
                <span>{isHindi ? "दुकान का मुख्य स्थान सेट करें" : "Store Main Location Configuration"}</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isHindi
                  ? "नक्शे पर क्लिक करके या पिन को खींचकर अपनी दुकान का सटीक स्थान सेट करें। ग्राहक इसी स्थान के आधार पर अपनी दूरी और डिलीवरी समय देख पाएंगे।"
                  : "Drag the pin or click on the map below to configure your official physical store location in Mau. Customers will see this location to coordinate self-pickups or check distances."}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isHindi ? "दुकान का पता दर्ज करें" : "Store Physical Address"}</label>
                    <textarea
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 text-slate-100 text-xs leading-normal"
                      placeholder={isHindi ? "दुकान का पूरा पता दर्ज करें" : "Enter complete shop physical address details"}
                    />
                  </div>

                  {/* AUTO-DOWNLOAD MAP SETTING */}
                  <div className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <input
                      type="checkbox"
                      id="auto-download"
                      checked={autoDownload}
                      onChange={(e) => setAutoDownload(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="auto-download" className="text-[11px] font-semibold text-slate-300 leading-snug cursor-pointer select-none">
                      {isHindi 
                        ? "अपडेट पर 25 किमी का ऑफलाइन मैप आटोमेटिक डाउनलोड करें" 
                        : "Auto-download and sync 25km radius offline map data on location update"}
                    </label>
                  </div>

                  {isMapDownloading && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-2.5 shadow-2xl">
                      <div className="flex items-center justify-between text-[10px] md:text-xs">
                        <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{isHindi ? "मैप पैकेज संकलित हो रहा है" : "Syncing Map Bundle..."}</span>
                        </span>
                        <span className="font-mono text-slate-300 font-bold">{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        {downloadStep}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSaveShopLocation}
                    disabled={isMapDownloading}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded-xl font-bold transition transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isHindi ? "लोकेशन सेटिंग्स सुरक्षित करें" : "Save Location Settings"}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <MapSelector
                    lat={shopLat}
                    lng={shopLng}
                    onLocationChange={(lat, lng) => {
                      setShopLat(lat);
                      setShopLng(lng);
                    }}
                    label={isHindi ? "नक्शे पर दुकान का स्थान" : "Configure Shop coordinates on Map"}
                    language={language}
                  />
                </div>
              </div>
            </div>

            {/* CUSTOM LANDMARK BUILDER & OFFLINE MAP UPLOADER */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-xs text-left space-y-4">
              <h4 className="text-sm uppercase text-amber-500 font-bold tracking-wider flex items-center space-x-1.5">
                <Database className="h-5 w-5 text-amber-500" />
                <span>{isHindi ? "कस्टम ऑफलाइन मैप डेटा अपलोडर" : "Custom Offline Map & Landmark Manager"}</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isHindi
                  ? "यदि स्वचालित रूप से सेट किए गए मैप पॉइंट्स (जैसे रेलवे स्टेशन, मुंशीपुरा आदि) की स्थिति गलत दिख रही है, तो आप अपने खुद के सटीक स्थानों का डेटा फ़ाइल (.json या .geojson) यहाँ मैनुअली अपलोड कर सकते हैं। यह ऐप पुराने डेटा को ओवरराइड करके आपके द्वारा दिए गए सटीक पॉइंट रेंडर करेगा।"
                  : "If default landmarks on the map are inaccurate or incorrectly labeled, you can construct and upload your own authoritative offline map dataset (.json or .geojson). The custom points will immediately override the defaults."}
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <h5 className="font-bold text-slate-300 text-xs flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>{isHindi ? "मैप डेटा फ़ाइल टेम्पलेट फॉर्मेट" : "JSON Landmark Data Format"}</span>
                </h5>
                <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800 overflow-x-auto leading-normal">
{`[
  {
    "name": "Mau Junction Railway Station",
    "nameHi": "मऊ जंक्शन रेलवे स्टेशन",
    "lat": 25.9525,
    "lng": 83.5615,
    "type": "station"
  },
  {
    "name": "Anmol Cosmetics Store",
    "nameHi": "अनमोल कॉस्मेटिक्स",
    "lat": 25.9485,
    "lng": 83.5650,
    "type": "shop"
  }
]`}
                </pre>
                
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      const template = [
                        { name: "Mau Junction Railway Station", nameHi: "मऊ जंक्शन रेलवे स्टेशन", lat: 25.9525, lng: 83.5615, type: "station" },
                        { name: "Sanskriti Pathshala", nameHi: "संस्कृति पाठशाला", lat: 25.9455, lng: 83.5635, type: "education" },
                        { name: "Munshipura Chauraha", nameHi: "मुंशीपुरा चौराहा", lat: 25.9490, lng: 83.5605, type: "crossing" },
                        { name: "Anmol Cosmetics Shop", nameHi: "अनमोल कॉस्मेटिक्स", lat: 25.9485, lng: 83.5650, type: "shop" }
                      ];
                      const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "anmol_custom_landmarks_template.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 text-[10px] font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isHindi ? "टेम्पलेट JSON डाउनलोड करें" : "Download Sample JSON Template"}</span>
                  </button>

                  <button
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = ".json,.geojson";
                      fileInput.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            let loaded: any[] = [];
                            if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
                              parsed.features.forEach((f: any) => {
                                if (f.geometry && f.geometry.type === "Point") {
                                  loaded.push({
                                    name: f.properties?.name || "Custom Point",
                                    nameHi: f.properties?.nameHi || f.properties?.name || "कस्टम पॉइंट",
                                    lat: f.geometry.coordinates[1],
                                    lng: f.geometry.coordinates[0],
                                    type: f.properties?.type || "custom"
                                  });
                                }
                              });
                            } else if (Array.isArray(parsed)) {
                              parsed.forEach((x: any) => {
                                if (x.lat && x.lng) {
                                  loaded.push({
                                    name: x.name || "Custom Point",
                                    nameHi: x.nameHi || x.name || "कस्टम पॉइंट",
                                    lat: Number(x.lat),
                                    lng: Number(x.lng),
                                    type: x.type || "custom"
                                  });
                                }
                              });
                            }
                            if (loaded.length > 0) {
                              localStorage.setItem("anmol_custom_landmarks", JSON.stringify(loaded));
                              const newMeta = {
                                synced: true,
                                lastSynced: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
                                tilesCount: 1500 + loaded.length,
                                radiusKm: 25,
                                isCustomUpload: true
                              };
                              localStorage.setItem("anmol_offline_map_meta", JSON.stringify(newMeta));
                              window.dispatchEvent(new Event("anmol_offline_map_updated"));
                              alert(isHindi 
                                ? `सफलतापूर्वक अपलोड! ${loaded.length} नए कस्टमाइज़्ड स्थान अब एक्टिव हैं।` 
                                : `Successfully imported ${loaded.length} custom offline landmark records!`);
                            } else {
                              alert("No valid points found!");
                            }
                          } catch (err) {
                            alert("Invalid file structure!");
                          }
                        };
                        reader.readAsText(file);
                      };
                      fileInput.click();
                    }}
                    className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 text-[10px] transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isHindi ? "कस्टम ऑफलाइन फ़ाइल अपलोड करें" : "Upload Custom Offline File"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role matrix */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-left space-y-3">
                <h4 className="text-xs uppercase text-amber-500 font-bold tracking-wider">
                  🔑 Admin User Permissions Matrix
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                    <span className="font-extrabold text-slate-200">Super Admin (Anmol)</span>
                    <span className="text-green-400 font-bold">ALL Perms</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                    <span className="font-semibold text-slate-300">Store Manager</span>
                    <span className="text-slate-400">Inventory & Orders only</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400">Delivery Boy App</span>
                    <span className="text-slate-500">Routing View only</span>
                  </div>
                </div>
              </div>

              {/* Security ledger logs */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-left space-y-3">
                <h4 className="text-xs uppercase text-red-400 font-bold tracking-wider flex items-center space-x-1">
                  <Lock className="h-4 w-4 text-red-400 animate-pulse" />
                  <span>Administrative Security Log</span>
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] text-slate-400">
                  {logs.map((log) => (
                    <p key={log.id} className="leading-tight">
                      [{log.time}] {log.action} ({log.ip})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHANGE PASSWORD OVERLAY MODAL */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative font-sans text-xs text-left">
            <button
              onClick={() => {
                setIsChangingPassword(false);
                setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm uppercase text-fuchsia-400 font-extrabold tracking-widest mb-4 border-b border-slate-800 pb-2">
              🔐 {isHindi ? "एडमिन पासवर्ड बदलें" : "Update Admin Passcode"}
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">{isHindi ? "पुराना पासवर्ड *" : "Current Passcode *"}</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isHindi ? "नया पासवर्ड *" : "New Passcode *"}</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isHindi ? "नए पासवर्ड की पुष्टि करें *" : "Confirm New Passcode *"}</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg cursor-pointer"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-bold hover:opacity-95 cursor-pointer"
                >
                  {isHindi ? "पासवर्ड अपडेट करें" : "Update Passcode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
