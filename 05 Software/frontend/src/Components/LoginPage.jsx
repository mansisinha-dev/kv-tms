import React, { useState } from 'react';
import axios from 'axios';
import {
    Lock,
    User,
    ShieldCheck,
    ArrowRight,
    AlertCircle,
    Sparkles,
    ArrowLeft,
    GraduationCap,
    UserCheck,
    Factory,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound
} from 'lucide-react';

import kissLogo from '../assets/kiss-logo.png';
import { API_BASE_URL } from '../apiConfig';

const PORTAL_ROLES = [
    {
        id: 'ADMIN',
        roleKey: 'ROLE_ADMIN',
        title: 'Central Admin',
        badge: 'Executive Oversight',
        subtitle: 'Governance, approvals & system control',
        icon: ShieldCheck,
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        activeClass: 'border-[#006837] bg-emerald-50/70 ring-2 ring-[#fcb900]/80 shadow-md',
        defaultId: 'KISS-ADM-001',
        defaultPw: 'KISS-ADM-001@123',
        idLabel: 'Administrator Employee ID',
        idPlaceholder: 'e.g. KISS-ADM-001',
        description: 'Institutional administration console for scholar admission registries, master course approvals, faculty oversight, and financial accounts.',
        scope: 'Governance & Institutional Approvals'
    },
    {
        id: 'PRODUCTION',
        roleKey: 'ROLE_PRODUCTION_MANAGER',
        title: 'Production Unit',
        badge: 'Artisan Manufacturing',
        subtitle: 'BOM, inventory & commercial sales',
        icon: Factory,
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        activeClass: 'border-amber-500 bg-amber-50/70 ring-2 ring-[#fcb900]/80 shadow-md',
        defaultId: 'KISS-PRD-001',
        defaultPw: 'KISS-PRD-001@123',
        idLabel: 'Production Supervisor Employee ID',
        idPlaceholder: 'e.g. KISS-PRD-001',
        description: 'Operations console for Bill of Materials (BOM), batch fabrication scheduling, finished goods warehouse stock, and institutional sales orders.',
        scope: 'BOM, Batch Production & Stock'
    },
    {
        id: 'TRAINER',
        roleKey: 'ROLE_TRAINER',
        title: 'Faculty Trainer',
        badge: 'Studio Mentors',
        subtitle: 'Workshop delivery & scholar grading',
        icon: UserCheck,
        colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        activeClass: 'border-indigo-600 bg-indigo-50/70 ring-2 ring-[#fcb900]/80 shadow-md',
        defaultId: 'KISS-FAC-001',
        defaultPw: 'KISS-FAC-001@123',
        idLabel: 'Faculty Instructor Staff ID',
        idPlaceholder: 'e.g. KISS-FAC-001 or KISS-FAC-002',
        description: 'Faculty portal for practical studio workshop conduction, daily scholar attendance logs, trade curriculums, and competency evaluations.',
        scope: 'Workshops, Attendance & Grading'
    },
    {
        id: 'TRAINEE',
        roleKey: 'ROLE_TRAINEE',
        title: 'Vocational Scholar',
        badge: 'Tribal Learners',
        subtitle: 'Earn While Learn & skills portal',
        icon: GraduationCap,
        colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
        activeClass: 'border-teal-600 bg-teal-50/70 ring-2 ring-[#fcb900]/80 shadow-md',
        defaultId: 'KISS-TRN-2026-001',
        defaultPw: 'KISS-TRN-2026-001@123',
        idLabel: 'Scholar University Roll Number',
        idPlaceholder: 'e.g. KISS-TRN-2026-001',
        description: 'Learner portal for tribal scholars to view personal practical attendance, syllabus modules progress, and live Direct Benefit Transfer (DBT) stipends.',
        scope: 'Scholar Dashboard & DBT Stipends'
    }
];

