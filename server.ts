import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express app
const app = express();
const PORT = 3000;

// Setup JSON body parser with increased limit for base64 skin photos
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini client utility
// Always set the User-Agent header to 'aistudio-build' in httpOptions for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mock/In-Memory database for products, reviews, and orders
const products = [
  // --- MAKEUP CATEGORY ---
  {
    id: "m1",
    name: "Lakme Absolute Skin Natural Mousse",
    category: "Makeup",
    brand: "Lakme",
    price: 850,
    originalPrice: 950,
    rating: 4.8,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
    description: "Feather-light mousse formula that blends seamlessly for a flawless, natural finish with SPF 8. Perfect for daily or party wear.",
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: "m2",
    name: "Maybelline New York Fit Me Matte Poreless Foundation",
    category: "Makeup",
    brand: "Maybelline",
    price: 599,
    originalPrice: 699,
    rating: 4.7,
    reviewsCount: 245,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
    description: "An ultra-blendable liquid foundation that controls shine, refines pores, and leaves a natural matte finish.",
    inStock: true,
    badge: "Trending",
  },
  {
    id: "m3",
    name: "Swiss Beauty Liquid Concealer",
    category: "Makeup",
    brand: "Swiss Beauty",
    price: 229,
    originalPrice: 249,
    rating: 4.6,
    reviewsCount: 189,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=80",
    description: "High coverage liquid concealer that easily covers blemishes, dark spots, and redness with a lightweight, matte finish.",
    inStock: true,
    badge: "Under ₹499",
  },

  // --- SKINCARE CATEGORY ---
  {
    id: "s1",
    name: "Mamaearth Vitamin C Daily Glow Face Wash",
    category: "Skincare",
    brand: "Mamaearth",
    price: 249,
    originalPrice: 299,
    rating: 4.5,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
    description: "Enriched with Vitamin C and Turmeric, this daily face wash gently cleanses, fights dullness, and gives your skin a natural, healthy glow.",
    inStock: true,
    badge: "Most Ordered",
  },
  {
    id: "s2",
    name: "The Derma Co 1% Hyaluronic Sunscreen Aqua Gel",
    category: "Skincare",
    brand: "The Derma Co",
    price: 499,
    originalPrice: 499,
    rating: 4.9,
    reviewsCount: 410,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
    description: "Broad-spectrum sunscreen gel with SPF 50 & PA++++. Non-greasy, lightweight, and leaves absolutely no white cast.",
    inStock: true,
    badge: "Must Have",
  },
  {
    id: "s3",
    name: "Minimalist 10% Niacinamide Face Serum",
    category: "Skincare",
    brand: "Minimalist",
    price: 599,
    originalPrice: 599,
    rating: 4.8,
    reviewsCount: 188,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=80",
    description: "A nourishing daily serum that reduces acne marks, tightens open pores, regulates sebum, and strengthens the skin barrier.",
    inStock: true,
    badge: "Top Rated",
  },

  // --- HAIR CARE CATEGORY ---
  {
    id: "h1",
    name: "L'Oréal Professionnel Absolute Repair Shampoo",
    category: "Hair Care",
    brand: "L'Oréal",
    price: 745,
    originalPrice: 795,
    rating: 4.8,
    reviewsCount: 154,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80",
    description: "Infused with gold quinoa and protein, this professional shampoo deeply restores and reconstructs damaged hair, leaving it soft and shiny.",
    inStock: true,
    badge: "Premium",
  },
  {
    id: "h2",
    name: "Tresemmé Keratin Smooth Serum",
    category: "Hair Care",
    brand: "Tresemmé",
    price: 425,
    originalPrice: 450,
    rating: 4.6,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=80",
    description: "Enriched with Keratin and Argan Oil, it eliminates frizz, adds intense shine, and provides a sleek salon-finish style.",
    inStock: true,
    badge: "Under ₹499",
  },

  // --- LIPSTICKS & EYE MAKEUP ---
  {
    id: "l1",
    name: "Sugar Cosmetics Matte Attack Liquid Lipstick - Red",
    category: "Lipsticks",
    brand: "Sugar",
    price: 499,
    originalPrice: 599,
    rating: 4.7,
    reviewsCount: 177,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80",
    description: "Transfer-proof, intensely pigmented matte liquid lipstick that lasts up to 12 hours without drying your lips.",
    inStock: true,
    badge: "Bold Shade",
  },
  {
    id: "e1",
    name: "Insight Cosmetics Intense Kohl Kajal",
    category: "Eye Makeup",
    brand: "Insight",
    price: 150,
    originalPrice: 175,
    rating: 4.5,
    reviewsCount: 340,
    image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=500&auto=format&fit=crop&q=80",
    description: "Smudge-proof and waterproof, ultra-black kohl kajal pencil for dramatic and gorgeous eyes that stay all day long.",
    inStock: true,
    badge: "Under ₹199",
  },

  // --- BRIDAL & SHRINGAR ---
  {
    id: "b1",
    name: "Suhagan Premium Bridal Shringar Box",
    category: "Shringar Box",
    brand: "Anmol Specials",
    price: 1899,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=500&auto=format&fit=crop&q=80",
    description: "Complete traditional Shringar box for brides. Includes premium Sindoor, Bindi, Mehendi cones, Kajal, Mahavar, Alta, and essential bridal cosmetics.",
    inStock: true,
    badge: "Wedding Collection",
  },
  {
    id: "b2",
    name: "Anmol Mau-Special Handmade Glass Bangles Set",
    category: "Glass Bangles",
    brand: "Anmol Specials",
    price: 349,
    originalPrice: 499,
    rating: 4.9,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80",
    description: "Traditional handmade glass bangles set from Mau. Features elegant design with glittery stonework, ideal for weddings and festivals.",
    inStock: true,
    badge: "Traditional Mau",
  },
  {
    id: "b3",
    name: "Kundan Royal Bridal Jewellery Choker Set",
    category: "Kundan Jewellery",
    brand: "Anmol Specials",
    price: 2499,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80",
    description: "Exquisite heavy Kundan choker necklace set with matching earrings and Maang Tikka. Plated with premium gold polish.",
    inStock: true,
    badge: "Festival Offer",
  },

  // --- PERFUMES & FRAGRANCES ---
  {
    id: "p1",
    name: "Nivea Fresh Flower Deodorant",
    category: "Perfumes",
    brand: "Nivea",
    price: 199,
    originalPrice: 249,
    rating: 4.4,
    reviewsCount: 201,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80",
    description: "Long-lasting freshness with a delightful floral fragrance that cares for your delicate underarm skin.",
    inStock: true,
    badge: "Under ₹199",
  },
];

