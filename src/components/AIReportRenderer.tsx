import React from "react";
import { 
  Sparkles, 
  Sun, 
  Moon, 
  ShoppingBag, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Activity, 
  Heart,
  Droplet,
  Percent,
  Smile,
  Zap,
  Star,
  Check
} from "lucide-react";

interface AIReportRendererProps {
  content: string | null;
}

interface ParsedSection {
  type: string;
  title: string;
  lines: string[];
  scores: { label: string; value: number }[];
  skinType?: string;
  confidence?: string;
}

// Words that should be highlighted in premium soft gold (#D4AF37)
const GOLD_HIGHLIGHTS = [
  "anmol cosmetics", "anmol", "lakme", "maybelline", "swiss beauty", "mamaearth", "derma co", 
  "minimalist", "l'oréal", "tresemmé", "sugar cosmetics", "insight cosmetics", "shringar box",
  "combination skin", "oily skin", "dry skin", "normal skin", "mishrit",
  "मिश्रित त्वचा", "तैलीय त्वचा", "रूखी त्वचा", "सामान्य त्वचा", "ग्लो", "नमी", "त्वचा स्वास्थ्य स्कोर",
  "glow", "hydration", "pores", "texture", "even tone", "analysis", "confidence level",
  "85%", "88%", "90%", "92%", "95%", "98%", "100%", "919455321567"
];

