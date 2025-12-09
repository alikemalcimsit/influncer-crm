# 🚀 Influencer CRM - AI-Powered Command Center

> **Modern influencer'lar için tam otomatik içerik yönetim platformu**  
> AI ile kişiselleştirilmiş öneriler, otomatik yayınlama, multi-platform yönetim

## ✨ Sistem Özeti

**Tam kapsamlı influencer CRM'i**: İçerik üretiminden yayınlamaya, analitikten gelir takibine kadar her şey tek platformda. AI sistemi influencer'ı tanıyor, onun yerine düşünüyor ve optimal kararlar alıyor.

### 🎯 Ana Özellikler

#### 🤖 AI Sistemleri
- ✅ **Personality Analysis**: YouTube/Instagram/TikTok videolarından karakter analizi
- ✅ **Video Ideas**: Kişiselleştirilmiş, trend-based video fikirleri (viral skor ile)
- ✅ **Hashtag Recommendations**: 5 veri kaynağından AI destekli etiket önerileri
- ⏳ **Content Generator**: Script yazımı, thumbnail tasarımı, tam otomatik içerik

#### 📅 Otomatik Yayınlama
- ✅ **Scheduled Posting**: Zamanlanmış içerik yayınlama (YouTube, Instagram, TikTok, Twitter)
- ✅ **Multi-Platform**: Her platform için özelleştirilmiş ayarlar
- ✅ **Auto-Retry**: Hata durumunda otomatik tekrar deneme
- ✅ **Analytics Sync**: Yayından sonra otomatik performans takibi
- ⏳ **OAuth Integration**: Platform bağlantıları (YouTube, Instagram, TikTok, Twitter)

#### 📁 Media Library
- ✅ **Asset Management**: Video, resim yükleme ve organize etme
- ✅ **Folder System**: Klasör yapısı ile düzenli saklama
- ✅ **Usage Tracking**: Hangi medya nerede kullanıldı takibi
- ✅ **Bulk Operations**: Toplu yükleme, silme
- ⏳ **AI Analysis**: Görsel/video içerik analizi (object detection, sentiment)

#### 🤝 İş Geliştirme
- ✅ **Brand Matching**: AI ile marka eşleştirme ve başvuru sistemi
- ✅ **Competitor Analysis**: Rakip performans analizi, gap detection
- ✅ **Collaboration Hub**: Influencer işbirlikleri
- ✅ **Revenue Tracking**: Gelir takibi ve raporlama

#### 📊 Analytics & Insights
- ✅ **Content Performance**: Video/post performans analizi
- ✅ **Trend Tracking**: Güncel trendleri takip
- ✅ **Engagement Metrics**: Detaylı etkileşim metrikleri
- ⏳ **Predictive Analytics**: AI destekli büyüme tahminleri

---

## 🏗️ Sistem Mimarisi

```
Frontend (Next.js 16 + React 19 + TypeScript + Tailwind CSS)
    ↓
Backend (Node.js + Express + MongoDB)
    ↓
┌────────────┬────────────┬────────────┬────────────┐
│ Scheduling │   Media    │    AI      │ Platforms  │
│  Service   │  Service   │  Services  │  OAuth     │
└────────────┴────────────┴────────────┴────────────┘
    ↓             ↓            ↓            ↓
YouTube API  AWS S3      ChatGPT      YouTube OAuth
Instagram    Cloudinary  Gemini       Instagram API
TikTok API   FFmpeg      Grok API     TikTok API
Twitter API                           Twitter API
```

---

## 📦 Core Models

### ScheduledPost
Zamanlanmış içerik yönetimi. Multi-platform, retry logic, analytics tracking.

### MediaAsset  
Tüm media dosyaları. Folder organize, AI analysis, usage tracking.

### PlatformConnection
OAuth tokens, auto-refresh, platform-specific settings.

### User (50+ fields)
Comprehensive profile: niche, content types, platforms, preferences.

### Content, Trend, BrandMatch, Collaboration, Revenue...
Tüm iş modelleri tam entegre.

---

## 🚀 Kurulum

### 1. Environment Variables
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/influencer-crm
JWT_SECRET=your-secret-key
YOUTUBE_API_KEY=your-youtube-key
CHATGPT_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
```

### 2. Başlatma
```bash
# Backend
cd backend
npm install
npm run dev  # Scheduler otomatik başlar

