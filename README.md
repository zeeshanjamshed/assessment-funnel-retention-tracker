# Funnel Retention Tracker

A complete solution to track user progression and drop-offs in quiz funnels.

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/assessment-funnel-retention-tracker.git
cd assessment-funnel-retention-tracker
```

### 1. Setup Database
```bash

createdb funnel_tracker
```

### 2. Environment Configuration
Copy the example environment variables to your `.env` file, be sure to set the correct details for your local environment:

```bash
cp .env.example .env
```

**server/.env**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=funnel_tracker
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

**client/.env.local**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Install & Run
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Create database tables
cd server && npm run migrate

# Start both client and server
cd .. && npm run dev
```

**Servers will run on:**
- Frontend Dashboard: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## 📊 Testing with Real Quiz

To track the Nebroo quiz (https://offer.nebroo.com/lead2):

1. Open `https://offer.nebroo.com/lead2`
2. Open browser console (F12 → Console)
3. Paste and run this script:

```javascript
// Clear session data for fresh testing
sessionStorage.removeItem('funnel_session_id');
sessionStorage.removeItem('funnel_tab_id');

// Load tracking script
const script = document.createElement('script');
script.src = 'http://localhost:3001/funnel-tracker.js?v=' + Date.now();
script.onload = function() {
    console.log('✅ FunnelTracker loaded successfully!');
    window.FunnelTracker.init({
        apiUrl: 'http://localhost:3001/api/track',
        quizId: 'lead2',
        debug: true
    });
    
    console.log('🎯 Tracking active - go through the quiz!');
    console.log('📊 View dashboard: http://localhost:3000');
};

document.head.appendChild(script);
```

4. Complete the quiz and check the dashboard at `http://localhost:3000`
