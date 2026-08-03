import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi, uploadResumePdfApi } from '../api/userApi';
import { getSeekerInterestsApi, deleteInterestApi, Interest } from '../api/interestApi';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import logoImg from '../assets/logo.png';

const SeekerProfile: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'profile' | 'applications'
  const [activeTab, setActiveTab] = useState<'profile' | 'applications'>('profile');

  // Profile Form State
  const [occupation, setOccupation] = useState(user?.occupation ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl ?? '');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Applications Tab State
  const [applications, setApplications] = useState<Interest[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [activeChat, setActiveChat] = useState<{
    interestId: string;
    partnerName: string;
    listingTitle?: string;
  } | null>(null);

  // Fetch applications when tab switches to 'applications' or on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoadingApps(true);
    getSeekerInterestsApi()
      .then(data => {
        if (!cancelled) setApplications(data);
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setIsLoadingApps(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleDeleteApplication = async (interestId: string) => {
    if (!window.confirm('Delete this application record and chat history?')) return;
    try {
      await deleteInterestApi(interestId);
      setApplications(prev => prev.filter(app => app._id !== interestId));
    } catch {
      alert('Failed to delete application. Please try again.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('PDF file size must be less than 5MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const url = await uploadResumePdfApi(file);
      setResumeUrl(url);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message ?? 'Failed to upload PDF resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await updateProfileApi({
        occupation,
        phone,
        bio,
        resumeUrl,
      });

      // Refresh AuthContext user state from backend
      await refreshUser();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format full static URL for opening PDF
  const fullResumeUrl = resumeUrl.startsWith('http')
    ? resumeUrl
    : `http://localhost:5000${resumeUrl}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-[1000] bg-white border-b border-[#f0ede8]"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="w-full px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex-shrink-0">
              <img src={logoImg} alt="Homie" className="h-[44px] object-contain" />
            </Link>
            <Link
              to="/seeker/dashboard"
              className="text-[0.82rem] font-semibold text-[#555] hover:text-[#1a1a1a] transition-colors"
            >
              ← Back to Map Search
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[0.82rem] text-[#888]">
              Logged in as <span className="font-semibold text-[#1a1a1a]">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[0.8rem] font-semibold text-[#555] border border-[#d4cfc8] rounded-full hover:bg-[#f5f2ee] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Profile Body ── */}
      <main className="max-w-[800px] mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-[1.8rem] font-extrabold text-[#1a1a1a] tracking-[-0.02em] mb-1">
            Seeker Dashboard & Profile 👤
          </h1>
          <p className="text-[0.85rem] text-[#888]">
            Manage your trust profile, tenant resume, and view all your submitted property applications.
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-2 mb-8 border-b border-[#e5e0d8] pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 text-[0.88rem] font-bold rounded-full transition-colors ${activeTab === 'profile'
                ? 'bg-[#4A7546] text-white shadow-sm'
                : 'text-[#666] hover:bg-[#eae7e1]'
              }`}
          >
            Edit Profile 👤
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 text-[0.88rem] font-bold rounded-full transition-colors flex items-center gap-2 ${activeTab === 'applications'
                ? 'bg-[#4A7546] text-white shadow-sm'
                : 'text-[#666] hover:bg-[#eae7e1]'
              }`}
          >
            <span>My Applications 📋</span>
            {applications.length > 0 && (
              <span className={`px-2 py-[1px] text-[0.7rem] rounded-full font-extrabold ${activeTab === 'applications' ? 'bg-white text-[#4A7546]' : 'bg-[#4A7546] text-white'
                }`}>
                {applications.length}
              </span>
            )}
          </button>
        </div>

        {/* ════════ TAB 1: EDIT PROFILE ════════ */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Profile Card */}
            <div
              className="bg-white rounded-[20px] p-7 flex flex-col gap-5"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <h2 className="text-[1rem] font-bold text-[#1a1a1a] pb-3 border-b border-[#f5f2ee]">
                Personal & Employment Info
              </h2>

              {/* Name & Email (Read only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.75rem] font-semibold text-[#888] mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name ?? ''}
                    className="w-full px-4 py-2.5 text-[0.85rem] border border-[#e5e0d8] rounded-xl bg-[#faf9f6] text-[#888] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-semibold text-[#888] mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email ?? ''}
                    className="w-full px-4 py-2.5 text-[0.85rem] border border-[#e5e0d8] rounded-xl bg-[#faf9f6] text-[#888] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Occupation & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.78rem] font-semibold text-[#1a1a1a] mb-1">
                    Occupation / Work Role
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer, Designer, Student"
                    className="w-full px-4 py-2.5 text-[0.85rem] border border-[#d4cfc8] rounded-xl focus:outline-none focus:border-[#4A7546] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[0.78rem] font-semibold text-[#1a1a1a] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 text-[0.85rem] border border-[#d4cfc8] rounded-xl focus:outline-none focus:border-[#4A7546] transition-colors"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-[#1a1a1a] mb-1">
                  Short Bio / Living Preferences
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell property owners a bit about yourself (e.g. quiet tenant, non-smoker, preferred move-in date)..."
                  className="w-full px-4 py-2.5 text-[0.85rem] border border-[#d4cfc8] rounded-xl focus:outline-none focus:border-[#4A7546] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Tenant Resume PDF Upload Card */}
            <div
              className="bg-white rounded-[20px] p-7 flex flex-col gap-4"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <div>
                <h2 className="text-[1rem] font-bold text-[#1a1a1a] mb-1">
                  Tenant Resume PDF 📄
                </h2>
                <p className="text-[0.78rem] text-[#888]">
                  Upload your employment proof, ID copy, or tenant resume (PDF format, max 5MB).
                </p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#d4cfc8] rounded-[16px] p-6 bg-[#faf9f6] flex flex-col items-center justify-center text-center transition-colors hover:border-[#4A7546]">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-[0.85rem] font-semibold text-[#1a1a1a] mb-1">
                  {isUploading ? 'Uploading PDF resume…' : 'Choose a PDF file to upload'}
                </p>
                <p className="text-[0.72rem] text-[#aaa] mb-4">PDF files only (max 5MB)</p>

                <label className="cursor-pointer px-5 py-2.5 bg-[#4A7546] text-white text-[0.82rem] font-semibold rounded-full hover:bg-[#3a5e37] transition-colors shadow-sm">
                  {isUploading ? 'Uploading…' : 'Select PDF File'}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <p className="text-[0.78rem] text-red-500 font-medium">{uploadError}</p>
              )}

              {/* Uploaded Resume Status / View Button */}
              {resumeUrl && (
                <div className="flex items-center justify-between bg-[#eaf3ea] rounded-xl px-4 py-3 border border-[#c2e0c2]">
                  <div className="flex items-center gap-2 text-[0.82rem] font-semibold text-[#3a7a3a]">
                    <span>✅ Resume Uploaded</span>
                  </div>
                  <a
                    href={fullResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-[#4A7546] text-white text-[0.78rem] font-bold rounded-full hover:bg-[#3a5e37] transition-colors shadow-sm"
                  >
                    📄 View Resume PDF
                  </a>
                </div>
              )}
            </div>

            {/* Feedback messages */}
            {saveSuccess && (
              <div className="p-4 bg-[#eaf3ea] text-[#3a7a3a] text-[0.85rem] font-bold rounded-xl text-center">
                Profile updated successfully! ✨
              </div>
            )}

            {saveError && (
              <div className="p-4 bg-red-50 text-red-600 text-[0.85rem] font-semibold rounded-xl text-center">
                {saveError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full py-3.5 bg-[#4A7546] text-white text-[0.92rem] font-bold rounded-full hover:bg-[#3a5e37] disabled:opacity-50 transition-colors shadow-md"
            >
              {isSaving ? 'Saving Changes…' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* ════════ TAB 2: MY APPLICATIONS ════════ */}
        {activeTab === 'applications' && (
          <div className="flex flex-col gap-6">

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending', 'accepted', 'declined'] as const).map(filterKey => {
                const count =
                  filterKey === 'all'
                    ? applications.length
                    : applications.filter(a => a.status === filterKey).length;
                const label =
                  filterKey === 'all'
                    ? 'All Requests'
                    : filterKey === 'pending'
                      ? 'Pending ⏳'
                      : filterKey === 'accepted'
                        ? 'Accepted '
                        : 'Declined ';

                return (
                  <button
                    key={filterKey}
                    onClick={() => setAppFilter(filterKey)}
                    className={`px-4 py-1.5 rounded-full text-[0.78rem] font-bold transition-all border ${appFilter === filterKey
                        ? 'bg-[#4A7546] border-[#4A7546] text-white shadow-sm'
                        : 'bg-white border-[#d4cfc8] text-[#666] hover:border-[#4A7546]'
                      }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Loading */}
            {isLoadingApps && (
              <p className="text-[0.85rem] text-[#aaa] text-center py-10">Loading your applications…</p>
            )}

            {/* Empty State */}
            {!isLoadingApps && applications.length === 0 && (
              <div className="bg-white rounded-[20px] p-10 text-center shadow-sm">
                <div className="text-5xl mb-3">📬</div>
                <h3 className="text-[1rem] font-bold text-[#1a1a1a] mb-1">No applications yet</h3>
                <p className="text-[0.82rem] text-[#aaa] mb-6">
                  Search for rental properties on the map and click "Express Interest" to get started!
                </p>
                <Link
                  to="/seeker/dashboard"
                  className="px-6 py-2.5 bg-[#4A7546] text-white text-[0.82rem] font-bold rounded-full hover:bg-[#3a5e37] transition-colors"
                >
                  Explore Map Search 🗺️
                </Link>
              </div>
            )}

            {/* Applications Grid */}
            {!isLoadingApps && applications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {applications
                  .filter(app => appFilter === 'all' || app.status === appFilter)
                  .map(app => {
                    const listing = typeof app.listing === 'object' ? app.listing : null;
                    const owner = typeof app.owner === 'object' ? app.owner : null;
                    const isDeletedByOwner = !listing;
                    const coverImg = listing?.images?.[0];
                    const fullCoverUrl = coverImg
                      ? coverImg.startsWith('http') ? coverImg : `http://localhost:5000${coverImg}`
                      : null;

                    return (
                      <div
                        key={app._id}
                        className={`bg-white rounded-[20px] p-5 flex flex-col justify-between gap-4 border transition-all ${isDeletedByOwner ? 'border-red-200 bg-[#fdfaf8]' : 'border-[#f0ede8] hover:shadow-md'
                          }`}
                        style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.04)' }}
                      >
                        {/* Property preview header */}
                        <div className="flex gap-4 items-start">
                          {fullCoverUrl ? (
                            <img
                              src={fullCoverUrl}
                              alt={listing?.title ?? 'Deleted Listing'}
                              className="w-20 h-20 rounded-[14px] object-cover flex-shrink-0 bg-[#faf9f6]"
                            />
                          ) : (
                            <div className={`w-20 h-20 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 ${isDeletedByOwner ? 'bg-red-50 text-red-400' : 'bg-[#eaf3ea] text-[#4A7546]'
                              }`}>
                              {isDeletedByOwner ? '🏚️' : '🏠'}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2.5 py-0.5 text-[0.68rem] font-bold rounded-full flex-shrink-0 ${isDeletedByOwner
                                  ? 'bg-[#fdf0f0] text-[#c77]'
                                  : app.status === 'pending'
                                    ? 'bg-[#fff8e6] text-[#b8840a]'
                                    : app.status === 'accepted'
                                      ? 'bg-[#eaf3ea] text-[#3a7a3a]'
                                      : 'bg-[#fdf0f0] text-[#c77]'
                                }`}>
                                {isDeletedByOwner ? 'Unavailable ⛔' : app.status === 'pending' ? 'Pending ⏳' : app.status === 'accepted' ? 'Accepted ✅' : 'Declined ❌'}
                              </span>
                              <span className="text-[0.68rem] text-[#bbb]">
                                {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>

                            {isDeletedByOwner ? (
                              <div>
                                <h4 className="text-[0.88rem] font-bold text-[#c77] mb-1">
                                  Listing Removed
                                </h4>
                                <p className="text-[0.75rem] text-red-600 font-medium leading-tight">
                                  This listing has been deleted or sold by the owner.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-[0.92rem] font-bold text-[#1a1a1a] line-clamp-1">
                                  {listing.title}
                                </h4>
                                <p className="text-[0.78rem] text-[#4A7546] font-semibold mb-0.5">
                                  ₹{listing.rent?.toLocaleString('en-IN')}/month
                                </p>
                                <p className="text-[0.72rem] text-[#888] line-clamp-1">
                                  📍 {listing.address}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer & Actions */}
                        <div className="pt-3 border-t border-[#f5f2ee] flex items-center justify-between gap-2">
                          {!isDeletedByOwner ? (
                            <Link
                              to={`/listings/${listing._id}`}
                              className="text-[0.75rem] font-semibold text-[#4A7546] hover:underline"
                            >
                              View Listing →
                            </Link>
                          ) : (
                            <span className="text-[0.72rem] text-[#aaa]">Chat Disabled</span>
                          )}

                          <div className="flex items-center gap-2">
                            {/* Delete Application Button */}
                            <button
                              onClick={() => handleDeleteApplication(app._id)}
                              className="p-1 text-[0.85rem] text-[#aaa] hover:text-red-500 transition-colors"
                              title="Delete application record"
                            >
                              🗑️
                            </button>

                            {!isDeletedByOwner && app.status === 'accepted' && (
                              <button
                                onClick={() =>
                                  setActiveChat({
                                    interestId: app._id,
                                    partnerName: owner?.name ?? 'Property Host',
                                    listingTitle: listing?.title,
                                  })
                                }
                                className="px-4 py-1.5 bg-[#4A7546] text-white text-[0.75rem] font-bold rounded-full hover:bg-[#3a5e37] transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <span>💬</span> Open Chat
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
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

export default SeekerProfile;
