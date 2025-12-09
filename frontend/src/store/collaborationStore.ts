import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Collaboration {
  id: string;
  brandName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: number;
  platform: string;
  contentType: string;
  deadline: string;
  description: string;
  createdAt: string;
}

interface BrandMatch {
  id: string;
  brandName: string;
  niche: string[];
  matchScore: number;
  followers: number;
  engagementRate: number;
  logo?: string;
}

interface CollaborationState {
  collaborations: Collaboration[];
  brandMatches: BrandMatch[];
  selectedCollaboration: Collaboration | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCollaborations: (collaborations: Collaboration[]) => void;
  addCollaboration: (collaboration: Collaboration) => void;
  updateCollaboration: (id: string, collaboration: Partial<Collaboration>) => void;
  deleteCollaboration: (id: string) => void;
  selectCollaboration: (collaboration: Collaboration | null) => void;
  
  setBrandMatches: (matches: BrandMatch[]) => void;
  
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearCollaborations: () => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set) => ({
      collaborations: [],
      brandMatches: [],
      selectedCollaboration: null,
      isLoading: false,
      error: null,

      setCollaborations: (collaborations) => 
        set({ collaborations, error: null }),
      
      addCollaboration: (collaboration) =>
        set((state) => ({
          collaborations: [collaboration, ...state.collaborations],
          error: null,
        })),
      
      updateCollaboration: (id, updatedCollaboration) =>
        set((state) => ({
          collaborations: state.collaborations.map((collab) =>
            collab.id === id ? { ...collab, ...updatedCollaboration } : collab
          ),
          error: null,
        })),
      
      deleteCollaboration: (id) =>
        set((state) => ({
          collaborations: state.collaborations.filter((collab) => collab.id !== id),
          selectedCollaboration: state.selectedCollaboration?.id === id 
            ? null 
            : state.selectedCollaboration,
          error: null,
        })),
      
      selectCollaboration: (collaboration) => 
        set({ selectedCollaboration: collaboration }),
      
      setBrandMatches: (matches) => 
        set({ brandMatches: matches, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearCollaborations: () =>
        set({
          collaborations: [],
          brandMatches: [],
          selectedCollaboration: null,
          error: null,
        }),
    }),
    {
      name: 'collaboration-storage',
    }
  )
);
