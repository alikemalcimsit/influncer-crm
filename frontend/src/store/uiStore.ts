import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Analytics {
  totalFollowers: number;
  engagementRate: number;
  avgReach: number;
  growthRate: number;
  lastUpdated: string;
}

interface Revenue {
  totalEarnings: number;
  monthlyRevenue: number;
  activeDealsBrands: number;
  pendingPayments: number;
  lastUpdated: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface UIState {
  // Analytics
  analytics: Analytics | null;
  
  // Revenue
  revenue: Revenue | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI States
  sidebarOpen: boolean;
  darkMode: boolean;
  
  // Actions - Analytics
  setAnalytics: (analytics: Analytics) => void;
  updateAnalytics: (analytics: Partial<Analytics>) => void;
  
  // Actions - Revenue
  setRevenue: (revenue: Revenue) => void;
  updateRevenue: (revenue: Partial<Revenue>) => void;
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      analytics: null,
      revenue: null,
      notifications: [],
      unreadCount: 0,
      sidebarOpen: true,
      darkMode: false,

      // Analytics Actions
      setAnalytics: (analytics) => set({ analytics }),
      
      updateAnalytics: (analytics) =>
        set((state) => ({
          analytics: state.analytics ? { ...state.analytics, ...analytics } : null,
        })),

      // Revenue Actions
      setRevenue: (revenue) => set({ revenue }),
      
      updateRevenue: (revenue) =>
        set((state) => ({
          revenue: state.revenue ? { ...state.revenue, ...revenue } : null,
        })),

      // Notification Actions
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        }),
      
      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;
          
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      
      deleteNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        }),
      
      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),
      
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),
      
      setDarkMode: (darkMode) =>
        set({ darkMode }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
