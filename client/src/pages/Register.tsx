import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/login-bg.jpeg';
import logoImg from '../assets/logo.png';
import Button from '../ui/button';

type Role = 'seeker' | 'owner';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('seeker');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to AuthContext register()
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* ══ BG: Full-bleed photo background ══ */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ══ LOGO — top left, click to go home ══ */}
      <div className="absolute top-5 left-6 z-20">
        <Link to="/">
          <img src={logoImg} alt="Homie" className="h-[50px] object-contain cursor-pointer" />
        </Link>
      </div>

      {/* ══ TOP RIGHT NAV — "Already have an account?" ══ */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-1 text-[0.82rem] text-[#4a4a4a]">
        <span>Already have an account?</span>
        <Link
          to="/login"
          className="font-semibold text-[#4A7546] hover:underline ml-1 flex items-center gap-[3px]"
        >
          Log In
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="mt-[1px]">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* ══ REGISTER CARD — centered on right ══ */}
      <div className="absolute inset-y-0 right-0 w-[46%] flex items-center justify-center z-10">
        <div className="w-full max-w-[390px] mx-auto px-4">

          {/* Card */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_48px_rgba(0,0,0,0.09)] px-9 py-9">

            {/* Header */}
            <h1 className="text-[1.75rem] font-extrabold text-[#1a1a1a] text-center leading-tight mb-1 tracking-[-0.02em]">
              <span className="text-[#4A7546]">Create an Account</span>
            </h1>
            <p className="text-center text-[0.8rem] text-[#888] mb-6 mt-3">
              Already a member?{' '}
              <Link to="/login" className="text-[#4A7546] font-semibold hover:underline">
                Log In →
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-0">

              {/* Full Name */}
              <div className="mb-5">
                <label className="block text-[0.78rem] font-medium text-[#3a3a3a] mb-[6px]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full border-0 border-b border-[#c8c4be] bg-transparent text-[0.88rem] text-[#1a1a1a] pb-[6px] focus:outline-none focus:border-[#4A7546] transition-colors duration-200"
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-[0.78rem] font-medium text-[#3a3a3a] mb-[6px]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border-0 border-b border-[#c8c4be] bg-transparent text-[0.88rem] text-[#1a1a1a] pb-[6px] focus:outline-none focus:border-[#4A7546] transition-colors duration-200"
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-[0.78rem] font-medium text-[#3a3a3a] mb-[6px]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full border-0 border-b border-[#c8c4be] bg-transparent text-[0.88rem] text-[#1a1a1a] pb-[6px] pr-7 focus:outline-none focus:border-[#4A7546] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-0 bottom-[6px] text-[#aaa] hover:text-[#555] transition-colors"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div className="mb-6">
                <label className="block text-[0.78rem] font-medium text-[#3a3a3a] mb-[10px]">
                  I am a...
                </label>
                <div className="flex gap-3">
                  {/* Seeker card */}
                  <button
                    type="button"
                    onClick={() => setRole('seeker')}
                    className={`flex-1 py-[10px] px-3 rounded-[12px] border text-[0.8rem] font-semibold transition-all duration-200 flex flex-col items-center gap-1
                      ${role === 'seeker'
                        ? 'border-[#4A7546] bg-[#4A7546]/[0.07] text-[#4A7546]'
                        : 'border-[#e0dbd4] text-[#888] hover:border-[#c0b9b0]'
                      }`}
                  >
                    {/* Home search icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Seeker
                  </button>

                  {/* Owner card */}
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`flex-1 py-[10px] px-3 rounded-[12px] border text-[0.8rem] font-semibold transition-all duration-200 flex flex-col items-center gap-1
                      ${role === 'owner'
                        ? 'border-[#4A7546] bg-[#4A7546]/[0.07] text-[#4A7546]'
                        : 'border-[#e0dbd4] text-[#888] hover:border-[#c0b9b0]'
                      }`}
                  >
                    {/* House icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Owner
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                text="Create Account"
                bgColor="#4A7546"
                textColor="#ffffff"
                hoverBgColor="#3a5e37"
                hoverTextColor="#ffffff"
                width="100%"
                height="48px"
                type="submit"
              />
            </form>
          </div>

          {/* Social logins — below card */}
          <div className="flex items-center justify-center gap-4 mt-5">
            {/* Google */}
            <button
              type="button"
              className="w-[52px] h-[52px] rounded-full bg-white border border-[#e8e4de] shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex items-center justify-center hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
              aria-label="Continue with Google"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              className="w-[52px] h-[52px] rounded-full bg-white border border-[#e8e4de] shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex items-center justify-center hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
              aria-label="Continue with Apple"
            >
              <svg width="18" height="22" viewBox="0 0 814 1000" fill="#1a1a1a">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.3 134.3-316.9 266.1-316.9 60.8 0 111.4 37.1 149.4 37.1 36.3 0 93.5-39.5 160.3-39.5 24.4 0 108.2 2.6 168.6 80.6zm-198.5-119.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;
