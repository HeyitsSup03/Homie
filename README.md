# 🏡 Homie — Find a Space That Feels Like Home

**Homie** is a modern, full-stack web application designed to seamlessly connect house seekers with property owners. Built with a robust MERN stack architecture (MongoDB, Express, React, Node.js) and TypeScript, Homie offers real-time geospatial search, interactive map exploration, role-based onboarding, and listing management.

---

## ✨ Features Completed So Far

### 🔐 Auth & Role-Based Security (Phase 1)
- **Role-Based Authentication**: Registration & login for two user roles: **Owner** and **Seeker**.
- **JWT Protection**: Secure HTTP authentication with JWT tokens automatically managed via Axios interceptors.
- **Route Guards**:
  - `ProtectedRoute`: Restricts owner pages to owners and seeker pages to seekers.
  - `GuestRoute`: Auto-redirects logged-in users away from auth pages to their respective dashboards.

### 🏡 Owner Experience & Onboarding (Phase 2)
- **2-Step Animated Onboarding**: First-time registered owners pass through a multi-step form wizard with horizontal slide transitions.
  - **Step 1 (Property Details)**: Property title, rent, address, description, amenity pill selector.
  - **Step 2 (Personal Details)**: Owner name, phone number, and a live listing preview summary card.
- **Automated Address Geocoding**: Addresses typed by owners are automatically converted to `[longitude, latitude]` coordinates via the **OpenCage Geocoding API** server-side.
- **2dsphere Geospatial Indexing**: Listings are saved to MongoDB with GeoJSON `Point` coordinates, optimized for spatial queries.
- **Owner Dashboard**:
  - Parallax background design (`owner-bg.jpeg`).
  - Sticky header bar displaying owner greeting and full-width navigation.
  - Responsive 3-column listing card grid showing active rentals, rent badges (`₹/mo`), address, amenities, and availability status.
  - Loading skeleton shimmers and zero-listing empty state.

### 🗺️ Seeker Search & Interactive Map (Phase 3)
- **Geospatial Search Engine**: `GET /api/listings/nearby` endpoint powered by MongoDB `$near` spatial operator with custom distance radius filters.
- **Interactive Leaflet Map**: Integrated `react-leaflet` map with OpenStreetMap tiles.
- **Price-Pill Markers**: Custom map pins displaying real-time rent amounts (`₹15,000`).
- **Synchronized Split-Pane View**:
  - **Map (Left)**: Interactive map with clickable price pins.
  - **Results Sidebar (Right)**: List of property cards matching the map location.
  - **Cross-Interaction**: Clicking a map marker scrolls and highlights its matching card; clicking a sidebar card flies the map to those coordinates and opens its popup pin.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS + Custom Design System
- **Map & Geospatial**: `leaflet`, `react-leaflet`
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: Axios with request/response interceptors

### Backend
- **Runtime**: Node.js + Express (TypeScript)
- **Database**: MongoDB Atlas + Mongoose ORM
- **Geospatial Queries**: MongoDB `2dsphere` index & `$near` operator
- **Geocoding API**: OpenCage Data API
- **Auth & Security**: `jsonwebtoken`, `bcryptjs`, Cors, Express Async Handler

---

## 📁 Project Structure

```
Homie/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   └── src/
│       ├── api/                # Axios API services (authApi, listingApi)
│       ├── assets/             # Images & design assets
│       ├── components/
│       │   └── layout/         # ProtectedRoute, GuestRoute
│       ├── context/            # AuthContext (session state)
│       ├── pages/              # HeroSection, Login, Register, OwnerListingForm, OwnerDashboard, SeekerDashboard
│       ├── services/           # Frontend geocoding service
│       ├── ui/                 # Reusable UI components (Button)
│       ├── App.tsx             # Route definitions
│       ├── main.tsx
│       └── vite-env.d.ts
│
└── server/                      # Express Backend (TypeScript)
    └── src/
        ├── config/             # MongoDB connection (db.ts)
        ├── controllers/        # authController, listingController
        ├── middleware/         # auth.ts (JWT verify), requireRole.ts
        ├── models/             # User.ts, Listing.ts (2dsphere index)
        ├── routes/             # authRoutes, listingRoutes
        ├── services/           # geocode.ts (OpenCage integration)
        ├── utils/              # asyncHandler.ts
        └── server.ts           # Server entry point
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user as `owner` or `seeker` |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Fetch currently authenticated user profile |

### Property Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/listings` | Owner Only | Create property listing & geocode address to GeoJSON |
| `GET` | `/api/listings/my-listings` | Owner Only | Fetch all listings created by logged-in owner |
| `GET` | `/api/listings/nearby` | Authenticated | Query listings within radius `radiusKm` of `[lat, lng]` |
| `GET` | `/api/listings/:id` | Authenticated | Fetch single listing detail with populated owner info |

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas cluster URL (or local MongoDB instance)
- OpenCage API key (for geocoding)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/homie.git
cd homie
```

### 2. Configure Backend Environment
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/homie?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
OPENCAGE_API_KEY=0c3aa83daf6546548bb5791594f7a100
```

### 3. Install Dependencies
```bash
# Install root workspace dependencies
npm install

# Install client & server dependencies
cd client && npm install
cd ../server && npm install
```

### 4. Run Development Servers
From the root workspace directory, you can launch both backend and frontend servers:

```bash
# In Terminal 1 (Backend - http://localhost:5000)
npm run dev:server

# In Terminal 2 (Frontend - http://localhost:3000)
npm run dev:client
```

---

## 📌 Upcoming Roadmap

- [ ] **Phase 4 — Listing Detail Page**: In-depth property page with photo carousel, amenities list, host details, and map view.
- [ ] **Phase 5 — Interest & Match Flow**: Seekers can send "Express Interest" requests to Owners.
- [ ] **Phase 6 — Cloudinary Image Uploads**: Enable Owners to upload real property photos via Cloudinary signed upload presets.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
