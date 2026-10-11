import React from 'react';
import {
    LogOut,
    Home,
    Menu,
    X,
    ArrowLeft,
    Mail,
    ShieldCheck
} from 'lucide-react';

import kissLogo from '../assets/kiss-logo.png';
import founderPhoto from '../assets/achyuta-samanta.jpg';

export default function Header({ currentUser, onLogout, onGoToHome, onToggleSidebar, isSidebarOpen }) {
    return (
        <header className="w-full bg-white font-sans text-slate-800 shadow-sm shrink-0 z-40">
            {/* 1. Top Gradient Banner (Matching university.kiss.ac.in gradient) */}
            <div className="bg-gradient-to-r from-[#17d059] to-[#00a6e2] text-white py-1 px-4 sm:px-8 text-xs font-semibold">
                <div className="w-full flex justify-between items-center">
                    <button
                        onClick={onGoToHome}
                        className="inline-flex items-center gap-1.5 text-white/95 hover:text-white hover:underline transition"
                        title="Back to Public Website"
                    >
                        <ArrowLeft size={13} />
                        <span>Go to KISS Home page / Public Website</span>
                    </button>

                    {/* Social Links */}
                    <div className="flex items-center gap-3 text-white/95">
                        <span className="hidden sm:inline-block text-[11px] font-normal text-white/80">Connect with KISS:</span>
                        <a href="https://www.facebook.com/kissfoundation" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition" title="Facebook">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/></svg>
                        </a>
                        <a href="https://x.com/kissfoundation" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition" title="X (Twitter)">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="https://instagram.com/kissfoundation" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition" title="Instagram">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </a>
                        <a href="https://www.youtube.com/@KISSFoundation" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition" title="YouTube">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/company/kalinga-institute-of-social-sciences--kiss/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition" title="LinkedIn">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                        <a href="mailto:info@kiss.ac.in" className="hover:text-white hover:scale-110 transition" title="Email Us">
                            <Mail size={14} />
                        </a>
                    </div>
                </div>
            </div>

            {/* 2. Main Identity Bar (#f7f7f7 background covering full header width) */}
            <div className="bg-[#f7f7f7] border-b border-slate-200 flex items-stretch justify-between pl-4 sm:pl-8 pr-0 min-h-[96px] sm:min-h-[104px]">
                {/* Left: Mobile Toggle + KISS DU Logo */}
                <div className="flex items-center gap-3 py-2.5">
                    {onToggleSidebar && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="md:hidden p-2 bg-white hover:bg-slate-100 text-[#006837] rounded-lg transition-colors border border-slate-300 shadow-sm"
                            title="Toggle Navigation Sidebar"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    )}

                    <div onClick={onGoToHome} className="cursor-pointer hover:opacity-95 transition">
                        <img
                            src={kissLogo}
                            alt="Kalinga Institute of Social Sciences (KISS Deemed to be University)"
                            className="h-11 sm:h-14 md:h-16 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Right: User Info + Logout + Full-Height Founder Panel covering the complete right box */}
                <div className="flex items-stretch gap-3 sm:gap-4 ml-auto">
                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-2.5 py-2 pr-2 sm:pr-4">
                        <button
                            onClick={onGoToHome}
                            title="Public Website"
                            className="bg-white hover:bg-slate-100 text-[#006837] text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition border border-slate-300 shadow-sm"
                        >
                            <Home size={14} /> <span className="hidden sm:inline">Website</span>
                        </button>

                        {currentUser && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
                                <div className="w-7 h-7 rounded-full bg-[#006837] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="font-bold leading-tight text-slate-800">{currentUser.fullName}</p>
                                    <p className="text-[10px] text-emerald-700 font-semibold capitalize">
                                        {currentUser.role ? currentUser.role.replace('ROLE_', '').toLowerCase() : 'User'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onLogout}
                            title="Sign Out"
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition shadow"
                        >
                            <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>

                    {/* Founder Profile - Stretches from top to bottom and flush to the right edge (covering 100% of marked red box) */}
                    <div className="hidden lg:flex items-center gap-3.5 px-6 sm:px-8 bg-white border-l border-slate-200 shadow-sm shrink-0 self-stretch">
                        <img
                            src={founderPhoto}
                            alt="Prof. Achyuta Samanta"
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#006837]/30 shadow-md"
                        />
                        <div className="text-left font-sans">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                                Prof. Achyuta Samanta
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Founder – KIIT &amp; KISS
                            </p>
                            <a
                                href="https://achyutasamanta.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#006837] hover:underline font-semibold block mt-0.5"
                            >
                                achyutasamanta.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Sub-Nav Brand & Module Strip */}
            <div className="bg-white border-b-2 border-[#006837] shadow-sm py-1.5 px-4 sm:px-8 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#006837] tracking-wide uppercase">
                        Vocational Training Management System (KV-TMS)
                    </span>
                    <span className="hidden sm:inline-block bg-[#fcb900] text-slate-950 text-[10px] px-2 py-0.5 rounded font-black">
                        NAAC Grade 'A'
                    </span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-600 text-[11px]">
                    <span className="hidden sm:inline">Active Module Session:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {currentUser?.role ? currentUser.role.replace('ROLE_', '') : 'Authorized'} Portal
                    </span>
                </div>
            </div>
        </header>
    );
}