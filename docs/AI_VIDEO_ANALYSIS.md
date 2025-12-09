# AI Video Analysis System

## Nasıl Çalışır?

### 1. Veri Toplama Katmanı

#### YouTube Analysis
- **YouTube Data API v3** ile channel bilgileri çekiliyor
- Son 30-50 video'nun metadata'sı alınıyor:
  - Video başlıkları
  - Açıklamalar (descriptions)
  - Tags
  - View, like, comment sayıları
  - Video süreleri
  - Yayınlanma tarihleri

#### Instagram Analysis  
- Instagram Graph API veya scraping
- Post captions
- Hashtag stratejisi
- Engagement metrikleri

#### TikTok Analysis
- TikTok API
- Trending sounds
- Video descriptions
- Hashtag usage

### 2. İçerik Analiz Katmanı

#### Pattern Detection
```javascript
// Başlık Stili Analizi
- Soru mu kullanıyor? ("How to...", "Why does...")
- Sayılar var mı? ("5 Tips", "Top 10")
- Ünlem işareti kullanımı (Enerji seviyesi)
- BÜYÜK HARF kullanımı (Clickbait indicator)
- Parantez/bracket kullanımı [Kategorizasyon]
- Ortalama başlık uzunluğu

// Dil & Ton Analizi
- Formal vs Casual kelime kullanımı
- First-person ("I", "We") vs Third-person
- CTA (Call-to-action) frekansı
- Emoji kullanımı (Sıklık ve tip)

// Hashtag Stratejisi
- Ortalama hashtag sayısı
- Unique vs Repeated hashtags
- Niche-specific vs Generic

// İçerik Uzunluğu
- Shorts (<1 min) vs Long-form (>10 min)
- Ortalama video süresi
- İzleyici retention pattern'i
```

### 3. AI Analiz Katmanı

#### ChatGPT/Gemini Integration
Toplanan verilerden AI'ya gönderilen prompt:

```
Influencer Data:
- 50 video başlığı
- 10 video açıklaması  
- Emoji/hashtag pattern'leri
- Engagement metrikleri
- Posting frequency

AI Çıkarımları:
✓ Content Style (Educational/Entertainment/Lifestyle)
✓ Tone of Voice (Professional/Casual/Energetic)
✓ Personality Traits (Creative, Analytical, Expressive)
✓ Audience Type (Mass market/Niche)
✓ Strengths & Weaknesses
```

### 4. Kişiselleştirilmiş Öneri Motoru

#### Video Fikri Üretimi
1. **Trend-Based Ideas**: Güncel trendlere göre
2. **Personality-Based**: Kişiliğe uygun fikirler  
3. **Niche-Specific**: İçerik niş'ine özel
4. **Viral Potential Scoring**: Her fikre viral skor

```javascript
Idea Generation Formula:
- Current Trends (30%)
- Personality Match (40%)
- Historical Performance (20%)
- Market Gaps (10%)
= Personalized Video Idea + Viral Score
```

### 5. Sürekli Öğrenme

Her yeni video için:
- Performance tracking
- AI model'i güncelleme
- Pattern evolution
- Daha iyi öneriler

## Teknik Stack

```
YouTube API → Pattern Analyzer → AI (ChatGPT/Gemini) → Personality Profile
     ↓              ↓                    ↓                      ↓
 Video Data    Title/Desc           Tone/Style          Video Ideas
                Analysis            Detection           Generation
```

## Gerçek Implementasyon

✅ YouTube API integration
✅ Pattern detection algorithms  
✅ AI content analyzer service
🔄 ChatGPT/Gemini prompt engineering
🔄 Video transcription (Whisper API)
⏳ Instagram/TikTok integration

