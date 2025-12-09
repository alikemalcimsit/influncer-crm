# 🗄️ Zustand State Management Documentation

## Overview

Bu proje, modern ve performanslı state management için **Zustand** kullanmaktadır. Zustand, Redux'a alternatif olarak minimal API ve güçlü özellikler sunar.

## 📦 Kurulu Store'lar

### 1. **AuthStore** - Kullanıcı Kimlik Doğrulama
```typescript
import { useAuthStore } from '@/store';

const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
```

**Özellikler:**
- Kullanıcı bilgilerini yönetme
- Token saklama ve yönetimi
- Login/Logout işlemleri
- LocalStorage ile persist

**Kullanım Örneği:**
```typescript
// Login
const handleLogin = async () => {
  const response = await authService.login(email, password);
  login(response.user, response.token);
};

// Logout
const handleLogout = () => {
  logout();
  router.push('/login');
};

// User update
updateUser({ ...user, name: 'New Name' });
```

---

### 2. **ContentStore** - İçerik Yönetimi
```typescript
import { useContentStore } from '@/store';

const { 
  contents, 
  selectedContent, 
  isLoading,
  setContents,
  addContent,
  updateContent,
  deleteContent 
} = useContentStore();
```

**Özellikler:**
- Tüm içerikleri saklama
- Seçili içerik yönetimi
- CRUD operasyonları
- Loading ve error state'leri

**Kullanım Örneği:**
```typescript
// İçerikleri yükle
const fetchContents = async () => {
  setLoading(true);
  try {
    const data = await contentService.getContents();
    setContents(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Yeni içerik ekle
const handleCreate = async (formData) => {
  const newContent = await contentService.createContent(formData);
  addContent(newContent);
};

// İçerik güncelle
updateContent(contentId, { status: 'published' });

// İçerik sil
deleteContent(contentId);
```

---

### 3. **TrendStore** - Trend Analizi
```typescript
import { useTrendStore } from '@/store';

const {
  trends,
  filteredTrends,
  selectedPlatform,
  setTrends,
  filterByPlatform
} = useTrendStore();
```

**Özellikler:**
- Trend verilerini saklama
- Platform bazlı filtreleme
- Otomatik filtered trends hesaplama
- Trend CRUD operasyonları

**Kullanım Örneği:**
```typescript
// Trendleri yükle
const fetchTrends = async () => {
  const data = await trendService.getTrends();
  setTrends(data);
};

// Platform filtreleme
filterByPlatform('instagram'); // Sadece Instagram trendleri
filterByPlatform('all'); // Tüm platformlar

// Yeni trend ekle
addTrend({
  _id: '123',
  keyword: 'AI',
  platform: 'TikTok',
  searchVolume: 50000,
  growthRate: 25.5,
  category: 'tech',
  updatedAt: new Date().toISOString()
});
```

---

### 4. **UIStore** - Kullanıcı Arayüzü Durumu
```typescript
import { useUIStore } from '@/store';

const {
  analytics,
  revenue,
  notifications,
  unreadCount,
  sidebarOpen,
  darkMode,
  addNotification,
  toggleDarkMode
} = useUIStore();
```

**Özellikler:**
- Analytics verileri
- Revenue (gelir) bilgileri
- Bildirim sistemi
- Dark mode
- Sidebar durumu

**Kullanım Örneği:**
```typescript
// Analytics güncelle
setAnalytics({
  totalFollowers: 12500,
  engagementRate: 4.8,
  avgReach: 8200,
  growthRate: 15.3,
  lastUpdated: new Date().toISOString()
});

// Bildirim ekle
addNotification({
  type: 'success',
  title: 'New Collaboration',
  message: 'Brand X wants to collaborate!'
});

// Bildirimleri yönet
markAsRead(notificationId);
markAllAsRead();
deleteNotification(notificationId);

// UI durumu
toggleSidebar();
toggleDarkMode();
```

---

### 5. **CollaborationStore** - İşbirliği Yönetimi
```typescript
import { useCollaborationStore } from '@/store';

const {
  collaborations,
  brandMatches,
  selectedCollaboration,
  addCollaboration,
  updateCollaboration,
  setBrandMatches
} = useCollaborationStore();
```

