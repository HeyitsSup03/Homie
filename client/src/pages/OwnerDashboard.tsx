import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyListingsApi, Listing } from '../api/listingApi';
import logoImg from '../assets/logo.png';
import ownerBg from '../assets/owner-bg.jpeg';

// ── Amenity display limit ──────────────────────────────────────────────────
const MAX_VISIBLE_AMENITIES = 3;

// ── Skeleton Card ──────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-[18px] p-6 animate-pulse"
    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
    <div className="h-3 bg-gray-100 rounded w-4/5 mb-5" />
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-100 rounded-full w-16" />
      <div className="h-6 bg-gray-100 rounded-full w-14" />
      <div className="h-6 bg-gray-100 rounded-full w-20" />
    </div>
    <div className="flex justify-between items-center">
      <div className="h-5 bg-gray-200 rounded w-24" />
      <div className="h-5 bg-gray-100 rounded-full w-20" />
    </div>
  </div>
);

// ── Listing Card ────────────────────────────────────────────────────────────
const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const visibleAmenities = listing.amenities.slice(0, MAX_VISIBLE_AMENITIES);
  const extraCount = listing.amenities.length - MAX_VISIBLE_AMENITIES;

  const formattedDate = new Date(listing.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="bg-white rounded-[18px] p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Title + availability */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1rem] font-bold text-[#1a1a1a] leading-snug flex-1">
          {listing.title}
        </h3>
        <span
          className={`flex-shrink-0 flex items-center gap-[5px] text-[0.7rem] font-semibold px-3 py-[4px] rounded-full
            ${listing.isAvailable
              ? 'bg-[#eaf3ea] text-[#3a7a3a]'
              : 'bg-[#f0f0f0] text-[#888]'
            }`}
        >
          <span className={`w-[6px] h-[6px] rounded-full ${listing.isAvailable ? 'bg-[#4A7546]' : 'bg-[#aaa]'}`} />
          {listing.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Address */}
      <p className="text-[0.8rem] text-[#888] leading-relaxed flex gap-2 items-start">
        <span className="mt-[1px]">📍</span>
        <span>{listing.address}</span>
      </p>

      {/* Description */}
      {listing.description && (
        <p className="text-[0.8rem] text-[#aaa] leading-relaxed line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Amenity pills */}
      {listing.amenities.length > 0 && (
        <div className="flex flex-wrap gap-[6px]">
          {visibleAmenities.map(amenity => (
            <span
              key={amenity}
              className="px-3 py-[4px] bg-[#f5f2ee] text-[#555] text-[0.72rem] rounded-full font-medium"
            >
              {amenity}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="px-3 py-[4px] bg-[#f5f2ee] text-[#888] text-[0.72rem] rounded-full font-medium">
              +{extraCount} more
            </span>
          )}
        </div>
      )}

      {/* Rent + date */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#f5f2ee]">
        <span className="text-[1rem] font-bold text-[#4A7546]">
          ₹{listing.rent.toLocaleString('en-IN')}
          <span className="text-[0.72rem] font-normal text-[#aaa]">/mo</span>
        </span>
        <span className="text-[0.7rem] text-[#bbb]">Listed {formattedDate}</span>
      </div>
    </div>
  );
};

// ── Empty State ────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-6xl mb-5">🏠</div>
    <h2 className="text-[1.2rem] font-bold text-[#1a1a1a] mb-2">No listings yet</h2>
    <p className="text-[0.85rem] text-[#aaa] mb-7 max-w-[280px]">
      You haven't added any properties. Add your first listing to get started.
    </p>
    <Link
      to="/owner/create-listing"
      className="px-6 py-3 bg-[#4A7546] text-white text-[0.85rem] font-semibold rounded-full hover:bg-[#3a5e37] transition-colors duration-200"
    >
      + Add Your First Listing
    </Link>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────
const OwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyListingsApi()
      .then(data => { if (!cancelled) setListings(data); })
      .catch(() => { if (!cancelled) setError('Failed to load listings. Please try again.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${ownerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-30 bg-white border-b border-[#f0ede8]"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-[full] mx-4 px-8 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={logoImg} alt="Homie" className="h-[44px]  object-contain" />
          </Link>

          {/* Owner info + logout */}
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-[0.82rem] text-[#888]">
                Hello, <span className="font-semibold text-[#1a1a1a]">{user.name}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[0.8rem] font-semibold text-[#555] border border-[#d4cfc8] rounded-full hover:bg-[#f5f2ee] hover:text-[#1a1a1a] transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-[1200px] mx-auto px-8 py-10">

        {/* Page title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[1.8rem] font-extrabold text-[#1a1a1a] tracking-[-0.02em]">
              Your Listings
            </h1>
            {!isLoading && listings.length > 0 && (
              <p className="text-[0.82rem] text-[#aaa] mt-1">
                {listings.length} {listings.length === 1 ? 'property' : 'properties'} listed
              </p>
            )}
          </div>

          <Link
            to="/owner/create-listing"
            className="flex items-center gap-2 px-5 py-[10px] bg-[#4A7546] text-white text-[0.85rem] font-semibold rounded-full hover:bg-[#3a5e37] transition-colors duration-200 shadow-sm"
          >
            <span className="text-[1.1rem] leading-none">+</span>
            Add New Listing
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <p className="text-[0.85rem] text-red-500 mb-6">{error}</p>
        )}

        {/* Loading: 3 skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && listings.length === 0 && <EmptyState />}

        {/* Listing cards grid */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default OwnerDashboard;
