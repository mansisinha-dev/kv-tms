import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    GraduationCap,
    Scissors,
    Coins,
    Users,
    Award,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    BookOpen,
    Building,
    HeartHandshake,
    Layers,
    Hammer,
    Mail,
    ExternalLink,
    Menu,
    X,
    MapPin,
    Phone,
    Globe,
    Clock,
    Target,
    Compass,
    Eye,
    Heart,
    Palette,
    Send,
    Check,
    LogOut
} from 'lucide-react';

import kissLogo from '../assets/kiss-logo.png';
import founderPhoto from '../assets/achyuta-samanta.jpg';
import skillDevImg from '../assets/kiss-skill-development.jpg';
import campusOverviewImg from '../assets/kiss-campus-overview.jpg';
import { API_BASE_URL } from '../apiConfig';

export default function HomePage({ onGoToLogin, currentUser, onGoToPortal, onLogout }) {
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Contact Form Interactive State
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Vocational Training Inquiry',
        message: ''
    });
    const [contactSubmitted, setContactSubmitted] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/academics/courses/detailed`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    // Only show active courses on public portal
                    const activeOnly = res.data.filter(c => c.active !== false);
                    setCourses(activeOnly);
                }
            })
            .catch(err => {
                console.warn('Could not fetch active courses for homepage:', err.message);
                // Fallback default courses if backend is connecting
                setCourses([
                    { id: 1, name: 'Sewing & Garment Fabrication', code: 'VOC-SEW-101', durationMonths: 6, moduleCount: 4, description: 'Industrial apparel stitching, uniform fabrication, pattern cutting, and quality control.' },
                    { id: 2, name: 'Handicrafts & Tribal Art', code: 'VOC-ART-102', durationMonths: 6, moduleCount: 4, description: 'Authentic Saura painting, terracotta pottery, traditional bamboo weaving, and ethnic art preservation.' },
                    { id: 3, name: 'Bamboo Craft & Furniture Design', code: 'VOC-BAM-103', durationMonths: 6, moduleCount: 4, description: 'Eco-friendly bamboo curing, joinery, household furniture crafting, and sustainable basketry.' },
                    { id: 4, name: 'Carpentry & Woodcraft Engineering', code: 'VOC-CAR-104', durationMonths: 6, moduleCount: 4, description: 'Woodworking machinery, commercial desk fabrication, institutional furniture repair, and joinery.' }
                ]);
            })
            .finally(() => setLoadingCourses(false));
    }, []);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSubmitted(true);
        setTimeout(() => {
            setContactSubmitted(false);
            setContactForm({
                name: '',
                email: '',
                phone: '',
                subject: 'Vocational Training Inquiry',
                message: ''
            });
        }, 5000);
    };

    // Icon selector helper
    const getCourseIcon = (code = '') => {
        if (code.includes('SEW')) return Scissors;
        if (code.includes('POT') || code.includes('ART')) return Award;
        if (code.includes('BAM')) return BookOpen;
        if (code.includes('CAR')) return Hammer;
        if (code.includes('FOD')) return HeartHandshake;
        return Layers;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">

            {/* ========================================================================= */}
            {/* 1. KISS UNIVERSITY OFFICIAL 3-TIER HEADER                                  */}
            {/* ========================================================================= */}
            <header className="w-full bg-white font-sans text-slate-800 shadow-sm shrink-0">
                {/* 1. Top Gradient Banner (Exact gradient from university.kiss.ac.in) */}
                <div className="bg-gradient-to-r from-[#17d059] to-[#00a6e2] text-white py-1.5 px-4 sm:px-8 lg:px-12 text-xs font-semibold">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://kiss.ac.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-white/95 hover:text-white hover:underline transition"
                                title="Go to KISS Foundation Homepage"
                            >
                                <ArrowLeft size={13} />
                                <span className="hidden sm:inline">Go to KISS Home page (kiss.ac.in)</span>
                            </a>
                            <span className="bg-amber-300 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide shadow-sm">
                                🎓 Academic Project Prototype
                            </span>
                        </div>

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
                <div className="bg-[#f7f7f7] border-b border-slate-200 flex items-stretch justify-between pl-4 sm:pl-8 lg:px-12 pr-0 min-h-[96px] sm:min-h-[104px]">
                    {/* Left: KISS DU Logo */}
                    <div className="flex items-center py-2.5">
                        <a href="#" className="block hover:opacity-95 transition">
                            <img
                                src={kissLogo}
                                alt="Kalinga Institute of Social Sciences (KISS Deemed to be University)"
                                className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                            />
                        </a>
                    </div>

                    {/* Right: Portal Login + Full-Height Founder Panel covering the complete right box */}
                    <div className="flex items-stretch gap-3 sm:gap-6 ml-auto">
                        {/* Prominent Portal CTA */}
                        <div className="flex items-center py-2 pr-2 sm:pr-4">
                            {currentUser ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onGoToPortal}
                                        className="bg-[#48B859] hover:bg-[#3ea34e] text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow hover:shadow-md transition flex items-center gap-2 border border-emerald-400 group shrink-0"
                                        title="Return to your active operations portal"
                                    >
                                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                        <span>Back to Portal</span>
                                        <span className="hidden md:inline-block bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-medium ml-0.5">
                                            {currentUser.fullName || currentUser.collegeId}
                                        </span>
                                    </button>
                                    <button
                                        onClick={onLogout}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition border border-rose-200 shadow-xs"
                                        title="Sign Out"
                                    >
                                        <LogOut size={14} />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onGoToLogin}
                                    className="bg-[#2D3591] hover:bg-[#232a74] text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 border border-indigo-400/30 group shrink-0"
                                >
                                    <ShieldCheck size={18} className="text-[#fcb900]" />
                                    <span>Portal Login</span>
                                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Toggle Button */}
                        <div className="lg:hidden flex items-center py-2 pr-4">
                            <button
                                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                className="p-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                        {/* Founder Profile - Stretches from top to bottom flush right */}
                        <div className="hidden md:flex items-center gap-3.5 px-6 sm:px-8 lg:px-10 bg-white border-l border-slate-200 shadow-sm shrink-0 self-stretch">
                            <img
                                src={founderPhoto}
                                alt="Prof. Achyuta Samanta"
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#48B859]/40 shadow-md"
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
                                    className="text-xs text-[#257c37] hover:text-[#48B859] hover:underline font-semibold block mt-0.5"
                                >
                                    achyutasamanta.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Primary University Navigation Menu Bar */}
                <nav className="bg-white border-b-2 border-[#48B859] shadow-sm sticky top-0 z-40">
                    <div className="w-full px-4 sm:px-8 lg:px-12 flex justify-between items-center">
                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-1 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                            <a
                                href="#about"
                                className="px-3.5 py-2.5 rounded hover:text-[#257c37] hover:bg-[#48B859]/10 transition"
                            >
                                About Us
                            </a>
                            <a
                                href="#mission-vision"
                                className="px-3.5 py-2.5 rounded hover:text-[#257c37] hover:bg-[#48B859]/10 transition"
                            >
                                Mission &amp; Vision
                            </a>
                            <a
                                href="#trades"
                                className="px-3.5 py-2.5 rounded hover:text-[#257c37] hover:bg-[#48B859]/10 transition"
                            >
                                Skill Development &amp; Trades
                            </a>
                            <a
                                href="#philosophy"
                                className="px-3.5 py-2.5 rounded hover:text-[#257c37] hover:bg-[#48B859]/10 transition"
                            >
                                "Earn While Learn"
                            </a>
                            <a
                                href="#impact"
                                className="px-3.5 py-2.5 rounded hover:text-[#257c37] hover:bg-[#48B859]/10 transition"
                            >
                                University Impact
                            </a>
                            <a
                                href="#contact"
                                className="px-3.5 py-2.5 rounded text-[#1e6f30] bg-[#48B859]/15 font-extrabold hover:bg-[#48B859]/25 transition border border-[#48B859]/30"
                            >
                                Campus &amp; Contact
                            </a>
                        </div>

                        {/* System Badge on the right */}
                        <div className="hidden lg:flex items-center gap-2 py-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                                Vocational Training Management System (KV-TMS)
                            </span>
                            <span className="bg-[#48B859]/15 text-[#1e6f30] border border-[#48B859]/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                Live System
                            </span>
                        </div>
                    </div>

                    {/* Mobile Drawer */}
                    {mobileNavOpen && (
                        <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-4 py-4 space-y-2 text-sm font-semibold">
                            {/* Founder Mobile Card */}
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
                                <img
                                    src={founderPhoto}
                                    alt="Prof. Achyuta Samanta"
                                    className="w-10 h-10 rounded-full object-cover border"
                                />
                                <div>
                                    <div className="font-bold text-xs text-slate-900">Prof. Achyuta Samanta</div>
                                    <div className="text-[10px] text-slate-500">Founder – KIIT &amp; KISS</div>
                                    <a href="https://achyutasamanta.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#257c37] underline">achyutasamanta.com</a>
                                </div>
                            </div>

                            <a
                                href="#about"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-white text-slate-700 hover:text-[#257c37] transition"
                            >
                                About KISS Bhubaneswar
                            </a>
                            <a
                                href="#mission-vision"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-white text-slate-700 hover:text-[#257c37] transition"
                            >
                                Mission &amp; Vision
                            </a>
                            <a
                                href="#trades"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-white text-slate-700 hover:text-[#257c37] transition"
                            >
                                Skill Development &amp; Trades
                            </a>
                            <a
                                href="#philosophy"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-white text-slate-700 hover:text-[#257c37] transition"
                            >
                                "Earn While Learn" Closed-Loop Paradigm
                            </a>
                            <a
                                href="#impact"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-white text-slate-700 hover:text-[#257c37] transition"
                            >
                                University Impact &amp; Reach
                            </a>
                            <a
                                href="#contact"
                                onClick={() => setMobileNavOpen(false)}
                                className="block px-3 py-2 rounded-lg bg-[#48B859]/15 text-[#1e6f30] font-bold border border-[#48B859]/30"
                            >
                                Campus &amp; Contact Details
                            </a>
                            <div className="pt-2">
                                {currentUser ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => { setMobileNavOpen(false); onGoToPortal(); }}
                                            className="w-full bg-[#48B859] hover:bg-[#3ea34e] text-white font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft size={16} /> Back to Portal ({currentUser.fullName || currentUser.collegeId})
                                        </button>
                                        <button
                                            onClick={() => { setMobileNavOpen(false); onLogout(); }}
                                            className="w-full bg-rose-50 text-rose-700 font-bold text-xs py-2 rounded-xl border border-rose-200 flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onGoToLogin}
                                        className="w-full bg-[#2D3591] hover:bg-[#232a74] text-white font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 border border-indigo-400/30"
                                    >
                                        <ShieldCheck size={16} className="text-[#fcb900]" /> Portal Login
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* ========================================================================= */}
            {/* 2. HERO SECTION WITH AUTHENTIC VOCATIONAL ARTISAN IMAGE                   */}
            {/* ========================================================================= */}
            <section className="bg-[#48B859] text-white py-14 sm:py-20 px-4 relative overflow-hidden">
                {/* Background decorative soft glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 w-80 h-80 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-2xl space-y-5">
                        <div className="inline-flex items-center gap-2 bg-[#fcb900] text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md">
                            <Sparkles size={14} className="text-slate-900" />
                            <span>World's Largest Indigenous Education Institution</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-xs">
                            Transforming Indigenous Lives Through <span className="text-[#fcb900]">Vocational Skills &amp; Dignity</span>
                        </h1>
                        <p className="text-sm sm:text-base text-white/95 leading-relaxed font-normal">
                            Vocational education and skill development are an integral part of the curriculum at <strong className="font-bold text-white underline decoration-[#fcb900]/60 decoration-2 underline-offset-2">KISS Bhubaneswar</strong>. Alongside 100% free formal education, KV-TMS powers end-to-end craft training, batch production, commercial sales, and real-time <strong className="font-bold text-white underline decoration-[#fcb900]/60 decoration-2 underline-offset-2">"Earn While Learn"</strong> direct stipends for over 30,000 tribal scholars.
                        </p>

                        <div className="pt-3 flex flex-wrap gap-3.5">
                            <a
                                href="#trades"
                                className="bg-[#fcb900] hover:bg-[#e0a500] text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 text-sm border border-amber-400 group"
                            >
                                <BookOpen size={17} className="text-slate-950" />
                                <span>Explore 50+ Vocational Trades</span>
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </a>
                            <a
                                href="#about"
                                className="bg-[#2D3591] hover:bg-[#242b78] border border-indigo-400/30 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition text-sm flex items-center gap-2"
                            >
                                <Sparkles size={16} className="text-[#fcb900]" />
                                <span>About KISS Vocational Mission</span>
                            </a>
                        </div>

                        {/* Institutional Highlights Pill */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
                            <span className="bg-black/15 border border-white/25 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                                <CheckCircle2 size={13} className="text-[#fcb900]" /> 100% Free Residential Education
                            </span>
                            <span className="bg-black/15 border border-white/25 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                                <CheckCircle2 size={13} className="text-[#fcb900]" /> 50+ Trades Imparted
                            </span>
                            <span className="bg-black/15 border border-white/25 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                                <CheckCircle2 size={13} className="text-[#fcb900]" /> UNDP &amp; British Council Supported
                            </span>
                        </div>
                    </div>

                    {/* Hero Visual Card: Authentic Vocational Artisan in Action */}
                    <div className="w-full lg:max-w-lg space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900 group">
                            <img
                                src={skillDevImg}
                                alt="Tribal artisan student creating traditional ethnic art at KISS Vocational Studio"
                                className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                            
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <span className="bg-[#fcb900] text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                                    Vocational Studio in Action
                                </span>
                                <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                                    Preserving Heritage &bull; Empowering Artisans
                                </h3>
                                <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">
                                    Indigenous tribal scholar crafting traditional Saura/Warli motifs in the KISS handicraft workshop.
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats Grid Overlay */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/25 text-center text-xs">
                            <div>
                                <span className="text-[10px] text-white/80 block uppercase font-bold">Tribal Scholars</span>
                                <span className="text-base font-black text-white">30,000+</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/80 block uppercase font-bold">Vocational Trades</span>
                                <span className="text-base font-black text-[#fcb900]">50+</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/80 block uppercase font-bold">Course Fees</span>
                                <span className="text-base font-black text-white">100% Free</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/80 block uppercase font-bold">Stipends</span>
                                <span className="text-base font-black text-white">DBT Direct</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. ABOUT US SECTION (DIRECT FROM KISS SKILL DEVELOPMENT PORTAL)           */}
            {/* ========================================================================= */}
            <section id="about" className="py-16 sm:py-20 px-4 max-w-7xl mx-auto w-full">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-[#1e6f30] text-xs font-black uppercase tracking-widest bg-[#48B859]/15 px-3.5 py-1 rounded-full border border-[#48B859]/30">
                        About KISS Skill Development
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                        Empowering Tribal Youth with Sustainable Livelihood Skills
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                        Kalinga Institute of Social Sciences (KISS) is the world's largest fully free residential institution for indigenous children, combining holistic academics from Kindergarten to Post-Doctoral studies with rigorous occupational vocational education.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left: About Details & Text */}
                    <div className="lg:col-span-7 space-y-5">
                        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <GraduationCap size={22} className="text-[#48B859]" />
                                Integral Part of Curriculum at KISS
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Vocational education and skill development are an integral part of the curriculum at KISS. Along with formal education, it plays a vital role in the empowerment of tribal students. Each student is imparted with vocational training in one of the <strong>50 trades offered at the institute</strong> as per their talent, natural artistic heritage, and career interest.
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Obtaining occupational skills helps tribal students develop into <strong>successful micro-entrepreneurs</strong> or become fit for corporate and industrial work life. The foundation offers training in diverse fields such as tailoring, appliqué work, food processing, eco-chemical production, bamboo craft, carpentry, animal husbandry, and pisciculture.
                            </p>
                        </div>

                        {/* Four Key Pillars */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-[#1e6f30] font-bold text-xs uppercase mb-1">
                                    <Sparkles size={16} /> Global Partnerships
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Entrepreneurship and innovation training is provided with the support of the <strong>British Council</strong> and <strong>UNDP</strong>.
                                </p>
                            </div>
                            <div className="bg-teal-50/70 border border-teal-200/80 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase mb-1">
                                    <Palette size={16} /> Indigenous Crafts
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Preserving indigenous culture through ethnic Saura art, Warli murals, handlooms, and bamboo woodcraft.
                                </p>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase mb-1">
                                    <Coins size={16} /> "Earn While Learn"
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Commercial proceeds from student products are directly credited to trainees as production stipends.
                                </p>
                            </div>
                            <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-[#2D3591] font-bold text-xs uppercase mb-1">
                                    <Building size={16} /> Modern Studios
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    State-of-the-art computer labs, smart design workshops, digital libraries, and internet access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Authentic Campus Congregation Image */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white group">
                            <img
                                src={campusOverviewImg}
                                alt="30,000+ Tribal Students at KISS Bhubaneswar residential campus"
                                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <span className="bg-[#48B859] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow">
                                    Campus Scale
                                </span>
                                <h4 className="text-base font-bold text-white mt-1">
                                    30,000+ Indigenous Tribal Scholars
                                </h4>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    World's largest residential educational facility providing 100% free food, lodging, healthcare &amp; vocational training.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-medium border border-slate-200">
                            Recognized with <strong>UNESCO King Sejong Literacy Prize</strong> &bull; Special Consultative Status with <strong>UN ECOSOC</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 4. MISSION & VISION SECTION (DIRECT FROM OFFICIAL KISS PORTAL)            */}
            {/* ========================================================================= */}
            <section id="mission-vision" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-slate-100 to-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[#1e6f30] text-xs font-black uppercase tracking-widest bg-[#48B859]/15 px-3.5 py-1 rounded-full border border-[#48B859]/30">
                            Purpose &amp; Long-Term Vision
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                            Our Mission &amp; Vision
                        </h2>
                        <p className="text-sm text-slate-600 mt-2">
                            From a small beginning, our work has grown into an internationally acclaimed model guided by a clear institutional purpose.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mission Card: Harmonized Royal Indigo to Fresh Brand Green Gradient */}
                        <div className="bg-gradient-to-br from-[#2D3591] via-[#1f4a56] to-[#1e783b] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#fcb900] mb-6">
                                    <Compass size={28} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-[#fcb900] bg-black/20 px-3 py-1 rounded-full">
                                    Institutional Mission
                                </span>
                                <h3 className="text-2xl font-black text-white mt-4 mb-3">
                                    Free Learning, Leading &amp; Growing
                                </h3>
                                <blockquote className="text-base sm:text-lg text-emerald-50 italic leading-relaxed font-serif">
                                    "A world where all children and youth can learn free of cost to learn, lead and grow without fear to reach their full potential."
                                </blockquote>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
                                <span>100% Philanthropic Free-Ship</span>
                                <span className="font-bold text-white">KISS Foundation</span>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-gradient-to-br from-amber-500 via-[#fcb900] to-amber-600 text-slate-950 p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-slate-950/10 border border-slate-950/20 flex items-center justify-center text-slate-950 mb-6">
                                    <Target size={28} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white/40 px-3 py-1 rounded-full">
                                    Long-Term Vision
                                </span>
                                <h3 className="text-2xl font-black text-slate-950 mt-4 mb-3">
                                    Empowerment of 2 Million Indigenous Children
                                </h3>
                                <blockquote className="text-base sm:text-lg text-slate-900 italic leading-relaxed font-serif font-semibold">
                                    "To empower 2 million indigenous children through quality comprehensive education and sustainable livelihood skills."
                                </blockquote>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-950/15 flex items-center justify-between text-xs text-slate-900 font-semibold">
                                <span>Sustainable Livelihoods</span>
                                <span className="font-bold">UN SDG Benchmark</span>
                            </div>
                        </div>
                    </div>

                    {/* Core Values Grid */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-[#48B859]/15 text-[#1e6f30] flex items-center justify-center font-bold mb-3">
                                01
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Zero-Burden Free Education</h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Complete free-ship covering tuition, hostel residence, clothing, meals, books, and healthcare.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold mb-3">
                                02
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Indigenous Cultural Dignity</h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Preserving and honoring the languages, folklore, traditions, and arts of 62 tribal communities.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-3">
                                03
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Economic Self-Reliance</h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Converting student craftsmanship into commercial revenue with 100% proceeds paid directly to scholars.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold mb-3">
                                04
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">UN SDG Alignment</h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Advancing SDG 1 (No Poverty), SDG 4 (Quality Education), SDG 8 (Decent Work), and SDG 10 (Reduced Inequalities).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. "EARN WHILE LEARN" PARADIGM SECTION                                    */}
            {/* ========================================================================= */}
            <section id="philosophy" className="py-16 sm:py-20 px-4 max-w-7xl mx-auto w-full">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-[#1e6f30] text-xs font-black uppercase tracking-widest bg-[#48B859]/15 px-3.5 py-1 rounded-full border border-[#48B859]/30">
                        KISS Innovation Paradigm
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                        The Closed-Loop "Earn While Learn" Initiative
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                        Introduced by the foundation, this initiative provides an added incentive: products crafted during training meet institutional demands and commercial sales, with 100% proceeds distributed back to the students.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                        { 
                            step: '01', 
                            title: 'Vocational Training & Studio Practicals', 
                            desc: 'Faculty instructs scholars in technical trades and ethnic crafts with daily hands-on studio hours.' 
                        },
                        { 
                            step: '02', 
                            title: 'Batch Production & Quality Control', 
                            desc: 'Standardized production units fabricate authentic apparel, handicrafts, and furniture with zero material wastage.' 
                        },
                        { 
                            step: '03', 
                            title: 'Captive & Commercial Sales', 
                            desc: 'Finished goods supply the KIIT/KISS campus demand as well as government tribal emporiums and cultural exhibitions.' 
                        },
                        { 
                            step: '04', 
                            title: 'Direct Benefit Transfer (DBT)', 
                            desc: 'Production revenues and incentive stipends are disbursed directly to individual student bank accounts.' 
                        },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#48B859] transition">
                            <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-50 transition-colors absolute top-3 right-4 select-none">
                                {item.step}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#48B859]/15 text-[#1e6f30] font-bold text-xs flex items-center justify-center mb-3">
                                {item.step}
                            </div>
                            <h3 className="font-bold text-slate-800 text-base leading-snug">{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Live System Integration Banner: Royal Indigo into Brand Green */}
                <div className="mt-8 bg-gradient-to-r from-[#2D3591] via-[#1f5945] to-[#48B859] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Coins size={28} className="text-[#fcb900] shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm text-white">KV-TMS Direct Benefit Transfer (DBT) Automated Workflow</h4>
                            <p className="text-xs text-emerald-100 mt-0.5">Automating attendance tracking, production batch completion, admin approval, and scholar stipends.</p>
                        </div>
                    </div>
                    <div className="bg-black/20 border border-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 backdrop-blur-xs">
                        <CheckCircle2 size={16} className="text-[#fcb900]" />
                        <span>100% Institutional DBT Disbursal</span>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 6. VOCATIONAL TRADES & CURRICULUMS SHOWCASE                               */}
            {/* ========================================================================= */}
            <section id="trades" className="py-16 sm:py-20 px-4 bg-slate-100 border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[#1e6f30] text-xs font-black uppercase tracking-widest bg-[#48B859]/15 px-3.5 py-1 rounded-full border border-[#48B859]/30">
                            Academic &amp; Industrial Trades
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                            Accredited Vocational Curriculums
                        </h2>
                        <p className="text-sm text-slate-600 mt-2">
                            Imparting 50+ specialized vocational trades accredited by the Board of Studies in Vocational &amp; Tribal Crafts.
                        </p>
                    </div>

                    {loadingCourses ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            Loading accredited vocational courses from database...
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm italic">
                            No active courses found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map((course, idx) => {
                                const Icon = getCourseIcon(course.code);
                                return (
                                    <div key={course.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#48B859] transition flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#48B859]/15 text-[#1e6f30] flex items-center justify-center shrink-0">
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-bold text-base text-slate-800">{course.name}</h3>
                                                    <span className="text-xs font-mono text-slate-400 font-semibold">{course.code}</span>
                                                </div>
                                                <span className="bg-[#2D3591]/10 text-[#2D3591] border border-[#2D3591]/20 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                                                    {course.durationMonths} Months
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>
                                            <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                                                    {course.moduleCount || course.syllabus?.length || 4} Syllabus Modules
                                                </span>
                                                <span className="text-[#257c37] font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> 100% Free Education Grant
                                                </span>
                                                <span className="text-[#257c37] font-semibold">
                                                    Earn-While-Learn Eligible
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Trade Breadth Footnote */}
                    <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2 text-center sm:text-left">
                        <span>
                            Full spectrum of 50 trades includes: <strong>Tailoring, Appliqué, Food Processing, Bamboo Furniture, Chemical Production, Pisciculture, Poultry, Floriculture, Pottery, Electrical Maintenance, and Screen Printing.</strong>
                        </span>
                        <a href="https://kiss.ac.in/skill-development/" target="_blank" rel="noopener noreferrer" className="text-[#257c37] hover:text-[#48B859] font-bold hover:underline flex items-center gap-1 mx-auto sm:mx-0">
                            View All on kiss.ac.in <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 7. UNIVERSITY IMPACT & STATS SECTION                                      */}
            {/* ========================================================================= */}
            <section id="impact" className="py-16 sm:py-20 px-4 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[#fcb900] text-xs font-black uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-full border border-white/20">
                            Global Significance &amp; Outreach
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 tracking-tight">
                            KISS University Impact at a Glance
                        </h2>
                        <p className="text-sm text-slate-400 mt-2">
                            Pioneering tribal empowerment, social transformation, and indigenous preservation at unprecedented global scale.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-[#fcb900] block">30,000+</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Indigenous Students on Campus</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">80,000+</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Alumni &amp; Lives Impacted</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-cyan-400 block">62</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Tribes Represented (13 PVTGs)</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-[#fcb900] block">50+</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Vocational Trades Imparted</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">100%</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Free Residential Education</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <span className="text-2xl sm:text-3xl font-black text-cyan-400 block">1st</span>
                            <span className="text-xs text-slate-300 font-medium mt-1 block">Tribal Deemed University in World</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 8. CAMPUS & CONTACT SECTION (DIRECT FROM OFFICIAL KISS PORTAL)            */}
            {/* ========================================================================= */}
            <section id="contact" className="py-16 sm:py-20 px-4 max-w-7xl mx-auto w-full">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-[#1e6f30] text-xs font-black uppercase tracking-widest bg-[#48B859]/15 px-3.5 py-1 rounded-full border border-[#48B859]/30">
                        Get In Touch
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                        Campus &amp; Institutional Contact
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Have questions about the Vocational Training Programs, Earn-While-Learn initiative, or campus visits? Reach out to our administrative team.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Contact Information Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Address Card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#48B859]/15 text-[#1e6f30] flex items-center justify-center shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Campus Address</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Campus 10, K.I.S.S., Bhubaneswar, Odisha, India – 751024
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    (Main Residential &amp; Vocational Training Hub)
                                </p>
                            </div>
                        </div>

                        {/* Administrative Campus */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                                <Building size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">University Headquarters</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Campus 3, Patharagadia, Bhubaneswar, Odisha, India – 751024
                                </p>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Telephone Contact</h4>
                                <p className="text-xs text-slate-700 font-mono mt-1">
                                    +91 674 2725340 / +91 674 2725380
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    General Inquiries &amp; Academic Helpdesk
                                </p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Email Addresses</h4>
                                <p className="text-xs font-mono text-[#257c37] font-semibold mt-1">
                                    info@kiss.ac.in &bull; contact@kiss.ac.in
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    vocational@kiss.ac.in (KV-TMS Directorate)
                                </p>
                            </div>
                        </div>

                        {/* Websites & Hours */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Official Web Portals</h4>
                                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                    <div><a href="https://kiss.ac.in" target="_blank" rel="noopener noreferrer" className="text-[#257c37] hover:text-[#48B859] hover:underline">kiss.ac.in</a> (KISS Foundation)</div>
                                    <div><a href="https://university.kiss.ac.in" target="_blank" rel="noopener noreferrer" className="text-[#257c37] hover:text-[#48B859] hover:underline">university.kiss.ac.in</a> (Deemed to be University)</div>
                                    <div><a href="https://artofgiving.in.net" target="_blank" rel="noopener noreferrer" className="text-[#257c37] hover:text-[#48B859] hover:underline">artofgiving.in.net</a> (Art of Giving Movement)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Inquiry Message Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="border-b pb-4 mb-5">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Send size={18} className="text-[#48B859]" />
                                    Send an Inquiry to KV-TMS Administration
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Have a query regarding tribal craft batches, commercial orders, or vocational admissions?
                                </p>
                            </div>

                            {contactSubmitted ? (
                                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                                    <div className="w-12 h-12 bg-[#48B859]/15 text-[#1e6f30] rounded-full flex items-center justify-center mx-auto">
                                        <Check size={24} />
                                    </div>
                                    <h4 className="font-bold text-base text-emerald-950">Thank You! Your Inquiry Has Been Received.</h4>
                                    <p className="text-xs text-emerald-800">
                                        The Vocational Directorate at KISS Campus 10 will review your message and respond to <strong>{contactForm.email || 'your email'}</strong> promptly.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                placeholder="e.g. Ramesh Chandra Majhi"
                                                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                placeholder="e.g. ramesh@example.com"
                                                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Mobile</label>
                                            <input
                                                type="tel"
                                                value={contactForm.phone}
                                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category *</label>
                                            <select
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20 bg-white font-semibold"
                                            >
                                                <option value="Vocational Training Inquiry">Vocational Training Curriculum</option>
                                                <option value="Earn While Learn Paradigm">Earn While Learn Stipend Program</option>
                                                <option value="Handicrafts Purchase / Bulk Order">Tribal Handicrafts Bulk Order</option>
                                                <option value="Campus Visit & Collaboration">Campus Visit &amp; Institutional Partner</option>
                                                <option value="Other Inquiries">General University Inquiry</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Query *</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={contactForm.message}
                                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                            placeholder="Please describe your inquiry, questions about vocational trades, or collaboration interest..."
                                            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20 resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-[11px] text-slate-400">
                                            Official communication under KISS Foundation Bhubaneswar.
                                        </p>
                                        <button
                                            type="submit"
                                            className="bg-[#48B859] hover:bg-[#3ea34e] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow hover:shadow-md flex items-center gap-1.5 border border-emerald-400"
                                        >
                                            <Send size={13} /> Submit Message
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 9. OFFICIAL FOOTER                                                        */}
            {/* ========================================================================= */}
            <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
                    {/* Col 1 */}
                    <div className="space-y-3">
                        <img
                            src={kissLogo}
                            alt="KISS Logo"
                            className="h-12 w-auto object-contain brightness-110"
                        />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Kalinga Institute of Social Sciences (KISS) Deemed to be University. The world's largest indigenous residential educational institution.
                        </p>
                        <p className="text-[11px] text-[#fcb900] font-semibold">
                            Founded by Prof. Achyuta Samanta
                        </p>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-2">
                        <h4 className="text-white font-bold text-sm">Quick Links</h4>
                        <ul className="space-y-1.5 text-xs">
                            <li><a href="#about" className="hover:text-white transition">About KISS Bhubaneswar</a></li>
                            <li><a href="#mission-vision" className="hover:text-white transition">Mission &amp; Vision</a></li>
                            <li><a href="#trades" className="hover:text-white transition">Vocational Trades &amp; Curriculum</a></li>
                            <li><a href="#philosophy" className="hover:text-white transition">"Earn While Learn" Paradigm</a></li>
                            <li><a href="#impact" className="hover:text-white transition">Global Impact &amp; Recognition</a></li>
                            <li><a href="#contact" className="hover:text-white transition">Campus &amp; Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-2">
                        <h4 className="text-white font-bold text-sm">Institutional Partners</h4>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                            <li>&bull; United Nations Development Programme (UNDP)</li>
                            <li>&bull; British Council (UK)</li>
                            <li>&bull; United Nations Population Fund (UNFPA)</li>
                            <li>&bull; UNESCO Literacy Prize Laureate</li>
                            <li>&bull; Ministry of Tribal Affairs (Govt. of India)</li>
                        </ul>
                    </div>

                    {/* Col 4 */}
                    <div className="space-y-2">
                        <h4 className="text-white font-bold text-sm">Campus Information</h4>
                        <p className="text-xs text-slate-400">
                            <strong>Campus 10:</strong> K.I.S.S., Bhubaneswar, Odisha – 751024<br />
                            <strong>Phone:</strong> +91 674 2725340<br />
                            <strong>Email:</strong> info@kiss.ac.in
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                            Deemed to be University under Section 3 of UGC Act, 1956
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600 space-y-1">
                    <p>&copy; {new Date().getFullYear()} Kalinga Institute of Social Sciences (KISS). All Rights Reserved.</p>
                    <p>KV-TMS v1.0 &bull; Closed-Loop Vocational Training Management System for Indigenous Tribal Empowerment</p>
                </div>
            </footer>

        </div>
    );
}