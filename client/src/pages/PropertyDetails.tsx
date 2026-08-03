import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getListingByIdApi, Listing } from '../api/listingApi';
import {
  expressInterestApi,
  getSeekerInterestsApi,
  InterestStatus,
} from '../api/interestApi';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import logoImg from '../assets/logo.png';

// ── Fix Leaflet default icon (broken by Vite bundler) ─────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Amenity icon map ───────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, string> = {
  WiFi: '📶',
  AC: '❄️',
  Parking: '🅿️',
  Laundry: '🧺',
  Security: '🔒',
  Gym: '🏋️',
  Pool: '🏊',
  Elevator: '🛗',
  Pets: '🐾',
  'Water 24/7': '💧',
  CCTV: '📷',
  Balcony: '🌿',
  Kitchen: '🍳',
  Furnished: '🛋️',
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const PageSkeleton: React.FC = () => (
  <div className="max-w-[1100px] mx-auto px-6 py-10 flex gap-8">
    <div className="flex-1 flex flex-col gap-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-[320px] w-full rounded-[18px]" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="w-[320px] flex-shrink-0 flex flex-col gap-4">
      <Skeleton className="h-[200px] w-full rounded-[18px]" />
      <Skeleton className="h-[140px] w-full rounded-[18px]" />
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Interest state (Seeker only) ────────────────────────────────────────
  const [interestStatus, setInterestStatus] = useState<InterestStatus | null>(null);
  const [interestId, setInterestId] = useState<string | null>(null);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  // ── Chat Drawer State ───────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!id) { setError('Invalid listing ID.'); setIsLoading(false); return; }
    getListingByIdApi(id)
      .then(setListing)
      .catch(() => setError('Property not found or has been removed.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Fetch seeker's existing interest for this listing
  useEffect(() => {
    if (user?.role !== 'seeker' || !id) return;
    getSeekerInterestsApi().then(interests => {
      const existing = interests.find(
        i => (typeof i.listing === 'object' ? i.listing._id : i.listing) === id
      );
      if (existing) {
        setInterestStatus(existing.status);
        setInterestId(existing._id);
      }
    }).catch(() => { }); // Silent — don't block the detail page
  }, [id, user?.role]);

  const handleExpressInterest = async () => {
    if (!id || isSubmittingInterest) return;
    setInterestError(null);
    setIsSubmittingInterest(true);
    try {
      const interest = await expressInterestApi(id);
      setInterestStatus(interest.status);
      setInterestId(interest._id);
    } catch (err: any) {
      setInterestError(err?.response?.data?.message ?? 'Failed to send interest. Please try again.');
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const backHref = user?.role === 'owner' ? '/owner/dashboard' : '/seeker/dashboard';

  // ── Image Carousel State ──────────────────────────────────────────────────
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = listing?.images ?? [];
  const hasImages = images.length > 0;

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const lat = listing?.location.coordinates[1];
  const lng = listing?.location.coordinates[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-[1000] bg-white border-b border-[#f0ede8]"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="w-full px-6 h-[64px] flex items-center gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={logoImg} alt="Homie" className="h-[44px] object-contain" />
          </Link>

          <button
            onClick={() => navigate(backHref)}
            className="flex items-center gap-1 text-[0.82rem] font-semibold text-[#555] hover:text-[#1a1a1a] transition-colors"
          >
            ← Back to Dashboard
          </button>

          <div className="ml-auto flex items-center gap-3">
            {user?.name && (
              <span className="text-[0.82rem] text-[#888]">
                Hello, <span className="font-semibold text-[#1a1a1a]">{user.name}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      {isLoading && <PageSkeleton />}

      {/* Error / 404 */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-4">🏚️</div>
          <h2 className="text-[1.3rem] font-bold text-[#1a1a1a] mb-2">Property not found</h2>
          <p className="text-[0.85rem] text-[#aaa] mb-6">{error}</p>
          <button
            onClick={() => navigate(backHref)}
            className="px-6 py-3 bg-[#4A7546] text-white text-[0.85rem] font-semibold rounded-full hover:bg-[#3a5e37] transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Listing detail */}
      {!isLoading && listing && (
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT: Main content ── */}
            <div className="flex-1 flex flex-col gap-7 min-w-0">

              {/* Photo Gallery Carousel */}
              {hasImages && (
                <div className="flex flex-col gap-3">
                  <div className="relative w-full h-[380px] rounded-[22px] overflow-hidden bg-[#1a1a1a] border border-[#f0ede8] shadow-md group">
                    <img
                      src={images[activeImageIndex].startsWith('http') ? images[activeImageIndex] : `http://localhost:5000${images[activeImageIndex]}`}
                      alt={`${listing.title} - Photo ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* Prev / Next controls if multiple images */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                          title="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                          title="Next photo"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-[0.72rem] font-bold backdrop-blur-sm">
                          {activeImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {images.map((img, idx) => {
                        const fullUrl = img.startsWith('http') ? img : `http://localhost:5000${img}`;
                        const isActive = idx === activeImageIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[#4A7546] ring-2 ring-[#4A7546]/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                          >
                            <img src={fullUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Title + badges */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className={`flex items-center gap-[5px] text-[0.72rem] font-semibold px-3 py-[4px] rounded-full
                      ${listing.isAvailable ? 'bg-[#eaf3ea] text-[#3a7a3a]' : 'bg-[#f0f0f0] text-[#888]'}`}
                  >
                    <span className={`w-[6px] h-[6px] rounded-full ${listing.isAvailable ? 'bg-[#4A7546]' : 'bg-[#aaa]'}`} />
                    {listing.isAvailable ? 'Available Now' : 'Unavailable'}
                  </span>
                  <span className="text-[0.72rem] text-[#bbb]">
                    Listed {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-[1.8rem] font-extrabold text-[#1a1a1a] tracking-[-0.02em] leading-tight mb-2">
                  {listing.title}
                </h1>
                <p className="text-[0.9rem] text-[#888] flex gap-2 items-start">
                  <span>📍</span><span>{listing.address}</span>
                </p>
              </div>

              {/* Map */}
              {lat !== undefined && lng !== undefined && (
                <div className="rounded-[18px] overflow-hidden border border-[#f0ede8]" style={{ height: '320px' }}>
                  <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    className="w-full h-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>
                        <strong>{listing.title}</strong><br />
                        {listing.address}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div>
                  <h2 className="text-[1rem] font-bold text-[#1a1a1a] mb-4">What's included</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.amenities.map(amenity => (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 bg-white rounded-[12px] px-4 py-3 border border-[#f0ede8]"
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                      >
                        <span className="text-[1.1rem]">{AMENITY_ICONS[amenity] ?? '✅'}</span>
                        <span className="text-[0.82rem] font-medium text-[#1a1a1a]">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-[1rem] font-bold text-[#1a1a1a] mb-3">About this property</h2>
                  <p className="text-[0.88rem] text-[#555] leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Rent + Owner card ── */}
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-[80px]">

              {/* Rent card */}
              <div
                className="bg-white rounded-[18px] p-6 flex flex-col gap-4"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
              >
                <div>
                  <span className="text-[2rem] font-extrabold text-[#4A7546] tracking-[-0.02em]">
                    ₹{listing.rent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[0.85rem] text-[#aaa] ml-1">/ month</span>
                </div>

                <div className="border-t border-[#f5f2ee] pt-4 text-[0.8rem] text-[#888] space-y-1">
                  <p>📍 {listing.address}</p>
                </div>

                {/* CTA — Express Interest */}
                {user?.role === 'seeker' && (
                  <div className="flex flex-col gap-2">
                    {interestStatus === null && (
                      <button
                        onClick={handleExpressInterest}
                        disabled={isSubmittingInterest}
                        className="w-full py-3 bg-[#4A7546] text-white text-[0.88rem] font-bold rounded-full hover:bg-[#3a5e37] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmittingInterest ? 'Sending…' : 'Express Interest'}
                      </button>
                    )}
                    {interestStatus === 'pending' && (
                      <div className="w-full py-3 bg-[#f5f2ee] text-[#888] text-[0.88rem] font-bold rounded-full text-center">
                        Interest Pending ⏳
                      </div>
                    )}
                    {interestStatus === 'accepted' && (
                      <div className="flex flex-col gap-2">
                        <div className="w-full py-2 bg-[#eaf3ea] text-[#3a7a3a] text-[0.8rem] font-bold rounded-full text-center">
                          Accepted  — Match Unlocked!
                        </div>
                        <button
                          onClick={() => setIsChatOpen(true)}
                          className="w-full py-3 bg-[#4A7546] text-white text-[0.88rem] font-bold rounded-full hover:bg-[#3a5e37] transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                          <span>💬</span> Chat with Owner
                        </button>
                      </div>
                    )}
                    {interestStatus === 'declined' && (
                      <div className="w-full py-3 bg-[#f5f0f0] text-[#c77] text-[0.88rem] font-bold rounded-full text-center">
                        Request Declined ❌
                      </div>
                    )}
                    {interestError && (
                      <p className="text-[0.75rem] text-red-500 text-center">{interestError}</p>
                    )}
                  </div>
                )}
                {user?.role === 'owner' && (
                  <div className="w-full py-3 bg-[#f5f2ee] text-[#aaa] text-[0.85rem] rounded-full text-center">
                    Your property listing
                  </div>
                )}
              </div>

              {/* Owner contact card */}
              <div
                className="bg-white rounded-[18px] p-5 flex flex-col gap-3"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              >
                <h3 className="text-[0.85rem] font-bold text-[#1a1a1a]">Hosted by</h3>

                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-[#e8ede8] flex items-center justify-center text-[#4A7546] font-bold text-[1rem] flex-shrink-0">
                    {(listing.ownerDetails ?? (listing.owner as any))?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-[0.88rem] font-semibold text-[#1a1a1a]">
                      {(listing.ownerDetails ?? (listing.owner as any))?.name ?? 'Property Owner'}
                    </p>
                    <p className="text-[0.72rem] text-[#aaa]">Owner</p>
                  </div>
                </div>

                {((listing.ownerDetails ?? (listing.owner as any))?.email) && (
                  <a
                    href={`mailto:${(listing.ownerDetails ?? (listing.owner as any)).email}`}
                    className="flex items-center gap-2 text-[0.8rem] text-[#555] hover:text-[#4A7546] transition-colors"
                  >
                    <span>✉️</span>
                    <span>{(listing.ownerDetails ?? (listing.owner as any))?.email}</span>
                  </a>
                )}

                {((listing.ownerDetails ?? (listing.owner as any))?.phone) && (
                  <a
                    href={`tel:${(listing.ownerDetails ?? (listing.owner as any)).phone}`}
                    className="flex items-center gap-2 text-[0.8rem] text-[#555] hover:text-[#4A7546] transition-colors"
                  >

                    <span>{(listing.ownerDetails ?? (listing.owner as any))?.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer Modal */}
      {isChatOpen && interestId && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          interestId={interestId}
          partnerName={(listing?.ownerDetails ?? (listing?.owner as any))?.name ?? 'Owner'}
          listingTitle={listing?.title}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
