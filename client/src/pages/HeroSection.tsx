import React from 'react';
import bgImage from '../assets/bg.jpeg';
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
  return (
    <div style={rootStyle}>

      {/* ══ LAYER 1: Full house photo background ══ */}
      <div style={photoBgStyle} />

      {/* ══ LAYER 2: Organic white overlay SVG ══ */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1354 768"
        style={waveOverlayStyle}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FAF8F5" />
            <stop offset="100%" stopColor="#ECEBE4" />
          </linearGradient>
        </defs>
        {/* Left Organic Wave Notch Overlay (exact user coordinates) */}
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
        {/* Bottom Right Notch Accent (preserved) */}
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
      <div style={pageWrapperStyle}>

        {/* ── HEADER ── */}
        <header style={headerStyle}>
          {/* Logo */}
          <div style={logoWrapStyle}>
            <img src={logoImg} alt="Homie Logo" style={{ height: '60px', objectFit: 'contain', marginLeft: '-17px' }} />
          </div>

          {/* Auth buttons — top right */}
          <div style={authRowStyle}>
            <Button
              text="Login"
              bgColor="rgba(255,255,255,0.65)"
              textColor="#111"
              hoverBgColor="rgba(255,255,255,0.95)"
              hoverTextColor="#111"
              width="96px"
              height="38px"
            />
            <Button
              text="Sign Up"
              bgColor="rgba(255,255,255,0.65)"
              textColor="#111"
              hoverBgColor="rgba(255,255,255,0.95)"
              hoverTextColor="#111"
              width="106px"
              height="38px"
            />
          </div>
        </header>

        {/* ── MAIN BODY ── */}
        <main style={mainStyle}>

          {/* LEFT COLUMN — sits on top of white blob */}
          <div style={leftColStyle}>

            {/* Hero Headline */}
            <h1 style={headlineStyle}>
              Your Home, <span style={{ color: '#4A7546' }}>For Rent.</span><br />
              Your Home, <span style={{ color: '#4A7546' }}>To Rent.</span>
            </h1>


            {/* Subheading */}
            <p style={subheadStyle}>
              Discover rentals and list your property with premium<br />
              management for an effortlessly better experience.
            </p>

            {/* ── FORM CARDS ROW ── */}
            <div style={cardsRowStyle}>

              {/* Card 1 — List Your Home */}
              <div style={formCardStyle}>
                <p style={cardTitleStyle}>List Your Home</p>
                <p style={fieldLabelStyle}>Location</p>
                <div style={selectBoxStyle}>
                  <span style={selectValueStyle}>Auckland, NZ</span>
                  <span style={dropArrowStyle}>▾</span>
                </div>
                <p style={listItemStyle}>Sydney, AU</p>
                <p style={{ ...listItemStyle, color: '#b8b0a8' }}>Mantkat, NZ</p>
                <div style={{ marginTop: '14px' }}>
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
              <div style={formCardStyle}>
                <p style={cardTitleStyle}>Find Your Home</p>
                <p style={fieldLabelStyle}>Location</p>
                <div style={selectBoxStyle}>
                  <span style={selectValueStyle}>Auckland, NZ</span>
                  <span style={dropArrowStyle}>▾</span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <Button
                    bgColor="#4A7546"
                    textColor="#ffffff"
                    hoverBgColor="#333"
                    width="100%"
                    height="42px"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={socialProofBadgeStyle}>
                  <div style={avatarStackStyle}>
                    <img src={avatar1} alt="" style={avatarStyle} />
                    <img src={avatar2} alt="" style={{ ...avatarStyle, marginLeft: '-9px' }} />
                  </div>
                  <p style={socialProofTextStyle}>
                    11,239 people have<br />found their home
                  </p>
                </div>
              </div>

            </div>

            {/* Social icons */}
            <div style={socialIconsRowStyle}>
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

          {/* RIGHT — spacer so reviews panel can anchor bottom-right */}
          <div style={{ flex: 1 }} />

        </main>

        {/* ── REVIEWS PANEL — absolutely anchored bottom-right ── */}
        <div style={reviewsPanelStyle}>
          <img src={kitchenThumb} alt="Kitchen" style={reviewThumbStyle} />

          <div style={reviewContentStyle}>
            <div style={reviewHeaderRowStyle}>
              <span style={reviewTitleStyle}>Customer Reviews</span>
              <div style={arrowBtnsStyle}>
                <button style={arrowBtnStyle} disabled>‹</button>
                <button style={arrowBtnStyle} disabled>›</button>
              </div>
            </div>
            <p style={reviewTextStyle}>
              Found our dream home through Homie! The curated rentals and process were seamless. Highly recommend.
            </p>
            <p style={{ ...reviewTextStyle, marginTop: '5px' }}>
              The property management team is incredibly responsive. Feeling truly at home.
            </p>
          </div>

          {/* Overflow thumb stack */}
          <div style={overflowThumbsStyle}>
            <div style={{ ...overflowThumbStyle, background: 'linear-gradient(135deg,#c8b49a,#a89272)' }} />
            <div style={{ ...overflowThumbStyle, background: 'linear-gradient(135deg,#d5c4ae,#baa888)', opacity: 0.6 }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;

/* ════════════════════════════════════════
   STYLES
════════════════════════════════════════ */

/* Root — no background, just position container */
const rootStyle: React.CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

/* Layer 1 — full-bleed house photo */
const photoBgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center right',
  zIndex: 0,
};

/* Layer 2 — organic white blob SVG */
const waveOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  pointerEvents: 'none',
};

/* Layer 3 — UI content wrapper */
const pageWrapperStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: '0 32px',
};

