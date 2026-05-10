# ✈️ Traveloop – The Premium AI-Powered Travel Planning Platform

![Traveloop Banner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200)

> **Transforming the way you dream, design, and organize your global adventures.**

Traveloop is a personalized, intelligent, and collaborative platform designed to simplify the complexity of multi-city travel planning. It combines a premium user experience with powerful features to make trip organization as exciting as the journey itself.

---

## 🌟 Vision
To create a world where travel planning is simple, engaging, and highly personalized—empowering every individual to visualize their journey and explore global destinations with confidence and ease.

## 🎯 Mission
Build a user-centric, responsive application that streamlines multi-city itinerary creation, budget management, and collaborative sharing, making high-end travel planning accessible to everyone.

---

## ✨ Key Features

### 🛠️ Core Planning Tools
- **Itinerary Builder**: An interactive interface to add cities, dates, and activities. Easily reorder stops and visualize your full trip timeline.
- **Trip Budget & Cost Breakdown**: Automated financial summaries with visual charts (pie/bar). Track transportation, stay, meals, and activities with real-time budget alerts.
- **Smart Packing Checklist**: An AI-ready checklist for travel essentials, categorized by type (Clothing, Documents, Electronics) with progress tracking.
- **My Trips Dashboard**: A central hub to manage all your upcoming and past adventures with rich summary cards.

### 🔍 Discovery & Personalization
- **Global City Search**: Find and add destinations with ease.
- **Activity Browse**: Explore and select experiences to enrich your stops.
- **Trip Notes & Journal**: Save important details, reminders, and thoughts for specific days or trips.

### 🌐 Social & Collaborative
- **Shared Itinerary View**: Generate public URLs for your trips to inspire others or share your plans with friends in a beautiful, read-only format.
- **User Profiles**: Manage your travel preferences, saved destinations, and personal data.

---

## 🚀 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Premium CSS3 (Glassmorphism) |
| **Styling** | Custom Design System, CSS Variables, Responsive Fluid Grids |
| **Backend** | Firebase Authentication, Cloud Firestore (Real-time DB), Firebase Storage |
| **Development** | Vite (HMR), NPM, Git |
| **Design** | Material Symbols, Google Fonts (Outfit, Inter) |

---

## 🛠️ Installation & Setup

Follow these steps to get Traveloop running locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/ayushkrsingh001/Odoo-Hackathon.git
cd Odoo-Hackathon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
├── assets/             # Images, logos, and static assets
├── src/
│   ├── css/            # Core design system and page-specific styles
│   │   ├── variables.css   # Design tokens & color palette
│   │   ├── components.css  # Reusable UI elements
│   │   └── layout.css      # Responsive grid system
│   ├── js/
│   │   ├── firebase/   # Firebase configuration and services
│   │   ├── pages/      # Page-specific logic (Budget, Itinerary, etc.)
│   │   └── utils/      # Shared utilities (Trip Selector, Guards)
│   └── scripts/        # Global navigation and app initialization
├── index.html          # Landing Page
├── dashboard.html      # Main User Hub
└── ...                 # Feature-specific HTML pages
```

---

## 📐 Design Philosophy
- **Glassmorphism**: Using subtle blurs and semi-transparent layers for a modern, premium feel.
- **Tactile Interactivity**: Every button and card responds with smooth transitions and elevation changes.
- **Mobile-First**: Fully responsive layouts that adapt from mobile screens to ultra-wide monitors.
- **Accessibility**: Semantic HTML and clear visual hierarchies for an inclusive user experience.

---

## 🗺️ Roadmap
- [ ] **AI Trip Generator**: Fully integrate AI to suggest entire itineraries based on a single prompt.
- [ ] **Offline Mode**: Allow users to view their itineraries without an internet connection.
- [ ] **Multi-Currency Support**: Real-time currency conversion for global travelers.
- [ ] **Community Marketplace**: Discover and copy public itineraries from world-class travelers.

---

## 👥 Contributors
- **Ayush Kumar Singh** - *Lead Developer & Visionary*

---

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed for the **Odoo Hackathon** with ❤️ by Team Traveloop.*
