import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string | { country?: string; city?: string };
  phone?: string;
  avatar?: string;
  niche?: string[];
  contentType?: string[];
  languages?: string[];
  experience?: string;
  socialMedia?: {
    instagram?: { username?: string; followers?: number; verified?: boolean };
    youtube?: { channelName?: string; subscribers?: number; verified?: boolean };
    tiktok?: { username?: string; followers?: number; verified?: boolean };
    twitter?: { username?: string; followers?: number; verified?: boolean };
    [key: string]: any;
  };
  targetAudience?: {
    ageRange?: string;
    gender?: string;
    interests?: string[];
  };
  collaborationPreference?: string;
  rateCard?: {
    currency?: string;
    instagramPost?: number;
    instagramStory?: number;
    instagramReel?: number;
    youtubeVideo?: number;
    tiktokVideo?: number;
  };
  preferences?: {
    emailNotifications?: boolean;
    brandMatchAlerts?: boolean;
    trendAlerts?: boolean;
  };
  isPremium?: boolean;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