/* ── Header ── */
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '20px',
  paddingBottom: '0',
};

const logoWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  color: '#111',
};

const authRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

/* ── Main body ── */
const mainStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  paddingBottom: '80px', /* lift content above reviews panel */
};

const leftColStyle: React.CSSProperties = {
  width: '42%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

/* ── Headline ── */
const headlineStyle: React.CSSProperties = {
  fontSize: '2.65rem',
  fontWeight: 800,
  lineHeight: 1.18,
  color: '#111',
  margin: '0 0 14px 0',
  letterSpacing: '-0.025em',
};

const subheadStyle: React.CSSProperties = {
  fontSize: '0.88rem',
  color: '#5a5450',
  lineHeight: 1.65,
  margin: '0 0 22px 0',
};

/* ── Form cards ── */
const cardsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '22px',
};

const formCardStyle: React.CSSProperties = {
  flex: '0 0 182px',
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '16px',
  padding: '14px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '0.92rem',
  fontWeight: 700,
  color: '#111',
  margin: '0 0 8px 0',
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: '#7a736e',
  margin: '0 0 4px 0',
  fontWeight: 500,
};

const selectBoxStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(228, 222, 214, 0.8)',
  borderRadius: '9px',
  padding: '7px 10px',
  marginBottom: '7px',
};

const selectValueStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#111',
};

const dropArrowStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#7a736e',
};

const listItemStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: '#7a736e',
  margin: '3px 0',
  paddingLeft: '2px',
};

/* ── Social proof badge ── */
const socialProofBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  marginTop: '10px',
  background: 'rgba(245, 240, 235, 0.8)',
  borderRadius: '10px',
  padding: '7px 10px',
};

const avatarStackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const avatarStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '2px solid white',
  flexShrink: 0,
};

const socialProofTextStyle: React.CSSProperties = {
  fontSize: '0.67rem',
  color: '#3a3430',
  fontWeight: 600,
  margin: 0,
  lineHeight: 1.4,
};

/* ── Social icons ── */
const socialIconsRowStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '28px',
  left: '32px',
  zIndex: 10,
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
};

/* ── Reviews panel ── */
const reviewsPanelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '28px',
  right: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '470px',
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: '18px 0 0 18px',
  padding: '14px 16px 14px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const reviewThumbStyle: React.CSSProperties = {
  width: '68px',
  height: '68px',
  borderRadius: '11px',
  objectFit: 'cover',
  flexShrink: 0,
};

const reviewContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const reviewHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '6px',
};

const reviewTitleStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#111',
};

const arrowBtnsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
};

const arrowBtnStyle: React.CSSProperties = {
  width: '21px',
  height: '21px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.15)',
  background: 'rgba(255,255,255,0.7)',
  fontSize: '12px',
  cursor: 'default',
  color: '#333',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const reviewTextStyle: React.CSSProperties = {
  fontSize: '0.71rem',
  color: '#4a4440',
  lineHeight: 1.55,
  margin: 0,
};

const overflowThumbsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flexShrink: 0,
};

const overflowThumbStyle: React.CSSProperties = {
  width: '42px',
  height: '42px',
  borderRadius: '9px',
};
