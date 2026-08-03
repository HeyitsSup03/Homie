import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getNearbyListingsApi, Listing } from '../api/listingApi';
import { getSeekerInterestsApi, Interest } from '../api/interestApi';
import { geocodeQuery } from '../services/geocode';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import logoImg from '../assets/logo.png';
import sidebarBg from '../assets/seekers-dashboard-bg.PNG';

// ── Fix Leaflet default icon path broken by Vite/Webpack ──────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom price-label marker ──────────────────────────────────────────────
const createPriceIcon = (rent: number, isHighlighted: boolean) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${isHighlighted ? '#4A7546' : '#1a1a1a'};
        color: #fff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid ${isHighlighted ? '#3a5e37' : '#333'};
        transform: translateX(-50%);
        cursor: pointer;
      ">
        ₹${rent.toLocaleString('en-IN')}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// ── Map re-centering helper ────────────────────────────────────────────────
const MapFlyTo: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom]);
  return null;
};

// ── Skeleton card ──────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-[14px] p-4 animate-pulse mb-3"
    style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-full mb-4" />
    <div className="flex gap-2">
      <div className="h-5 bg-gray-100 rounded-full w-14" />
      <div className="h-5 bg-gray-100 rounded-full w-16" />
    </div>
  </div>
);

// ── Result card ────────────────────────────────────────────────────────────
const ResultCard: React.FC<{
  listing: Listing;
  isHighlighted: boolean;
  onClick: () => void;
}> = ({ listing, isHighlighted, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-[14px] p-4 mb-3 cursor-pointer transition-all duration-200
      ${isHighlighted
        ? 'ring-2 ring-[#4A7546] shadow-md -translate-y-[2px]'
        : 'hover:-translate-y-[2px] hover:shadow-md'
      }`}
    style={{ boxShadow: isHighlighted ? undefined : '0 1px 8px rgba(0,0,0,0.06)' }}
  >
    {listing.images && listing.images.length > 0 && (
      <div className="w-full h-[120px] rounded-[10px] overflow-hidden mb-3 bg-[#faf9f6]">
        <img
          src={listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div className="flex items-start justify-between gap-2 mb-1">
      <h3 className="text-[0.88rem] font-bold text-[#1a1a1a] leading-snug flex-1">{listing.title}</h3>
      <span className="text-[0.92rem] font-bold text-[#4A7546] flex-shrink-0">
        ₹{listing.rent.toLocaleString('en-IN')}
        <span className="text-[0.65rem] font-normal text-[#aaa]">/mo</span>
      </span>
    </div>
    <p className="text-[0.75rem] text-[#888] mb-2 flex gap-1 items-start">
      <span>📍</span><span className="line-clamp-1">{listing.address}</span>
    </p>
    {listing.amenities.length > 0 && (
      <div className="flex flex-wrap gap-[5px]">
        {listing.amenities.slice(0, 4).map(a => (
          <span key={a} className="px-2 py-[2px] bg-[#f5f2ee] text-[#555] text-[0.68rem] rounded-full font-medium">
            {a}
          </span>
        ))}
        {listing.amenities.length > 4 && (
          <span className="px-2 py-[2px] bg-[#f5f2ee] text-[#888] text-[0.68rem] rounded-full">
            +{listing.amenities.length - 4}
          </span>
        )}
      </div>
    )}
    <span className={`inline-flex items-center gap-[5px] text-[0.65rem] font-semibold mt-2
      ${listing.isAvailable ? 'text-[#4A7546]' : 'text-[#aaa]'}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${listing.isAvailable ? 'bg-[#4A7546]' : 'bg-[#bbb]'}`} />
      {listing.isAvailable ? 'Available' : 'Unavailable'}
    </span>
    <Link
      to={`/listings/${listing._id}`}
      onClick={e => e.stopPropagation()}
      className="inline-block mt-2 text-[0.72rem] font-semibold text-[#4A7546] hover:underline"
    >
      View Details →
    </Link>
  </div>
);

// ── Default map center (India) ─────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639]; // Kolkata
const DEFAULT_ZOOM = 11;

// ── Session Cache Key ──────────────────────────────────────────────────────
const SEARCH_CACHE_KEY = 'homie_seeker_search_cache';

interface CachedSearchState {
  searchInput: string;
  searchLabel: string | null;
  mapCenter: [number, number];
  mapZoom: number;
  listings: Listing[];
  hasSearched: boolean;
}

const getInitialCache = (): CachedSearchState | null => {
  try {
    const raw = sessionStorage.getItem(SEARCH_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Filter Amenities List ──────────────────────────────────────────────────
const FILTER_AMENITIES = [
  'WiFi', 'AC', 'Parking', 'Laundry',
  'Security', 'Gym', 'Pool', 'Elevator',
  'Pets', 'Water 24/7', 'CCTV', 'Balcony',
];

// ── Main Component ─────────────────────────────────────────────────────────
const SeekerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Restore from cache if returning from PropertyDetails page
  const cached = getInitialCache();

  const [searchInput, setSearchInput] = useState(cached?.searchInput ?? '');
  const [mapCenter, setMapCenter] = useState<[number, number]>(cached?.mapCenter ?? DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(cached?.mapZoom ?? DEFAULT_ZOOM);
  const [listings, setListings] = useState<Listing[]>(cached?.listings ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLabel, setSearchLabel] = useState<string | null>(cached?.searchLabel ?? null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(cached?.hasSearched ?? false);

  // ── Filter & Sort state ──────────────────────────────────────────
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [minRent, setMinRent] = useState<string>('');
  const [maxRent, setMaxRent] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | ''>('');

  // ── Matches & Chat state ─────────────────────────────────────────
  const [acceptedMatches, setAcceptedMatches] = useState<Interest[]>([]);
  const [showMatchesDropdown, setShowMatchesDropdown] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    interestId: string;
    partnerName: string;
    listingTitle?: string;
  } | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const popupRefs = useRef<Record<string, L.Marker | null>>({});

  // Fetch seeker's accepted matches on mount
  useEffect(() => {
    let cancelled = false;
    getSeekerInterestsApi()
      .then(interests => {
        if (!cancelled) {
          const accepted = interests.filter(i => i.status === 'accepted');
          setAcceptedMatches(accepted);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(SEARCH_CACHE_KEY);
    logout();
    navigate('/', { replace: true });
  };

  const executeFilteredSearch = async (
    center: [number, number] = mapCenter,
    overrideMin?: string,
    overrideMax?: string,
    overrideAmenities?: string[],
    overrideSort?: 'price_asc' | 'price_desc' | 'newest' | ''
  ) => {
    setIsLoading(true);
    setError(null);

    const activeMin = overrideMin !== undefined ? overrideMin : minRent;
    const activeMax = overrideMax !== undefined ? overrideMax : maxRent;
    const activeAmenities = overrideAmenities !== undefined ? overrideAmenities : selectedAmenities;
    const activeSort = overrideSort !== undefined ? overrideSort : sortBy;

    try {
      const results = await getNearbyListingsApi({
        lat: center[0],
        lng: center[1],
        radiusKm: 20,
        minRent: activeMin ? Number(activeMin) : undefined,
        maxRent: activeMax ? Number(activeMax) : undefined,
        amenities: activeAmenities,
        sortBy: activeSort || undefined,
      });

      setListings(results);

      // Update sessionStorage cache
      sessionStorage.setItem(
        SEARCH_CACHE_KEY,
        JSON.stringify({
          searchInput: searchInput.trim(),
          searchLabel,
          mapCenter: center,
          mapZoom,
          listings: results,
          hasSearched: true,
        })
      );
    } catch (err: any) {
      setError(err?.message ?? 'Search failed. Please try again.');
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;
    setError(null);
    setIsLoading(true);
    setHasSearched(true);
    setHighlightedId(null);

    try {
      const { lat, lng, displayName } = await geocodeQuery(searchInput.trim());
      const newCenter: [number, number] = [lat, lng];
      const newZoom = 12;

      setMapCenter(newCenter);
      setMapZoom(newZoom);
      setSearchLabel(displayName);

      await executeFilteredSearch(newCenter);
    } catch (err: any) {
      setError(err?.message ?? 'Search failed. Please try again.');
      setListings([]);
      setIsLoading(false);
    }
  };

  const toggleAmenityFilter = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setMinRent('');
    setMaxRent('');
    setSelectedAmenities([]);
    setSortBy('');
    if (hasSearched) {
      executeFilteredSearch(mapCenter, '', '', [], '');
    }
  };

  // Clicking a card → highlight + open map popup
  const handleCardClick = (listing: Listing) => {
    setHighlightedId(listing._id);
    const marker = popupRefs.current[listing._id];
    if (marker) {
      marker.openPopup();
      setMapCenter([
        listing.location.coordinates[1],
        listing.location.coordinates[0],
      ]);
    }
  };

  // Clicking a map marker → highlight + scroll card into view
  const handleMarkerClick = (listing: Listing) => {
    setHighlightedId(listing._id);
    const card = cardRefs.current[listing._id];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#faf9f6' }}>

      {/* ── Sticky Header ── */}
      <header
        className="flex-shrink-0 bg-white border-b border-[#f0ede8] z-[1000]"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="w-full px-6 h-[64px] flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logoImg} alt="Homie" className="h-[44px] object-contain" />
          </Link>

          {/* Search bar + Filter button — center */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-[580px] mx-auto">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] text-[0.9rem]">🔍</span>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder='Search by city, area or landmark…'
                className="w-full pl-9 pr-4 py-[9px] text-[0.85rem] border border-[#d4cfc8] rounded-full bg-[#faf9f6] focus:outline-none focus:border-[#4A7546] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-[9px] bg-[#4A7546] text-white text-[0.82rem] font-semibold rounded-full hover:bg-[#3a5e37] disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {isLoading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilterPanel(prev => !prev)}
              className={`px-3.5 py-[9px] text-[0.82rem] font-semibold rounded-full border transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                showFilterPanel || minRent || maxRent || selectedAmenities.length > 0 || sortBy
                  ? 'bg-[#4A7546] border-[#4A7546] text-white shadow-sm'
                  : 'bg-[#faf9f6] border-[#d4cfc8] text-[#555] hover:border-[#4A7546]'
              }`}
            >
              <span>⚙️</span> Filters
              {(minRent || maxRent || selectedAmenities.length > 0 || sortBy) && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </form>

          {/* User + Matches + logout — right */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto relative">
            {acceptedMatches.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMatchesDropdown(prev => !prev)}
                  className="px-4 py-2 text-[0.8rem] font-bold text-white bg-[#4A7546] rounded-full hover:bg-[#3a5e37] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>💬</span> My Matches
                  <span className="w-5 h-5 bg-white text-[#4A7546] rounded-full text-[0.7rem] font-extrabold flex items-center justify-center">
                    {acceptedMatches.length}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showMatchesDropdown && (
                  <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-[16px] shadow-xl border border-[#f0ede8] py-2 z-[3000] animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="px-4 py-2 text-[0.75rem] font-bold text-[#888] border-b border-[#f5f2ee]">
                      ACCEPTED MATCHES ({acceptedMatches.length})
                    </p>
                    <div className="max-h-[240px] overflow-y-auto">
                      {acceptedMatches.map(match => {
                        const listing = typeof match.listing === 'object' ? match.listing : null;
                        return (
                          <button
                            key={match._id}
                            onClick={() => {
                              setShowMatchesDropdown(false);
                              setActiveChat({
                                interestId: match._id,
                                partnerName: 'Property Host',
                                listingTitle: listing?.title,
                              });
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#faf9f6] flex flex-col gap-0.5 transition-colors border-b border-[#f9f8f6] last:border-0"
                          >
                            <span className="text-[0.82rem] font-bold text-[#1a1a1a]">
                              {listing?.title ?? 'Property Listing'}
                            </span>
                            <span className="text-[0.72rem] text-[#4A7546] font-medium">
                              Open Chat 💬
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/seeker/profile"
              className="px-4 py-2 text-[0.8rem] font-semibold text-[#1a1a1a] bg-[#faf9f6] border border-[#d4cfc8] rounded-full hover:bg-[#f0ede8] transition-colors"
            >
              Profile 👤
            </Link>

            {user?.name && (
              <span className="text-[0.82rem] text-[#888]">
                Hello, <span className="font-semibold text-[#1a1a1a]">{user.name}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[0.8rem] font-semibold text-[#555] border border-[#d4cfc8] rounded-full hover:bg-[#f5f2ee] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Collapsible Filter & Sort Panel */}
        {showFilterPanel && (
          <div className="bg-[#faf9f6] border-t border-[#f0ede8] px-6 py-4 transition-all animate-in slide-in-from-top-2 duration-200 shadow-inner">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Budget Range */}
                <div>
                  <label className="block text-[0.78rem] font-bold text-[#1a1a1a] mb-1.5">
                    Budget Range (Monthly Rent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minRent}
                      onChange={e => setMinRent(e.target.value)}
                      className="w-full px-3 py-1.5 text-[0.82rem] border border-[#d4cfc8] rounded-xl bg-white focus:outline-none focus:border-[#4A7546]"
                    />
                    <span className="text-[#bbb] text-[0.8rem]">–</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxRent}
                      onChange={e => setMaxRent(e.target.value)}
                      className="w-full px-3 py-1.5 text-[0.82rem] border border-[#d4cfc8] rounded-xl bg-white focus:outline-none focus:border-[#4A7546]"
                    />
                  </div>
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => { setMinRent(''); setMaxRent('15000'); }}
                      className="px-2.5 py-0.5 text-[0.7rem] font-medium bg-white border border-[#e5e0d8] rounded-full hover:border-[#4A7546] text-[#555]"
                    >
                      &lt; ₹15k
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMinRent('15000'); setMaxRent('30000'); }}
                      className="px-2.5 py-0.5 text-[0.7rem] font-medium bg-white border border-[#e5e0d8] rounded-full hover:border-[#4A7546] text-[#555]"
                    >
                      ₹15k – ₹30k
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMinRent('30000'); setMaxRent(''); }}
                      className="px-2.5 py-0.5 text-[0.7rem] font-medium bg-white border border-[#e5e0d8] rounded-full hover:border-[#4A7546] text-[#555]"
                    >
                      &gt; ₹30k
                    </button>
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[0.78rem] font-bold text-[#1a1a1a] mb-1.5">
                    Sort Results By
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 text-[0.82rem] border border-[#d4cfc8] rounded-xl bg-white focus:outline-none focus:border-[#4A7546] text-[#1a1a1a]"
                  >
                    <option value="">Distance / Nearest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => executeFilteredSearch(mapCenter)}
                    className="flex-1 py-2 bg-[#4A7546] text-white text-[0.82rem] font-bold rounded-xl hover:bg-[#3a5e37] transition-colors shadow-sm"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-white text-[#555] border border-[#d4cfc8] text-[0.82rem] font-semibold rounded-xl hover:bg-[#eae7e1] transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <label className="block text-[0.78rem] font-bold text-[#1a1a1a] mb-1.5">
                  Filter by Amenities (Properties must match all selected)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_AMENITIES.map(amenity => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenityFilter(amenity)}
                        className={`px-3 py-1 text-[0.72rem] font-medium rounded-full transition-all border ${
                          isSelected
                            ? 'bg-[#4A7546] border-[#4A7546] text-white shadow-sm'
                            : 'bg-white border-[#d4cfc8] text-[#555] hover:border-[#4A7546]'
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Body: map left + sidebar right ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map panel */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="w-full h-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo center={mapCenter} zoom={mapZoom} />
            {listings.map(listing => (
              <Marker
                key={listing._id}
                position={[
                  listing.location.coordinates[1],
                  listing.location.coordinates[0],
                ]}
                icon={createPriceIcon(listing.rent, highlightedId === listing._id)}
                ref={marker => { popupRefs.current[listing._id] = marker; }}
                eventHandlers={{ click: () => handleMarkerClick(listing) }}
              >
                <Popup>
                  <div className="text-[0.82rem]">
                    <p className="font-bold text-[#1a1a1a] mb-1">{listing.title}</p>
                    <p className="text-[#888] text-[0.75rem] mb-1">📍 {listing.address}</p>
                    <p className="text-[#4A7546] font-bold">₹{listing.rent.toLocaleString('en-IN')}/mo</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="relative w-[380px] flex-shrink-0 bg-[#faf9f6] border-l border-[#f0ede8] flex flex-col overflow-hidden">

          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-50"
            style={{
              backgroundImage: `url(${sidebarBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'bottom center',
              transform: 'translateY(77px)', //  Increase this number (e.g. 50px, 100px, 150px) to push it further down
            }}
          />


          {/* Sidebar header */}
          <div className="relative z-10 flex-shrink-0 px-5 py-3 border-b border-[#f5f2ee] bg-white/90 backdrop-blur-sm">
            {!hasSearched && (
              <p className="text-[0.82rem] text-[#888]"> <span className='flex justify-center items-center mt-4'>Search for a location to find properties nearby</span>.</p>
            )}
            {hasSearched && !isLoading && !error && (
              <p className="text-[0.82rem] text-[#555]">
                <span className="font-bold text-[#1a1a1a]">{listings.length} {listings.length === 1 ? 'property' : 'properties'}</span>
                {searchLabel && <span> near <span className="font-medium">{searchLabel.split(',')[0]}</span></span>}
              </p>
            )}
            {error && (
              <p className="text-[0.8rem] text-red-500">{error}</p>
            )}
          </div>

          {/* Scrollable results */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">

            {/* Loading skeletons */}
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}


            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16"
                style={{ transform: 'translateY(-77px)' }}>
                <div className="text-5xl mb-4">🗺️</div>
                <p className="text-[0.85rem] text-[#aaa] max-w-[220px]">
                  Enter a city or area above to discover nearby rentals.
                </p>
              </div>
            )}

            {/* Empty state */}
            {hasSearched && !isLoading && !error && listings.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="text-5xl mb-4">🏚️</div>
                <p className="text-[0.9rem] font-semibold text-[#1a1a1a] mb-1">No properties found</p>
                <p className="text-[0.8rem] text-[#aaa]">Try a wider search or a different area.</p>
              </div>
            )}

            {/* Result cards */}
            {!isLoading && listings.map(listing => (
              <div
                key={listing._id}
                ref={el => { cardRefs.current[listing._id] = el; }}
              >
                <ResultCard
                  listing={listing}
                  isHighlighted={highlightedId === listing._id}
                  onClick={() => handleCardClick(listing)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Drawer Modal */}
      {activeChat && (
        <ChatDrawer
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          interestId={activeChat.interestId}
          partnerName={activeChat.partnerName}
          listingTitle={activeChat.listingTitle}
        />
      )}
    </div>
  );
};

export default SeekerDashboard;
