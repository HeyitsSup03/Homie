import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg-2.jpeg';
import logoImg from '../assets/logo.png';
import Button from '../ui/button';

/* ─── Mock data URIs ─── */
const avatar1 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='14' fill='%23c4a882'/%3E%3Ccircle cx='14' cy='11' r='5' fill='%23a0845c'/%3E%3Cellipse cx='14' cy='26' rx='8' ry='6' fill='%23a0845c'/%3E%3C/svg%3E";
const avatar2 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='14' fill='%23d4b896'/%3E%3Ccircle cx='14' cy='11' r='5' fill='%23b8845c'/%3E%3Cellipse cx='14' cy='26' rx='8' ry='6' fill='%23b8845c'/%3E%3C/svg%3E";
const kitchenThumb =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' fill='%23888'/%3E%3Crect x='8' y='26' width='56' height='28' rx='2' fill='%23aaa'/%3E%3Crect x='4' y='16' width='64' height='12' rx='2' fill='%23999'/%3E%3Ccircle cx='22' cy='46' r='6' fill='%23777'/%3E%3Ccircle cx='50' cy='46' r='6' fill='%23777'/%3E%3C/svg%3E";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    /* Root — relative position container, full viewport */
    <div className="relative w-screen h-screen overflow-hidden font-[Plus_Jakarta_Sans,system-ui,-apple-system,sans-serif]">

      {/* ══ LAYER 1: Full house photo background ══ */}
      <div
        className="absolute inset-0 bg-cover z-0"
        style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: 'center right' }}
      />

      {/* ══ LAYER 2: Organic white overlay SVG ══ */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1354 768"
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FAF8F5" />
            <stop offset="100%" stopColor="#ECEBE4" />
          </linearGradient>
        </defs>
        {/* Left Organic Wave Notch Overlay */}
        <path
          fill="url(#bgGradient)"
          d={`
            M 1354,0
            L 982,0
            C 935,0 905,16 893,46
            C 884,70 889,96 861,110
            C 822,129 760,120 722,137
            C 679,156 661,198 650,238
            C 635,292 599,312 548,320
            C 515,326 494,347 490,381
            C 486,416 506,455 511,503
            C 516,551 493,584 445,608
            C 405,628 387,661 389,704
            C 391,740 372,760 332,768
            L 0,768
            L 0,0
            L 1354,0
            Z
          `}
        />
        {/* Bottom Right Notch Accent */}
        <path
          fill="url(#bgGradient)"
          d={`
            M 1354,768
            L 1001,768
            C 1037,683 1093,626 1199,604
            C 1276,590 1326,611 1354,590
            Z
          `}
        />
      </svg>

      {/* ══ LAYER 3: UI Content ══ */}
      <div className="relative z-[2] flex flex-col h-screen px-8">

        {/* ── HEADER ── */}
        <header className="flex justify-between items-center pt-5">
          {/* Logo */}
          <div className="flex items-center gap-[7px]">
            <img src={logoImg} alt="Homie Logo" className="h-[60px] object-contain -ml-[17px]" />
          </div>

          {/* Auth buttons — top right */}
          <div className="flex gap-2">
            <Button
              text="Login"
              bgColor="rgba(255,255,255,0.65)"
              textColor="#111"
              hoverBgColor="rgba(255,255,255,0.95)"
              hoverTextColor="#111"
              width="96px"
              height="38px"
              onClick={() => navigate('/login')}
            />
            <Button
              text="Sign Up"
              bgColor="rgba(255,255,255,0.65)"
              textColor="#111"
              hoverBgColor="rgba(255,255,255,0.95)"
              hoverTextColor="#111"
              width="106px"
              height="38px"
              onClick={() => navigate('/register')}
            />
          </div>
        </header>

        {/* ── MAIN BODY ── */}
        <main className="flex flex-1 items-center pb-20">

          {/* LEFT COLUMN — sits on top of white blob */}
          <div className="w-[42%] flex flex-col gap-0">

            {/* Hero Headline */}
            <h1 className="text-[2.65rem] font-extrabold leading-[1.18] text-[#111] mb-[14px] tracking-[-0.025em]">
              Your Home, <span className="text-[#4A7546]">For Rent.</span><br />
              Your Home, <span className="text-[#4A7546]">To Rent.</span>
            </h1>

            {/* Subheading */}
            <p className="text-[0.88rem] text-[#5a5450] leading-[1.65] mb-[22px]">
              Discover rentals and list your property with premium<br />
              management for an effortlessly better experience.
            </p>

            {/* ── FORM CARDS ROW ── */}
            <div className="flex gap-3 items-start mb-[22px]">

              {/* Card 1 — List Your Home */}
              <div className="flex-[0_0_182px] bg-white/[0.72] backdrop-blur-[18px] border border-white/90 rounded-2xl p-[14px] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <p className="text-[0.92rem] font-bold text-[#111] mb-2">List Your Home</p>
                <p className="text-[0.72rem] text-[#7a736e] mb-1 font-medium">Location</p>
                <div className="flex justify-between items-center bg-[rgba(228,222,214,0.8)] rounded-[9px] px-[10px] py-[7px] mb-[7px]">
                  <span className="text-[0.82rem] font-semibold text-[#111]">Auckland, NZ</span>
                  <span className="text-[0.7rem] text-[#7a736e]">▾</span>
                </div>
                <p className="text-[0.78rem] text-[#7a736e] my-[3px] pl-[2px]">Sydney, AU</p>
                <p className="text-[0.78rem] text-[#b8b0a8] my-[3px] pl-[2px]">Mantkat, NZ</p>
                <div className="mt-[14px]">
                  <Button
                    text="Start Listing"
                    bgColor="#4A7546"
                    textColor="#ffffff"
                    hoverBgColor="#333"
                    width="100%"
                    height="42px"
                  />
                </div>
              </div>

              {/* Card 2 — Find Your Home */}
              <div className="flex-[0_0_182px] bg-white/[0.72] backdrop-blur-[18px] border border-white/90 rounded-2xl p-[14px] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <p className="text-[0.92rem] font-bold text-[#111] mb-2">Find Your Home</p>
                <p className="text-[0.72rem] text-[#7a736e] mb-1 font-medium">Location</p>
                <div className="flex justify-between items-center bg-[rgba(228,222,214,0.8)] rounded-[9px] px-[10px] py-[7px] mb-[7px]">
                  <span className="text-[0.82rem] font-semibold text-[#111]">Auckland, NZ</span>
                  <span className="text-[0.7rem] text-[#7a736e]">▾</span>
                </div>

                <div className="mt-3">
                  <Button
                    bgColor="#4A7546"
                    textColor="#ffffff"
                    hoverBgColor="#333"
                    width="100%"
                    height="42px"
                  >
                    <span className="flex items-center gap-[6px]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Search
                    </span>
                  </Button>
                </div>

                {/* Social proof badge */}
                <div className="flex items-center gap-[7px] mt-[10px] bg-[rgba(245,240,235,0.8)] rounded-[10px] px-[10px] py-[7px]">
                  <div className="flex items-center shrink-0">
                    <img src={avatar1} alt="" className="w-6 h-6 rounded-full border-2 border-white shrink-0" />
                    <img src={avatar2} alt="" className="w-6 h-6 rounded-full border-2 border-white shrink-0 -ml-[9px]" />
                  </div>
                  <p className="text-[0.67rem] text-[#3a3430] font-semibold m-0 leading-[1.4]">
                    11,239 people have<br />found their home
                  </p>
                </div>
              </div>

            </div>

            {/* Social icons */}
            <div className="absolute bottom-7 left-8 z-10 flex gap-4 items-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>

          </div>

          {/* RIGHT — spacer */}
          <div className="flex-1" />

        </main>

        {/* ── REVIEWS PANEL — absolutely anchored bottom-right ── */}
        <div className="absolute bottom-7 right-0 z-10 flex items-center gap-3 w-[470px] bg-white/[0.68] backdrop-blur-[20px] border border-white/[0.85] rounded-[18px_0_0_18px] px-4 py-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <img src={kitchenThumb} alt="Kitchen" className="w-[68px] h-[68px] rounded-[11px] object-cover shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[0.8rem] font-bold text-[#111]">Customer Reviews</span>
              <div className="flex gap-1">
                <button
                  className="w-[21px] h-[21px] rounded-full border border-black/[0.15] bg-white/70 text-[12px] text-[#333] p-0 flex items-center justify-center cursor-default"
                  disabled
                >‹</button>
                <button
                  className="w-[21px] h-[21px] rounded-full border border-black/[0.15] bg-white/70 text-[12px] text-[#333] p-0 flex items-center justify-center cursor-default"
                  disabled
                >›</button>
              </div>
            </div>
            <p className="text-[0.71rem] text-[#4a4440] leading-[1.55] m-0">
              Found our dream home through Homie! The curated rentals and process were seamless. Highly recommend.
            </p>
            <p className="text-[0.71rem] text-[#4a4440] leading-[1.55] mt-[5px] m-0">
              The property management team is incredibly responsive. Feeling truly at home.
            </p>
          </div>

          {/* Overflow thumb stack */}
          <div className="flex flex-col gap-[6px] shrink-0">
            <div className="w-[42px] h-[42px] rounded-[9px]" style={{ background: 'linear-gradient(135deg,#c8b49a,#a89272)' }} />
            <div className="w-[42px] h-[42px] rounded-[9px] opacity-60" style={{ background: 'linear-gradient(135deg,#d5c4ae,#baa888)' }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