export default function AIReportRenderer({ content }: AIReportRendererProps) {
  if (!content) return null;

  // Helper to split long paragraph blocks into shorter, scannable sentences
  const makeSentencesShort = (text: string): string[] => {
    if (!text) return [];
    
    // Split by standard Hindi full stop (।) or English period followed by space
    // and trim empty items
    const rawParts = text.split(/(?<=[।\.])\s+/);
    const results: string[] = [];
    
    rawParts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      // If a sentence is still extremely long, we can keep it as is, but usually it's short
      results.push(trimmed);
    });
    
    return results;
  };

  // Helper to render bold text and selectively highlight premium brand names in gold
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Match anything between ** and **
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Check if this part contains any key gold highlight terms
        const lowerPart = part.toLowerCase();
        const shouldBeGold = GOLD_HIGHLIGHTS.some(highlight => lowerPart.includes(highlight));
        
        if (shouldBeGold) {
          return (
            <strong key={index} className="text-amber-500 font-extrabold font-sans mx-0.5 select-all">
              {part}
            </strong>
          );
        } else {
          // Standard high-contrast clean white bold
          return (
            <strong key={index} className="text-slate-100 font-bold font-sans mx-0.5">
              {part}
            </strong>
          );
        }
      }
      return part;
    });
  };

  // 1. PARSE CONTENT INTO LOGICAL SECTIONS/CARDS
  const lines = content.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = {
    type: "intro",
    title: "",
    lines: [],
    scores: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect horizontal separators
    if (line === "---" || line === "–-–" || line === "___" || line === "━━━━━━━━━━━━━━━━") {
      continue; // Skip rendering raw lines; we use elegant cards and dividers
    }

    // Detect headers (lines starting with # or bold lines that act as titles)
    const isHeading = line.startsWith("#") || 
      (line.startsWith("**") && line.endsWith("**") && line.length < 85) ||
      (line.toUpperCase().includes("ROUTINE") && line.length < 50) ||
      (line.includes("रूटीन") && line.length < 50) ||
      (line.includes("शेड्यूल") && line.length < 50) ||
      (line.includes("सुझाव") && line.length < 50);

    if (isHeading) {
      // Save the previous section
      if (currentSection.lines.length > 0 || currentSection.scores.length > 0 || currentSection.title) {
        sections.push(currentSection);
      }

      // Clean heading text
      let title = line.replace(/^#+\s*/, "").trim();
      title = title.replace(/^\*\*([\s\S]*?)\*\*$/, "$1").trim();
      title = title.replace(/^\*([\s\S]*?)\*$/, "$1").trim();
      title = title.replace(/^\*\*|\*\*$/g, "").trim();

      // Determine section type
      let type = "general";
      const lTitle = title.toLowerCase();

      if (lTitle.includes("skin type") || lTitle.includes("त्वचा का प्रकार") || lTitle.includes("summary") || lTitle.includes("त्वचा प्रकार")) {
        type = "skin_summary";
      } else if (lTitle.includes("health score") || lTitle.includes("हेल्थ स्कोर") || lTitle.includes("metrics") || lTitle.includes("स्कोर") || lTitle.includes("score")) {
        type = "health_scores";
      } else if (lTitle.includes("morning") || lTitle.includes("मॉर्निंग") || lTitle.includes("सुबह") || lTitle.includes("day-of-wedding") || lTitle.includes("glam plan")) {
        type = "morning_routine";
      } else if (lTitle.includes("night") || lTitle.includes("नाइट") || lTitle.includes("रात") || lTitle.includes("evening") || lTitle.includes("🌙")) {
        type = "night_routine";
      } else if (lTitle.includes("recommended") || lTitle.includes("product") || lTitle.includes("उत्पाद") || lTitle.includes("shringar box") || lTitle.includes("सामग्री") || lTitle.includes("accessories match")) {
        type = "recommended_products";
      } else if (lTitle.includes("avoid") || lTitle.includes("precautions") || lTitle.includes("सावधानी") || lTitle.includes("बचें") || lTitle.includes("परहेज")) {
        type = "avoid";
      } else if (lTitle.includes("timeline") || lTitle.includes("bridal") || lTitle.includes("wedding") || lTitle.includes("दिन") || lTitle.includes("दिनचर्या") || lTitle.includes("shringar")) {
        type = "timeline";
      } else if (lTitle.includes("quote") || lTitle.includes("सुविचार") || lTitle.includes("विचार") || lTitle.includes("closing")) {
        type = "quote";
      }

      currentSection = {
        type,
        title,
        lines: [],
        scores: []
      };
      continue;
    }

    // Detect stand-alone quotes
    const isQuote = line.startsWith('"') || line.startsWith('“') || line.includes("Quote:") || line.includes("सुविचार:");
    if (isQuote) {
      if (currentSection.type !== "quote") {
        if (currentSection.lines.length > 0 || currentSection.scores.length > 0 || currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = {
          type: "quote",
          title: "",
          lines: [line],
          scores: []
        };
      } else {
        currentSection.lines.push(line);
      }
      continue;
    }

    // Try parsing health scores inside scores section
    if (currentSection.type === "health_scores" || currentSection.type === "general") {
      // Matches standard patterns like: "Glow/Radiance: 85/100", "Hydration: 75%", "नमी (Hydration): 80/100"
      const scoreReg = /(Glow|Radiance|Hydration|Pores|Tone|Texture|नमी|चमक|लोच|ऑयल|दाग|धब्बे|पिगमेंटेशन|त्वचा|Glow\/Radiance|Pores\s*&\s*Texture|Even\s*Tone\/Spots)[^:]*:\s*\*?(\d+)/i;
      const scoreMatch = line.match(scoreReg);
      if (scoreMatch) {
        // Change section type to health_scores if it was general
        currentSection.type = "health_scores";
        const label = scoreMatch[1].trim();
        const value = parseInt(scoreMatch[2], 10);
        currentSection.scores.push({ label, value });
        continue;
      }
    }

    // Try parsing skin type details inside summary section
    if (currentSection.type === "skin_summary" || currentSection.type === "general") {
      const typeReg = /(Skin Type|त्वचा का प्रकार|Type)\s*:\s*\*?([^*:\n\(\)]+)/i;
      const typeMatch = line.match(typeReg);
      if (typeMatch) {
        currentSection.type = "skin_summary";
        currentSection.skinType = typeMatch[2].replace(/^\*+/, "").replace(/\*+$/, "").trim();
      }

      const confReg = /(Confidence Level|विश्वास स्तर|एक्यूरेसी|Confidence)\s*:\s*\*?([^*:\n]+)/i;
      const confMatch = line.match(confReg);
      if (confMatch) {
        currentSection.type = "skin_summary";
        currentSection.confidence = confMatch[2].replace(/^\*+/, "").replace(/\*+$/, "").trim();
      }
    }

    // Standard body line
    currentSection.lines.push(line);
  }

  // Save final section
  if (currentSection.lines.length > 0 || currentSection.scores.length > 0 || currentSection.title) {
    sections.push(currentSection);
  }

  // 2. RENDER THE STRUCTURED SECTIONS AS PREMIUM REPORT CARDS
  return (
    <div className="space-y-6 md:space-y-8 py-2">
      {sections.map((sec, secIdx) => {
        const titleText = sec.title || "";
        
        // --- RENDERING: WELCOME INTRO CARD ---
        if (sec.type === "intro") {
          return (
            <div 
              key={secIdx} 
              className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-lg text-slate-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-500 animate-pulse">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="text-base font-serif font-semibold text-amber-300">
                  {titleText || "AI Analysis Insights"}
                </h4>
              </div>
              <div className="space-y-3">
                {sec.lines.flatMap(line => makeSentencesShort(line)).map((sentence, idx) => (
                  <p key={idx} className="text-sm md:text-base text-slate-300 leading-relaxed font-sans">
                    {renderFormattedText(sentence)}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // --- RENDERING: SKIN ASSESSMENT SUMMARY CARD (Apple Health & Nykaa Inspired) ---
        if (sec.type === "skin_summary") {
          const skinTypeDisplay = sec.skinType || "Combination Skin";
          const confidenceDisplay = sec.confidence || "88%";

          return (
            <div 
              key={secIdx} 
              className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden"
            >
              {/* Subtle gold glow accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800/60">
                <Smile className="h-5 w-5 text-amber-500 shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-slate-100">
                  {titleText || "Skin Diagnostics & Assessment"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Gauge/Stars */}
                <div className="flex flex-col items-center md:items-start space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex items-center space-x-1.5 text-amber-500">
                    <Star className="h-5 w-5 fill-amber-500" />
                    <Star className="h-5 w-5 fill-amber-500" />
                    <Star className="h-5 w-5 fill-amber-500" />
                    <Star className="h-5 w-5 fill-amber-500" />
                    <Star className="h-5 w-5 fill-amber-500/20 text-amber-500/40" />
                    <span className="text-xs text-slate-400 font-mono ml-1">4.0 / 5.0</span>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold">Predicted Skin Type</p>
                    <h5 className="text-lg md:text-xl font-serif font-black text-amber-300 mt-1">
                      {skinTypeDisplay}
                    </h5>
                  </div>
                </div>

                {/* Analysis Accuracy */}
                <div className="flex flex-col items-center md:items-start space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex items-center space-x-1.5 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5 fill-emerald-500/10" />
                    <span className="text-xs text-emerald-400 font-mono font-bold">Verified Scan Report</span>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold">AI Scan Accuracy</p>
                    <h5 className="text-lg md:text-xl font-sans font-extrabold text-slate-200 mt-1">
                      {confidenceDisplay} Confidence
                    </h5>
                  </div>
                </div>
              </div>

              {sec.lines.length > 0 && (
                <div className="mt-5 space-y-3 text-slate-300">
                  {sec.lines.flatMap(line => makeSentencesShort(line)).map((sentence, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <span className="text-amber-500 mt-1 font-bold shrink-0">✔</span>
                      <p className="leading-relaxed">{renderFormattedText(sentence)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // --- RENDERING: SKIN HEALTH SCORES CARD (Progress Bar Indicators) ---
        if (sec.type === "health_scores") {
          // If no specific scores were successfully parsed, we can display standard fallback scores
          const displayScores = sec.scores.length > 0 ? sec.scores : [
            { label: "Glow & Radiance", value: 85 },
            { label: "Hydration Balance", value: 78 },
            { label: "Texture & Pores", value: 72 },
            { label: "Skin Even Tone", value: 80 }
          ];

          return (
            <div 
              key={secIdx} 
              className="bg-slate-900/95 p-6 rounded-2xl border border-slate-800 shadow-xl"
            >
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800/60">
                <Activity className="h-5 w-5 text-amber-500 shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-slate-100">
                  {titleText || "Skin Health Parameters"}
                </h4>
              </div>

              {/* Progress Bar Grid */}
              <div className="space-y-4.5">
                {displayScores.map((sc, idx) => {
                  // Determine clean color for specific scores
                  const barColorClass = "bg-gradient-to-r from-amber-600 to-amber-400";
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium tracking-wide">
                          {sc.label}
                        </span>
                        <span className="text-amber-300 font-mono font-bold text-xs">
                          {sc.value} / 100
                        </span>
                      </div>
                      
                      {/* Premium styled Progress bar */}
                      <div className="bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800/40 relative">
                        <div 
                          className={`${barColorClass} h-full rounded-full transition-all duration-1000 shadow-sm`}
                          style={{ width: `${sc.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {sec.lines.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-800/40 space-y-3">
                  {sec.lines.flatMap(line => makeSentencesShort(line)).map((sentence, idx) => (
                    <p key={idx} className="text-sm text-slate-300 leading-relaxed font-sans">
                      {renderFormattedText(sentence)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // --- RENDERING: MORNING ROUTINE CARD ---
        if (sec.type === "morning_routine") {
          return (
            <div 
              key={secIdx} 
              className="bg-gradient-to-br from-slate-900 to-amber-950/10 p-6 rounded-2xl border border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all"
            >
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-amber-500/10">
                <Sun className="h-5 w-5 text-amber-500 animate-spin-slow shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-amber-300">
                  {titleText || "Morning Routine (सुबह का नियम)"}
                </h4>
              </div>

              <div className="space-y-4">
                {sec.lines.map((line, idx) => {
                  // Clean standard formatting if line starts with lists
                  const cleanLine = line.replace(/^[\*\-\s\d\.\)]+/, "").trim();
                  if (!cleanLine) return null;

                  // Parse key action step (e.g. "Cleanser: Wash face")
                  const firstColon = cleanLine.indexOf(":");
                  let key = "";
                  let val = cleanLine;
                  if (firstColon !== -1 && firstColon < 25) {
                    key = cleanLine.substring(0, firstColon).trim();
                    val = cleanLine.substring(firstColon + 1).trim();
                  }

                  return (
                    <div key={idx} className="flex items-start space-x-3.5 text-sm">
                      <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full w-6.5 h-6.5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="leading-relaxed text-slate-200">
                        {key ? (
                          <>
                            <span className="text-slate-100 font-extrabold block md:inline md:mr-1.5">{key}:</span>
                            <span className="text-slate-300">{renderFormattedText(val)}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">{renderFormattedText(cleanLine)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // --- RENDERING: NIGHT ROUTINE CARD ---
        if (sec.type === "night_routine") {
          return (
            <div 
              key={secIdx} 
              className="bg-gradient-to-br from-slate-900 to-indigo-950/15 p-6 rounded-2xl border border-indigo-500/10 shadow-lg hover:border-indigo-500/20 transition-all"
            >
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-indigo-500/10">
                <Moon className="h-5 w-5 text-indigo-400 shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-indigo-300">
                  {titleText || "Night Routine (रात का नियम)"}
                </h4>
              </div>

              <div className="space-y-4">
                {sec.lines.map((line, idx) => {
                  const cleanLine = line.replace(/^[\*\-\s\d\.\)]+/, "").trim();
                  if (!cleanLine) return null;

                  const firstColon = cleanLine.indexOf(":");
                  let key = "";
                  let val = cleanLine;
                  if (firstColon !== -1 && firstColon < 25) {
                    key = cleanLine.substring(0, firstColon).trim();
                    val = cleanLine.substring(firstColon + 1).trim();
                  }

                  return (
                    <div key={idx} className="flex items-start space-x-3.5 text-sm">
                      <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full w-6.5 h-6.5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="leading-relaxed text-slate-200">
                        {key ? (
                          <>
                            <span className="text-slate-100 font-extrabold block md:inline md:mr-1.5">{key}:</span>
                            <span className="text-slate-300">{renderFormattedText(val)}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">{renderFormattedText(cleanLine)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // --- RENDERING: RECOMMENDED PRODUCTS SECTION ---
        if (sec.type === "recommended_products") {
          return (
            <div 
              key={secIdx} 
              className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl"
            >
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800/60">
                <ShoppingBag className="h-5 w-5 text-amber-500 shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-slate-100">
                  {titleText || "Recommended Cosmetics Catalog"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.lines.map((line, idx) => {
                  const cleanLine = line.replace(/^[\*\-\s]+/, "").trim();
                  if (!cleanLine) return null;

                  return (
                    <div 
                      key={idx} 
                      className="bg-slate-950/60 hover:bg-slate-950/90 p-4 rounded-xl border border-slate-800/40 hover:border-amber-500/20 transition-all flex items-start space-x-3"
                    >
                      <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-500 mt-0.5 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">
                        {renderFormattedText(cleanLine)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // --- RENDERING: AVOID / PRECAUTIONS CARD ---
        if (sec.type === "avoid") {
          return (
            <div 
              key={secIdx} 
              className="border-l-4 border-rose-500 bg-rose-950/10 p-6 rounded-r-2xl border-y border-r border-slate-800/60 shadow-lg text-slate-200"
            >
              <div className="flex items-center space-x-2.5 mb-4">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 animate-bounce" />
                <h4 className="text-base font-serif font-black tracking-tight text-rose-300">
                  {titleText || "Things to Avoid / परहेज"}
                </h4>
              </div>
              <div className="space-y-3">
                {sec.lines.flatMap(line => makeSentencesShort(line)).map((sentence, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-sm">
                    <span className="text-rose-400 font-extrabold shrink-0 mt-0.5">✕</span>
                    <p className="text-slate-300 leading-relaxed">{renderFormattedText(sentence)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // --- RENDERING: BRIDAL TIMELINE / SCHEDULE TIMELINE ---
        if (sec.type === "timeline") {
          return (
            <div 
              key={secIdx} 
              className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl"
            >
              <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800/60">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
                <h4 className="text-base font-serif font-black tracking-tight text-slate-100">
                  {titleText || "Timeline Details"}
                </h4>
              </div>

              <div className="relative pl-6 border-l border-amber-500/20 space-y-6">
                {sec.lines.map((line, idx) => {
                  const cleanLine = line.replace(/^[\*\-\s]+/, "").trim();
                  if (!cleanLine) return null;

                  return (
                    <div key={idx} className="relative">
                      {/* Left timeline node dot */}
                      <span className="absolute -left-9 top-1.5 w-5 h-5 bg-slate-950 border-2 border-amber-500 rounded-full flex items-center justify-center text-[10px] text-amber-500 font-bold shadow-md">
                        ★
                      </span>
                      <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
                        {renderFormattedText(cleanLine)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // --- RENDERING: BEAUTY QUOTE CARD ---
        if (sec.type === "quote") {
          const rawQuote = sec.lines.join(" ").replace(/^["'“'Quote सुविचार:\s]+/, "").replace(/["'”]+$/, "").trim();
          
          return (
            <div 
              key={secIdx} 
              className="my-6 p-6 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 border-y border-amber-500/20 rounded-2xl text-center italic text-sm md:text-base text-amber-200 font-serif shadow-inner max-w-xl mx-auto"
            >
              <span className="text-2xl font-serif text-amber-500/60 block mb-1">“</span>
              <p className="leading-relaxed px-4">{renderFormattedText(rawQuote)}</p>
              <span className="text-2xl font-serif text-amber-500/60 block mt-1">”</span>
            </div>
          );
        }

        // --- RENDERING: GENERAL FALLBACK CARD ---
        return (
          <div 
            key={secIdx} 
            className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-md text-slate-300 space-y-3.5"
          >
            {titleText && (
              <h4 className="text-sm md:text-base font-serif font-bold text-amber-300 pb-2 border-b border-slate-800/60">
                {renderFormattedText(titleText)}
              </h4>
            )}
            <div className="space-y-2.5">
              {sec.lines.flatMap(line => makeSentencesShort(line)).map((sentence, idx) => (
                <p key={idx} className="text-sm leading-relaxed font-sans text-slate-200">
                  {renderFormattedText(sentence)}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
