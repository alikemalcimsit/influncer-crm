# Influencer CRM - AI-Powered Content Creation & Management Platform

> 🚀 **Yenilikçi, Kapsamlı ve Satılabilir bir Startup Projesi**

Modern influencer'lar ve içerik üreticiler için yapay zeka destekli, all-in-one yönetim platformu. ChatGPT ve Grok AI ile entegre, içerik üretiminden monetization'a kadar her şey tek platformda.

## 🌟 Neden Bu Proje Farklı?

### Piyasada Olmayan/Az Bulunan Özellikler:

1. **🎥 AI Video Generation** - Script'ten otomatik video üretimi
2. **🔮 Predictive Analytics** - ML bazlı büyüme ve gelir tahminleme
3. **🤝 Brand Matching Engine** - AI ile otomatik marka eşleştirme
4. **💬 Unified Engagement Hub** - Tüm platformlardan tek yerden yönetim
5. **📊 Viral Probability Calculator** - İçeriğin viral olma şansını hesaplama
6. **🕵️ Competitor Intelligence** - Otomatik rakip analizi ve benchmarking
7. **📅 Smart Content Calendar** - AI önerili optimal zamanlama
8. **👥 Collaboration Network** - Influencer'lar arası işbirliği marketplace

## 💎 Abonelik Planları (SaaS Model)

| Özellik | Free | Pro ($29/ay) | Enterprise ($99/ay) |
|---------|------|-------------|---------------------|
| AI İçerik Üretimi | 10/ay | 100/ay | Sınırsız |
| AI Video Üretimi | ❌ | 20/ay | Sınırsız |
| Sosyal Medya Hesapları | 2 | 10 | Sınırsız |
| Zamanlanmış Gönderi | 5 | 100 | Sınırsız |
| Brand Matching | ❌ | ✅ | ✅ |
| Gelişmiş Analitik | ❌ | ✅ | ✅ |
| White-Label | ❌ | ❌ | ✅ |
| API Erişimi | ❌ | ✅ | ✅ |
| Öncelikli Destek | ❌ | ❌ | ✅ |

**Yıllık Ödemede %20 İndirim!**

## 🚀 Özellikler

### 🤖 AI Entegrasyonları
- **ChatGPT API**: Influencer analizi, video fikirleri, senaryo yazımı, caption üretimi
- **Grok API**: Gerçek zamanlı trend analizi, TikTok video önerileri, rakip analizi

### 📊 Ana Modüller
1. **Influencer Profil Yönetimi**
   - Sosyal medya hesaplarını bağlama (TikTok, Instagram, YouTube, Twitter)
   - Kişilik analizi ve içerik stili belirleme
   - Niche ve hedef kitle tanımlama

2. **İçerik Üretim Sistemi**
   - AI destekli video fikirleri
   - Otomatik senaryo yazımı
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
