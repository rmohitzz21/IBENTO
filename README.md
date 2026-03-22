# IBENTO 🎊

**IBENTO** is a comprehensive, multi-vendor event marketplace platform designed to streamline the event planning process. It connects customers looking to organize events (weddings, corporate events, parties) with professional vendors (caterers, decorators, photographers, venues) in a seamless, secure, and interactive digital ecosystem.

![IBENTO Banner](https://via.placeholder.com/1200x400?text=IBENTO+-+Event+Marketplace)

---

## 📖 About the Platform
Organizing an event often involves juggling multiple vendors, negotiating prices, and keeping track of countless details. IBENTO solves this by providing a unified platform where:
- **Customers** can browse curated vendors, compare portfolios, read reviews, and book services directly.
- **Vendors** can showcase their services, manage bookings, interact with clients, and track their earnings.
- **Admins** have a bird's-eye view of the platform, managing users, transactions, and ensuring quality control.

---

## ✨ Core Features

### 👤 Customer (User) Features
- **Smart Discovery:** Browse and search for vendors by category, rating, location, and price.
- **Seamless Booking:** Interactive calendar and booking flow to select dates and specific service packages.
- **Real-Time Chat:** Communicate directly with vendors to discuss event details before and after booking.
- **Wishlist & Favorites:** Save preferred vendors and services for future events.
- **Secure Payments:** Integrated payment gateway for safe transactions.
- **Reviews & Ratings:** Share feedback and rate vendor services post-event.

### 🏪 Vendor Features
- **Personalized Dashboard:** Track total bookings, revenue, and profile views.
- **Service Management:** Create and edit service listings, pricing tiers, and upload portfolio images.
- **Booking Management:** Accept, reject, or negotiate booking requests from clients.
- **Availability Calendar:** Block out dates and manage working hours.
- **Direct Messaging:** Respond to customer inquiries instantly.
- **Earnings & Payouts:** Track financial metrics and request payouts.

### 🛡️ Admin Features
- **Platform Management:** Approve or decline new vendor applications to maintain platform quality.
- **User Management:** Oversee all customer and vendor accounts.
- **Financial Oversight:** Monitor all platform transactions, handle vendor payouts, and track platform commissions.
- **System Settings:** Control global categories, featured vendors, and promotional banners.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- React.js (Vite)
- Tailwind CSS (Styling)
- Zustand / React Context (State Management)
- React Query (Data Fetching & Caching)
- Framer Motion (Animations)

**Backend (Server)**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- Socket.io (Real-time Bidirectional Communication)
- JSON Web Tokens (JWT) (Authentication & RBAC)
- Multer & Cloud Storage (Media Uploads)

---

## 🚀 Future Roadmap & Potential Additions

IBENTO is built to scale. Here are the planned features and potential additions to take the platform to the next level:

- [ ] **AI-Powered Matchmaking:** Implement an AI recommendation engine (Python/FastAPI) to suggest the perfect vendors based on a user's event type, budget, and style preferences.
- [ ] **Event Budget Planner:** A built-in calculator for customers to track their expenses across different booked vendors.
- [ ] **Virtual Tours:** Allow venue vendors to upload 360-degree tours or video walkthroughs.
- [ ] **Mobile Application:** Develop cross-platform mobile apps (React Native/Flutter) for on-the-go access for both vendors and customers.
- [ ] **Advanced Analytics for Vendors:** Provide vendors with deeper insights into profile traffic, conversion rates, and market trends.
- [ ] **Automated Contracts & E-Signatures:** Generate standard agreements between customers and vendors upon booking confirmation.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier is fine)
- Razorpay test account → [dashboard.razorpay.com](https://dashboard.razorpay.com)
- Mailtrap account for dev email → [mailtrap.io](https://mailtrap.io)
- Cloudinary account → [cloudinary.com](https://cloudinary.com)

### 1. Clone & Install
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy and fill in `server/.env.example` → `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ibento
JWT_SECRET=<64 random chars>
JWT_REFRESH_SECRET=<different 64 random chars>
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<mailtrap user>
SMTP_PASS=<mailtrap pass>
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Client** — copy and fill in `client/.env.example` → `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx   # must match server
```

> **Dev tip:** If SMTP is not configured, OTPs are printed to the server console (green text). Copy from there to test auth flows.

### 3. Seed the Database

```bash
cd server && npm run seed:categories
```

This seeds 10 event categories (Photography, Decoration, Catering, etc.) needed for vendor browsing.

### 4. Create Admin User

Run this one-time in MongoDB Compass or Atlas:
```javascript
// In your ibento database → users collection
db.users.insertOne({
  name: "Admin",
  email: "admin@ibento.in",
  role: "admin",
  password: "<bcrypt hash of your password>",  // use bcryptjs to hash
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this Node.js snippet to generate the hash:
```bash
node -e "require('bcryptjs').hash('YourPassword123', 10).then(h => console.log(h))"
```

### 5. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd server && npm run dev   # runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev   # runs on http://localhost:5173
```

### 6. Test Login Credentials
| Role | Email | Method |
|------|-------|--------|
| Admin | admin@ibento.in | Password |
| User | any registered email | OTP (check console/Mailtrap) |
| Vendor | any registered email | OTP (check console/Mailtrap) |

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 

## 📝 License
This project is licensed under the MIT License.
