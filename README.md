# CampusBoard — Campus Info Display System

Sistem informasi digital kampus berbasis Next.js yang menampilkan jadwal kegiatan, pengumuman berjalan, dan konten multimedia secara real-time di layar Smart TV atau PC. Dikelola melalui dashboard admin berbasis web.

---

## Tech Stack

| Layer        | Teknologi                                 |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 16 (App Router)                   |
| Language     | TypeScript                                |
| Database     | SQLite via Prisma v5                      |
| Auth         | NextAuth.js v4 (Credentials)              |
| Styling      | Tailwind CSS v4                           |
| Validation   | Zod v4                                    |
| Date         | date-fns                                  |
| External API | Open-Meteo (cuaca, gratis, tanpa API key) |

---

## Fitur

**Layar Display (TV/Fullscreen)**

- Jam digital real-time (WIB/WITA/WIT)
- Informasi cuaca live via Open-Meteo
- Daftar jadwal kegiatan hari ini dengan status BERLANGSUNG
- Countdown ke event berikutnya
- Slideshow gambar dengan musik latar (mode gambar)
- Putar video YouTube / video lokal otomatis (mode video)
- Running text pengumuman animasi marquee
- 5 logo kampus (1 utama + 4 logo kecil)

**Dashboard Admin**

- Login aman dengan session JWT
- CRUD kegiatan (judul, waktu mulai/selesai, lantai, ruang, pelaksana)
- CRUD media (YouTube, file lokal, URL eksternal, opsi contain/cover)
- CRUD pengumuman
- Upload file gambar, video, dan audio
- Pengaturan (nama kampus, kota cuaca, logo, URL musik latar, video default)
- Dark mode / light mode

---

## Layout Layar (1920×1080)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [LOGO]  NAMA KAMPUS                     [HH:MM:SS]   [☁ CUACA]     │
├───────────────────────────┬──────────────────────────────────────────┤
│                           │                                          │
│  JADWAL KEGIATAN HARI INI │        VIDEO / SLIDESHOW GAMBAR          │
│  ──────────────────────── │        (YouTube / img crossfade)         │
│  🕐 08:00 WITA s/d Selesai│                                          │
│     Lantai 2 • R. 201     │                                          │
│     ● BERLANGSUNG         │  ┌────────────────────────────────────┐  │
│                           │  │  ⏱ EVENT BERIKUTNYA                │  │
│  🕑 13:00 WITA s/d Selesai│  │  Seminar AI                        │  │
│     Lantai 1 • Aula Utama │  │  dimulai dalam  02:30:45           │  │
│                           │  └────────────────────────────────────┘  │
│  [logo 1] [2] [3] [4]     │                                          │
├───────────────────────────┴──────────────────────────────────────────┤
│  >>> Pengumuman running text scrolling ke kiri...                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Struktur Proyek

```
newdss/
├── app/
│   ├── page.tsx                    # Display screen utama
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx              # Sidebar + dark mode
│   │   └── (dashboard)/
│   │       ├── page.tsx            # Dashboard ringkasan
│   │       ├── events/page.tsx
│   │       ├── media/page.tsx
│   │       ├── announcements/page.tsx
│   │       └── settings/page.tsx
│   └── api/
│       ├── display/route.ts        # Satu endpoint untuk semua data display
│       ├── events/[id]/route.ts
│       ├── media/[id]/route.ts
│       ├── announcements/[id]/route.ts
│       ├── settings/route.ts
│       ├── weather/route.ts
│       └── upload/route.ts
├── components/
│   ├── display/
│   │   ├── Clock.tsx
│   │   ├── Weather.tsx
│   │   ├── EventList.tsx
│   │   ├── MediaSlideshow.tsx      # Mode gambar + mode video
│   │   └── Marquee.tsx
│   └── admin/
│       └── AdminLayout.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.cjs
│   └── dev.db
└── public/
    ├── uploads/                    # File yang diupload admin
    └── logos/
```

---

## API Endpoints

