export type Mood = 'Happy' | 'Sad' | 'Adventurous' | 'Romantic' | 'Scared' | 'Chill' | 'Custom';

export type ContentType = 'movie' | 'series';

export interface UserPreferences {
  ageRange: string;
  languages: string[];
  genres: string[];
  mood: Mood;
  customMoodDescription: string;
  type: ContentType;
  length: string;
  multipleParts: boolean;
  count: number;
  yearRange: string;
}

export interface Recommendation {
  name: string;
  ott: string;
  reason: string;
  tagline: string;
  image_keywords: string;
  socialHype?: string; // e.g. "Viral edits on TikTok", "Aesthetic Pinterest boards"
  trendingTheme?: string; 
}

export interface SocialVibe {
  name: string;
  tag: string;
  url: string;
  image_keywords: string;
  description: string;
  platform: 'youtube' | 'blog' | 'tiktok' | 'instagram';
  videoId?: string; // For YouTube thumbnails
  reason?: string;
}

export interface Meme {
  title: string;
  subtitle: string;
  image_keywords: string;
  color: string;
}

export const MOOD_CONFIGS: Record<Mood, { color: string; message: string; icon: string; border: string; contrast: string }> = {
  Happy: {
    color: 'bg-[#FFFF00]', // Electric Yellow
    border: 'border-[#000000]',
    contrast: 'text-black',
    message: 'NAACH GAANA TIME!',
    icon: 'PartyPopper',
  },
  Sad: {
    color: 'bg-[#FF007F]', // Neon Pink
    border: 'border-[#000000]',
    contrast: 'text-white',
    message: 'DIL TOOT GAYA? NO PROB.',
    icon: 'HeartCrack',
  },
  Adventurous: {
    color: 'bg-[#00FF00]', // Neon Green
    border: 'border-[#000000]',
    contrast: 'text-black',
    message: 'KHATRON KE KHILADI!',
    icon: 'Zap',
  },
  Romantic: {
    color: 'bg-[#FF1493]', // Deep Pink
    border: 'border-[#000000]',
    contrast: 'text-white',
    message: 'PYAR IS IN THE AIR!',
    icon: 'Flame',
  },
  Scared: {
    color: 'bg-[#9D00FF]', // Neon Purple
    border: 'border-[#000000]',
    contrast: 'text-white',
    message: 'DARNA MANA HAI!',
    icon: 'Skull',
  },
  Chill: {
    color: 'bg-[#00FFFF]', // Cyan
    border: 'border-[#000000]',
    contrast: 'text-black',
    message: 'KHAO, PIYO, MAST RAHO!',
    icon: 'IceCream',
  },
  Custom: {
    color: 'bg-[#FF9D00]', // Vibrant Orange
    border: 'border-[#000000]',
    contrast: 'text-black',
    message: 'YOUR EXCLUSIVE VIBE!',
    icon: 'Sparkles',
  },
};
