import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, RefreshCw, ChevronLeft, ArrowRight, MonitorPlay } from "lucide-react";
import { Mood, UserPreferences, Recommendation, MOOD_CONFIGS, SocialVibe, Meme } from "./types";
import { getRecommendations, getTrendingSocialVibes } from "./services/geminiService";
import { MoodCard } from "./components/MoodCard";
import { FilterForm } from "./components/FilterForm";
import { RecommendationCard } from "./components/RecommendationCard";
import { cn } from "./lib/utils";

import { SocialReels } from "./components/SocialReels";

const INITIAL_PREFS: UserPreferences = {
  ageRange: "Adults (18+)",
  languages: [],
  genres: [],
  mood: "Custom",
  customMoodDescription: "",
  type: "movie",
  length: "",
  multipleParts: false,
  count: 3,
  yearRange: "Any",
};

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [prefs, setPrefs] = useState<UserPreferences>(INITIAL_PREFS);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [socialVibes, setSocialVibes] = useState<SocialVibe[]>([]);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [loadingSocials, setLoadingSocials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [animatedWordIndex, setAnimatedWordIndex] = useState(0);

  const words = ["MOOD", "VIBE", "FEELING"];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    const fetchSocials = async () => {
      setLoadingSocials(true);
      setSocialError(null);
      try {
        const data = await getTrendingSocialVibes();
        setRefreshKey(Date.now());
        
        if (data.vibes && data.vibes.length > 0) {
          // Basic validation: ensure URLs are safe and present
          const validatedVibes = data.vibes.map(vibe => {
            if (!vibe.url.startsWith('http')) {
              return {
                ...vibe,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(vibe.name)}`
              };
            }
            return vibe;
          });
          setSocialVibes(validatedVibes);
        }

        if (data.memes && data.memes.length > 0) {
          setMemes(data.memes);
        } else if (!data.vibes || data.vibes.length === 0) {
          throw new Error("No intelligence data returned from API");
        }
      } catch (err: any) {
        console.warn("Falling back to static vibes:", err);
        setSocialError(err.message || "Failed to fetch live vibes");
        setSocialVibes([
          { 
            name: "The Soul of Indian Masala", 
            tag: "#DirectorStudy", 
            url: "https://www.youtube.com/watch?v=s97p0W9qOyc", 
            image_keywords: "bollywood cinematic maximalism",
            description: "How Rajamouli and Bhansali redefine visual maximalism.",
            platform: 'youtube',
            videoId: 's97p0W9qOyc'
          },
          { 
            name: "Framing The Emotional Spice", 
            tag: "#FilmAnalysis", 
            url: "https://www.youtube.com/watch?v=3-pZfTMp6vY", 
            image_keywords: "intense close up drama lighting",
            description: "Geometry and emotion in modern blockbuster cinema.",
            platform: 'youtube',
            videoId: '3-pZfTMp6vY'
          },
          { 
            name: "Global Masala: Neon Dreams", 
            tag: "#CinephileBlog", 
            url: "https://mubi.com/notebook", 
            image_keywords: "neon city night rain movie",
            description: "Why international audiences are falling for high-intensity drama.",
            platform: 'blog',
            videoId: ""
          },
          { 
            name: "The Aesthetics of Chaos", 
            tag: "#VisualHistory", 
            url: "https://www.youtube.com/watch?v=s97p0W9qOyc", 
            image_keywords: "colorful indian street movie scene",
            description: "Exploring the vibrant chaos of independent masala films.",
            platform: 'youtube',
            videoId: 's97p0W9qOyc'
          },
          { 
            name: "Symmetry as Narrative", 
            tag: "#WesAndersonVibe", 
            url: "https://www.youtube.com/results?search_query=symmetry+in+cinema", 
            image_keywords: "perfectly symmetrical room pastel colors",
            description: "How centering the frame changes the story of our lives.",
            platform: 'youtube',
            videoId: 'id_placeholder_1'
          },
          { 
            name: "Noir Noir: Darker Cities", 
            tag: "#ArtOfShadows", 
            url: "https://mubi.com/notebook", 
            image_keywords: "noir detective trenchcoat rain shadow",
            description: "The resurgence of high-contrast black and white storytelling.",
            platform: 'blog',
            videoId: ""
          }
        ]);
        setMemes([
          { 
            title: "Parallel Cinema Expectations", 
            subtitle: "VS Reality", 
            image_keywords: "funny,bollywood,acting",
            color: "#FF007F"
          },
          { 
            title: "The 'Intro' Scene", 
            subtitle: "Every Single Time", 
            image_keywords: "explosion,action,hero",
            color: "#00FF00"
          },
          { 
            title: "Logic has left", 
            subtitle: "The Chat", 
            image_keywords: "confused,physics,funny",
            color: "#00FFFF"
          },
          { 
            title: "When the BGM hits", 
            subtitle: "Middle of the road", 
            image_keywords: "speakers,dance,party",
            color: "#FFFF00"
          }
        ]);
      } finally {
        setLoadingSocials(false);
      }
    };

    fetchSocials();
    return () => clearInterval(interval);
  }, []);

  const moodConfig = MOOD_CONFIGS[prefs.mood];

  const handleMoodSelect = (mood: Mood) => {
    setPrefs(prev => ({ ...prev, mood, customMoodDescription: "" }));
  };

  const handleContinue = () => {
    // If user typed something but didn't select a mood, keep it as Custom
    setStep(2);
  };

  const updatePrefs = (newPrefs: Partial<UserPreferences>) => {
    setPrefs(prev => ({ ...prev, ...newPrefs }));
  };

  const handleFetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await getRecommendations(prefs);
      setResults(recs);
      setStep(3);
    } catch (err: any) {
      console.error("Failed to get recs:", err);
      // Clean up JSON error if it's from Firestore/Firebase or API
      let displayMsg = err.message;
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error && parsed.error.message) {
          displayMsg = parsed.error.message;
        }
      } catch (e) {
        // Not JSON, use as is
      }
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white text-black font-sans selection:bg-[#FFFF00] bg-grain">
      {/* Cinematic Scanning Line overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-15" />
      
      <div className="fixed inset-0 pop-gradient opacity-10 pointer-events-none" />
      
      <nav className="relative z-10 p-8 flex justify-between items-end max-w-7xl mx-auto border-b-8 border-black mb-12 bg-white">
        <div className="absolute top-0 left-0 right-0 h-4 film-strip-edge bg-black/5" />
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="w-16 h-16 bg-[#FFFF00] border-4 border-black flex items-center justify-center brutal-shadow-sm group-hover:rotate-12 transition-transform">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <span className="font-masala text-4xl block leading-none">FILMY VIBES</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Gemini Masala Engine</span>
              <div className="bg-[#00FF00] text-black text-[8px] font-black px-2 py-0.5 border-2 border-black animate-pulse">CINEMATIC AI</div>
            </div>
          </div>
        </div>
        
        {step > 1 && (
          <button 
            onClick={() => setStep((step - 1) as any)}
            className="bg-[#FF007F] text-white px-6 py-2 border-4 border-black font-black uppercase tracking-widest text-xs brutal-shadow-sm hover:brutal-shadow transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none"
          >
            ← Back
          </button>
        )}
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 2 }}
              className="space-y-16"
            >
              <div className="relative inline-block mb-8">
                <div className="absolute -inset-4 bg-[#00FF00] -rotate-2 border-4 border-black z-0 brutal-shadow" />
                <h1 className="relative z-10 text-6xl md:text-[8rem] font-masala leading-[0.8] tracking-tighter">
                  WHAT'S THE <br />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={words[animatedWordIndex]}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-[#FF007F] inline-block"
                    >
                      {words[animatedWordIndex]}?
                    </motion.span>
                  </AnimatePresence>
                </h1>
              </div>

              {/* Hero Image Section with Cinematic Frame */}
              <div className="relative h-[450px] w-full border-8 border-black brutal-shadow overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-8 film-strip-edge bg-black z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-8 film-strip-edge bg-black z-20" />
                
                <img 
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000" 
                  alt="Cinematic Vibe"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 contrast-125 brightness-75 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors flex items-center justify-center p-8">
                  <div className="bg-[#FFFF00] border-4 border-black p-8 -rotate-2 group-hover:rotate-0 transition-transform brutal-shadow text-center">
                    <p className="font-masala text-4xl md:text-6xl text-black">CRAFT YOUR SCENE</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
                      <p className="font-mono text-xs uppercase font-black bg-black text-white px-2 py-1">POWERED BY GEMINI</p>
                      <p className="font-mono text-xs uppercase font-black bg-[#FF007F] text-white px-2 py-1">#CinematicAI</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-12 bg-black" />
                    <span className="font-masala text-2xl">TYPE YOUR VIBE</span>
                    <div className="h-2 flex-grow bg-black" />
                  </div>
                  
                  <textarea
                    placeholder="E.g. I want to feel unstoppable like a superhero, or I'm in the mood for a cozy winter mystery..."
                    className="w-full bg-white border-8 border-black p-8 font-bold text-2xl md:text-3xl brutal-shadow focus:brutal-shadow-hover focus:-translate-y-2 transition-all outline-none min-h-[180px] placeholder:text-black/10"
                    value={prefs.customMoodDescription}
                    onChange={(e) => setPrefs(prev => ({ ...prev, customMoodDescription: e.target.value, mood: 'Custom' }))}
                  />
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="font-masala text-xl opacity-40">OR PICK A STARTER</span>
                    <div className="h-0.5 flex-grow bg-black/10" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {(Object.keys(MOOD_CONFIGS) as Mood[])
                      .filter(m => m !== 'Custom')
                      .map((mood) => (
                      <MoodCard
                        key={mood}
                        mood={mood}
                        isSelected={prefs.mood === mood}
                        onSelect={handleMoodSelect}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={handleContinue}
                    disabled={!prefs.customMoodDescription && !prefs.mood}
                    className="w-full bg-[#00FF00] border-8 border-black py-8 font-masala text-4xl hover:bg-white brutal-shadow-hover active:brutal-shadow-active transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    CONTINUE TO THEATER →
                  </button>
                </div>

                {/* Trending Social Vibes Section */}
                <div className="pt-24 space-y-12">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <div className="w-12 h-12 bg-[#FF007F] border-4 border-black flex items-center justify-center brutal-shadow-sm uppercase font-black text-white shrink-0">HI</div>
                    <div className="shrink-0">
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Trend Intelligence</h3>
                      <p className="text-[10px] font-black uppercase bg-black text-[#00FF00] px-2 py-0.5 inline-block mt-1 tracking-widest">Real-time Cinematic Spices</p>
                    </div>
                    {/* Decorative Marquee */}
                    <div className="flex-1 h-8 bg-black overflow-hidden flex items-center">
                      <div className="animate-marquee whitespace-nowrap text-[#00FF00] font-black text-[10px] uppercase">
                        SCANNED 6 NEW CULTURAL VIBES // ANALYZING DRAMA LEVELS // MULTIMODAL EXTRACTION COMPLETE // SCANNED 6 NEW CULTURAL VIBES // ANALYZING DRAMA LEVELS // MULTIMODAL EXTRACTION COMPLETE //
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[500px]">
                    {loadingSocials ? (
                      Array(6).fill(0).map((_, i) => (
                        <div key={i} className="group p-8 border-4 border-black border-dashed bg-neutral-50 animate-pulse relative overflow-hidden h-48">
                          <div className="absolute top-4 left-4 w-12 h-4 bg-black/10" />
                          <div className="absolute bottom-8 left-8 right-8 h-8 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <RefreshCw className="w-12 h-12 animate-spin" />
                          </div>
                        </div>
                      ))
                    ) : (
                      socialVibes.map((item, id) => (
                        <a 
                          key={id} 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group p-8 border-4 border-black hover:bg-black transition-colors brutal-shadow-sm hover:brutal-shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00FF00]/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <span className="bg-[#00FF00] text-black text-[10px] font-black px-2 py-1 border-2 border-black uppercase tracking-widest">
                                {item.tag}
                              </span>
                              <span className="text-black/30 group-hover:text-white/30 font-black text-[10px] uppercase italic">
                                {item.platform}
                              </span>
                            </div>
                            
                            <h3 className="text-3xl font-black uppercase italic leading-none mb-4 group-hover:text-white transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            
                            <p className="text-xs font-black uppercase tracking-wide text-black/60 group-hover:text-white/60 leading-relaxed max-w-[200px]">
                              {item.description}
                            </p>
                            
                            {item.reason && (
                              <div className="mt-4 p-2 bg-white/5 border border-black/10 group-hover:border-white/20">
                                <span className="text-[7px] font-black uppercase text-black/40 group-hover:text-white/40 block mb-1">
                                  AI Insight
                                </span>
                                <p className="text-[8px] font-mono leading-none text-black/30 group-hover:text-white/30 hidden group-hover:block">
                                  {item.reason}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-8 flex items-center gap-2 text-[#FF007F] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              Analyze Trend <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>

                  {/* Trending Memes Section */}
                  <div className="mt-40">
                    <div className="flex items-center gap-4 mb-12">
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter">Trending <span className="bg-[#FFFF00] px-2 text-black border-2 border-black brutal-shadow-xs">Memes</span></h2>
                      <div className="h-[2px] flex-1 bg-black/10" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {memes.length > 0 ? (
                        memes.map((meme, idx) => (
                          <div key={idx} className="group relative border-4 border-black bg-white overflow-hidden p-4 brutal-shadow-sm hover:-translate-y-2 transition-all">
                            <div className="aspect-square bg-neutral-200 border-2 border-black overflow-hidden mb-4 relative">
                              <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />
                              <div className="absolute top-2 left-2 z-20 bg-black text-white text-[8px] font-black px-2 py-0.5 border border-white/20 uppercase tracking-tighter">
                                TOP TREND #{(idx + 1).toString().padStart(2, '0')}
                              </div>
                              <img 
                                src={`https://picsum.photos/seed/${meme.title.replace(/\W/g, '')}${idx}${refreshKey}/400/400`} 
                                alt="meme" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-[10px] uppercase tracking-widest text-black/40">{meme.subtitle}</p>
                              <p className="font-masala text-xl uppercase italic leading-none">{meme.title}</p>
                            </div>
                            <div 
                              className="absolute -right-2 -bottom-2 w-8 h-8 border-2 border-black rotate-12 z-10" 
                              style={{ backgroundColor: meme.color }}
                            />
                          </div>
                        ))
                      ) : (
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-64 bg-neutral-100 border-4 border-black border-dashed opacity-50 animate-pulse" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, rotate: 10 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-20 space-y-4">
                <div className="bg-black text-white p-4 inline-block -rotate-2 brutal-shadow max-w-full">
                  <h2 className="text-4xl md:text-6xl font-masala leading-none break-words">
                    {prefs.customMoodDescription ? `\"${prefs.customMoodDescription}\"` : moodConfig.message}
                  </h2>
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-[#FFFF00] flex-1 border-4 border-black" />
                  <div className="h-4 bg-[#FF007F] flex-1 border-4 border-black" />
                </div>
              </div>

              <FilterForm
                prefs={prefs}
                onUpdate={updatePrefs}
                onSubmit={handleFetchRecommendations}
                isLoading={loading}
              />

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-20"
                >
                  <SocialReels recommendations={[]} isLoading={true} />
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 bg-black text-white border-8 border-[#FF007F] brutal-shadow"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-4xl">😱</div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-masala text-2xl mb-2 text-[#FF007F]">THE KITCHEN IS ON FIRE!</h3>
                      <p className="font-bold opacity-80">{error}</p>
                    </div>
                    <button 
                      onClick={handleFetchRecommendations}
                      className="bg-[#00FF00] text-black px-8 py-3 border-4 border-black font-black uppercase text-sm brutal-shadow-sm hover:brutal-shadow transition-all"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-20 pb-32"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-[#FFFF00] p-12 border-8 border-black brutal-shadow">
                <div className="max-w-2xl">
                  <div className="text-[14px] font-black uppercase tracking-[0.5em] mb-4 bg-black text-white px-4 py-1 inline-block">BOMBSHELL RESULTS!</div>
                  <h2 className="text-6xl md:text-8xl font-masala leading-[0.8] uppercase tracking-tighter">
                    THE PERFECT <br /> {prefs.type}s!
                  </h2>
                  <p className="mt-4 font-black uppercase tracking-widest text-[#FF007F]">
                    Curated for: {prefs.customMoodDescription || prefs.mood}
                  </p>
                </div>
                <div className="flex-shrink-0 animate-bounce">
                  <div className="w-24 h-24 bg-[#FF007F] rounded-full border-4 border-black flex items-center justify-center text-white brutal-shadow-sm">
                    <Film className="w-12 h-12" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-12">
                {results.map((item, idx) => (
                  <RecommendationCard key={item.name} item={item} index={idx} />
                ))}
              </div>

              <SocialReels recommendations={results} />

              <div className="flex justify-center pt-20">
                <button
                  onClick={reset}
                  className="group relative bg-[#00FF00] border-8 border-black px-12 py-6 font-masala text-3xl hover:bg-white transition-colors brutal-shadow-hover active:brutal-shadow-active"
                >
                  <div className="flex items-center gap-4">
                    <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-700" />
                    RE-SPIN THE DISH!
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 p-12 flex justify-between items-center border-t-4 border-black font-black text-xs uppercase tracking-widest bg-white">
        <span className="bg-black text-white px-2 py-1">BUILD V4.0 // GEMINI CORE</span>
        <span>&copy; {new Date().getFullYear()} / GOOGLE AI STUDIO / GEMINI</span>
      </footer>
    </div>
  );
}
