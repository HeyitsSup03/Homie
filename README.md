
# Homie — approach, folder structure, step-by-step build

## 1. Overall approach

Treat this as a monorepo with two independent apps that talk over a REST API:

```
Homie/
├── server/     ← Node + Express + MongoDB (API)
└── client/     ← React + Vite (frontend)
```

Build order follows a strict rule: **never build a screen before the API endpoint it depends on exists and is tested.** This keeps you from writing UI against imaginary data shapes. Concretely, every phase below has an "API first" sub-step followed by "then the screen."

We'll build in 7 phases, same as before, but each is now broken into concrete file-level tasks.

---

## 2. Folder structure

### `server/`

```
server/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js                # role: owner | seeker
│   │   ├── Listing.js              # includes 2dsphere geo field
│   │   └── Interest.js
│   ├── controllers/
│   │   ├── authController.js       # signup, login
│   │   ├── listingController.js    # create, get, nearby search
│   │   ├── interestController.js   # express interest, owner inbox
│   │   └── userController.js       # profile get/update
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── interestRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   ├── auth.js                 # verifies JWT, attaches req.user
│   │   ├── requireRole.js          # restricts route to owner/seeker
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── geocode.js              # wraps OpenCage/Mapbox geocoding call
│   │   └── cloudinarySign.js       # generates signed upload params
│   ├── utils/
│   │   └── asyncHandler.js
│   ├── app.js                      # express app, middleware wiring
│   └── server.js                   # entry point, starts listener
├── .env                            # secrets (never commit)
├── .env.example
└── package.json
```

### `client/`

```
client/
├── src/
│   ├── api/
│   │   ├── axiosClient.js          # base axios instance, attaches JWT
│   │   ├── authApi.js
│   │   ├── listingApi.js
│   │   └── interestApi.js
│   ├── auth/
│   │   ├── AuthContext.jsx         # holds current user + token
│   │   └── ProtectedRoute.jsx      # route guard by role
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageContainer.jsx
│   │   ├── map/
│   │   │   ├── MapView.jsx         # Leaflet wrapper, multi-pin mode
│   │   │   └── SinglePinMap.jsx    # Leaflet wrapper, one-pin mode
│   │   ├── listing/
│   │   │   ├── ListingCard.jsx     # used in search results grid
│   │   │   └── ListingForm.jsx     # used by owner to create/edit
│   │   └── common/
│   │       ├── SearchBar.jsx
│   │       └── Loader.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx         # search bar entry point
│   │   ├── SearchResultsPage.jsx   # map + card list
│   │   ├── ListingDetailPage.jsx   # single pin + owner info
│   │   ├── OwnerDashboard.jsx      # list of interests received
│   │   ├── SeekerProfilePage.jsx   # resume PDF upload
│   │   ├── SignupPage.jsx
│   │   └── LoginPage.jsx
│   ├── hooks/
│   │   └── useGeolocation.js       # optional: browser location for defaults
│   ├── App.jsx                     # route definitions
│   └── main.jsx
├── .env                            # VITE_API_URL, VITE_CLOUDINARY_* etc.
└── package.json
```

Keep `pages/` thin — they compose components and call the `api/` layer. All actual Leaflet, form, and card logic lives in `components/`, so you can reuse `ListingCard` and `MapView` across the search and detail pages without duplication.

---

## 3. Step-by-step build

### Phase 1 — Foundation (auth + skeleton)

**Backend**
1. `npm init`, install `express mongoose bcryptjs jsonwebtoken dotenv cors`
2. `config/db.js` — connect to MongoDB Atlas free cluster
3. `models/User.js` — fields: name, email, passwordHash, role (`owner`/`seeker`), phone
4. `controllers/authController.js` + `routes/authRoutes.js` — `POST /api/auth/signup`, `POST /api/auth/login`
5. `middleware/auth.js` — verifies JWT from `Authorization: Bearer` header
6. Test all endpoints with Postman/Thunder Client before touching the frontend

**Frontend**
1. `npm create vite@latest client -- --template react`, install `react-router-dom axios`
2. `api/axiosClient.js` — base instance pointing to your server URL
3. `auth/AuthContext.jsx` — stores user + token in context (localStorage for persistence)
4. `SignupPage.jsx` (role picker: owner/seeker), `LoginPage.jsx`
5. `auth/ProtectedRoute.jsx` — redirects unauthenticated users, restricts by role
6. **Checkpoint**: you can sign up as either role, log in, and land on a placeholder dashboard.

