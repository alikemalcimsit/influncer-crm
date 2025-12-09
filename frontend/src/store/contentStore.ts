import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Content {
  _id: string;
  title: string;
  platform: string;
  status: string;
  publishDate: string;
  likes: number;
  comments: number;
  views: number;
  description?: string;
  scheduledDate?: string;
}

interface ContentState {
  contents: Content[];
  selectedContent: Content | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContents: (contents: Content[]) => void;
  addContent: (content: Content) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  selectContent: (content: Content | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearContents: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      contents: [],
      selectedContent: null,
      isLoading: false,
      error: null,

      setContents: (contents) => set({ contents, error: null }),
      
      addContent: (content) => 
        set((state) => ({ 
          contents: [content, ...state.contents],
          error: null 
        })),
      
      updateContent: (id, updatedContent) =>
        set((state) => ({
          contents: state.contents.map((content) =>
            content._id === id ? { ...content, ...updatedContent } : content
          ),
          error: null,
        })),
      
      deleteContent: (id) =>
        set((state) => ({
          contents: state.contents.filter((content) => content._id !== id),
          selectedContent: state.selectedContent?._id === id ? null : state.selectedContent,
          error: null,
        })),
      
      selectContent: (content) => set({ selectedContent: content }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearContents: () => set({ contents: [], selectedContent: null, error: null }),
    }),
    {
      name: 'content-storage',
    }
  )
);
