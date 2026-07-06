import React, { useState, useRef } from "react";
import { Sparkles, Camera, Loader2, RefreshCw, Send, CheckCircle2, User, Smile, ShieldAlert } from "lucide-react";
import { Product } from "../types";
import AIReportRenderer from "./AIReportRenderer";

interface AICoachProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  language: "hi" | "en";
}

export default function AICoach({ products, onAddToCart, language }: AICoachProps) {
  // Beauty Coach form states
  const [age, setAge] = useState<string>("24");
  const [skinType, setSkinType] = useState<string>("Normal");
  const [oiliness, setOiliness] = useState<string>("Medium");
  const [budget, setBudget] = useState<string>("Premium");
  const [concerns, setConcerns] = useState<string>("Glow & Hydration");
  const [hairProblems, setHairProblems] = useState<string>("Dry and frizzy hair");
  const [loadingCoach, setLoadingCoach] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Skin Analyzer states
  const [loadingSkin, setLoadingSkin] = useState<boolean>(false);
  const [skinReport, setSkinReport] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Tab: Beauty Coach vs Skin Analyzer
  const [activeSubTab, setActiveSubTab] = useState<"coach" | "analyzer">("coach");

  const isHindi = language === "hi";

  // Start/Stop Webcam
  const startCamera = async () => {
    setUseWebcam(true);
    setSelectedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      alert(isHindi ? "कैमरा एक्सेस नहीं मिला। कृपया इमेज अपलोड करें।" : "Camera access denied. Please upload an image instead.");
      setUseWebcam(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Beauty Coach Wizard
  const handleGetRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCoach(true);
    setRecommendation(null);
    try {
      const response = await fetch("/api/beauty-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          skinType,
          oiliness,
          budget,
          concerns,
          hairProblems,
          language: isHindi ? "Hindi" : "English",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Coach fetch error:", err);
      alert("Error contacting Beauty Coach server.");
    } finally {
      setLoadingCoach(false);
    }
  };

  // Submit Skin Analyzer image
  const handleAnalyzeSkin = async () => {
    if (!selectedImage) return;
    setLoadingSkin(true);
    setSkinReport(null);
    try {
      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          language: isHindi ? "Hindi" : "English",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSkinReport(data.report);
      } else {
        alert(data.error || "Failed to analyze skin image.");
      }
    } catch (err) {
      console.error("Skin analyzer error:", err);
      alert("Error contacting Skin Analyzer server.");
    } finally {
      setLoadingSkin(false);
    }
  };

  return (
    <div id="ai-beauty-coach" className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
            {isHindi ? "एआई ब्यूटी कोच + स्किन एनालाइजर" : "AI Beauty Coach & Skin Analyzer"}
          </h2>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveSubTab("coach")}
            className={`px-3 py-1.5 rounded-md text-xs md:text-sm transition-all ${
              activeSubTab === "coach" ? "bg-amber-500 text-slate-950 font-medium shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {isHindi ? "एआई ब्यूटी कोच 🤖" : "AI Coach 🤖"}
          </button>
          <button
            onClick={() => setActiveSubTab("analyzer")}
            className={`px-3 py-1.5 rounded-md text-xs md:text-sm transition-all ${
              activeSubTab === "analyzer" ? "bg-amber-500 text-slate-950 font-medium shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {isHindi ? "स्किन एनालाइजर 📸" : "Skin Analyzer 📸"}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BEAUTY COACH */}
      {activeSubTab === "coach" && (
        <div>
          {!recommendation ? (
            <form onSubmit={handleGetRoutine} className="space-y-6">
              <p className="text-slate-400 text-sm">
                {isHindi
                  ? "अपना प्रोफाइल बताएं और एआई ब्यूटी कोच से कस्टमाइज्ड मॉर्निंग और नाइट रूटीन, बेहतरीन प्रोडक्ट्स रिकमेंडेशन पाएं।"
                  : "Tell us about yourself and let our Expert AI Beauty Coach recommend a step-by-step custom Morning/Night routine matched to our local Mau collection."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age Input */}
                <div>
                  <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                    {isHindi ? "आपकी उम्र (Age)" : "Your Age"}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter age (e.g. 24)"
                    required
                  />
                </div>

                {/* Skin Type */}
                <div>
                  <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                    {isHindi ? "स्किन टाइप (Skin Type)" : "Skin Type"}
                  </label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Normal">{isHindi ? "सामान्य (Normal)" : "Normal"}</option>
                    <option value="Dry">{isHindi ? "रूखी (Dry)" : "Dry"}</option>
                    <option value="Oily">{isHindi ? "तैलीय (Oily)" : "Oily"}</option>
                    <option value="Combination">{isHindi ? "कॉम्बिनेशन (Combination)" : "Combination"}</option>
                    <option value="Sensitive">{isHindi ? "संवेदनशील (Sensitive)" : "Sensitive"}</option>
                  </select>
                </div>

                {/* Sebum Level */}
                <div>
                  <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                    {isHindi ? "त्वचा की नमी (Oily या Dry?)" : "Moisture Levels"}
                  </label>
                  <select
                    value={oiliness}
                    onChange={(e) => setOiliness(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Very Dry">{isHindi ? "बहुत ड्राई" : "Very Dry"}</option>
                    <option value="Dry">{isHindi ? "हल्का ड्राई" : "Slightly Dry"}</option>
                    <option value="Medium">{isHindi ? "सामान्य" : "Medium / Normal"}</option>
                    <option value="Oily">{isHindi ? "तैलीय (Oily)" : "Oily"}</option>
                    <option value="Very Oily">{isHindi ? "बहुत तैलीय" : "Very Oily"}</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                    {isHindi ? "बजट प्रेफरेंस (Budget)" : "Budget Preference"}
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Under ₹199">{isHindi ? "किफायती (Under ₹199)" : "Affordable (Under ₹199)"}</option>
                    <option value="Under ₹499">{isHindi ? "पॉपुलर (Under ₹499)" : "Popular (Under ₹499)"}</option>
                    <option value="Premium">{isHindi ? "प्रीमियम और ब्रांडेड" : "Premium & Branded"}</option>
                    <option value="Any Budget">{isHindi ? "कोई भी बजट (Best Results)" : "Any Budget (Best Results)"}</option>
                  </select>
                </div>
              </div>

              {/* Skin Concerns */}
              <div>
                <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                  {isHindi ? "स्किन की समस्या/मेकअप स्टाइल (Skin Concerns / Look)" : "Skincare Concerns & Makeup Style"}
                </label>
                <input
                  type="text"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={isHindi ? "जैसे: मुहांसे, चेहरे पर ग्लो, ब्राइडल लुक, दैनिक मेकअप" : "e.g., Acne spots, glow, daily office routine, bridal makeup"}
                />
              </div>

              {/* Hair Concerns */}
              <div>
                <label className="block text-xs uppercase text-slate-400 font-medium tracking-wider mb-2">
                  {isHindi ? "बालों की समस्या (Hair Concerns)" : "Hair Concerns"}
                </label>
                <input
                  type="text"
                  value={hairProblems}
                  onChange={(e) => setHairProblems(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={isHindi ? "जैसे: डैंड्रफ, बाल झड़ना, ड्राई बाल" : "e.g., Dandruff, hair fall, split ends, dry hair"}
                />
              </div>

              <button
                type="submit"
                disabled={loadingCoach}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loadingCoach ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>{isHindi ? "एआई ब्यूटी रूटीन तैयार हो रहा है..." : "Analyzing & Drafting Routine..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>{isHindi ? "एआई ब्यूटी कोच से रूटीन पूछें" : "Consult AI Beauty Coach"}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-amber-400">{isHindi ? "रूटीन फॉर:" : "Routine For:"}</span> {age} Yrs • {skinType} ({oiliness}) Skin
                </div>
                <button
                  onClick={() => setRecommendation(null)}
                  className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{isHindi ? "नया रूटीन बनाएं" : "Recalculate"}</span>
                </button>
              </div>

              {/* Output Markdown styled Box */}
              <div className="bg-slate-950/80 p-5 md:p-7 rounded-2xl border border-slate-800/80 text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner">
                <AIReportRenderer content={recommendation} />
              </div>

              {/* Matched Store Products Quick Selection */}
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{isHindi ? "आपकी रूटीन के अनुसार सुझाये गए प्रोडक्ट्स" : "Direct Recommended Products from Anmol Shop"}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products
                    .filter((p) => {
                      // Match some basic products based on concerns
                      if (concerns.toLowerCase().includes("glow") || concerns.toLowerCase().includes("vitamin")) {
                        return p.id === "s1" || p.id === "s2" || p.id === "s3";
                      }
                      if (hairProblems.toLowerCase().includes("hair") || hairProblems.toLowerCase().includes("shampoo")) {
                        return p.id === "h1" || p.id === "h2";
                      }
                      return p.id === "m1" || p.id === "s2" || p.id === "l1";
                    })
                    .map((product) => (
                      <div key={product.id} className="flex bg-slate-800 p-3 rounded-lg border border-slate-700 items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{product.name}</h4>
                            <p className="text-[11px] text-slate-400">{product.brand} • <span className="text-amber-400 font-semibold">₹{product.price}</span></p>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart(product)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs transition"
                        >
                          + {isHindi ? "जोड़ें" : "Add"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SKIN ANALYZER */}
      {activeSubTab === "analyzer" && (
        <div className="space-y-6">
          <p className="text-slate-400 text-sm">
            {isHindi
              ? "अपने चेहरे की एक फोटो अपलोड करें या सीधे सेल्फी लें। हमारा एआई स्किन एनालाइजर आपके चेहरे के ग्लो, हाइड्रेशन, टोन का विश्लेषण कर रिपोर्ट तैयार करेगा।"
              : "Upload a photo or capture a live selfie. Our advanced AI Skin Vision analyzer will analyze skin glow, moisture levels, blemishes, and texture."}
          </p>

          {!skinReport ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-950 hover:border-amber-500 transition">
                {useWebcam ? (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <video ref={videoRef} className="w-full max-w-sm rounded-lg border border-slate-800 bg-black" playsInline />
                    <div className="flex space-x-3">
                      <button
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-lg text-sm flex items-center space-x-1"
                      >
                        <Camera className="h-4 w-4" />
                        <span>{isHindi ? "फोटो खींचें" : "Capture"}</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-slate-100 rounded-lg text-sm"
                      >
                        {isHindi ? "बंद करें" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <img src={selectedImage} alt="Face Analysis Preview" className="w-full max-w-xs h-64 object-cover rounded-lg shadow-md border border-slate-700" />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>{isHindi ? "दूसरी फोटो चुनें" : "Choose Another"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-slate-850 rounded-full inline-block text-amber-400">
                      <Camera className="h-10 w-10 mx-auto" />
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">
                        {isHindi ? "कैमरा का उपयोग करें या इमेज फाइल अपलोड करें" : "Take a live selfie or drag/drop an image"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG or WEBP format</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs md:text-sm flex items-center justify-center space-x-1"
                      >
                        <Camera className="h-4 w-4" />
                        <span>{isHindi ? "सेल्फी लें (Live Selfie)" : "Use Selfie Camera"}</span>
                      </button>
                      <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs md:text-sm cursor-pointer flex items-center justify-center space-x-1 border border-slate-700">
                        <span>{isHindi ? "इमेज अपलोड करें" : "Upload Photo"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden Canvas for capturing video frames */}
              <canvas ref={canvasRef} className="hidden" />

              {selectedImage && (
                <button
                  onClick={handleAnalyzeSkin}
                  disabled={loadingSkin}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg transition disabled:opacity-50"
                >
                  {loadingSkin ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>{isHindi ? "एआई स्किन स्कैन कर रहा है..." : "AI Skin Scanning in progress..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>{isHindi ? "एआई स्किन स्कैन शुरू करें" : "Start AI Skin Analysis"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                {selectedImage && (
                  <img src={selectedImage} alt="Analyzed Face" className="w-24 h-24 object-cover rounded-lg border border-slate-600" />
                )}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="font-semibold text-slate-200 text-base flex items-center justify-center sm:justify-start space-x-1.5">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span>{isHindi ? "एआई स्किन एनालिसिस कम्प्लीट!" : "Skin Scan Compiled!"}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isHindi ? "नीचे दी गई एआई रिपोर्ट में आपके स्किन स्कोर और कस्टमाइज्ड ब्यूटी रिकमेंडेशन दिए गए हैं।" : "Below is your detailed skin metric summary and custom recommended Anmol products."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSkinReport(null);
                    setSelectedImage(null);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-amber-400 border border-slate-700 rounded text-xs hover:bg-slate-950"
                >
                  {isHindi ? "नया स्कैन करें" : "Re-Scan"}
                </button>
              </div>

              {/* Skin Metrics Report */}
              <div className="bg-slate-950/80 p-5 md:p-7 rounded-2xl border border-slate-800/80 text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner">
                <AIReportRenderer content={skinReport} />
              </div>

              {/* Dynamic matched recommendations for skincare */}
              <div>
                <h4 className="text-xs uppercase text-amber-400 font-semibold mb-3 tracking-wider">
                  {isHindi ? "रिकमेंडेड स्किनकेयर उत्पाद" : "Recommended Skincare Essentials"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {products
                    .filter((p) => p.category === "Skincare")
                    .map((product) => (
                      <div key={product.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center flex flex-col justify-between">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto rounded-md mb-2" />
                        <h5 className="text-xs font-semibold text-slate-200 line-clamp-1">{product.name}</h5>
                        <p className="text-[10px] text-amber-400 font-semibold mt-1">₹{product.price}</p>
                        <button
                          onClick={() => onAddToCart(product)}
                          className="mt-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded text-xs transition"
                        >
                          + {isHindi ? "जोड़ें" : "Add"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
