# 🏠 Homie — Peer-to-Peer Rental Discovery & Direct Matching Platform

**Homie** is a full-stack, real-time rental property discovery and direct-matching web application designed to connect Property Owners and Rental Seekers seamlessly without middleman fees.

---

## ✨ Features & Capabilities

### 🔐 1. Authentication & Role-Based Access
- **Dual Role System**: Separate onboarding & dashboards for `owner` and `seeker` users.
- **Route Guards**: `GuestRoute` (redirects logged-in users to home) and `ProtectedRoute` (enforces role access).
- **Persistent Sessions**: JWT authentication with automatic session rehydration.

### 🗺️ 2. Geospatial Search & Interactive Leaflet Map
- **Location Geocoding**: Server-side OpenCage integration converting street addresses into GeoJSON `[longitude, latitude]` coordinates.
- **MongoDB `2dsphere` Indexing**: Spatial `$near` queries fetching properties within configurable radius.
- **Synced Split-Pane UI**: Interactive map price markers synced with scrollable listing cards.
- **Session Cache**: Instant search state restoration across page navigations with zero redundant API calls.

### 🖼️ 3. Multi-Photo Property Gallery
- **Multi-File Uploads**: Owners can upload up to 5 property photos (JPEG, PNG, WEBP) per listing.
- **Interactive Photo Carousel**: Hero viewer on `/listings/:id` with Next (`>`) / Prev (`<`) controls, image counter, and clickable thumbnail bar.
- **Card Previews**: Cover photos rendered on search results and owner dashboard cards.

### 📩 4. Express Interest & Owner Inbox
- **Unique Request Gatekeeper**: Prevents duplicate applications with MongoDB compound unique indexes `{listing, seeker}`.
- **Owner Inbox**: Real-time request inbox with **[ Accept ]** and **[ Decline ]** controls.

### 📄 5. Seeker Profile & Tenant Resume PDF Upload
- **Profile Management**: Dedicated `/seeker/profile` page with occupation, phone, and living preferences bio inputs.
- **PDF Resume Upload**: Multer upload pipeline (5MB limit) storing files with static URL serving (`/uploads/resumes/`).
- **Owner Credentials Inspector**: Owners can click **"📄 View Tenant Resume PDF"** (opens PDF in new tab) to review tenant background before accepting.

### 💬 6. Match-Gated Real-Time Messaging (Chat)
- **Strict Match Gating**: Backend messaging (`POST /api/messages`) strictly enforces `interest.status === 'accepted'`.
- **`ChatDrawer.tsx`**: Slide-over chat panel with color-coded message bubbles and Enter key send.
- **Tab-Aware Delta Polling**:
  - Automatically pauses polling when the browser tab is hidden (`document.hidden`).
  - Fetches incremental updates via `GET /api/messages/:interestId?after=timestamp`.
  - Non-overlapping recursive `setTimeout` loop preventing request stacking.

### ⚙️ 7. Advanced Filtering & Sorting
- **Rent Budget Range**: Min/Max price inputs + quick preset budget buttons (`< ₹15k`, `₹15k–30k`, `> ₹30k`).
- **Amenity Filters**: Multi-select toggle pills for 12 popular amenities (WiFi, AC, Parking, Gym, Pool, etc.).
- **Sorting Controls**: Sort results by Distance, Price (Low → High / High → Low), or Newest First.

### 🗑️ 8. Listing Deletion & Application Cleanup
- **Owner Property Deletion**: Owners can delete listings via `DELETE /api/listings/:id`.
- **Unavailable Notice**: Deleted properties display **Unavailable ⛔** with *"This listing has been deleted or sold by the owner"*, disabling chat.
- **Seeker Application Cleanup**: Seekers can delete application records and chat history via `DELETE /api/interests/:id`.

---

## 🛠️ Technology Stack

### **Frontend (`client/`)**
- **Framework**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Vanilla CSS
- **Maps**: Leaflet, `react-leaflet`
- **Routing**: `react-router-dom` v6
- **HTTP Client**: Axios

### **Backend (`server/`)**
- **Runtime**: Node.js, Express, TypeScript
- **Database**: MongoDB Atlas, Mongoose
- **Auth**: `jsonwebtoken`, `bcryptjs`
- **File Uploads**: `multer`
- **Geocoding**: OpenCage Data API

---

## 📁 Repository Structure

```
Homie/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── api/                # Axios API service modules (auth, listing, interest, message, user)
│   │   ├── assets/             # Images and background graphics
│   │   ├── components/         # Reusable UI components (chat, layout, common)
│   │   ├── context/            # AuthContext provider and session management
│   │   ├── pages/              # Main application views (Hero, Dashboards, Details, Profile, Forms)
│   │   ├── services/           # Geocoding service helpers
│   │   ├── App.tsx             # Application routing definitions
│   │   └── main.tsx            # Vite entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Express + Node + TypeScript API
│   ├── public/uploads/         # Static file storage for resumes and property images
│   ├── src/
│   │   ├── config/             # Database connection setup
│   │   ├── controllers/        # Route controllers (auth, listing, interest, message, user, upload)
│   │   ├── middleware/         # Auth verification and role restriction middlewares
│   │   ├── models/             # Mongoose schemas (User, Listing, Interest, Message)
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # External service integration (OpenCage geocoding)
│   │   └── utils/              # Async handler utility
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # Server listener entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Configuration

### **Server Environment Variables (`server/.env`)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/homie?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
OPENCAGE_API_KEY=your_opencage_api_key_here
```

### **Client Environment Variables (`client/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/homie.git
cd homie
```

### 2. Install Backend Dependencies & Start Server
```bash
cd server
npm install
npm run dev
```
*Server will start listening at `http://localhost:5000`.*

### 3. Install Frontend Dependencies & Start Client
```bash
cd ../client
npm install
npm run dev
```
*Frontend will run at `http://localhost:3000`.*

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
