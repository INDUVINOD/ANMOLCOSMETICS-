import React, { useState, useEffect } from "react";
import { Check, ShoppingBag, Truck, CreditCard, MessageSquare, Loader2, ArrowRight, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { CartItem, Product } from "../types";
import MapSelector from "./MapSelector";

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
  language: "hi" | "en";
}

export default function Checkout({ cart, onClearCart, language }: CheckoutProps) {
  // Delivery Coordinates on Map
  const [deliveryLat, setDeliveryLat] = useState<number>(25.9485);
  const [deliveryLng, setDeliveryLng] = useState<number>(83.5650);

  // Load shop location as calculation baseline
  const [shopLat] = useState<number>(() => {
    const saved = localStorage.getItem("anmol_shop_lat");
    return saved ? Number(saved) : 25.9485;
  });
  const [shopLng] = useState<number>(() => {
    const saved = localStorage.getItem("anmol_shop_lng");
    return saved ? Number(saved) : 83.5650;
  });

  // Calculate Haversine distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = calculateDistance(shopLat, shopLng, deliveryLat, deliveryLng);
  const estDeliveryTime = Math.max(10, Math.round(distance * 6 + 15)); // Estimation math: ~6 mins per km + 15 mins prep time

  // Pincode checker states
  const [pincodeInput, setPincodeInput] = useState<string>("275101");
  const [checkingPin, setCheckingPin] = useState<boolean>(false);
  const [pincodeStatus, setPincodeStatus] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [pincode, setPincode] = useState<string>("275101");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Order success states
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string>("Processing");

  const isHindi = language === "hi";

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharges = subtotal > 499 ? 0 : 40;
  const total = subtotal + deliveryCharges;

  // Track order simulation status cycle
  useEffect(() => {
    if (orderSuccess) {
      const timers = [
        setTimeout(() => setTrackingStatus("Packed & Properly Cushioned"), 6000),
        setTimeout(() => setTrackingStatus("Out for Local Delivery in Mau"), 12000),
        setTimeout(() => setTrackingStatus("Delivered Successfully! 🎉"), 18000),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [orderSuccess]);

  // Check pincode availability
  const checkPincode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pincodeInput) return;
    setCheckingPin(true);
    setPincodeStatus(null);
    try {
      const response = await fetch(`/api/check-delivery/${pincodeInput}`);
      const data = await response.json();
      setPincodeStatus(data);
    } catch (err) {
      console.error("Pincode check error:", err);
    } finally {
      setCheckingPin(false);
    }
  };

  // Submit order to generate WhatsApp invoice
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmittingOrder(true);
    try {
      const cartSummary = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const detailedAddress = `${address} (GPS Location: ${deliveryLat.toFixed(5)}, ${deliveryLng.toFixed(5)} | Distance: ${distance.toFixed(2)} km | Est Time: ~${estDeliveryTime} mins)`;

      const response = await fetch("/api/whatsapp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartSummary,
          customerName: name,
          phone,
          address: detailedAddress,
          pincode,
          paymentMethod,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOrderSuccess(data);
        onClearCart();
      } else {
        alert(data.error || "Order creation failed.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error sending order to server.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div id="checkout-section" className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800">
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-3">
        <ShoppingBag className="h-6 w-6 text-amber-400" />
        <h2 className="text-xl md:text-2xl font-semibold text-slate-100">
          {isHindi ? "चेकआउट और फास्ट डिलीवरी" : "Checkout & Order Confirmation"}
        </h2>
      </div>

      {!orderSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Checkout Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* PIN CODE CHECKER */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs uppercase text-amber-400 tracking-wider font-semibold mb-2.5 flex items-center space-x-1.5">
                <Truck className="h-4 w-4" />
                <span>{isHindi ? "मऊ लोकल डिलीवरी पिनकोड चेकर" : "Mau Local Delivery PIN Checker"}</span>
              </h3>
              <form onSubmit={checkPincode} className="flex space-x-2">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. 275101"
                />
                <button
                  type="submit"
                  disabled={checkingPin}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1"
                >
                  {checkingPin ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <span>{isHindi ? "जांचें" : "Check"}</span>}
                </button>
              </form>

              {pincodeStatus && (
                <div className="mt-3 text-xs p-2.5 rounded bg-slate-900 border border-slate-850">
                  {pincodeStatus.available ? (
                    <div className="space-y-1">
                      <p className="text-green-400 font-bold flex items-center space-x-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>{isHindi ? "डिलीवरी उपलब्ध है!" : "Local Same-Day Delivery Available!"}</span>
                      </p>
                      <p className="text-slate-300">
                        {isHindi ? "समय:" : "Time:"} <span className="text-amber-400 font-semibold">{pincodeStatus.time}</span>
                      </p>
                      <p className="text-slate-400">
                        {isHindi ? "चार्ज:" : "Charges:"} {pincodeStatus.charges}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-400 font-medium">
                      {isHindi ? "इस पिनकोड पर लोकल डिलीवरी उपलब्ध नहीं है।" : "We do not deliver here yet. Currently servicing Mau and adjoining PIN codes."}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ORDER DELIVERY DETAILS */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <h3 className="text-xs uppercase text-amber-400 tracking-wider font-semibold pb-1.5 border-b border-slate-800 flex items-center space-x-1.5">
                <MapPin className="h-4 w-4" />
                <span>{isHindi ? "डिलिवरी पता और कस्टमर प्रोफाइल" : "Delivery Address & Contact Details"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {isHindi ? "आपका पूरा नाम" : "Your Full Name"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {isHindi ? "व्हाट्सएप नंबर" : "WhatsApp Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {isHindi ? "पूरा पता (घर का नंबर, गली, मोहल्ला)" : "Full Delivery Address"}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder={isHindi ? "मऊ का पूरा पता दर्ज करें" : "Provide exact details (Street, Landmarks in Mau)"}
                    required
                  />
                </div>

                {/* INTERACTIVE DELIVERY MAP SELECTOR */}
                <div className="sm:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      <span>{isHindi ? "नक्शे पर डिलीवरी का स्थान चुनें (Satellite & Normal)" : "Set Delivery Location on Map (Satellite & Normal)"}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                      {isHindi ? "दूरी आधारित समय आकलन" : "Distance-Based Estimation"}
                    </span>
                  </div>
                  
                  <MapSelector
                    lat={deliveryLat}
                    lng={deliveryLng}
                    onLocationChange={(lat, lng, addressName) => {
                      setDeliveryLat(lat);
                      setDeliveryLng(lng);
                      if (addressName && !address) {
                        setAddress(addressName);
                      }
                    }}
                    label={isHindi ? "आपकी लोकेशन (पिन कर के चुनें)" : "Your Delivery Point (Click to place Pin)"}
                    language={language}
                  />

                  {/* Dynamic delivery distance and time metrics */}
                  <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        {isHindi ? "दुकान से कुल दूरी (Distance)" : "Total distance from Anmol Store"}
                      </span>
                      <span className="text-amber-400 font-bold text-sm">
                        {distance.toFixed(2)} km
                      </span>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        {isHindi ? "अनुमानित डिलीवरी समय" : "Estimated Dispatch Time"}
                      </span>
                      <span className="text-green-400 font-bold text-sm flex items-center justify-end space-x-1">
                        <Truck className="h-4 w-4 animate-bounce text-green-400" />
                        <span>~{estDeliveryTime} mins</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {isHindi ? "पिनकोड" : "Pincode"}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="275101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {isHindi ? "भुगतान विकल्प (Payment Mode)" : "Payment Mode"}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="COD">{isHindi ? "कैश ऑन डिलीवरी (COD)" : "Cash on Delivery (COD)"}</option>
                    <option value="UPI">{isHindi ? "यूपीआई ऑनलाइन (UPI Apps)" : "UPI Online (GPay/PhonePe)"}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder || cart.length === 0}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>{isHindi ? "ऑर्डर प्रोसेस हो रहा है..." : "Processing Order..."}</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 animate-bounce" />
                    <span>{isHindi ? "व्हाट्सएप इनवॉइस प्राप्त करें और ऑर्डर कम्प्लीट करें" : "Checkout & Order via WhatsApp"}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
              {isHindi ? "ऑर्डर समरी (Cart Items)" : "Your Cart Summary"}
            </h3>

            {cart.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">
                {isHindi ? "आपका कार्ट खाली है।" : "No items in cart yet."}
              </p>
            ) : (
              <div className="space-y-3.5">
                <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-xs py-1 border-b border-slate-900">
                      <div>
                        <span className="text-slate-200 font-medium">{item.product.name}</span>
                        <p className="text-[10px] text-slate-500">
                          Qty {item.quantity} • {item.product.brand}
                        </p>
                      </div>
                      <span className="text-slate-300 font-semibold">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>{isHindi ? "सबटोटल" : "Subtotal"}</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isHindi ? "डिलीवरी चार्ज" : "Delivery Charges"}</span>
                    <span>{deliveryCharges === 0 ? <span className="text-green-400 font-medium">FREE</span> : `₹${deliveryCharges}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-100 font-bold border-t border-slate-900 pt-2">
                    <span className="text-amber-400">{isHindi ? "कुल राशि (Total)" : "Total Amount"}</span>
                    <span className="text-amber-400">₹{total}</span>
                  </div>
                </div>

                {/* Loyalty Bonus Points */}
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-[10px] text-yellow-300">
                  🎁 {isHindi ? "इस ऑर्डर पर आप कमाएंगे:" : "This purchase will earn you:"}{" "}
                  <span className="font-bold">{Math.floor(total * 0.1)} Anmol Loyalty Coins</span> (Redeemable on next visit!)
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ORDER SUCCESS AND TRACKING INTERFACE */
        <div className="text-center py-8 space-y-6 max-w-xl mx-auto">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-full inline-block text-green-400 animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-100 font-serif">
              {isHindi ? "बधाई हो! ऑर्डर दर्ज हो गया है।" : "Success! Your Invoice is Generated!"}
            </h3>
            <p className="text-xs text-slate-400">
              {isHindi ? "ऑर्डर आईडी:" : "Order ID:"} <span className="text-amber-400 font-bold text-sm">{orderSuccess.orderId}</span>
            </p>
            <p className="text-sm text-slate-300">
              {isHindi
                ? "नीचे दिए गए बटन पर क्लिक करके व्हाट्सएप पर सीधे ऑर्डर कंफर्म करें। बिना कन्फर्म किये लोकल एजेंट शिपमेंट शुरू नहीं कर पाएंगे।"
                : "To ensure instant processing, please tap the button below to send the generated invoice to our WhatsApp service."}
            </p>
          </div>

          {/* Core Redirect Link */}
          <div className="p-3 bg-slate-950 border border-slate-855 rounded-xl">
            <a
              href={orderSuccess.whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold py-3 px-6 rounded-lg shadow-lg text-sm md:text-base animate-pulse"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{isHindi ? "व्हाट्सएप पर ऑर्डर भेजें 📱" : "Complete Order on WhatsApp 📱"}</span>
            </a>
          </div>

          {/* REAL-TIME SIMULATED ORDER TRACKING */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Truck className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>{isHindi ? "रीयल-टाइम डिलीवरी ट्रैकिंग" : "Mau Same-Day Delivery Tracker"}</span>
            </h4>

            <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {/* Step 1: Placed */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="z-10 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-bold">✓</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{isHindi ? "ऑर्डर प्राप्त हुआ" : "Order Registered Successfully"}</p>
                  <p className="text-[10px] text-slate-500">Just Now</p>
                </div>
              </div>

              {/* Step 2: Packed */}
              <div className="flex items-center space-x-3 text-xs">
                <div className={`z-10 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  trackingStatus.includes("Packed") || trackingStatus.includes("Local") || trackingStatus.includes("Delivered")
                    ? "bg-green-500 text-slate-950" : "bg-slate-800 text-slate-500"
                }`}>✓</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{isHindi ? "सुरक्षित पैकेजिंग (Proper Bubble Packaging)" : "Proper Cushioned Packaging"}</p>
                  <p className="text-[10px] text-slate-500">{trackingStatus.includes("Packed") ? "In Progress" : "Awaiting confirmation"}</p>
                </div>
              </div>

              {/* Step 3: Out for delivery */}
              <div className="flex items-center space-x-3 text-xs">
                <div className={`z-10 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  trackingStatus.includes("Local") || trackingStatus.includes("Delivered")
                    ? "bg-green-500 text-slate-950" : "bg-slate-800 text-slate-500"
                }`}>✓</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{isHindi ? "मऊ लोकल एजेंट रवाना (Same Day Delivery)" : "Out for same day delivery in Mau"}</p>
                  <p className="text-[10px] text-slate-500">{trackingStatus.includes("Local") ? "On the way" : "Scheduled"}</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2.5 border-t border-slate-900">
              <p className="text-xs text-slate-400">
                {isHindi ? "वर्तमान स्थिति:" : "Current Status:"} <span className="text-green-400 font-semibold">{trackingStatus}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
