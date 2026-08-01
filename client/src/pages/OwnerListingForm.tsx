import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/button';
import { useAuth } from '../context/AuthContext';
import { createListingApi, CreateListingPayload } from '../api/listingApi';
import { getErrorMessage } from '../api/authApi';
import logoImg from '../assets/logo.png';
import bgImg from '../assets/listing1.PNG';

// ── Amenity options ────────────────────────────────────────────────────────
const AMENITY_OPTIONS = [
    'WiFi', 'AC', 'Parking', 'Laundry',
    'Security', 'Elevator', 'Power Backup', 'Furnished',
];

interface Step1Data {
    title: string;
    address: string;
    rent: string;
    description: string;
    amenities: string[];
}

interface Step2Data {
    name: string;
    phone: string;
}

const OwnerListingForm: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');

    const [step1, setStep1] = useState<Step1Data>({
        title: '',
        address: '',
        rent: '',
        description: '',
        amenities: [],
    });

    const [step2, setStep2] = useState<Step2Data>({
        name: user?.name ?? '',
        phone: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync user.name when auth context finishes loading/rehydrating
    React.useEffect(() => {
        if (user?.name && !step2.name) {
            setStep2(prev => ({ ...prev, name: user.name }));
        }
    }, [user?.name]);

    // ── Validation ──────────────────────────────────────────────────────────
    const step1Valid =
        step1.title.trim() !== '' &&
        step1.address.trim() !== '' &&
        step1.rent.trim() !== '' &&
        Number(step1.rent) > 0;

    const step2Valid = step2.name.trim() !== '' && step2.phone.trim() !== '';

    // ── Amenity toggle ──────────────────────────────────────────────────────
    const toggleAmenity = (amenity: string) => {
        setStep1(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    // ── Slide transitions ───────────────────────────────────────────────────
    const animateTransition = (dir: 'forward' | 'back', toStep: 1 | 2) => {
        if (isAnimating) return;
        setAnimDir(dir);
        setIsAnimating(true);
        setTimeout(() => {
            setStep(toStep);
            setIsAnimating(false);
        }, 320);
    };

    const goToStep2 = () => { if (step1Valid) animateTransition('forward', 2); };
    const goBackToStep1 = () => animateTransition('back', 1);

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!step1Valid) {
            setError('Please fill in all required property details in Step 1.');
            return;
        }

        if (!step2Valid) {
            setError('Please enter your full name and phone number.');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        const payload: CreateListingPayload = {
            title: step1.title.trim(),
            address: step1.address.trim(),
            rent: Number(step1.rent),
            description: step1.description.trim() || undefined,
            amenities: step1.amenities,
        };
        try {
            await createListingApi(payload);
            navigate('/owner/dashboard', { replace: true });
        } catch (err) {
            setError(getErrorMessage(err));
            setIsSubmitting(false);
        }
    };

    // ── Slide animation style ───────────────────────────────────────────────
    const slideStyle: React.CSSProperties = isAnimating
        ? {
            transform: animDir === 'forward' ? 'translateX(-52px)' : 'translateX(52px)',
            opacity: 0,
            transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1), opacity 320ms ease',
        }
        : {
            transform: 'translateX(0)',
            opacity: 1,
            transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1), opacity 320ms ease',
        };

    // ── Shared field styles ─────────────────────────────────────────────────
    const inputCls =
        'w-full border-0 border-b border-[#d4cfc8] bg-transparent text-[0.88rem] text-[#1a1a1a] pb-[7px] focus:outline-none focus:border-[#4A7546] transition-colors duration-200 placeholder:text-[#c0bab3]';
    const labelCls = 'block text-[0.68rem] font-semibold text-[#aaa] mb-[6px] uppercase tracking-[0.08em]';

    return (
        <div className="relative w-screen h-screen overflow-hidden flex">

            {/* ══ LEFT: illustration panel ══ */}
            <div
                className="relative w-1/2 flex-shrink-0"
                style={{
                    backgroundImage: `url(${bgImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Logo overlay */}
                <div className="absolute top-5 left-6 z-10">
                    <Link to="/">
                        <img src={logoImg} alt="Homie" className="h-[50px] object-contain cursor-pointer" />
                    </Link>
                </div>
            </div>

            {/* ══ RIGHT: white form panel ══ */}
            <div className="w-1/2 bg-white flex flex-col overflow-y-auto">

                {/* ── Top step indicator bar ── */}
                <div className="flex-shrink-0 px-14 pt-10 pb-6 border-b border-[#f0ede8]">
                    <div className="flex items-center justify-center gap-8">

                        {/* Step 1 pill */}
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.78rem] font-bold transition-colors duration-300
                ${step === 1 ? 'bg-[#4A7546] text-white' : 'bg-[#e8f0e8] text-[#4A7546]'}`}>
                                1
                            </div>
                            <span className={`text-[0.82rem] font-medium transition-colors duration-300 ${step === 1 ? 'text-[#1a1a1a]' : 'text-[#aaa]'}`}>
                                Property Details
                            </span>
                        </div>

                        {/* Connector */}
                        <div className="flex-1 h-[1px] bg-[#ede9e2] max-w-[48px]" />

                        {/* Step 2 pill */}
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.78rem] font-bold transition-colors duration-300
                ${step === 2 ? 'bg-[#4A7546] text-white' : 'bg-[#f0ede8] text-[#bbb]'}`}>
                                2
                            </div>
                            <span className={`text-[0.82rem] font-medium transition-colors duration-300 ${step === 2 ? 'text-[#1a1a1a]' : 'text-[#bbb]'}`}>
                                Personal Details
                            </span>
                        </div>

                    </div>
                </div>

                {/* ── Form content ── */}
                <div className="flex-1 flex items-start justify-center px-8 py-10">
                    <div className="w-full max-w-[500px]" style={slideStyle}>

                        {step === 1 ? (
                            /* ════════ STEP 1 ════════ */
                            <div>
                                <h1
                                    className="text-[2rem] text-[#1a1a1a] leading-tight mb-8"
                                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 400 }}
                                >
                                    List Your Property
                                </h1>

                                <div className="flex flex-col gap-7">
                                    {/* Title + Rent */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className={labelCls}>Property Title</label>
                                            <input
                                                type="text"
                                                value={step1.title}
                                                onChange={e => setStep1(p => ({ ...p, title: e.target.value }))}
                                                placeholder="e.g. 2BHK in Salt Lake"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Monthly Rent (₹)</label>
                                            <input
                                                type="number"
                                                value={step1.rent}
                                                onChange={e => setStep1(p => ({ ...p, rent: e.target.value }))}
                                                placeholder="e.g. 15000"
                                                min={0}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className={labelCls}>Full Address</label>
                                        <input
                                            type="text"
                                            value={step1.address}
                                            onChange={e => setStep1(p => ({ ...p, address: e.target.value }))}
                                            placeholder="e.g. Salt Lake, Kolkata, West Bengal, India"
                                            className={inputCls}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className={labelCls}>
                                            Description <span className="normal-case font-normal text-[#bbb]">(optional)</span>
                                        </label>
                                        <textarea
                                            value={step1.description}
                                            onChange={e => setStep1(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Describe the property…"
                                            className={`${inputCls} resize-none`}
                                            rows={2}
                                        />
                                    </div>

                                    {/* Amenities */}
                                    <div>
                                        <label className={labelCls}>Amenities</label>
                                        <div className="flex flex-wrap gap-[6px] mt-1">
                                            {AMENITY_OPTIONS.map(amenity => {
                                                const selected = step1.amenities.includes(amenity);
                                                return (
                                                    <button
                                                        key={amenity}
                                                        type="button"
                                                        onClick={() => toggleAmenity(amenity)}
                                                        className={`px-[14px] py-[5px] rounded-full text-[0.75rem] font-medium border transition-all duration-200 select-none
                              ${selected
                                                                ? 'bg-[#4A7546] border-[#4A7546] text-white'
                                                                : 'bg-transparent border-[#d4cfc8] text-[#777] hover:border-[#4A7546] hover:text-[#4A7546]'
                                                            }`}
                                                    >
                                                        {amenity}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Next button */}
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            text="Next Step →"
                                            bgColor="#4A7546"
                                            textColor="#ffffff"
                                            hoverBgColor="#3a5e37"
                                            hoverTextColor="#ffffff"
                                            width="148px"
                                            height="44px"
                                            onClick={goToStep2}
                                            disabled={!step1Valid}
                                            type="button"
                                        />
                                    </div>
                                </div>
                            </div>

                        ) : (
                            /* ════════ STEP 2 ════════ */
                            <form onSubmit={handleSubmit}>
                                <h1
                                    className="text-[2rem] text-[#1a1a1a] leading-tight mb-8"
                                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 400 }}
                                >
                                    Personal information
                                </h1>

                                <div className="flex flex-col gap-7">
                                    {/* Name + Phone */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className={labelCls}>Full Name</label>
                                            <input
                                                type="text"
                                                value={step2.name}
                                                onChange={e => setStep2(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Your name"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={step2.phone}
                                                onChange={e => setStep2(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="+91 98765 43210"
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>

                                    {/* Listing summary */}
                                    <div className="border border-[#ede9e2] rounded-[10px] p-4 text-[0.78rem] text-[#777] bg-[#faf9f6]">
                                        <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#bbb] mb-2 font-semibold">Listing Summary</p>
                                        <div className="grid grid-cols-2 gap-y-[10px] gap-x-4">
                                            <div>
                                                <span className="text-[#bbb] text-[0.68rem]">Title</span>
                                                <p className="text-[#1a1a1a] font-medium mt-[2px]">{step1.title || '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[#bbb] text-[0.68rem]">Rent</span>
                                                <p className="text-[#1a1a1a] font-medium mt-[2px]">
                                                    {step1.rent ? `₹${Number(step1.rent).toLocaleString()}/mo` : '—'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[#bbb] text-[0.68rem]">Address</span>
                                                <p className="text-[#1a1a1a] font-medium mt-[2px]">{step1.address || '—'}</p>
                                            </div>
                                            {step1.amenities.length > 0 && (
                                                <div className="col-span-2">
                                                    <span className="text-[#bbb] text-[0.68rem]">Amenities</span>
                                                    <p className="text-[#1a1a1a] font-medium mt-[2px]">{step1.amenities.join(' · ')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline error */}
                                    {error && <p className="text-[0.75rem] text-red-500">{error}</p>}

                                    {/* Back + Submit */}
                                    <div className="flex justify-center gap-3 pt-1">
                                        <Button
                                            text="← Back"
                                            bgColor="transparent"
                                            textColor="#777"
                                            hoverBgColor="#f5f2ee"
                                            hoverTextColor="#1a1a1a"
                                            width="100px"
                                            height="44px"
                                            onClick={goBackToStep1}
                                            type="button"
                                            style={{ border: '1px solid #d4cfc8' }}
                                        />
                                        <Button
                                            bgColor="#4A7546"
                                            textColor="#ffffff"
                                            hoverBgColor="#3a5e37"
                                            hoverTextColor="#ffffff"
                                            width="170px"
                                            height="44px"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                'Submitting…'
                                            ) : (
                                                <span className="text-[0.8rem] whitespace-nowrap flex items-center justify-center gap-1 font-semibold">
                                                    Submit Listing →
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default OwnerListingForm;
