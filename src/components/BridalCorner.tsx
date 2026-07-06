import React, { useState } from "react";
import { Sparkles, Calendar, Heart, Shield, Loader2, ArrowRight, CheckCircle2, ShoppingCart, RefreshCw } from "lucide-react";
import { Product } from "../types";
import AIReportRenderer from "./AIReportRenderer";

interface BridalCornerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  language: "hi" | "en";
}

export default function BridalCorner({ products, onAddToCart, language }: BridalCornerProps) {
  const [daysLeft, setDaysLeft] = useState<string>("30");
  const [functionType, setFunctionType] = useState<string>("Wedding / Shaadi Ceremony");
  const [outfitColor, setOutfitColor] = useState<string>("Deep Royal Red");
  const [stylePreference, setStylePreference] = useState<string>("Traditional Kundan Shringar");
  const [loading, setLoading] = useState<boolean>(false);
  const [bridalPlan, setBridalPlan] = useState<string | null>(null);

  const isHindi = language === "hi";

  // Filter out bridal specific products for direct showcases
  const bridalProducts = products.filter(
    (p) => p.category === "Shringar Box" || p.category === "Glass Bangles" || p.category === "Kundan Jewellery"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBridalPlan(null);
    try {
      const response = await fetch("/api/bridal-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysLeft,
          functionType,
          bridalOutfitColor: outfitColor,
          stylePreference,
          language: isHindi ? "Hindi" : "English",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBridalPlan(data.plan);
      } else {
        alert(data.error || "Failed to generate bridal plan.");
      }
    } catch (err) {
      console.error("Bridal Planner fetch error:", err);
      alert("Error contacting Bridal Planner server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="bridal-corner" className="max-w-4xl mx-auto p-4 md:p-6 bg-amber-950/20 text-slate-100 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md">
      {/* Header Banner */}
      <div className="text-center mb-8 space-y-2">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
          {isHindi ? "विशेष विवाह संकलन" : "Exquisite Bridal Experience"}
        </span>
        <h2 className="text-2xl md:text-4xl font-serif font-semibold text-amber-300">
          {isHindi ? "दुल्हन शृंगार और विवाह कॉर्नर" : "Bridal & Traditional Shringar Corner"}
        </h2>
        <p className="text-slate-300 text-sm max-w-lg mx-auto font-sans">
          {isHindi
            ? "मऊ की सबसे प्रसिद्ध शृंगार दुकान से पारंपरिक हैंडमेड कांच की चूड़ियां, कुंदन ज्वेलरी, सुहाग शृंगार बॉक्स और कस्टमाइज्ड एआई ब्राइडल प्लानर।"
            : "Explore beautiful handmade glass bangles, royal Kundan chokers, Suhagan boxes, and draft your step-by-step beauty timeline using AI."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Direct Products Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-amber-500/20 pb-2 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{isHindi ? "विवाह शृंगार उत्पाद" : "Bridal Specials"}</span>
          </h3>

          <div className="space-y-4">
            {bridalProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/50 p-3.5 rounded-xl transition duration-300 flex space-x-3.5 items-center"
              >
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    {product.badge}
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-amber-500/10 group-hover:scale-105 transition"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-amber-300 font-bold text-xs md:text-sm">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs transition flex items-center space-x-1 shadow-md"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      <span>{isHindi ? "जोड़ें" : "Add"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secure Purchase note */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg text-xs text-amber-400/80 flex items-center space-x-2">
            <Shield className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              {isHindi
                ? "100% शुद्ध कांच एवं ओरिजिनल प्रोडक्ट्स की गारंटी। सेम डे होम डिलीवरी।"
                : "100% Genuine, pure materials guaranteed. Direct delivery from Mau store."}
            </span>
          </div>
        </div>

        {/* Right Column: AI Bridal Planner Form & Routine Output */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-4 md:p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-amber-400 animate-bounce" />
            <h3 className="text-base md:text-lg font-semibold text-slate-200">
              {isHindi ? "एआई ब्राइडल प्लानर" : "AI Bridal Look Planner"}
            </h3>
          </div>

          {!bridalPlan ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? "अपनी शादी के दिन और लहंगे का रंग दर्ज करें। एआई तुरंत आपकी त्वचा को तैयार करने का शेड्यूल, लुक गाइड और मैचिंग ज्वेलरी प्लान बताएगा।"
                  : "Enter your ceremony details. Our AI will compute a daily skin preparation schedule, choose the exact look for your outfit, and pair matching bangles/chokers."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {isHindi ? "शादी में बचे दिन" : "Days Left for Wedding"}
                  </label>
                  <input
                    type="number"
                    value={daysLeft}
                    onChange={(e) => setDaysLeft(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {isHindi ? "मुख्य विवाह उत्सव" : "Function Type"}
                  </label>
                  <select
                    value={functionType}
                    onChange={(e) => setFunctionType(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                  >
                    <option value="Wedding / Main Shaadi">{isHindi ? "मुख्य शादी (Wedding)" : "Wedding Ceremony"}</option>
                    <option value="Mehndi Ceremony">{isHindi ? "मेहंदी उत्सव (Mehndi)" : "Mehndi / Haldi"}</option>
                    <option value="Sangeet / Party">{isHindi ? "संगीत / कॉकटेल" : "Sangeet / Cocktail"}</option>
                    <option value="Reception">{isHindi ? "रिसेप्शन (Reception)" : "Reception Dinner"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {isHindi ? "लहंगे/पोशाक का रंग" : "Bridal Outfit Color"}
                  </label>
                  <input
                    type="text"
                    value={outfitColor}
                    onChange={(e) => setOutfitColor(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                    placeholder="e.g. Cherry Red, Golden Golden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {isHindi ? "शृंगार स्टाइल पसंद" : "Makeup & Jewelry Style"}
                  </label>
                  <select
                    value={stylePreference}
                    onChange={(e) => setStylePreference(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                  >
                    <option value="Traditional Heavy Kundan">{isHindi ? "भारी पारंपरिक कुंदन लुक" : "Traditional Heavy Kundan"}</option>
                    <option value="Minimal Elegant Pastel">{isHindi ? "मिनिमल पेस्टल और ड्यूई" : "Minimal Dewy Pastel"}</option>
                    <option value="Bold Royal Wedding">{isHindi ? "शाही बोल्ड राजपूती लुक" : "Bold Royal Look"}</option>
                    <option value="Retro Classic Matte">{isHindi ? "क्लासिक मैट विंग्ड आई लुक" : "Classic Matte Winged Eye"}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow-md transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>{isHindi ? "शेड्यूल तैयार हो रहा है..." : "Drafting Bridal Schedule..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 animate-bounce" />
                    <span>{isHindi ? "एआई ब्राइडल शृंगार प्लान तैयार करें" : "Draft AI Bridal Plan"}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                <span className="text-xs text-amber-300 font-medium">
                  👰 {outfitColor} Outfit Plan • {daysLeft} Days Left
                </span>
                <button
                  onClick={() => setBridalPlan(null)}
                  className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{isHindi ? "दोबारा प्लान करें" : "Re-Plan"}</span>
                </button>
              </div>

              {/* Bridal Plan Markdown text */}
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-slate-200 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                <AIReportRenderer content={bridalPlan} />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-850 p-2 rounded border border-slate-800">
                <span>{isHindi ? "शृंगार बॉक्स और कुंदन हार खरीदें" : "Add matchable Kundan & Shringar items to cart"}</span>
                <button
                  onClick={() => {
                    const box = products.find((p) => p.id === "b1");
                    if (box) onAddToCart(box);
                    const jewellery = products.find((p) => p.id === "b3");
                    if (jewellery) onAddToCart(jewellery);
                    alert(isHindi ? "ब्राइडल शृंगार आइटम्स को कार्ट में जोड़ा गया!" : "Bridal Kit and Jewellery added to your cart!");
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider text-[10px]"
                >
                  + {isHindi ? "सब जोड़े" : "Add All Set"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
