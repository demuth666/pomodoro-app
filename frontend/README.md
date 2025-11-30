# Pomodoro Dashboard

Aplikasi dashboard produktivitas dengan tema gelap yang dirancang untuk membantu pengguna mengelola waktu dan tugas mereka menggunakan teknik Pomodoro.

## 🎨 Fitur

- ⏱️ **Timer Pomodoro**: Timer melingkar dengan indikator visual progres yang akurat
- 🎵 **Music Player**: Pemutar musik terintegrasi dengan kontrol playback lengkap
- ✅ **Task List**: Daftar tugas dengan checkbox interaktif dan fitur add task
- 📅 **Calendar**: Kalender dengan timeline untuk melihat jadwal dan event
- 📊 **Progress Report**: Laporan progres dengan heatmap visual yang menarik

## 🛠️ Teknologi

- **React 19** - Library UI modern
- **TypeScript** - Type safety
- **Vite** - Build tool yang cepat
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Instalasi

```bash
npm install
```

## 🚀 Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🏗️ Build untuk Production

```bash
npm run build
```

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar dengan 5 tabs
│   │   ├── Timer.tsx           # Timer Pomodoro melingkar dengan progress
│   │   ├── MusicPlayer.tsx     # Widget pemutar musik dengan controls
│   │   ├── TaskList.tsx        # Widget daftar tugas dengan checkbox
│   │   ├── Calendar.tsx        # Widget kalender dengan timeline
│   │   └── ProgressReport.tsx # Widget laporan progres dengan heatmap
│   ├── App.tsx                 # Komponen utama dengan layout
│   ├── main.tsx                # Entry point aplikasi
│   └── index.css               # Global styles dengan Tailwind
├── tailwind.config.js          # Konfigurasi Tailwind CSS
├── postcss.config.js           # Konfigurasi PostCSS
└── package.json
```

## 📱 Responsive Design

Aplikasi dirancang untuk bekerja dengan baik di:
- 📱 **Mobile** (320px+) - Single column layout
- 💻 **Tablet** (768px+) - Optimized grid layout
- 🖥️ **Desktop** (1024px+) - Two-column layout dengan sidebar

## 🎨 Warna Tema

- **Background**: `#0a0a0a` (dark-bg)
- **Card**: `#1a1a1a` (dark-card)
- **Gray**: `#2a2a2a` (dark-gray)
- **Accent Red**: `#ef4444` (pomodoro-red)
- **Accent Pink**: `#f87171` (pomodoro-pink)

## ✨ Fitur Komponen

### Timer
- Timer melingkar dengan tick marks
- Progress indicator dengan gradient pink/red
- Clock hand yang berputar sesuai progress
- Start/Pause/Reset functionality

### Music Player
- Progress bar untuk track
- Kontrol: Shuffle, Previous, Play/Pause, Next, Repeat
- Display artist dan song name

### Task List
- Checkbox interaktif
- Add task functionality
- Visual feedback untuk completed tasks

### Calendar
- Day/Date selection dengan active state
- Focus summary dengan statistics
- Timeline dengan event blocks

### Progress Report
- Heatmap grid dengan intensity colors
- Weekly view dengan day labels
- Hover effects untuk better UX

## 🚀 Quick Start

1. Clone atau download project
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Buka browser di `http://localhost:5173`

## 📝 License

MIT