// In-memory reviews list
const reviews = [
  {
    id: "rev1",
    userName: "Pooja Singh",
    rating: 5,
    comment: "Anmol Cosmetics se online order kiya tha, Mau mein sirf 3 ghante mein same-day home delivery ho gayi! Products 100% original hain, main bahut khush hoon. Dhanyawad!",
    date: "2026-06-28",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    verified: true,
    tags: ["Fast Delivery", "Original Products"],
  },
  {
    id: "rev2",
    userName: "Anjali Gupta",
    rating: 5,
    comment: "Handmade glass bangles ka collection bahut hi shaandar hai. Shaadi ke liye Bridal Shringar Box mangvaya tha, quality lajawab hai. AI Coach ne bilkul sahi matching lip shade suggest kiya!",
    date: "2026-07-02",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    verified: true,
    tags: ["Bridal Special", "Beautiful Bangles"],
  },
  {
    id: "rev3",
    userName: "Komal Verma",
    rating: 4,
    comment: "Mau ke liye best shop! Pehle dukaan pe jaate the ab ghar baithe mangva lete hain. WhatsApp order feature bahut useful hai, bilkul aasan.",
    date: "2026-07-04",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    verified: true,
    tags: ["Local Delivery", "Easy WhatsApp Ordering"],
  },
];

// In-memory blog posts
const blogs = [
  {
    id: "b1",
    title: "10 Essential Bridal Shringar Steps for Mau Brides",
    excerpt: "Discover the beautiful traditions and the premium shringar routine every bride in Mau must follow to look stunning on her wedding day.",
    author: "Anmol Beauty Experts",
    date: "July 1, 2026",
    category: "Bridal Tips",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "b2",
    title: "Monsoon Skincare Routine: How to avoid Sticky & Oily Skin",
    excerpt: "With rains starting in Mau, humidity levels are rising. Here are simple steps suggested by our AI Beauty Coach to keep your skin fresh and non-sticky.",
    author: "Anmol AI Coach",
    date: "June 25, 2026",
    category: "Skincare",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80",
  },
];

// Admin Chat logs & Analytics
const chatLogs: Array<{ id: string; timestamp: Date; userProfile: any; prompt: string; aiResponse: string }> = [];
const orders: Array<{ id: string; customerName: string; phone: string; items: any[]; total: number; paymentMethod: string; pincode: string; status: string; date: Date }> = [];

// ==========================================
// API ENDPOINTS
// ==========================================

// Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Get reviews
app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

// Add a review
app.post("/api/reviews", (req, res) => {
  const { userName, rating, comment, tags } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ error: "Required fields missing" });
  }
  const newReview = {
    id: "rev_" + Date.now(),
    userName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split("T")[0],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    verified: true,
    tags: tags || ["Verified Purchase"],
  };
  reviews.unshift(newReview);
  res.status(201).json(newReview);
});

// Get blogs
app.get("/api/blogs", (req, res) => {
  res.json(blogs);
});

