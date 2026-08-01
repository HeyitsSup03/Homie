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
import { geocodeQuery } from '../services/geocode';
import logoImg from '../assets/logo.png';

// ── Fix Leaflet default icon path broken by Vite/Webpack ──────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
  </div>
);

// ── Default map center (India) ─────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639]; // Kolkata
const DEFAULT_ZOOM = 11;

// ── Main Component ─────────────────────────────────────────────────────────
const SeekerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const popupRefs = useRef<Record<string, L.Marker | null>>({});

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
      setMapCenter([lat, lng]);
      setMapZoom(12);
      setSearchLabel(displayName);

      const results = await getNearbyListingsApi({ lat, lng, radiusKm: 20 });
      setListings(results);
    } catch (err: any) {
      setError(err?.message ?? 'Search failed. Please try again.');
      setListings([]);
    } finally {
      setIsLoading(false);
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

          {/* Search bar — center */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-[520px] mx-auto">
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
          </form>

          {/* User + logout — right */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
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
        <div className="w-[380px] flex-shrink-0 bg-white border-l border-[#f0ede8] flex flex-col overflow-hidden">

          {/* Sidebar header */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-[#f5f2ee]">
            {!hasSearched && (
              <p className="text-[0.82rem] text-[#aaa]">Search for a location to find properties nearby.</p>
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
          <div className="flex-1 overflow-y-auto px-4 py-4">

            {/* Loading skeletons */}
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {/* Initial prompt */}
            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
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
    </div>
  );
};

export default SeekerDashboard;