**Özellikler:**
- İşbirliği takibi
- Brand matching
- Status yönetimi (pending, accepted, completed)
- Seçili işbirliği detayları

**Kullanım Örneği:**
```typescript
// Yeni işbirliği
addCollaboration({
  id: '123',
  brandName: 'Brand X',
  status: 'pending',
  amount: 5000,
  platform: 'Instagram',
  contentType: 'Reel',
  deadline: '2025-01-15',
  description: 'Product review video',
  createdAt: new Date().toISOString()
});

// Status güncelle
updateCollaboration('123', { status: 'accepted' });

// Brand matches
setBrandMatches([
  {
    id: '1',
    brandName: 'Nike',
    niche: ['fitness', 'sports'],
    matchScore: 95,
    followers: 1000000,
    engagementRate: 5.2
  }
]);
```

---

## 🎯 Store Özellikleri

### Persist (Kalıcılık)
Tüm store'lar LocalStorage ile persist edilir:
```typescript
persist(
  (set) => ({ /* state */ }),
  { name: 'store-name' }
)
```

### Type Safety
TypeScript ile tam tip güvenliği:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  // ... daha fazla
}
```

### Middleware Desteği
- `persist`: LocalStorage entegrasyonu
- Kendi middleware'inizi ekleyebilirsiniz

---

## 📚 Best Practices

### 1. Store'ları Bileşenlerde Kullanma
```typescript
// ✅ Doğru: Sadece ihtiyacınız olanları seçin
const { user, login } = useAuthStore();

// ❌ Yanlış: Tüm store'u almayın
const authStore = useAuthStore();
```

### 2. Actions ile State Güncelleme
```typescript
// ✅ Doğru: Store action'ını kullanın
addContent(newContent);

// ❌ Yanlış: State'i doğrudan değiştirmeyin
contents.push(newContent); // Bu çalışmaz!
```

### 3. Async İşlemler
```typescript
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Selector Pattern
```typescript
// Sadece gerekli state'i seç
const userName = useAuthStore((state) => state.user?.name);
const isLoading = useContentStore((state) => state.isLoading);
```

---

## 🔄 Store İletişimi

Store'lar arası veri paylaşımı:

```typescript
// AuthStore'dan user bilgisi al
const { user } = useAuthStore();

// ContentStore'da kullan
const createContent = async (data) => {
  const content = {
    ...data,
    userId: user.id,
    userName: user.name
  };
  addContent(content);
};
```

---

## 🚀 Performance Tips

### 1. Shallow Comparison
```typescript
import { shallow } from 'zustand/shallow';

const { name, email } = useAuthStore(
  (state) => ({ name: state.user?.name, email: state.user?.email }),
  shallow
);
```

### 2. Computed Values
```typescript
// Store içinde computed değerler
const filteredTrends = selectedPlatform === 'all'
  ? trends
  : trends.filter(t => t.platform === selectedPlatform);
```

### 3. Memoization
```typescript
import { useMemo } from 'react';

const sortedContents = useMemo(() => {
  return contents.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}, [contents]);
```

---

## 📖 Migration Guide

### Redux'tan Zustand'a Geçiş

**Redux:**
```typescript
// Actions
dispatch({ type: 'ADD_CONTENT', payload: content });

// Selectors
const contents = useSelector(state => state.contents);
```

**Zustand:**
```typescript
// Direkt action çağırma
addContent(content);

// Direkt state erişimi
const { contents } = useContentStore();
```

---

## 🎨 DevTools

Zustand DevTools kullanımı:
```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({ /* state */ }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);
```

---

## 📊 Store Yapısı Özeti

```
frontend/src/store/
├── index.ts                 # Tüm store'ları export eder
├── authStore.ts            # Kimlik doğrulama
├── contentStore.ts         # İçerik yönetimi
├── trendStore.ts           # Trend analizi
├── uiStore.ts              # UI durumu
└── collaborationStore.ts   # İşbirliği yönetimi
```

---

## 🔗 Kaynaklar

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Persisting Store Data](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

---

## 💡 Örnekler

Daha fazla örnek için `src/pages/dashboard/` klasöründeki bileşenlere bakın:
- `content.tsx` - ContentStore kullanımı
- `trends.tsx` - TrendStore kullanımı
- `profile.tsx` - AuthStore kullanımı