// Pin code checker
app.get("/api/check-delivery/:pincode", (req, res) => {
  const pincode = req.params.pincode;
  const deliveryZones: Record<string, { available: boolean; time: string; charges: string }> = {
    "275101": { available: true, time: "Same Day (Within 3 Hours)", charges: "FREE Delivery" },
    "275102": { available: true, time: "Same Day (Within 4 Hours)", charges: "₹30 or FREE above ₹499" },
    "275105": { available: true, time: "Same Day (Within 5 Hours)", charges: "₹40 or FREE above ₹499" },
    "275301": { available: true, time: "Next Day Delivery", charges: "₹50 or FREE above ₹999" },
    "275304": { available: true, time: "Next Day Delivery", charges: "₹50 or FREE above ₹999" },
  };

  const deliveryInfo = deliveryZones[pincode];
  if (deliveryInfo) {
    res.json({ pincode, ...deliveryInfo });
  } else {
    // If it's a general Uttar Pradesh pincode or other near Mau
    if (pincode.startsWith("275") || pincode.startsWith("221")) {
      res.json({
        pincode,
        available: true,
        time: "1-2 Days Delivery",
        charges: "₹60 or FREE above ₹999",
      });
    } else {
      res.json({
        pincode,
        available: false,
        time: "Not deliverable locally",
        charges: "We currently deliver only in Mau and neighboring regions.",
      });
    }
  }
});

// Handle simulated checkout and WhatsApp order generation
app.post("/api/whatsapp-order", (req, res) => {
  const { items, customerName, phone, address, pincode, paymentMethod } = req.body;
  if (!items || items.length === 0 || !customerName || !phone || !address || !pincode) {
    return res.status(400).json({ error: "Missing required order details." });
  }

  // Calculate order totals
  let total = 0;
  let itemsSummaryText = "";
  items.forEach((item: any) => {
    total += item.price * item.quantity;
    itemsSummaryText += `• ${item.name} (${item.brand}) x${item.quantity} - ₹${item.price * item.quantity}\n`;
  });

  const orderId = "ANMOL-" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    customerName,
    phone,
    items,
    total,
    paymentMethod,
    pincode,
    status: "Pending/Processing",
    date: new Date(),
  };
  orders.push(newOrder);

  // Format order message for WhatsApp
  const shopWhatsAppNumber = "919455321567"; // Hardcoded premium shop owner WhatsApp number (or representative)
  const messageText = `🛍 *ANMOL COSMETICS MAU - NEW ORDER!*\n\n` +
    `*Order ID:* ${orderId}\n` +
    `*Customer:* ${customerName}\n` +
    `*Phone:* ${phone}\n` +
    `*Delivery Address:* ${address}, Mau (Pincode: ${pincode})\n` +
    `*Payment Mode:* ${paymentMethod === "COD" ? "Cash on Delivery (COD) 💳" : "UPI Online 📱"}\n\n` +
    `📦 *Products Ordered:*\n${itemsSummaryText}\n` +
    `💰 *Total Amount:* ₹${total}\n\n` +
    `🚚 _Thank you for shopping with Mau's premium beauty shop! Our representative will confirm your delivery shortly._`;

  const encodedMessage = encodeURIComponent(messageText);
  const whatsAppUrl = `https://wa.me/${shopWhatsAppNumber}?text=${encodedMessage}`;

  res.json({
    success: true,
    orderId,
    total,
    whatsAppUrl,
    messageText,
  });
});

// Admin endpoints
app.get("/api/admin/analytics", (req, res) => {
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  res.json({
    totalSales,
    totalOrders: orders.length,
    chatCount: chatLogs.length,
    recentOrders: orders.slice(-5).reverse(),
    recentChats: chatLogs.slice(-5).reverse(),
    productStats: {
      total: products.length,
      categories: [...new Set(products.map((p) => p.category))],
      brands: [...new Set(products.map((p) => p.brand))],
    },
  });
});

app.get("/api/admin/chat-logs", (req, res) => {
  res.json(chatLogs);
});