### Phase 2 — Owner: create a listing

**Backend**
1. `models/Listing.js` — include `location: { type: "Point", coordinates: [lng, lat] }` and `listingSchema.index({ location: "2dsphere" })`
2. `services/geocode.js` — takes an address string, calls OpenCage, returns `[lng, lat]`
3. `controllers/listingController.js` — `POST /api/listings` (owner only, geocodes address server-side before saving)
4. `middleware/requireRole.js` — guards this route to `role === "owner"`

**Frontend**
1. `components/listing/ListingForm.jsx` — rent, services (checkboxes), description, address text field
2. Wire to `api/listingApi.js` → `createListing()`
3. **Checkpoint**: an owner can submit a listing and see it saved with correct coordinates in MongoDB Atlas's UI.

### Phase 3 — Search + map (the core feature)

**Backend**
1. `GET /api/listings/nearby?lat=&lng=&radiusKm=` using Mongo's `$near` with `$maxDistance`
2. Add a small geocode cache: store `{ query, lat, lng }` in a `GeocodeCache` collection so repeat searches for "Newtown, Kolkata" don't re-hit the geocoding API

**Frontend**
1. Install `leaflet react-leaflet`
2. `components/common/SearchBar.jsx` on `LandingPage.jsx` — on submit, geocode client-side (or call a backend `/api/geocode?q=` endpoint that proxies it) then navigate to `/search?lat=&lng=&locality=`
3. `components/map/MapView.jsx` — renders all pins from the nearby results
4. `SearchResultsPage.jsx` — fetches nearby listings, renders `MapView` + a grid of `ListingCard`s, hover-sync between card and pin (optional nice-to-have, skip on first pass)
5. **Checkpoint**: searching "Newtown, Kolkata" shows real pins with real listing cards below.

### Phase 4 — Listing detail page

**Backend**
1. `GET /api/listings/:id` — returns one listing with owner's public contact info populated

**Frontend**
1. `ListingDetailPage.jsx` — `SinglePinMap.jsx` + owner card + services + rent
2. "Express interest" button, visible only to logged-in seekers
3. **Checkpoint**: clicking a card from search results lands here with the single pin and correct details.

### Phase 5 — Express interest + owner dashboard

**Backend**
1. `models/Interest.js` — listingId, seekerId, status, createdAt
2. `POST /api/interests` (seeker only) — creates the record
3. `GET /api/interests/my-listings` (owner only) — returns interests grouped by the owner's listings, populated with seeker name/phone/PDF url

**Frontend**
1. Wire "Express interest" button to `api/interestApi.js`
2. `OwnerDashboard.jsx` — list of listings, each expandable to show interested seekers with contact + PDF link
3. **Checkpoint**: a seeker expressing interest on one browser/account shows up instantly in the owner dashboard on another.

### Phase 6 — Seeker resume PDF

**Backend**
1. `services/cloudinarySign.js` — generates a signed upload signature so the browser can upload directly to Cloudinary without the PDF touching your server
2. `GET /api/uploads/sign` (seeker only) — returns the signature + timestamp + api key needed for the direct upload
3. `PATCH /api/users/me` — save the resulting Cloudinary URL to the seeker's profile

**Frontend**
1. `SeekerProfilePage.jsx` — file input, calls Cloudinary's upload endpoint directly using the signed params, then saves the URL via `PATCH /api/users/me`
2. Attach `resumePdfUrl` automatically when calling `POST /api/interests`
3. **Checkpoint**: a seeker's PDF shows up as a clickable link in the owner dashboard.

### Phase 7 — Polish

- Filters on `SearchResultsPage` (budget slider, service checkboxes) — client-side filter on the already-fetched nearby results is enough for MVP, no new endpoint needed
- Loading and empty states everywhere data is fetched
- Mobile responsiveness pass
- Basic listing photos (Cloudinary, same signed-upload pattern as the PDF)

---

## 4. Environment variables you'll need

**server/.env**
```
MONGODB_URI=
JWT_SECRET=
OPENCAGE_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=
```

**client/.env**
```
VITE_API_URL=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

---

## 5. Suggested pace

Each phase is a self-contained, demoable slice — don't move to the next until the checkpoint at the end of the current one actually works end to end (API tested + UI wired), not just "the code looks right." This is the same discipline that would apply to any full-stack build: catching a broken data shape at Phase 2 is a 5-minute fix; catching it at Phase 6 means retrofitting three screens.