| Method     | Path                      | Auth    | Deskripsi                    |
| ---------- | ------------------------- | ------- | ---------------------------- |
| GET        | `/api/display`            | —       | Semua data display sekaligus |
| GET/POST   | `/api/events`             | POST: ✓ | Daftar & buat kegiatan       |
| PUT/DELETE | `/api/events/[id]`        | ✓       | Edit & hapus kegiatan        |
| GET/POST   | `/api/media`              | POST: ✓ | Daftar & buat media          |
| PUT/DELETE | `/api/media/[id]`         | ✓       | Edit & hapus media           |
| GET/POST   | `/api/announcements`      | POST: ✓ | Daftar & buat pengumuman     |
| PUT/DELETE | `/api/announcements/[id]` | ✓       | Edit & hapus pengumuman      |
| GET/PUT    | `/api/settings`           | PUT: ✓  | Baca & simpan pengaturan     |
| GET        | `/api/weather`            | —       | Proxy ke Open-Meteo          |
| POST       | `/api/upload`             | ✓       | Upload gambar/video/audio    |

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  name      String?
  createdAt DateTime @default(now())
}

model Event {
  id          String    @id @default(cuid())
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime? // null = "s/d Selesai"
  floor       Int       @default(1)
  room        String?
  organizer   String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Media {
  id           String   @id @default(cuid())
  type         String   @default("YOUTUBE") // YOUTUBE | LOCAL | EXTERNAL
  url          String
  title        String?
  displayOrder Int      @default(0)
  duration     Int      @default(10)        // detik, untuk gambar
  isActive     Boolean  @default(true)
  objectFit    String   @default("contain") // contain | cover
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Announcement {
  id        String   @id @default(cuid())
  text      String
  isActive  Boolean  @default(true)
  priority  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @default(now()) @updatedAt
}
```

**Setting Keys:**

| Key                 | Default                | Deskripsi                             |
| ------------------- | ---------------------- | ------------------------------------- |
| `campus_name`       | `Universitas Contoh`   | Nama kampus di header                 |
| `weather_city`      | `Jakarta`              | Kota untuk data cuaca                 |
| `weather_lat`       | `-6.2088`              | Latitude kota                         |
| `weather_lon`       | `106.8456`             | Longitude kota                        |
| `logo_main`         | `/logos/logo-main.png` | Logo utama                            |
| `logo_1` ~ `logo_4` | `/logos/logo-n.png`    | Logo kecil (4 buah)                   |
| `marquee_speed`     | `40`                   | Kecepatan animasi marquee (detik)     |
| `default_media_url` | _(YouTube URL)_        | Video loop jika tidak ada media       |
| `bg_music_url`      | _(kosong)_             | URL audio untuk mode slideshow gambar |

---

## Instalasi & Menjalankan

### Prasyarat

- Node.js 18+
- npm / yarn

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Salin environment file
cp .env.example .env
# Edit .env: isi NEXTAUTH_SECRET

# 3. Jalankan migrasi database
npx prisma migrate dev

# 4. Seed data awal (admin + sample data)
node prisma/seed.cjs

# 5. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk layar display.
Buka [http://localhost:3000/admin](http://localhost:3000/admin) untuk dashboard admin.

**Login default:** `admin` / `admin123`

### Build Production

```bash
npm run build
npm start
```

---

## Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="ganti-dengan-string-acak-yang-panjang"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Color Scheme

```css
/* Ocean Blue (background & panel) */
--ocean-950: #03045e;
--ocean-900: #023e8a;
--ocean-800: #0077b6;
--ocean-700: #0096c7;
--ocean-600: #00b4d8;
--ocean-400: #90e0ef;

/* Crimson (accent & highlight) */
--crimson-800: #8b0000;
--crimson-600: #c1121f;
--crimson-500: #e63946;
```

---

## Security

- Password di-hash dengan bcrypt (rounds: 12)
- Session auth via NextAuth JWT
- Semua API write-route dilindungi `getServerSession`
- Validasi input dengan Zod di semua endpoint
- Upload file: whitelist MIME type (gambar/video/audio saja)
- API key tidak ada di client-side code
- `NEXTAUTH_SECRET` disimpan di environment variable
