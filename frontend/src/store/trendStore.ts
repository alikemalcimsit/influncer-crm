import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Trend {
  _id: string;
  keyword: string;
  platform: string;
  searchVolume: number;
  growthRate: number;
  category: string;
  updatedAt: string;
}

interface TrendState {
  trends: Trend[];
  filteredTrends: Trend[];
  selectedPlatform: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTrends: (trends: Trend[]) => void;
  addTrend: (trend: Trend) => void;
  updateTrend: (id: string, trend: Partial<Trend>) => void;
  deleteTrend: (id: string) => void;
  filterByPlatform: (platform: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearTrends: () => void;
}

export const useTrendStore = create<TrendState>()(
  persist(
    (set) => ({
      trends: [],
      filteredTrends: [],
      selectedPlatform: 'all',
      isLoading: false,
      error: null,

      setTrends: (trends) => 
        set({ 
          trends, 
          filteredTrends: trends,
          error: null 
        }),
      
      addTrend: (trend) =>
        set((state) => {
          const newTrends = [trend, ...state.trends];
          return {
            trends: newTrends,
            filteredTrends: state.selectedPlatform === 'all' 
              ? newTrends 
              : newTrends.filter(t => t.platform.toLowerCase() === state.selectedPlatform),
            error: null,
          };
        }),
      
      updateTrend: (id, updatedTrend) =>
        set((state) => {
          const newTrends = state.trends.map((trend) =>
            trend._id === id ? { ...trend, ...updatedTrend } : trend
          );
          return {
            trends: newTrends,
            filteredTrends: state.selectedPlatform === 'all'
              ? newTrends
              : newTrends.filter(t => t.platform.toLowerCase() === state.selectedPlatform),
            error: null,
          };
        }),
      
      deleteTrend: (id) =>
        set((state) => {
          const newTrends = state.trends.filter((trend) => trend._id !== id);
          return {
            trends: newTrends,
            filteredTrends: state.selectedPlatform === 'all'
              ? newTrends
              : newTrends.filter(t => t.platform.toLowerCase() === state.selectedPlatform),
            error: null,
          };
        }),
      
      filterByPlatform: (platform) =>
        set((state) => ({
          selectedPlatform: platform,
          filteredTrends: platform === 'all'
            ? state.trends
            : state.trends.filter(t => t.platform.toLowerCase() === platform),
        })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearTrends: () => 
        set({ 
          trends: [], 
          filteredTrends: [], 
          selectedPlatform: 'all',
          error: null 
        }),
    }),
    {
      name: 'trend-storage',
    }
  )
);
