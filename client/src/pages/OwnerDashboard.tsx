import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyListingsApi, Listing } from '../api/listingApi';
import {
  getOwnerInterestsApi,
  updateInterestStatusApi,
  Interest,
} from '../api/interestApi';
import { ChatDrawer } from '../components/chat/ChatDrawer';
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

      {/* Rent + date + View Details */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#f5f2ee]">
        <span className="text-[1rem] font-bold text-[#4A7546]">
          ₹{listing.rent.toLocaleString('en-IN')}
          <span className="text-[0.72rem] font-normal text-[#aaa]">/mo</span>
        </span>
        <Link
          to={`/listings/${listing._id}`}
          className="text-[0.72rem] font-semibold text-[#4A7546] hover:underline"
        >
          View Details →
        </Link>
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

  // ── Interest inbox state ───────────────────────────────────────
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Chat state ─────────────────────────────────────────────────
  const [activeChat, setActiveChat] = useState<{
    interestId: string;
    partnerName: string;
    listingTitle?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyListingsApi()
      .then(data => { if (!cancelled) setListings(data); })
      .catch(() => { if (!cancelled) setError('Failed to load listings. Please try again.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    // Fetch interest inbox
    getOwnerInterestsApi()
      .then(data => { if (!cancelled) setInterests(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setInterestsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const handleStatusUpdate = async (interestId: string, status: 'accepted' | 'declined') => {
    setUpdatingId(interestId);
    try {
      const updated = await updateInterestStatusApi(interestId, status);
      setInterests(prev =>
        prev.map(i => i._id === interestId ? updated : i)
      );
    } catch {}
    finally { setUpdatingId(null); }
  };

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

        {/* ── Interested Seekers Inbox ── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[1.4rem] font-extrabold text-[#1a1a1a] tracking-[-0.02em]">
              Interested Seekers
            </h2>
            {interests.length > 0 && (
              <span className="px-3 py-1 bg-[#4A7546] text-white text-[0.72rem] font-bold rounded-full">
                {interests.filter(i => i.status === 'pending').length} new
              </span>
            )}
          </div>

          {interestsLoading && (
            <p className="text-[0.85rem] text-[#aaa]">Loading requests…</p>
          )}

          {!interestsLoading && interests.length === 0 && (
            <div className="bg-white rounded-[18px] px-8 py-10 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="text-4xl mb-3">📬</div>
              <p className="text-[0.9rem] font-semibold text-[#1a1a1a] mb-1">No interest requests yet</p>
              <p className="text-[0.8rem] text-[#aaa]">When seekers express interest in your listings, they'll appear here.</p>
            </div>
          )}

          {!interestsLoading && interests.length > 0 && (
            <div className="flex flex-col gap-4">
              {interests.map(interest => {
                const seeker = typeof interest.seeker === 'object' ? interest.seeker : null;
                const listing = typeof interest.listing === 'object' ? interest.listing : null;
                const isPending = interest.status === 'pending';
                const isUpdating = updatingId === interest._id;

                return (
                  <div
                    key={interest._id}
                    className="bg-white rounded-[18px] p-5 flex flex-col gap-4"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex flex-wrap items-start gap-4 justify-between">
                      {/* Seeker info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e8ede8] flex items-center justify-center text-[#4A7546] font-bold text-[1rem] flex-shrink-0">
                          {seeker?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-[0.9rem] font-bold text-[#1a1a1a]">{seeker?.name ?? 'Unknown'}</p>
                          {seeker?.email && <p className="text-[0.75rem] text-[#888]">{seeker.email}</p>}
                          {seeker?.phone && <p className="text-[0.75rem] text-[#888]">📞 {seeker.phone}</p>}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`px-3 py-1 text-[0.72rem] font-bold rounded-full flex-shrink-0
                        ${ interest.status === 'pending' ? 'bg-[#fff8e6] text-[#b8840a]'
                          : interest.status === 'accepted' ? 'bg-[#eaf3ea] text-[#3a7a3a]'
                          : 'bg-[#fdf0f0] text-[#c77]'}`}>
                        { interest.status === 'pending' ? 'Pending ⏳'
                          : interest.status === 'accepted' ? 'Accepted ✅'
                          : 'Declined ❌' }
                      </span>
                    </div>

                    {/* Property info */}
                    {listing && (
                      <div className="flex items-center gap-3 text-[0.8rem] text-[#555] bg-[#faf9f6] rounded-[10px] px-4 py-2">
                        <span className="font-semibold text-[#1a1a1a]">{listing.title}</span>
                        <span className="text-[#bbb]">·</span>
                        <span className="text-[#4A7546] font-semibold">₹{listing.rent.toLocaleString('en-IN')}/mo</span>
                        <Link to={`/listings/${listing._id}`} className="ml-auto text-[0.72rem] text-[#4A7546] hover:underline">
                          View →
                        </Link>
                      </div>
                    )}

                    {/* Accept / Decline actions */}
                    {isPending && (
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleStatusUpdate(interest._id, 'declined')}
                          disabled={isUpdating}
                          className="px-5 py-2 text-[0.8rem] font-semibold text-[#c77] border border-[#f0c0c0] rounded-full hover:bg-[#fdf0f0] disabled:opacity-50 transition-colors"
                        >
                          {isUpdating ? '…' : 'Decline'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(interest._id, 'accepted')}
                          disabled={isUpdating}
                          className="px-5 py-2 text-[0.8rem] font-semibold text-white bg-[#4A7546] rounded-full hover:bg-[#3a5e37] disabled:opacity-50 transition-colors"
                        >
                          {isUpdating ? '…' : 'Accept'}
                        </button>
                      </div>
                    )}

                    {interest.status === 'accepted' && (
                      <div className="flex items-center justify-between pt-2 border-t border-[#f5f2ee]">
                        <span className="text-[0.75rem] text-[#4A7546] font-medium">
                          ✨ Match unlocked
                        </span>
                        <button
                          onClick={() =>
                            setActiveChat({
                              interestId: interest._id,
                              partnerName: seeker?.name ?? 'Seeker',
                              listingTitle: listing?.title,
                            })
                          }
                          className="px-4 py-1.5 text-[0.78rem] font-bold text-white bg-[#4A7546] rounded-full hover:bg-[#3a5e37] transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>💬</span> Open Chat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

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

export default OwnerDashboard;
