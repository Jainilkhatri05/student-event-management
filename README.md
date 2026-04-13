# 🎓 Student Event Management System

A modern, full-stack web application for managing college events. Built with **Next.js 14**, **Tailwind CSS**, and **SQLite** (Node.js built-in).

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![SQLite](https://img.shields.io/badge/DB-SQLite-blue)

## ✨ Features

- 📅 **Dashboard** — Beautiful event grid with glassmorphism cards, neon accents, and category filters
- ➕ **Create Events** — Premium form with an interactive date & time picker
- 👥 **Student Directory** — View and add students with department color-coding
- 📝 **Registrations** — Register students for events via a modal with live feedback
- 🗄️ **SQL Database** — Three relational tables: `Students`, `Events`, `Registrations`
- 🌙 **Dark Mode UI** — Glassmorphism design with neon purple/indigo/cyan accents

## 🗃️ Database Schema

```sql
Students      (student_id, name, email, department, created_at)
Events        (event_id, title, description, event_date, location, organizer_id, created_at)
Registrations (registration_id, student_id, event_id, registered_at)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js v22+** (required for built-in `node:sqlite` module)
- **npm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Jainilkhatri05/student-event-management.git
cd student-event-management

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The SQLite database (`events.db`) is created automatically on first run with 6 realistic seed events and 5 students. No manual setup needed!

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + custom glassmorphism |
| Database | SQLite via `node:sqlite` (Node.js built-in) |
| Date Picker | `react-datepicker` |
| Icons | `lucide-react` |

## 📁 Project Structure

```
app/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── events/new/page.tsx   # Create Event form
│   ├── students/page.tsx     # Student directory
│   └── api/                  # API routes (CRUD)
├── components/
│   ├── Navbar.tsx
│   ├── EventCard.tsx
│   └── RegisterModal.tsx
├── lib/
│   └── db.ts                 # SQLite singleton + schema + seed
└── types/
    └── index.ts              # TypeScript interfaces
```

## 📡 API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Fetch all events |
| POST | `/api/events` | Create a new event |
| DELETE | `/api/events/:id` | Delete an event |
| GET | `/api/students` | Fetch all students |
| POST | `/api/students` | Add a new student |
| GET | `/api/registrations` | Fetch registrations |
| POST | `/api/registrations` | Register a student |