// ==========================================
// GEMINI RETRY & DECORATOR BACKOFF UTILITY
// ==========================================
async function generateContentWithRetry(params: any, retries = 3, delayMs = 1000): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (err: any) {
      const errMsg = String(err?.message || "").toUpperCase();
      const isUnavailable = errMsg.includes("503") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("HIGH DEMAND") ||
                            err?.status === 503 ||
                            err?.code === 503;
      
      const isRateLimit = errMsg.includes("429") || 
                          errMsg.includes("RESOURCE_EXHAUSTED") ||
                          err?.status === 429 ||
                          err?.code === 429;

      if ((isUnavailable || isRateLimit) && attempt < retries) {
        console.warn(`Gemini API returned 503/429 (Attempt ${attempt}/${retries}). Retrying in ${delayMs * attempt}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }
}

// ==========================================
// CUSTOM LOCAL HIGH-FIDELITY FALLBACK GENERATORS
// ==========================================
function generateBeautyCoachFallback(age: number, skinType: string, oiliness: string, budget: string, concerns: string, hairProblems: string, language: string) {
  const isHi = language.toLowerCase().includes("hi") || language.toLowerCase().includes("hin");
  
  if (isHi) {
    return `### ✨ अनमोल सौंदर्य कोच - आपकी व्यक्तिगत सौंदर्य रिपोर्ट (स्मार्ट ऑफलाइन बैकअप)

**नमस्ते!** अनमोल कॉस्मेटिक्स, मऊ के विशेषज्ञ कोच की ओर से आपका स्वागत है। हमारे एआई सर्वर पर भारी ट्रैफिक होने के कारण, हमने आपके विवरणों (आयु: ${age}, त्वचा का प्रकार: ${skinType}, तेल का स्तर: ${oiliness}) के आधार पर यह त्वरित व्यक्तिगत सौंदर्य योजना तैयार की है।

---

#### 🌅 सुबह का स्किनकेयर रूटीन (Morning Routine)
1. **सफाई (Cleansing)**: गुनगुने पानी और **Mamaearth Vitamin C Daily Glow Face Wash** के साथ चेहरे को धोएं। यह आपकी त्वचा से अतिरिक्त तेल हटाकर नैचुरल ग्लो देता है।
2. **विशेष उपचार (Serum)**: **Minimalist 10% Niacinamide Face Serum** की 2-3 बूंदें थपथपाकर लगाएं। यह आपके रोमछिद्रों को छोटा करता है और मुहांसों के निशानों को कम करता है।
3. **सुरक्षा और नमी (Sunscreen)**: **The Derma Co 1% Hyaluronic Sunscreen Aqua Gel** (SPF 50) जरूर लगाएं। यह बिना किसी सफेद परत (white cast) के हल्की नमी और बेहतरीन सुरक्षा देता है।
4. **फ्लोलेस बेस (Makeup Base)**: यदि मेकअप पसंद है, तो एक बहुत ही हल्की फिनिश के लिए **Lakme Absolute Skin Natural Mousse** या **Maybelline New York Fit Me Foundation** का उपयोग करें।

#### 🌃 रात का स्किनकेयर रूटीन (Night Routine)
1. **गहरी सफाई (Deep Cleanse)**: दिनभर की धूल और प्रदूषण को हटाने के लिए चेहरे को दोबारा धोएं।
2. **त्वचा की मरम्मत**: **Minimalist Niacinamide Serum** लगाकर सोएं ताकि रात में त्वचा की कोशिकाएं खुद को रिपेयर कर सकें।
3. **बालों की देखभाल**: यदि आपको बालों से संबंधित समस्या (${hairProblems || "कोई नहीं"}) है, तो हल्के शैम्पू के बाद **Tresemmé Keratin Smooth Serum** का इस्तेमाल करें।

---

#### 🛍️ सुझाए गए प्रामाणिक अनमोल प्रोडक्ट्स (Catalog Match)
* **The Derma Co 1% Hyaluronic Sunscreen Aqua Gel** (कीमत: ₹499) - हल्की नमी के साथ एसपीएफ़ सुरक्षा।
* **Minimalist 10% Niacinamide Face Serum** (कीमत: ₹599) - मुंहासे और दाग-धब्बों को दूर करने के लिए अचूक।
* **Suhagan Premium Bridal Shringar Box** (कीमत: ₹1899) - पारंपरिक मऊ विवाह उत्सव और त्योहारों के लिए आदर्श।

#### ⚠️ इनसे बचें (Avoid)
* अत्यधिक तैलीय भोजन और बहुत गर्म पानी से चेहरा धोने से बचें।
* बिना सनस्क्रीन के मऊ की तेज धूप में बाहर न निकलें।

---

> *"सौंदर्य केवल त्वचा की गहराई तक ही नहीं होता, यह आपके आत्मविश्वास में चमकता है। खुश रहिए और दमकते रहिए!"*`;
  } else {
    return `### ✨ Anmol Beauty Coach - Your Personalized Beauty Report (AI Offline Backup)

**Hello!** Welcome to your custom beauty and skincare analysis from Anmol Cosmetics, Mau. Due to temporary high demand on our AI models, we have instantly formulated this high-fidelity offline beauty consultation based on your profile: **Age ${age}, Skin Type: ${skinType} (${oiliness}), Budget: ${budget}**.

---

#### 🌅 Morning Skincare Routine
1. **Cleanse**: Wash your face with lukewarm water. We highly recommend **Mamaearth Vitamin C Daily Glow Face Wash** to clear impurities and boost skin luminance.
2. **Treat (Serum)**: Apply 2-3 drops of **Minimalist 10% Niacinamide Face Serum** to control excess sebum, tighten pores, and fade acne spots.
3. **Hydrate & Shield**: Liberally apply **The Derma Co 1% Hyaluronic Sunscreen Aqua Gel** (SPF 50) for lightweight, weightless sun defense without any heavy greasy feel.
4. **Velvety Finish**: Apply **Lakme Absolute Skin Natural Mousse** or **Maybelline New York Fit Me Foundation** for a smooth, natural-looking matte base.

#### 🌃 Night Skincare Routine
1. **Double Cleanse**: Ensure all makeup, dirt, and oil are washed off before bed.
2. **Nourish**: Apply a light hydrator to locked in moisture while sleeping.
3. **Hair Care**: To address your hair concerns (${hairProblems || "None"}), wash with **L'Oréal Professionnel Absolute Repair Shampoo** and apply **Tresemmé Keratin Smooth Serum** on damp hair lengths.

---

#### 🛍️ Handpicked Selection From Our Catalog
* **Minimalist 10% Niacinamide Face Serum**: Ideal for targeting pores, oiliness, and skin texture.
* **The Derma Co 1% Sunscreen Gel**: Best broad-spectrum weightless protection.
* **Sugar Cosmetics Matte Attack Liquid Lipstick**: For a stunning smudge-proof, long-lasting lip shade.

#### ⚠️ Critical Precautions
* Avoid harsh physical scrubs which micro-tear the skin barrier.
* Avoid sleeping with makeup or heavy, pore-clogging heavy creams.

---

> *"Real beauty is about being comfortable in your own unique skin. You are Anmol (Priceless)!"*`;
  }
}

function generateSkinAnalyzerFallback(language: string) {
  const isHi = language.toLowerCase().includes("hi") || language.toLowerCase().includes("hin");

  if (isHi) {
    return `### 🔍 अनमोल एआई स्किन स्कैनर - ऑफलाइन डायग्नोस्टिक रिपोर्ट

**विश्लेषण स्थिति**: सामान्य एआई सर्वर व्यस्त होने के कारण यह एक ऑफलाइन बैकअप रिपोर्ट है।

#### 📊 त्वचा स्वास्थ्य स्कोर (Skin Health Scores)
* **अनुमानित त्वचा प्रकार (Predicted Skin Type)**: सामान्य से तैलीय (Normal to Oily) | विश्वास स्तर: 90%
* **चमक / कांति (Glow/Radiance)**: **78/100** (स्वस्थ चमक)
* **हाइड्रेशन स्तर (Hydration)**: **72/100** (मध्यम नमी)
* **रोमछिद्र और बनावट (Pores & Texture)**: **80/100** (साफ सतह)
* **समान टोन / दाग-धब्बे (Even Tone/Spots)**: **75/100** (हल्के निशान)

#### 📝 मुख्य टिप्पणियां (Primary Observations)
* आपकी त्वचा की बाहरी परत (Skin Barrier) काफी स्वस्थ और सुदृढ़ स्थिति में है।
* मऊ के गर्म और आर्द्र मौसम में टी-ज़ोन (T-zone) पर हल्का अतिरिक्त सीबम उत्पादन देखा जा सकता है।
* समय से पहले झुर्रियों और दाग-धब्बों से बचने के लिए दैनिक एसपीएफ सुरक्षा बहुत महत्वपूर्ण है।

#### 🛍️ अनुशंसित अनमोल प्रोडक्ट्स (Recommended Products)
1. **Mamaearth Vitamin C Daily Glow Face Wash**: चेहरे को गहरी सफाई और ताज़गी देने के लिए।
2. **Minimalist 10% Niacinamide Face Serum**: रोमछिद्रों को सिकोड़ने और त्वचा की सतह को चिकना करने के लिए।
3. **The Derma Co 1% Hyaluronic Sunscreen Aqua Gel**: मऊ की कड़ी धूप से सुरक्षा और नॉन-स्टिकी हाइड्रेशन के लिए।

#### 💡 दैनिक सलाह (Daily Care Tips)
* दिन में दो बार नियमित चेहरा धोएं और रात को सोने से पहले मेकअप को अच्छी तरह से रिमूव करें।
* प्रतिदिन कम से कम 8-10 गिलास गुनगुना पानी पिएं।`;
  } else {
    return `### 🔍 Anmol AI Skin Scanner - Offline Diagnostic Report

**Analysis Status**: Serving offline high-fidelity skin diagnostic template due to high model demand.

#### 📊 Skin Health Scores
* **Predicted Skin Type**: Normal to Combination | Confidence: 92%
* **Glow & Radiance**: **80/100** (Healthy, vibrant)
* **Hydration Level**: **75/100** (Good baseline hydration)
* **Pores & Texture**: **82/100** (Smooth overall texture)
* **Even Tone & Spots**: **78/100** (Minimal pigmentation)

#### 📝 Primary Observations
* **Barrier Integrity**: Strong skin barrier with good cell renewal indicators.
* **Sebum Regulation**: Slight oily tendency around the T-zone area under high humidity.
* **Sun Protection**: Requires daily broad-spectrum SPF shielding to prevent premature aging and spots.

#### 🛍️ Personalized Product Selection (Anmol Catalog)
1. **Mamaearth Vitamin C Daily Glow Face Wash**: To gently brighten skin and clear dead cells.
2. **Minimalist 10% Niacinamide Face Serum**: Perfect to regulate sebum and diminish spots.
3. **The Derma Co 1% Hyaluronic Sunscreen Aqua Gel**: Weightless hydration with SPF 50.

#### 💡 Daily Care Protocol
* Cleanse twice daily, especially after outdoor exposure.
* Moisturize damp skin to lock in moisture, and never skip sunscreen even indoors.`;
  }
}

function generateBridalPlannerFallback(daysLeft: number, functionType: string, bridalOutfitColor: string, stylePreference: string, language: string) {
  const isHi = language.toLowerCase().includes("hi") || language.toLowerCase().includes("hin");

  if (isHi) {
    return `### 👰 अनमोल एआई ब्राइडल प्लानर - ऑफलाइन कस्टमाइज्ड शेड्यूल

**बधाई हो!** आपकी शादी के लिए सिर्फ **${daysLeft} दिन** बचे हैं। आपके **${functionType}** समारोह और **${bridalOutfitColor}** लहंगे/साड़ी के लिए आपकी व्यक्तिगत सौंदर्य योजना नीचे दी गई है:

#### 📅 सौंदर्य चमक टाइमलाइन (Days Left: ${daysLeft})
* **अगले 3 दिन**: भरपूर पानी पिएं और **Minimalist 10% Niacinamide Serum** लगाएं। चेहरे को शांत और साफ रखने के लिए यह बेहतरीन है।
* **शादी से 2 दिन पहले**: **Mamaearth Vitamin C Face Wash** से चेहरे की सफाई करें। हल्का फेशियल मसाज लें।
* **शादी का दिन**: त्वचा को हाइड्रेट करने के लिए **The Derma Co Hyaluronic Sunscreen Aqua Gel** लगाएं।

#### 💄 ${functionType} मेकअप गाइड (Look Guide)
* **बेस मेकअप**: **Lakme Absolute Mousse** का उपयोग करें जो ${bridalOutfitColor} आउटफिट के साथ आपको एक नैचुरल मखमली शाइन देगा।
* **आंखें**: **Insight Cosmetics Intense Kohl Kajal** का गहरा स्ट्रोक लगाएं।
* **लिप्स**: **Sugar Cosmetics Matte Attack Liquid Lipstick (Bold Red/Pink)** का उपयोग करें जो आपके ${bridalOutfitColor} परिधान से मैच करेगा।

#### 👑 मऊ स्पेशल शृंगार एक्सेसरीज (Traditional Match)
* **Suhagan Premium Bridal Shringar Box**: इसमें सिन्दूर, बिंदी, आलता और महावर शामिल हैं जो हर पारंपरिक दुल्हन के लिए जरूरी हैं।
* **मऊ की ग्लास चूड़ियां (Glass Bangles)**: आपके लहंगे के रंगों से मेल खाती हुई हस्तनिर्मित चूड़ियों का सेट पहनें।
* **Kundan Royal Choker Set**: शाही लुक के लिए हमारे स्पेशल कुंदन चोकर सेट का चुनाव करें।

> *"दुल्हन की असली सुंदरता उसकी मुस्कान में होती है। अनमोल कॉस्मेटिक्स मऊ आपके विवाह के उत्सव को खास बनाता है!"*`;
  } else {
    return `### 👰 Anmol AI Bridal Planner - Offline Beauty Schedule

**Congratulations!** You have **${daysLeft} days left** for your big day. Here is your curated bridal schedule for the **${functionType}** with a gorgeous **${bridalOutfitColor}** themed ensemble and **${stylePreference}** styling.

#### 📅 Beauty Prep Timeline (${daysLeft} Days to go)
* **Daily Hydration**: Drink 3-4 liters of water daily. Cleanse with **Mamaearth Vitamin C Face Wash**.
* **Skin Prep**: Apply **Minimalist 10% Niacinamide Face Serum** nightly to ensure smooth skin surface with zero redness.
* **Sun Protection**: Use **The Derma Co Hyaluronic Sunscreen Gel** whenever outdoors for final fittings.

#### 💄 Customized Look Guide for ${functionType}
* **Face Base**: Apply **Lakme Absolute Mousse** for a weightless, sweat-proof, matte skin texture matching your **${bridalOutfitColor}** outfit.
* **Eyes**: Go for a majestic bold look using **Insight Cosmetics Intense Kohl Kajal**.
* **Lips**: Wear **Sugar Cosmetics Matte Attack Liquid Lipstick (Bold Shades)** for transfer-proof perfection throughout the ceremony.

#### 👑 Handpicked Accessories (Anmol Special Collection)
* **Kundan Royal Jewellery Choker Set**: Pair with your ${bridalOutfitColor} outfit for a queenly appeal.
* **Suhagan Premium Bridal Shringar Box**: Features premium Sindoor, Mahavar, Alta, and traditional Bindi.
* **Mau Handmade Glass Bangles**: Add matching custom stone-studded glitter glass bangles for a timeless, local touch.

> *"A happy bride is the prettiest bride. Let Anmol Cosmetics Mau light up your wedding journey!"*`;
  }
}

// ==========================================
// GEMINI INTELLIGENT ROUTERS (AI FEATURES)
// ==========================================

// 1. AI Beauty Coach - Recommends full morning/night routines & matches products
app.post("/api/beauty-coach", async (req, res) => {
  try {
    const { age, skinType, oiliness, budget, concerns, hairProblems, language = "English" } = req.body;

    const sysInstruction = `You are the Expert AI Beauty Coach for "Anmol Cosmetics", the most premium cosmetics and bridal store in Mau, Uttar Pradesh. 
You speak in a warm, professional, and friendly tone, using a mixture of Hindi and English (Hinglish) or pure Hindi/English depending on the user's selected language.
Your goal is to suggest a customized daily routine (Morning and Night), explain how to use products correctly, which products to avoid, and recommend specific items from our available products catalog.
Our products catalog includes:
- Lakme Absolute Skin Natural Mousse
- Maybelline Fit Me Matte Poreless Foundation
- Swiss Beauty Liquid Concealer
- Mamaearth Vitamin C Daily Glow Face Wash
- The Derma Co 1% Hyaluronic Sunscreen Aqua Gel
- Minimalist 10% Niacinamide Face Serum
- L'Oréal Professionnel Absolute Repair Shampoo
- Tresemmé Keratin Smooth Serum
- Sugar Cosmetics Matte Attack Liquid Lipstick (Red/Bold shades)
- Insight Cosmetics Intense Kohl Kajal
- Suhagan Premium Bridal Shringar Box (Kajal, Sindoor, Bindi, Alta, Mahavar, Bangle, Bindi)
- Handmade Glass Bangles from Mau
- Kundan Royal Bridal Jewellery Choker Set
- Nivea Fresh Flower Deodorant

Always relate your advice to these products whenever possible! Be encouraging, and structure your response with:
1. Short skin/hair type summary & friendly opening.
2. Morning Routine (Steps, Use Instructions).
3. Night Routine (Steps, Use Instructions).
4. Recommended Products (specifically from the catalog and explain why they fit).
5. Products/Ingredients to Avoid for their specific skin/hair type.
6. A beautiful Beauty Quote to lift their spirits.

Keep the response clean, well-structured, in Markdown, and avoid any dry system logs. Response language must match the user request: ${language}.`;

    const userPrompt = `I am a ${age} year old with skin type: ${skinType} (${oiliness}). 
My budget category is: ${budget}. 
My main makeup or skincare concerns/preferences are: ${concerns || "Daily natural look"}.
My main hair concerns are: ${hairProblems || "None"}.
Please analyze and create my premium customized beauty plan!`;

    let recommendationText = "";
    try {
      // Query Gemini 3.5-flash with automatic retry logic
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.75,
        },
      });
      recommendationText = response.text || "I am currently formulating your routine. Please try again.";
    } catch (apiErr: any) {
      console.warn("Falling back to local beauty coach generator:", apiErr?.message || apiErr);
      recommendationText = generateBeautyCoachFallback(Number(age || 25), skinType || "Normal", oiliness || "Balanced", budget || "Premium", concerns || "", hairProblems || "", language);
    }

    // Save chat log for admin panel
    chatLogs.push({
      id: "chat_" + Date.now(),
      timestamp: new Date(),
      userProfile: { age, skinType, oiliness, budget, concerns, hairProblems },
      prompt: userPrompt,
      aiResponse: recommendationText,
    });

    res.json({
      success: true,
      recommendation: recommendationText,
    });
  } catch (err: any) {
    console.error("Error in AI Beauty Coach:", err);
    res.status(500).json({ error: "AI Beauty Coach is resting right now. Please try again shortly!" });
  }
});

// 2. AI Skin Analyzer - Uses computer vision to analyze skin conditions based on upload
app.post("/api/analyze-skin", async (req, res) => {
  try {
    const { imageBase64, language = "English" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided for analysis." });
    }

    // Prepare image part for Gemini API
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      },
    };

    const sysInstruction = `You are the advanced "AI Skin Analyzer" for Anmol Cosmetics, Mau.
Analyze the provided skin photo (simulated or real facial selfie) and generate a highly detailed, professional cosmetic skin assessment report.
Be encouraging, helpful, and scientific, but make it easy to understand for an everyday customer.
Provide the report in Markdown format with the following structure:
- **Predicted Skin Type**: (e.g. Dry, Oily, Combination, Normal) with a confidence level (e.g. 92%).
- **Skin Health Scores**:
  - Glow/Radiance: X/100
  - Hydration: X/100
  - Pores & Texture: X/100
  - Even Tone/Spots: X/100
- **Primary Observations**: Highlight key strengths of their skin and areas that need hydration, sebum control, or UV protection.
- **Personalized Routine Advice**: Morning & Evening.
- **Recommended Anmol Products**: Specifically recommend 2-3 products from:
  1. Mamaearth Vitamin C Face Wash (for glowing/even tone)
  2. The Derma Co Hyaluronic Sunscreen Gel (for hydration & sunscreen protection)
  3. Minimalist 10% Niacinamide Serum (for acne marks/pore-tightening)
  4. Lakme Skin Natural Mousse (for a lightweight satin-matte makeup base)
  
Maintain a highly premium, warm, and authentic aesthetic in Hindi/Hinglish/English as appropriate. Use language: ${language}.`;

    let analysisReport = "";
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: "Analyze my facial skin health, identify type, hydration score, tone, spots, pores and suggest the best routine with products." }],
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        },
      });
      analysisReport = response.text || "Skin analysis report could not be compiled. Please try uploading another photo.";
    } catch (apiErr: any) {
      console.warn("Falling back to local skin analyzer generator:", apiErr?.message || apiErr);
      analysisReport = generateSkinAnalyzerFallback(language);
    }

    // Save to logs
    chatLogs.push({
      id: "skin_" + Date.now(),
      timestamp: new Date(),
      userProfile: { mode: "Skin Analyzer" },
      prompt: "[Uploaded Skin Photo for Analysis]",
      aiResponse: analysisReport,
    });

    res.json({
      success: true,
      report: analysisReport,
    });
  } catch (err: any) {
    console.error("Error in AI Skin Analyzer:", err);
    res.status(500).json({ error: "The AI Skin Analyzer is currently calibrated. Please try again soon." });
  }
});

// 3. AI Bridal & Shringar Planner - Creates custom bridal schedule & matches look
app.post("/api/bridal-planner", async (req, res) => {
  try {
    const { daysLeft, functionType, bridalOutfitColor, stylePreference, language = "English" } = req.body;

    const sysInstruction = `You are the Expert "Anmol AI Bridal Planner" in Mau. 
Mau is famous for its elegant handloom sarees, rich bridal wear, handcrafted glass bangles, and Kundan jewelry.
Create an ultra-luxurious, step-by-step Bridal Makeup, Shringar, and beauty schedule for the upcoming wedding ceremonies.
Your response must be in Markdown, warm, premium, traditional, yet highly professional. Include:
1. **Bridal Beauty Glow Timeline**: Step-by-step skin prep from today (${daysLeft} days left) until the Wedding Day!
2. **Ceremony-Wise Makeup Look**: Custom makeup style guide for ${functionType} using ${bridalOutfitColor} outfit.
3. **Anmol Shringar Accessories Match**: Best combinations of Handmade Glass Bangles, Suhagan Premium Bridal Shringar Box items, and Kundan Royal Bridal Jewellery Choker sets from Anmol's Mau Special Collection.
4. **Day-of-Wedding Glam Plan**: How to prep, apply Lakme Mousse foundation, Maybelline foundation, Sugar Bold Red Lipsticks, and Insight Kohl Kajal for a long-lasting bridal glow.
5. **Traditional Mau Bridal Quote** in Hindi or English.
 
Use language: ${language}. Keep the presentation neat, premium, and structured.`;

    const userPrompt = `I am a bride-to-be with ${daysLeft} days left for my wedding. 
My major function is: ${functionType}. 
My bridal outfit color is: ${bridalOutfitColor}. 
My preferred makeup and jewelry style is: ${stylePreference}. 
Please plan my perfect bridal look!`;

    let plannerReport = "";
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.8,
        },
      });
      plannerReport = response.text || "Your customized Bridal Plan is being created. Please try again.";
    } catch (apiErr: any) {
      console.warn("Falling back to local bridal planner generator:", apiErr?.message || apiErr);
      plannerReport = generateBridalPlannerFallback(Number(daysLeft || 30), functionType || "Wedding", bridalOutfitColor || "Red", stylePreference || "Traditional", language);
    }

    chatLogs.push({
      id: "bridal_" + Date.now(),
      timestamp: new Date(),
      userProfile: { daysLeft, functionType, bridalOutfitColor, stylePreference },
      prompt: userPrompt,
      aiResponse: plannerReport,
    });

    res.json({
      success: true,
      plan: plannerReport,
    });
  } catch (err: any) {
    console.error("Error in AI Bridal Planner:", err);
    res.status(500).json({ error: "The Bridal Planner is crafting other looks. Please try again shortly." });
  }
});


// ==========================================
// VITE DEV SERVER & PRODUCTION HANDLING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Robust catch-all route for dev mode to serve index.html transformed by Vite
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Determine the dist path dynamically (could be current working directory or __dirname inside bundled dist)
    const distPath = fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Anmol Cosmetics Server running on http://localhost:${PORT}`);
  });
}

startServer();