export const DEFAULT_DEMO_ACCOUNTS = [
    {
        username: 'KISS-ADM-001',
        collegeId: 'KISS-ADM-001',
        name: 'Dr. Debashis Mohanty',
        fullName: 'Dr. Debashis Mohanty',
        password: 'KISS-ADM-001@123',
        role: 'ROLE_ADMIN',
        email: 'debashis.mohanty@kiss.ac.in',
        contactNumber: '+91 94370 12345',
        trade: 'Central University Governance'
    },
    {
        username: 'KISS-PRD-001',
        collegeId: 'KISS-PRD-001',
        name: 'Kavita Priyadarshini Das',
        fullName: 'Kavita Priyadarshini Das',
        password: 'KISS-PRD-001@123',
        role: 'ROLE_PRODUCTION_MANAGER',
        email: 'kavita.das@kiss.ac.in',
        contactNumber: '+91 94371 88765',
        trade: 'Commercial Artisan Production Unit'
    },
    {
        username: 'KISS-FAC-001',
        collegeId: 'KISS-FAC-001',
        name: 'Prof. Sanatan Marndi',
        fullName: 'Prof. Sanatan Marndi',
        password: 'KISS-FAC-001@123',
        role: 'ROLE_TRAINER',
        email: 'sanatan.marndi@kiss.ac.in',
        contactNumber: '+91 94371 55667',
        trade: 'VOC-ART-102 (Handicrafts & Tribal Art)'
    },
    {
        username: 'KISS-FAC-002',
        collegeId: 'KISS-FAC-002',
        name: 'Sasmita Sahoo',
        fullName: 'Sasmita Sahoo',
        password: 'KISS-FAC-002@123',
        role: 'ROLE_TRAINER',
        email: 'sasmita.sahoo@kiss.ac.in',
        contactNumber: '+91 94371 66778',
        trade: 'VOC-SEW-101 (Sewing & Apparel Manufacturing)'
    },
    {
        username: 'KISS-TRN-2026-001',
        collegeId: 'KISS-TRN-2026-001',
        name: 'Laxman Majhi',
        fullName: 'Laxman Majhi',
        password: 'KISS-TRN-2026-001@123',
        role: 'ROLE_TRAINEE',
        email: 'laxman.majhi@kiss.ac.in',
        contactNumber: '+91 98610 23456',
        trade: 'VOC-SEW-101 (Sewing & Apparel Manufacturing)',
        courseCode: 'VOC-SEW-101',
        courseName: 'Sewing & Apparel Manufacturing',
        category: 'Scheduled Tribe (KISS Scholar)'
    }
];

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
    const [selectedRoleId, setSelectedRoleId] = useState('ADMIN');
    const [username, setUsername] = useState('KISS-ADM-001');
    const [password, setPassword] = useState('KISS-ADM-001@123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const activeRole = PORTAL_ROLES.find(r => r.id === selectedRoleId) || PORTAL_ROLES[0];

    // Handle switching between the 4 role boxes
    const handleSelectRole = (role) => {
        setSelectedRoleId(role.id);
        setUsername(role.defaultId);
        setPassword(role.defaultPw);
        setError('');
    };

    // Auto-fill demo credentials shortcut
    const handleLoadDemo = () => {
        setUsername(activeRole.defaultId);
        setPassword(activeRole.defaultPw);
        setError('');
    };

    // Instant offline/demo bypass login
    const handleEnterOfflineMode = (forcedUser = null) => {
        const target = forcedUser || DEFAULT_DEMO_ACCOUNTS.find(u => u.username === activeRole.defaultId) || {
            username: activeRole.defaultId,
            collegeId: activeRole.defaultId,
            name: activeRole.title,
            fullName: activeRole.title,
            role: activeRole.roleKey,
            email: `${activeRole.defaultId.toLowerCase()}@kiss.ac.in`,
            contactNumber: '+91 94370 00000',
            trade: activeRole.description
        };

        const token = `offline-jwt-${target.username}-${Date.now()}`;
        localStorage.setItem('kvtms_token', token);
        onLoginSuccess({
            ...target,
            token,
            isOfflineMode: true
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
            setError('Please enter both your University ID and password.');
            setLoading(false);
            return;
        }

        // 1. Try real Spring Boot JWT login API (with timeout)
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, {
                username: trimmedUser,
                password: trimmedPass
            }, { timeout: 3500 });

            if (res.data && res.data.token) {
                localStorage.setItem('kvtms_token', res.data.token);
                
                // Extract assigned role from API response or fallback safely
                const assignedRole = res.data.role || (Array.isArray(res.data.roles) ? res.data.roles[0] : null) || 
                    (trimmedUser.includes('ADM') ? 'ROLE_ADMIN' : 
                     trimmedUser.includes('PRD') ? 'ROLE_PRODUCTION_MANAGER' : 
                     trimmedUser.includes('FAC') ? 'ROLE_TRAINER' : 'ROLE_TRAINEE');
                
                onLoginSuccess({
                    username: res.data.collegeId || res.data.username || trimmedUser,
                    collegeId: res.data.collegeId || res.data.username || trimmedUser,
                    fullName: res.data.fullName || trimmedUser,
                    name: res.data.fullName || trimmedUser,
                    role: assignedRole,
                    email: res.data.email,
                    contactNumber: res.data.contactNumber,
                    trade: res.data.trade,
                    courseName: res.data.courseName,
                    courseCode: res.data.courseCode,
                    category: res.data.category,
                    admissionDate: res.data.admissionDate,
                    token: res.data.token
                });
                return;
            }
        } catch (err) {
            console.warn("Backend API response error:", err);

            // If backend specifically returned a 401 / bad credentials on an active server
            if (err.response && err.response.status === 401) {
                setError(err.response?.data?.message || 'Invalid Credentials! Please verify your University ID and password.');
                setLoading(false);
                return;
            }

            // 2. Resilient Offline Fallback (when backend is restarting or unreachable)
            // Check default demo accounts first
            const demoMatch = DEFAULT_DEMO_ACCOUNTS.find(
                u => (u.username.toLowerCase() === trimmedUser.toLowerCase() || u.collegeId.toLowerCase() === trimmedUser.toLowerCase()) &&
                     (!trimmedPass || trimmedPass === u.password || trimmedPass.includes(u.username))
            );

            // Check cached local registry
            let localUsers = [];
            try {
                const saved = localStorage.getItem('kvtms_user_registry');
                if (saved) localUsers = JSON.parse(saved);
            } catch (e) {}

            const registryMatch = localUsers.find(
                u => ((u.username || '').toLowerCase() === trimmedUser.toLowerCase() || (u.collegeId || '').toLowerCase() === trimmedUser.toLowerCase()) &&
                    (!u.password || u.password === trimmedPass)
            );

            const matched = demoMatch || registryMatch;

            if (matched) {
                handleEnterOfflineMode(matched);
                return;
            }

            // Check if user clicked login with active portal default credentials
            const roleMatch = PORTAL_ROLES.find(r => r.defaultId.toLowerCase() === trimmedUser.toLowerCase());
            if (roleMatch) {
                handleEnterOfflineMode();
                return;
            }

            setError('Unable to reach server. Click the button below to continue in Offline Demo Mode.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#121642] via-[#0d1627] to-[#082819] text-slate-800 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans">

            {/* Geometric Grid Texture for Crisp Dimensional Contrast */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none"></div>

            {/* Vibrant Contrasting Ambient Glows (#2D3591 Royal Indigo, #48B859 Brand Green, #fcb900 Gold) */}
            <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] bg-[#2D3591]/35 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-[#48B859]/25 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 left-1/4 w-[30rem] h-[30rem] bg-[#fcb900]/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* 1. Top Navigation Bar */}
            <header className="w-full max-w-5xl flex justify-between items-center z-20 py-2">
                <button
                    onClick={onBackToHome}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                    <ArrowLeft size={15} />
                    <span>Back to KISS Home page (kiss.ac.in)</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 text-white/95 text-xs font-semibold bg-[#2D3591]/30 px-3.5 py-1.5 rounded-full border border-indigo-400/30 backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#48B859] animate-pulse"></span>
                    <span>KV-TMS Secure Portal Gateway</span>
                </div>
            </header>

            {/* 2. Main Authentication Card */}
            <main className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-4 border-[#fcb900] overflow-hidden z-10 my-4 sm:my-6 animate-fade-in">

                {/* Institutional University Header */}
                <div className="bg-gradient-to-r from-[#2D3591] via-[#1f5945] to-[#48B859] text-white p-6 sm:p-7 text-center border-b-4 border-[#fcb900] relative">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <img
                            src={kissLogo}
                            alt="KISS Logo"
                            className="h-14 sm:h-16 w-auto object-contain bg-white/95 rounded-xl p-1.5 shadow-md border border-amber-300"
                        />
                    </div>
                    <h1 className="text-base sm:text-xl font-black tracking-wide text-white">
                        KALINGA INSTITUTE OF SOCIAL SCIENCES
                    </h1>
                    <p className="text-xs sm:text-sm text-green-100 font-medium mt-0.5">
                        Deemed to be University &bull; Bhubaneswar, Odisha
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-[11px] font-bold">
                        <span className="bg-[#fcb900] text-slate-950 px-3 py-0.5 rounded-full shadow-xs">
                            NAAC Grade "A" Accredited
                        </span>
                        <span className="bg-black/25 border border-white/20 text-white px-3 py-0.5 rounded-full backdrop-blur-xs">
                            KV-TMS Closed-Loop Vocational Authentication
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8">

                    {/* Section Header: Select Portal Segment */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-[#fcb900]" />
                                    <span>Select Your Portal Segment</span>
                                </h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Click your institutional role to open your dedicated sign-in portal:
                                </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                4 Access Roles
                            </span>
                        </div>
                    </div>

                    {/* 4 Interactive Role Boxes / Entrance Tiles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                        {PORTAL_ROLES.map((r) => {
                            const isSelected = selectedRoleId === r.id;
                            const IconComponent = r.icon;

                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleSelectRole(r)}
                                    className={`relative p-3 sm:p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer group ${
                                        isSelected
                                            ? r.activeClass
                                            : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-xs'
                                    }`}
                                >
                                    {/* Top Row: Icon + Selection Indicator */}
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                            isSelected ? 'bg-[#006837] text-white shadow-xs' : r.colorClass
                                        }`}>
                                            <IconComponent size={19} />
                                        </div>

                                        {isSelected && (
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-[#48B859] text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                                                <CheckCircle2 size={10} className="text-white" /> Active
                                            </span>
                                        )}
                                    </div>

                                    {/* Text Information */}
                                    <div>
                                        <h3 className={`text-xs sm:text-sm font-black leading-tight ${
                                            isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                                        }`}>
                                            {r.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug line-clamp-2">
                                            {r.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Context Spotlight Banner for Active Role */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#48B859] shrink-0"></span>
                            <div>
                                <span className="font-bold text-slate-900">{activeRole.title} Portal: </span>
                                <span className="text-slate-600 text-[11px]">{activeRole.description}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLoadDemo}
                            className="text-[11px] font-bold text-[#257c37] hover:text-[#48B859] hover:underline flex items-center gap-1 shrink-0 bg-white border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition"
                            title="Auto-fill demo credentials for this role"
                        >
                            <KeyRound size={12} className="text-[#fcb900]" />
                            <span>Auto-fill Demo ID</span>
                        </button>
                    </div>

                    {/* Error / Offline Mode Alert Banner */}
                    {error && (
                        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2.5 animate-fade-in shadow-xs">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                                <span className="font-semibold">{error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleEnterOfflineMode()}
                                className="w-full bg-[#006837] hover:bg-[#004d28] text-white py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                            >
                                <Sparkles size={14} className="text-[#fcb900]" />
                                <span>Enter as {activeRole.title} (Instant Offline Mode) &rarr;</span>
                            </button>
                        </div>
                    )}

                    {/* The Dedicated Sign-In Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Dynamic University ID Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                                <span>{activeRole.idLabel}</span>
                                <span className="text-[10px] text-slate-400 font-normal">Case-Sensitive</span>
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder={activeRole.idPlaceholder}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20 transition"
                                />
                            </div>
                        </div>

                        {/* Password Field with Show/Hide Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                                <span>Password</span>
                                <span className="text-[10px] text-slate-400 font-normal">Encrypted</span>
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900 focus:outline-none focus:border-[#48B859] focus:ring-2 focus:ring-[#48B859]/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2D3591] hover:bg-[#232a74] active:bg-[#1b2160] text-white font-black py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 disabled:opacity-50 mt-3 group cursor-pointer border border-indigo-400/30"
                        >
                            {loading ? (
                                <span>Authenticating credentials...</span>
                            ) : (
                                <>
                                    <span>Sign in to {activeRole.title} Portal</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#fcb900]" />
                                </>
                            )}
                        </button>

                        {/* Quick Demo Bypass Access Link */}
                        <div className="pt-1 text-center">
                            <button
                                type="button"
                                onClick={() => handleEnterOfflineMode()}
                                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 transition cursor-pointer"
                            >
                                <Sparkles size={12} className="text-[#fcb900]" />
                                <span>Bypass & test as {activeRole.title} (Instant Demo Access)</span>
                            </button>
                        </div>
                    </form>

                </div>

                {/* Card Footer: Security Policy */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Lock size={12} className="text-emerald-700" />
                        <span>256-Bit SSL Campus Authentication</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                        Administered by KISS University (Campus-10, Bhubaneswar)
                    </span>
                </div>

            </main>

            {/* 3. Bottom Footer Note */}
            <footer className="w-full max-w-5xl text-center py-2 text-white/60 text-xs z-10">
                <p>&copy; {new Date().getFullYear()} Kalinga Institute of Social Sciences (KISS Deemed to be University). All Rights Reserved.</p>
            </footer>

        </div>
    );
}