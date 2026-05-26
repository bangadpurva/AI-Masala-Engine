import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { UserPreferences, ContentType } from "../types";
import { cn } from "../lib/utils";

interface FilterFormProps {
  prefs: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AGE_RANGES = ["Kids", "Teens", "Adults (18+)", "Mature (R-Rated)"];
const GENRES = ["Animation", "Documentary", "Black & White"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Japanese", "Korean", "German"];

export function FilterForm({ prefs, onUpdate, onSubmit, isLoading }: FilterFormProps) {
  const toggleLanguage = (lang: string) => {
    const newLangs = prefs.languages.includes(lang)
      ? prefs.languages.filter(l => l !== lang)
      : [...prefs.languages, lang];
    onUpdate({ languages: newLangs });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = prefs.genres.includes(genre)
      ? prefs.genres.filter(g => g !== genre)
      : [...prefs.genres, genre];
    onUpdate({ genres: newGenres });
  };

  const labelClasses = "block text-[12px] font-black uppercase tracking-[0.3em] mb-4 bg-black text-white px-3 py-1 inline-block";
  const inputBg = "bg-white border-4 border-black rounded-none p-4 text-sm font-bold focus:outline-none focus:bg-[#FFFF00] transition-colors brutal-shadow-sm";

  return (
    <div className="space-y-16 pb-24">
      {/* Type & Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className={labelClasses}>CHOOSE TYPE</label>
          <div className="flex gap-4">
            {(['movie', 'series'] as ContentType[]).map((type) => (
              <button
                key={type}
                onClick={() => onUpdate({ type })}
                className={cn(
                  "flex-1 py-4 text-xl font-masala uppercase tracking-widest transition-all border-4 border-black",
                  prefs.type === type 
                    ? "bg-[#FF007F] text-white brutal-shadow" 
                    : "bg-white hover:bg-[#FFFF00] brutal-shadow-sm"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className={labelClasses}>WHICH AUDIENCE?</label>
          <div className="relative">
            <select
              value={prefs.ageRange}
              onChange={(e) => onUpdate({ ageRange: e.target.value })}
              className={cn(inputBg, "w-full appearance-none relative z-10")}
            >
              {AGE_RANGES.map(age => <option key={age} value={age} className="text-black">{age}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <ChevronRight className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-6">
        <label className={labelClasses}>SELECT LANGUAGES</label>
        <div className="flex flex-wrap gap-4">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={cn(
                "px-8 py-3 border-4 border-black text-xs font-black uppercase tracking-widest transition-all",
                prefs.languages.includes(lang)
                  ? "bg-[#00FF00] text-black brutal-shadow -translate-y-1"
                  : "bg-white hover:bg-neutral-100 brutal-shadow-sm"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-6">
        <label className={labelClasses}>PICK YOUR FLAVOR <span className="opacity-50 text-[10px] ml-2">(OPTIONAL)</span></label>
        <div className="flex flex-wrap gap-4">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={cn(
                "px-8 py-3 border-4 border-black text-xs font-black uppercase tracking-widest transition-all",
                prefs.genres.includes(genre)
                  ? "bg-[#FFFF00] text-black brutal-shadow -translate-y-1"
                  : "bg-white hover:bg-neutral-100 brutal-shadow-sm"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Length & Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className={labelClasses}>
            {prefs.type === 'movie' ? 'HOW LONG?' : 'TOTAL EPS?'}
          </label>
          <input
            type="text"
            placeholder={prefs.type === 'movie' ? 'e.g. 150 MINS' : 'e.g. 8 EPISODES'}
            value={prefs.length}
            onChange={(e) => onUpdate({ length: e.target.value })}
            className={cn(inputBg, "w-full")}
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-4 cursor-pointer group bg-black text-white p-6 brutal-shadow-sm w-full border-4 border-black hover:brutal-shadow transition-all">
            <div className="relative">
              <input
                type="checkbox"
                checked={prefs.multipleParts}
                onChange={(e) => onUpdate({ multipleParts: e.target.checked })}
                className="sr-only"
              />
              <div className="w-12 h-6 bg-white/20 border-2 border-white/50" />
              <motion.div 
                animate={{ x: prefs.multipleParts ? 24 : 0 }}
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 border-2 border-black",
                  prefs.multipleParts ? "bg-[#00FF00]" : "bg-neutral-500"
                )} 
              />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em] leading-none">
              SEQUELS & SAGAS?
            </span>
          </label>
        </div>
      </div>

      {/* Year Range & Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className={labelClasses}>RELEASE ERA</label>
          <div className="relative">
            <select
              value={prefs.yearRange}
              onChange={(e) => onUpdate({ yearRange: e.target.value })}
              className={cn(inputBg, "w-full appearance-none relative z-10")}
            >
              {["Any", "2020s", "2010s", "2000s", "90s", "80s", "Classic (Pre-80s)"].map(year => (
                <option key={year} value={year} className="text-black">{year}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <ChevronRight className="rotate-90" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className={labelClasses}>HOW MANY RECS? ({prefs.count})</label>
          <div className="flex items-center gap-6 bg-white border-4 border-black p-4 brutal-shadow-sm h-full">
            <span className="font-masala text-2xl w-8 text-center shrink-0">1</span>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={prefs.count}
              onChange={(e) => onUpdate({ count: parseInt(e.target.value) })}
              className="flex-1 h-3 bg-neutral-200 appearance-none cursor-pointer accent-[#FF007F] border-2 border-black"
            />
            <span className="font-masala text-2xl w-8 text-center shrink-0">10</span>
          </div>
        </div>
      </div>

      <div className="pt-12">
        <button
          onClick={onSubmit}
          disabled={isLoading || prefs.languages.length === 0}
          className={cn(
            "w-full py-10 bg-[#FF007F] text-white font-masala text-5xl uppercase tracking-tighter transition-all border-8 border-black shadow-[12px_12px_0px_0px_#000]",
            "disabled:opacity-50 disabled:grayscale hover:bg-[#FF1493] active:translate-x-2 active:translate-y-2 active:shadow-none flex items-center justify-center gap-8"
          )}
        >
          {isLoading ? "MASALA MIXING..." : "ACTION DHAMAKA!"}
          {!isLoading && <ChevronRight className="w-12 h-12" />}
        </button>
      </div>
    </div>
  );
}
