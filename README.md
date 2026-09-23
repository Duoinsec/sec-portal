# SEC AI Assistant & College Portal
## AI-Powered College Assistant Chatbot using NLP with Multimodal Visual Reasoning

**Institution**: Sengunthar Engineering College (Autonomous), Tiruchengode  
**Affiliation**: Anna University, Chennai | NAAC 'A' Grade  
**Established**: 2001  
**Motto**: Education · Edification · Elevation  

---

## 📌 Project Overview
The **SEC AI Assistant & College Portal** is an institutional-grade, multimodal intelligent platform designed for students, faculty, and administrative staff at Sengunthar Engineering College.

### Key Capabilities:
- 🤖 **AI-Powered Academic Assistant**: Fast conversational reasoning powered by **Groq LPU hardware inference** and Meta's **Llama 3.1 70B** model.
- 📊 **Multimodal Visual Reasoning**: Intelligently determines whether a student query warrants text-only, an educational diagram, or a full system architecture flowchart.
- 🛡️ **Role-Based Access Control (RBAC)**: Secure isolation between `STUDENT`, `STAFF`, and `ADMIN` portals backed by PostgreSQL **Row Level Security (RLS)** in Supabase.
- 📈 **Academic Management**: Live attendance tracking, internal test & model exam mark records, CGPA computation, leave/OD approvals, and timetable schedules.
- ⚡ **Security & Rate-Limiting**: In-memory token bucket rate limiter (40 req/min/IP) and XSS sanitization.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 13 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Serverless API Route Handlers
- **AI / LLM Engine**: Groq Cloud SDK (`llama-3.1-70b-versatile`)
- **Database & Storage**: PostgreSQL 15, Supabase Cloud Database & Storage
- **Authentication**: Supabase Auth (JWT Bearer tokens)
- **Language**: TypeScript 5.0+

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.17.0 or higher)
- npm or yarn

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Installation & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ Default Credentials (Demo)
- **Student**: `23ad001@sec.edu.in` | `student123`
- **Staff**: `shanthipriya@sec.edu.in` | `staff123`
- **Admin**: `sathishkumar@sec.edu.in` | `admin123`

---

## 📄 License
Academic Project — Sengunthar Engineering College.
