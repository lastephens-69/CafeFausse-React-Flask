# ☕ Café Fausse — React + Flask + PostgreSQL

A full-stack restaurant website designed to showcase a polished user experience, clean UI components, and a scalable backend architecture.  
The application includes menu browsing, reservations, gallery filtering, and newsletter sign-up — all tied into a live API and database.

---

## 🌟 Overview

Café Fausse is a fictional fine-dining brand brought to life through a modern web application.  
The project demonstrates:

- Component-based React UI
- REST API built with Flask (Python)
- PostgreSQL relational database
- End-to-end form handling (reservations + newsletter)
- Responsive, accessible design
- Clear separation of concerns in both frontend and backend

The visual theme represents a contemporary Italian-inspired restaurant founded by *Chef Antonio Rossi* and *restaurateur Maria Lopez*.

---

## 🧭 Features

### **Frontend**
- Responsive layout (desktop, tablet, mobile)
- Category-based menu with images and pricing
- Reservation form with validation and API integration
- Filterable gallery organized by content type
- Newsletter signup section
- Clean navigation and consistent styling

### **Backend**
- Flask REST API with structured routing
- SQLAlchemy ORM for safe database interaction
- Reservation creation and availability logic
- Newsletter email persistence
- Error handling for invalid submissions
- Modular app structure for maintainability

### **Database**
- PostgreSQL schema supporting reservations and newsletters
- Hosted remotely for the live demo

---

## 🧩 Technical Design & Decisions

### **React + Vite**
- Fast dev environment with hot reload
- Ideal for component-driven UI
- Great performance for static deployment (Netlify)

### **Flask + SQLAlchemy**
- Lightweight Python backend for clean API endpoints
- Organized file structure for routes, models, and services
- Easy deployment on Render

### **PostgreSQL**
- Strong relational data handling
- Works well for structured, business-style models
- Simple hosting and connection

---

## 🗂️ Project Structure

### **Frontend**
```
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── cafe/
│   ├── components/
│   ├── pages/
│   ├── services/api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
└── package.json
```

### **Backend**
```
backend/
├── app.py
├── database.py
├── models.py
├── schema.sql
├── requirements.txt
├── .env.sample
└── .env  # local only
```

---

## 🎨 Design System

### **Typography**
- **Bilbo Swash Caps** — headings
- **Lora** — body text

### **Color Palette**
| Use | Color |
|------|--------|
| Primary Header/Footer | `#000000` |
| Accent Color | `#bfa14a` |
| Background | Ivory/White |

### **UI Guidelines**
- Gold accents for CTAs and active navigation
- Card patterns with soft shadows
- Standardized image aspect ratios for menu + gallery

---

## ⚙️ Running the Project Locally

### **1. Clone the repository**
```bash
git clone https://github.com/lastephens-69/CafeFausse-React-Flask.git
cd CafeFausse-React-Flask
```

---

### **2. Backend Setup**
```bash
cd backend
python -m venv .venv
```

**Activate:**

Windows:
```powershell
.\.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

**Install & run:**
```bash
pip install -r requirements.txt
python app.py
```

Backend runs at:  
👉 http://127.0.0.1:5000

---

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:  
👉 http://localhost:5173

---

## 🌐 Live Demo

| Component | Platform | URL |
|----------|----------|-----|
| **Frontend** | Netlify | https://cafe-fausse-ls.netlify.app/ |
| **Backend API** | Render | https://quantic-msse-webapp-interfacedesign.onrender.com |

---

## 🔐 Environment Variables (Backend)

```env
FLASK_ENV=development
PORT=5000
NETLIFY_URL=http://localhost:5173

ADMIN_TOKEN=your-admin-token

DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafe_fausse

DATABASE_URL=postgresql+pg8000://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

---

## 📸 Image Attribution

All imagery was created or curated using **Canva Pro**, organized into:

- `Dishes/`
- `Catering/`
- `Founders/`
- `Location/`
- `Behind the Scenes/`

---

## 👩‍💻 About the Developer

Built by **LaDonna Stephens**, focusing on:

- Full-stack engineering  
- UI/UX design  
- API development  
- Database modeling  
- Scalable architecture  
- Clean, maintainable code  
