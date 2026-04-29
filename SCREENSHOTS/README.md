# Health Universe CGM - Continuous Glucose Monitoring Dashboard

A full-stack web application for diabetes management with real-time glucose tracking, nutrition logging, AI-powered insights, and comprehensive medical reporting.

## 🌐 Live Demo

**Frontend:** https://health-universe-cgm-1.onrender.com  
**Backend API:** https://health-universe-cgm.onrender.com  
**GitHub:** https://github.com/Samprathi07/health-universe-cgm

---

## 📋 Features

### Core Glucose Monitoring (5 features)
1. **Current Glucose Display** - Real-time glucose reading with color-coded status (Low/Normal/High)
2. **Add Glucose Reading** - Log glucose levels with optional notes
3. **Delete Readings** - Remove readings with confirmation dialog
4. **Recent Readings List** - View last 10 readings with timestamps and notes
5. **Glucose Trend Chart** - Interactive line chart showing last 20 readings with reference lines

### Patient Management (2 features)
6. **Patient Profile** - Auto-saved patient information (name, age, doctor)
7. **CGM Sensor Status** - 30-day countdown timer with activation/expiry dates

### Nutrition Tracking (4 features)
8. **Meal Logging** - Track meals with carbs, protein, and water intake
9. **Nutrition Log Display** - View last 10 meals with nutrient breakdown
10. **Nutrition Statistics** - Calculate average nutrients and total water intake
11. **Integration** - Nutrition data integrated into insights and reports

### AI-Powered Smart Insights (2 features)
12. **Glucose Story Mode** - Personalized insights based on time-in-range, patterns, streaks, and nutrition
13. **Risk Prediction System** - Analyzes last 3 readings to predict low/high glucose risks

### Medical Reporting (2 features)
14. **Doctor Report Generator** - Comprehensive medical report with statistics, observations, and recommendations
15. **Copy to Clipboard** - One-click copy for email sharing

### Data Visualization (1 feature)
16. **Time in Range Dashboard** - Three circular progress indicators (Low/Normal/High) with percentages

### Data Persistence (2 features)
17. **MongoDB Database** - All data saved permanently
18. **LocalStorage** - Patient profile and sensor date persist across sessions

### UI/UX (2 features)
19. **Modern Design** - Purple gradient header, card-based layout, responsive design
20. **Real-Time Updates** - Auto-refresh, no page reload needed

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Recharts (data visualization)
- CSS3 (custom styling)

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose

**Deployment:**
- Render (frontend & backend)
- MongoDB Atlas (database)

---

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Samprathi07/health-universe-cgm.git
cd health-universe-cgm
```

2. **Backend Setup:**
```bash
cd backend
npm install
```

Create `.env` file:
Start backend:
```bash
node server.js
```

3. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the app:**
http://localhost:5173
---

## 🚀 Deployment

### Backend (Render)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment Variable: `MONGO_URI`

### Frontend (Render)
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

---

---

## 🎯 Key Functionalities

### Glucose Monitoring
- Add readings with glucose value (mg/dL) and optional notes
- View historical data with timestamps
- Delete unwanted readings
- Visual trend chart with high/low thresholds

### Nutrition Tracking
- Log meals by type (Breakfast/Lunch/Dinner/Snack)
- Track carbohydrates, protein, and water intake
- View nutrition statistics and averages

### AI Insights
- Time-in-range analysis (target: ≥70%)
- Pattern detection (meal spikes, variability)
- Risk prediction based on recent trends
- Personalized recommendations

### Medical Reporting
- Comprehensive report with patient demographics
- Statistical analysis (average, range, standard deviation)
- Clinical observations and episode counts
- Recommendations for healthcare provider

---

## 👤 Developer

**Samprathi Vangipuram**  
Email: samprathivangipuram@gmail.com  
GitHub: [@Samprathi07](https://github.com/Samprathi07)

---

---

## 🎯 Key Functionalities

### Glucose Monitoring
- Add readings with glucose value (mg/dL) and optional notes
- View historical data with timestamps
- Delete unwanted readings
- Visual trend chart with high/low thresholds

### Nutrition Tracking
- Log meals by type (Breakfast/Lunch/Dinner/Snack)
- Track carbohydrates, protein, and water intake
- View nutrition statistics and averages

### AI Insights
- Time-in-range analysis (target: ≥70%)
- Pattern detection (meal spikes, variability)
- Risk prediction based on recent trends
- Personalized recommendations

### Medical Reporting
- Comprehensive report with patient demographics
- Statistical analysis (average, range, standard deviation)
- Clinical observations and episode counts
- Recommendations for healthcare provider

---

## 👤 Developer

**Samprathi Vangipuram**  
Email: samprathivangipuram@gmail.com  
GitHub: [@Samprathi07](https://github.com/Samprathi07)

---

## 📝 License

This project is created for educational purposes.

---

##  Acknowledgments

- Recharts for data visualization
- MongoDB Atlas for database hosting
- Render for deployment platform