# Frontend  
cd frontend
npm install
npm run dev
```

### 3. İlk Kullanıcı
```
http://localhost:3000/register
```

---

## 📋 API Endpoints (60+)

### Core
- `/api/auth` - Authentication
- `/api/content` - Content CRUD
- `/api/analytics` - Analytics
- `/api/trends` - Trends
- `/api/revenue` - Revenue

### AI
- `/api/ai/analyze-personality` - Personality profiling
- `/api/ai/video-ideas` - Video ideas
- `/api/ai/hashtags/recommend` - Hashtag recommendations

### Scheduling
- `/api/scheduling` - List/Create/Update scheduled posts
- `/api/scheduling/upcoming` - Upcoming posts
- `/api/scheduling/:id/publish-now` - Immediate publish

### Media
- `/api/media/upload` - Upload files
- `/api/media` - Media library
- `/api/media/folders` - Folder management

### Platforms
- `/api/platforms/:platform/connect` - OAuth connect
- `/api/platforms/:platform/disconnect` - Disconnect
- `/api/platforms/:platform/validate` - Token validation

---

## 🔄 Otomatik Yayınlama Workflow

```
1. User creates content
   └─> Uploads media
   └─> AI recommends hashtags
   └─> Selects platforms
   └─> Sets schedule

2. System saves to ScheduledPost
   └─> Status: 'scheduled'

3. Scheduler runs (every 1 min)
   └─> Finds ready posts
   └─> Validates tokens
   └─> Publishes to platforms

4. Post-publish
   └─> Stores platform post IDs
   └─> Updates analytics
   └─> Sends notification
```

---

## 🎯 Kullanım Senaryoları

### Manuel Zamanlı Yayın
```
1. Content oluştur
2. AI hashtag önerisi al
3. Platform seç, customize et
4. Tarih/saat belirle
5. Schedule → Sistem otomatik yayınlar
```

### Tam Otomatik AI İçerik (Planned)
```
1. AI video fikri üret
2. AI script yaz
3. AI thumbnail tasarla
4. AI optimal zaman belirle
5. Sistem her şeyi otomatik yapar
```

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Multer  
**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand  
**AI**: OpenAI ChatGPT, Google Gemini, Grok  
**APIs**: YouTube Data API v3, Instagram Graph, TikTok, Twitter  
**Storage**: AWS S3 / Cloudinary (planned)

---

## � Key Innovations

1. **AI Personalization**: Her influencer için unique AI profili
2. **Zero-Touch Publishing**: Tam otomatik workflow
3. **Cross-Platform Intelligence**: Tüm platformlardan öğrenme
4. **Predictive Analytics**: Gelecek performans tahmini

---

## 📈 Roadmap

### ✅ Completed
- Core authentication & user management
- Content management with AI hashtag recommendations
- Scheduled posting system
- Media library
- Platform connection framework
- AI personality analysis & video ideas
- Brand matching, competitor analysis, collaboration hub

### 🔄 In Progress
- Platform publishers (YouTube, Instagram, TikTok, Twitter)
- OAuth flows
- Frontend pages (Scheduling, Media, Platforms, Settings)

### ⏳ Planned
- Full AI content generator (script + thumbnail + voice-over)
- Real-time analytics dashboard
- Deep learning personalization
- Mobile app (React Native)
- A/B testing automation

---

## 📚 Documentation

- **Complete System**: `/docs/COMPLETE_SYSTEM.md` ← **Tüm detaylar burada**
- **AI Video Analysis**: `/docs/AI_VIDEO_ANALYSIS.md`
- **Business Plan**: `/docs/BUSINESS_PLAN.md`
- **Technical**: `/docs/TECHNICAL.md`

---

## 🐛 Known Issues

1. ❗ Convert new files from CommonJS to ES modules
2. ❗ Implement platform publishers
3. ❗ Setup OAuth flows
4. 🔧 Configure AWS S3 / Cloudinary
5. 🔧 Add ffmpeg for video processing
6. 💡 AI media analysis integration

---

## 💎 SaaS Pricing (Planned)
   - Platform spesifik caption üretimi
   - TikTok/Instagram Reels için kısa video önerileri

3. **Trend Takip Sistemi**
   - Platform bazlı trend analizi
   - Hashtag ve challenge takibi
   - Niche bazlı trend önerileri
   - Viral potansiyel tahminleme

4. **Gelir Yönetimi**
   - Sponsorluk gelir takibi
   - Reklam gelirleri
   - Affiliate kazançlar
   - İstatistiksel raporlama

5. **E-posta Yönetimi**
   - Marka iletişimi takibi
   - Otomatik e-posta organizasyonu

6. **Analitik Dashboard**
   - Performans metrikleri
   - Engagement analizi
   - Platform bazlı istatistikler

## 🛠️ Teknolojiler

### Backend
- **Node.js** & **Express.js** - API framework
- **MongoDB** & **Mongoose** - Veritabanı
- **JWT** - Authentication
- **OpenAI API** - ChatGPT entegrasyonu
- **Grok API** - X.AI entegrasyonu
- **bcryptjs** - Şifre hashleme
- **Helmet** & **Rate Limiting** - Security

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons
- **Recharts** - Data visualization

## 📦 Kurulum

### Gereksinimler
- Node.js (v18+)
- MongoDB (v6+)
- npm veya yarn

### Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle ve API anahtarlarını ekle
# - MongoDB connection string
# - JWT secret
# - OpenAI API key
# - Grok API key
# - Email credentials

# Development modda başlat
npm run dev

# Production modda başlat
npm start
```

### Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# .env.local dosyasını oluştur
cp .env.local.example .env.local

# Development server başlat
npm run dev

# Production build
npm run build
npm start
```

## 🔑 API Anahtarları

### OpenAI API Key
1. [OpenAI Platform](https://platform.openai.com/) hesabı oluşturun
2. API Keys bölümünden yeni bir key oluşturun
3. `.env` dosyasına ekleyin: `OPENAI_API_KEY=your-key`

### Grok API Key
1. [X.AI](https://x.ai/) platformuna kaydolun
2. API erişimi için başvurun
3. `.env` dosyasına ekleyin: `GROK_API_KEY=your-key`

### MongoDB
Yerel MongoDB kurulumu:
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/influencer-crm
```

Veya [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud) kullanın.

## 🎯 Kullanım

### 1. Kayıt Ol / Giriş Yap
- `/register` - Yeni hesap oluştur
- `/login` - Mevcut hesapla giriş yap

### 2. Profil Oluştur
- Sosyal medya hesaplarını ekle
- Niche ve hedef kitle belirle
- AI ile profil analizi yap

### 3. İçerik Üret
- **Video Fikirleri**: AI ile trend bazlı video önerileri
- **Senaryo Yazımı**: Detaylı video scriptleri
- **Caption Üretimi**: Platform spesifik başlıklar
- **TikTok Videoları**: Kısa form içerik önerileri

### 4. Trend Takibi
- Niche bazlı trend analizi
- Viral hashtag önerileri
- Rakip analizi

### 5. Gelir Takibi
- Sponsorluk gelirleri
- Platform bazlı gelir raporları
- Aylık/yıllık istatistikler

## 📁 Proje Yapısı

```
influncer-crm/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB modelleri
│   │   ├── routes/          # API route'ları
│   │   ├── services/        # AI servisleri (ChatGPT, Grok)
│   │   ├── middleware/      # Auth, validation
│   │   ├── utils/           # Helper fonksiyonlar
│   │   └── server.js        # Ana server dosyası
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React komponentleri
    │   ├── pages/          # Next.js sayfaları
    │   ├── services/       # API servisleri
    │   ├── store/          # Zustand state management
    │   ├── lib/            # Utilities
    │   └── styles/         # CSS dosyaları
    ├── public/
    ├── .env.local.example
    ├── .gitignore
    └── package.json
```

## 🔐 Güvenlik

- JWT based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- Helmet for security headers
- CORS configuration
- Input validation
- Environment variables for sensitive data

## 🚀 Deployment

### Backend (Render, Railway, DigitalOcean)
```bash
npm run build
npm start
```

### Frontend (Vercel, Netlify)
```bash
npm run build
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Kullanıcı bilgisi

### Influencer Profile
- `GET /api/influencers/profile` - Profil getir
- `POST /api/influencers/profile` - Profil oluştur/güncelle
- `POST /api/influencers/analyze` - AI analizi

### Content
- `GET /api/content` - İçerikleri listele
- `POST /api/content/generate/video-idea` - Video fikri üret
- `POST /api/content/generate/script` - Senaryo yaz
- `POST /api/content/generate/caption` - Caption üret
- `PUT /api/content/:id` - İçerik güncelle
- `DELETE /api/content/:id` - İçerik sil

### Trends
- `GET /api/trends` - Trendleri listele
- `POST /api/trends/analyze` - Trend analizi

### Revenue
- `GET /api/revenue` - Gelirleri listele
- `POST /api/revenue` - Gelir ekle
- `GET /api/revenue/stats` - İstatistikler
- `PUT /api/revenue/:id` - Gelir güncelle
- `DELETE /api/revenue/:id` - Gelir sil

### Analytics
- `GET /api/analytics/overview` - Genel bakış
- `GET /api/analytics/performance` - Performans

### Email
- `GET /api/email/inbox` - Gelen kutusu
- `POST /api/email/send` - E-posta gönder

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açın.

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

Ali Kemal

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Özellikler ve API'ler değişebilir.
