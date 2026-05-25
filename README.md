# Client Accountability Dashboard

Next.js website — clients ki monthly service accountability track karein.

## Features
- **Dashboard** — 6-month trend chart, monthly stats, recent entries
- **Clients** — add/edit/delete clients with package, WhatsApp, status
- **Log Entry** — har month client ki services log karein (Static Post, Reel, Carousel, etc.)
- **Monthly Report** — client-wise breakdown table
- **Export Excel** — CSV download jo Excel mein seedha open hota hai

## Setup (5 minutes)

### 1. Install karein
```bash
cd client-accountability-app
npm install
```

### 2. Run karein (development)
```bash
npm run dev
```
Browser mein open karein: **http://localhost:3000**

### 3. Build for production
```bash
npm run build
npm start
```

## Deploy karna chahte hain? (Free)

### Vercel (Recommended — easiest)
1. [vercel.com](https://vercel.com) pe account banayein (free)
2. GitHub pe is folder ko push karein
3. Vercel mein "New Project" → GitHub repo select karein
4. Deploy ho jayega — live URL milega

### Netlify
```bash
npm run build
# netlify.com pe drag-and-drop karein `.next` folder
```

## Data Storage
- Sab data browser ke **localStorage** mein save hota hai
- Same device/browser pe data remain karega
- Production mein database (Supabase/Firebase) add ki ja sakti hai — contact karein

## Services tracked
- Static Post
- Reel / Video  
- Carousel
- Story Design
- Caption Writing
- Ad Creative
- Feedback / Edit

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage (data persistence)
