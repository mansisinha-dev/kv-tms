import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Calendar,
    Award,
    CheckCircle2,
    FileText,
    Send,
    Check,
    Mail,
    Phone,
    BookOpen,
    ShieldCheck,
    Clock,
    User,
    Tag,
    IdCard,
    AlertCircle,
    XCircle,
    GraduationCap,
    BarChart3,
    Bell,
    Megaphone,
    Pin,
    Coins,
    Wallet,
    CalendarCheck,
    Printer,
    Download,
    Camera,
    Upload,
    Trash2,
    MapPin,
    CheckCircle,
    Building,
    CreditCard,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

import { VocationalStore } from '../utils/vocationalStore';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function TraineePortal({ currentUser, activeSection = 'trainee-profile', onNavigateSection }) {
    const studentId = currentUser?.collegeId || currentUser?.username || 'KISS-TRN-2026-001';
    const [rubricScores, setRubricScores] = useState(() => VocationalStore.getRubricScores());

    useEffect(() => {
        const syncRubrics = () => setRubricScores(VocationalStore.getRubricScores());
        window.addEventListener('kvtms_vocational_sync', syncRubrics);
        return () => window.removeEventListener('kvtms_vocational_sync', syncRubrics);
    }, []);

    // 1. ACTIVE SECTION / TAB ROUTING (Sync with Left Sidebar)
    const [activeTab, setActiveTab] = useState(activeSection || 'trainee-profile');

    useEffect(() => {
        if (activeSection) {
            setActiveTab(activeSection === 'trainee' ? 'trainee-profile' : activeSection);
        }
    }, [activeSection]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (onNavigateSection) {
            onNavigateSection(tabId);
        }
    };

    // 2. SCHOLAR PROFILE & AVATAR PHOTO STATE
    const fileInputRef = useRef(null);
    const [photoUrl, setPhotoUrl] = useState(() => {
        return localStorage.getItem(`trainee_photo_${studentId}`) || '';
    });

    const [profile, setProfile] = useState({
        fullName: currentUser?.fullName || currentUser?.name || '',
        collegeId: studentId,
        email: currentUser?.email || '',
        contactNumber: currentUser?.contactNumber || '',
        trade: currentUser?.trade || '',
        courseId: currentUser?.courseId || null,
        category: currentUser?.category || 'Scheduled Tribe (KISS Scholar)',
        admissionDate: currentUser?.admissionDate || '',
        joiningDate: currentUser?.joiningDate || '',
        dob: currentUser?.dob || '',
        bloodGroup: currentUser?.bloodGroup || '',
        passOutDate: currentUser?.passOutDate || '',
        address: currentUser?.address || '',
        durationMonths: currentUser?.durationMonths || 6,
        status: currentUser?.status || 'ACTIVE'
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Please upload an image smaller than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setPhotoUrl(base64);
                localStorage.setItem(`trainee_photo_${studentId}`, base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoUrl('');
        localStorage.removeItem(`trainee_photo_${studentId}`);
    };

    // 3. CURRICULUM SYLLABUS MODULES
    const [syllabusModules, setSyllabusModules] = useState([]);
    const [loadingSyllabus, setLoadingSyllabus] = useState(true);

    // 4. ACADEMIC EXAMINATION EVALUATION SCORECARD
    const [examScore, setExamScore] = useState(null);
    const [loadingExam, setLoadingExam] = useState(true);

    // 5. ATTENDANCE LOGS & STATS (Synced with Trainer & Admin)
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    // 6. LEAVE MANAGEMENT
    const getLocalToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const todayStr = getLocalToday();

    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveSubmitted, setLeaveSubmitted] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(true);

    // 7. CAMPUS NOTICES BROADCAST FROM ADMIN
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    // 8. BATCH PRODUCTION STIPENDS & INCENTIVES
    const [batchStipends, setBatchStipends] = useState([]);
    const [loadingStipends, setLoadingStipends] = useState(true);

    const calculateDuration = (start, end) => {
        if (!start || !end) return 1;
        const [y1, m1, d1] = start.split('-').map(Number);
        const [y2, m2, d2] = end.split('-').map(Number);
        const date1 = new Date(y1, m1 - 1, d1);
        const date2 = new Date(y2, m2 - 1, d2);
        const diffTime = date2.getTime() - date1.getTime();
        if (diffTime < 0) return 1;
        return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleStartDateChange = (e) => {
        const val = e.target.value;
        setStartDate(val);
        if (endDate && val > endDate) {
            setEndDate(val);
        }
    };

    // Master Data Synchronization with Backend APIs
    const fetchAllData = async () => {
        let resolvedCourseId = 2;

        // 1. Fetch Profile
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/profile/${studentId}`);
            if (res.data) {
                setProfile(prev => ({
                    ...prev,
                    ...res.data,
                    trade: res.data.trade || prev.trade,
                    contactNumber: res.data.contactNumber || prev.contactNumber,
                    email: res.data.email || prev.email,
                    admissionDate: res.data.admissionDate || prev.admissionDate,
                    fullName: res.data.fullName || prev.fullName,
                    dob: res.data.dob || prev.dob,
                    joiningDate: res.data.joiningDate || prev.joiningDate,
                    bloodGroup: res.data.bloodGroup || prev.bloodGroup,
                    passOutDate: res.data.passOutDate || prev.passOutDate,
                    address: res.data.address || prev.address
                }));
                if (res.data.courseId) resolvedCourseId = res.data.courseId;
            }
        } catch (err) {
            // Fallback to local registry
            try {
                const saved = localStorage.getItem('kvtms_user_registry');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const match = parsed.find(u => u.username === studentId || u.collegeId === studentId);
                    if (match) {
                        setProfile(prev => ({
                            ...prev,
                            fullName: match.name || prev.fullName,
                            email: match.email || prev.email,
                            contactNumber: match.contactNumber || prev.contactNumber,
                            trade: match.trade || prev.trade,
                            category: match.category || prev.category,
                            dob: match.dob || prev.dob,
                            joiningDate: match.joiningDate || prev.joiningDate,
                            bloodGroup: match.bloodGroup || prev.bloodGroup,
                            passOutDate: match.passOutDate || prev.passOutDate,
                            address: match.address || prev.address
                        }));
                        if (match.trade?.includes('101')) resolvedCourseId = 1;
                        else if (match.trade?.includes('103')) resolvedCourseId = 3;
                        else if (match.trade?.includes('104')) resolvedCourseId = 4;
                    }
                }
            } catch (e) {}
        }

        // 2. Fetch Syllabus Modules
        try {
            setLoadingSyllabus(true);
            const sylRes = await axios.get(`${API_BASE_URL}/academics/courses/${resolvedCourseId}/syllabus`);
            if (sylRes.data && Array.isArray(sylRes.data) && sylRes.data.length > 0) {
                setSyllabusModules(sylRes.data);
            } else {
                setSyllabusModules([]);
            }
        } catch (err) {
            setSyllabusModules([]);
        } finally {
            setLoadingSyllabus(false);
        }

        // 3. Fetch Examination Evaluation Scorecard
        try {
            setLoadingExam(true);
            const examRes = await axios.get(`${API_BASE_URL}/academics/scores/by-college-id/${studentId}`);
            if (examRes.data && examRes.data.score !== undefined) {
                setExamScore(examRes.data);
            } else {
                setExamScore(null);
            }
        } catch (err) {
            setExamScore(null);
        } finally {
            setLoadingExam(false);
        }

        // 4. Fetch Attendance Logs (Synced with Trainer Marker & Admin Overrides)
        try {
            setLoadingAttendance(true);
            const attRes = await axios.get(`${API_BASE_URL}/academics/trainees/by-college-id/${studentId}/attendance`);
            if (attRes.data && Array.isArray(attRes.data)) {
                setAttendanceLogs(attRes.data);
            } else {
                setAttendanceLogs([]);
            }
        } catch (err) {
            setAttendanceLogs([]);
        } finally {
            setLoadingAttendance(false);
        }

        // 5. Fetch Leave Applications
        try {
            setLoadingLeaves(true);
            const leavesRes = await axios.get(`${API_BASE_URL}/leaves/by-student/${studentId}`);
            if (Array.isArray(leavesRes.data)) {
                setLeaves(leavesRes.data);
            } else {
                setLeaves([]);
            }
        } catch (err) {
            setLeaves([]);
        } finally {
            setLoadingLeaves(false);
        }

        // 6. Fetch Campus Notices for Trainees & All
        try {
            setLoadingNotices(true);
            const noticeRes = await axios.get(`${API_BASE_URL}/notices`);
            if (Array.isArray(noticeRes.data)) {
                const filtered = noticeRes.data.filter(n => 
                    !n.targetAudience || n.targetAudience === 'ALL' || n.targetAudience === 'TRAINEES'
                );
                setNotices(filtered);
            } else {
                setNotices([]);
            }
        } catch (err) {
            setNotices([]);
        } finally {
            setLoadingNotices(false);
        }

        // 7. Fetch Batch Production Stipends & Artisan Bonuses
        try {
            setLoadingStipends(true);
            const myStipends = [];

            // Local stipend requests registry
            try {
                const localReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
                localReqs.forEach(req => {
                    if (Array.isArray(req.teamMembers)) {
                        const m = req.teamMembers.find(member => 
                            member.username === studentId || 
                            member.collegeId === studentId ||
                            (member.name && (member.name === profile.fullName || member.name === currentUser?.name || member.name === currentUser?.fullName))
                        );
                        if (m) {
                            myStipends.push({
                                id: req.id || `STIPEND-${req.batchNumber}`,
                                batchNumber: req.batchNumber,
                                productName: req.productName || 'Handcrafted Artisan Item',
                                unitsCrafted: m.unitsCrafted || 1,
                                amount: m.amount || req.stipendPerScholar || 0,
                                status: req.status || 'PENDING_ADMIN_APPROVAL',
                                dbtReference: req.dbtReference || null,
                                disbursedDate: req.disbursedDate || null,
                                submittedAt: req.submittedAt
                            });
                        }
                    }
                });
            } catch (e) {}

            // Backend incentives endpoint
            try {
                const incRes = await axios.get(`${API_BASE_URL}/incentives/by-college-id/${studentId}`);
                if (incRes.data && Array.isArray(incRes.data)) {
                    incRes.data.forEach(inc => {
                        const existing = myStipends.find(s => s.batchNumber === inc.productionRun?.batchNumber);
                        if (!existing) {
                            myStipends.push({
                                id: inc.id,
                                batchNumber: inc.productionRun?.batchNumber || 'BATCH',
                                productName: inc.product?.name || 'Handcrafted Artisan Item',
                                unitsCrafted: inc.unitsCrafted || 1,
                                amount: inc.amountEarned || 0,
                                status: inc.status === 'DISBURSED' ? 'APPROVED_AND_DISBURSED' : 'PENDING_ADMIN_APPROVAL',
                                dbtReference: inc.transactionReference || null,
                                disbursedDate: inc.disbursedDate || null,
                                submittedAt: inc.createdAt
                            });
                        } else if (inc.status === 'DISBURSED') {
                            existing.status = 'APPROVED_AND_DISBURSED';
                            existing.dbtReference = inc.transactionReference || existing.dbtReference;
                            existing.disbursedDate = inc.disbursedDate || existing.disbursedDate;
                        }
                    });
                }
            } catch (backendIncErr) {}

            setBatchStipends(myStipends);
        } catch (stipendErr) {
            setBatchStipends([]);
        } finally {
            setLoadingStipends(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [studentId]);

    // Handle Leave Submission
    const handleApplyLeave = async (e) => {
        e.preventDefault();
        if (!leaveReason.trim()) return;
        if (!startDate || !endDate) return;

        try {
            await axios.post(`${API_BASE_URL}/leaves/apply`, {
                collegeId: studentId,
                startDate: startDate,
                endDate: endDate,
                reason: leaveReason.trim()
            });

            // Refresh leaves from MySQL
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${studentId}`);
            if (Array.isArray(res.data)) {
                setLeaves(res.data);
            }
            setLeaveSubmitted(true);
            setLeaveReason('');
            setTimeout(() => setLeaveSubmitted(false), 4000);
        } catch (err) {
            console.error("Leave application error:", err);
            alert(`Failed to submit leave: ${err.response?.data?.message || err.message}`);
        }
    };

    // Calculate Attendance Statistics
    const totalSessions = attendanceLogs.length;
    const presentCount = attendanceLogs.filter(l => l.status === 'PRESENT').length;
    const absentCount = attendanceLogs.filter(l => l.status === 'ABSENT').length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 85;
    const isStipendEligible = attendancePercentage >= 75;

    // Initials fallback
    const initials = (profile.fullName || 'TR')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TR';

    return (
        <div className="space-y-6">

            {/* Quick Header Banner (Clean Overview) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* Scholar Photo Circle */}
                    <div className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-50 border-2 border-[#006837] shadow-sm flex items-center justify-center font-black text-xl text-teal-800">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Scholar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-[#006837] text-white p-1 rounded-full shadow hover:bg-[#004d28] transition"
                            title="Update Profile Photo"
                        >
                            <Camera size={12} />
                        </button>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-slate-800">{profile.fullName}</h2>
                            <span className="bg-[#006837] text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                                {profile.collegeId}
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <ShieldCheck size={12} className="text-[#006837]" /> Verified KISS Scholar
                            </span>
                            <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <GraduationCap size={12} className="text-amber-700" /> 100% Free Education (KISS Trust)
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {profile.trade} • {profile.category}
                        </p>
                    </div>
                </div>

                {/* Right Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Active & In-Training
                    </span>
                    <button
                        type="button"
                        onClick={fetchAllData}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                        title="Refresh Synchronized Data"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Hidden Photo Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
            />

            {/* ========================================================================= */}
            {/* TAB 1: SCHOLAR PROFILE                                                    */}
            {/* ========================================================================= */}
            {(activeTab === 'trainee-profile' || activeTab === 'trainee') && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <User size={18} className="text-[#006837]" />
                                Scholar Official Admission & Registration Profile
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Permanent institutional identity records registered with KISS Deemed to be University
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006837] border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Upload size={13} /> {photoUrl ? 'Change Photo' : 'Upload Photo'}
                            </button>
                            {photoUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition"
                                    title="Remove Photo"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Registration Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Full Legal Name */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <User size={14} className="text-[#006837]" />
                                <span>Full Legal Name</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.fullName}</p>
                        </div>

                        {/* 2. Roll / College ID */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <ShieldCheck size={14} className="text-teal-600" />
                                <span>College Roll Number</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 font-mono">{profile.collegeId}</p>
                        </div>

                        {/* 3. Date of Birth */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <Calendar size={14} className="text-blue-600" />
                                <span>Date of Birth (DOB)</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.dob || 'N/A'}</p>
                        </div>

                        {/* 4. Blood Group */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <AlertCircle size={14} className="text-rose-600" />
                                <span>Blood Group</span>
                            </div>
                            <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded inline-block">
                                {profile.bloodGroup || 'N/A'}
                            </p>
                        </div>

                        {/* 5. Date of Joining */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <Calendar size={14} className="text-amber-600" />
                                <span>Date of Joining (DOJ)</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.joiningDate || profile.admissionDate || 'N/A'}</p>
                        </div>

                        {/* 6. Expected Passout Date */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <GraduationCap size={14} className="text-purple-600" />
                                <span>Expected Passout Date</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.passOutDate || 'N/A'}</p>
                        </div>

                        {/* 7. Registered Email */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <Mail size={14} className="text-indigo-600" />
                                <span>Registered Email ID</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 font-mono text-xs truncate">{profile.email}</p>
                        </div>

                        {/* 8. Mobile Number */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <Phone size={14} className="text-emerald-600" />
                                <span>Mobile Contact Number</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 font-mono">{profile.contactNumber}</p>
                        </div>

                        {/* 9. Enrolled Vocational Trade */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <BookOpen size={14} className="text-[#006837]" />
                                <span>Enrolled Trade & Specialization</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.trade}</p>
                        </div>

                        {/* 10. Scholar Demographics Category */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <Tag size={14} className="text-purple-600" />
                                <span>Institutional Category</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{profile.category}</p>
                        </div>

                        {/* 11. Residential Campus Address */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-4">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                                <MapPin size={14} className="text-rose-600" />
                                <span>Residential Campus & Permanent Address</span>
                            </div>
                            <p className="text-xs font-medium text-slate-700">{profile.address}</p>
                        </div>
                    </div>

                    {/* Institutional Credential Banner */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#006837]" />
                            <span className="text-emerald-950 font-medium">
                                NAAC Grade 'A' Residential Vocational Education • KISS Deemed to be University
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1 bg-white border border-emerald-300 text-[#006837] rounded-lg font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-1"
                        >
                            <Printer size={12} /> Print Scholar Identity Card
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: MY TRAINING (Curriculum Syllabus & Workshop Schedule)              */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-training' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <BookOpen size={18} className="text-[#006837]" />
                                    Vocational Training Curriculum & Syllabus Modules
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Approved course syllabus and studio training sequence synced with University Curriculum Database
                                </p>
                            </div>
                            <span className="bg-emerald-50 text-[#006837] text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200">
                                {profile.trade}
                            </span>
                        </div>

                        {loadingSyllabus ? (
                            <p className="text-xs text-slate-400 py-6 text-center">Loading curriculum modules from University Academic Registry...</p>
                        ) : syllabusModules.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center italic">No modules published yet for this course.</p>
                        ) : (
                            <div className="space-y-3">
                                {syllabusModules.map((mod, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3.5 hover:bg-white hover:border-emerald-300 transition">
                                        <div className="w-8 h-8 rounded-lg bg-[#006837] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                            {mod.orderNo || index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center flex-wrap gap-2">
                                                <h4 className="text-sm font-bold text-slate-800">{mod.moduleTitle}</h4>
                                                <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                                    Duration: {mod.durationHours} Hours
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                {mod.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Training Schedule Card */}
                        <div className="mt-6 p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                            <h4 className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                                <Clock size={15} className="text-[#006837]" />
                                Studio Practical Workshop Schedule & Guidelines:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 mt-2">
                                <div>• <strong>Workshop Hours:</strong> 09:30 AM – 01:30 PM (Monday – Saturday)</div>
                                <div>• <strong>Practical Studio Lab:</strong> KISS Central Vocational Skills Workshop</div>
                                <div>• <strong>Safety Regulation:</strong> Mandatory Protective Apron & Eyewear</div>
                                <div>• <strong>Assessment Mode:</strong> Practical Performance Rubric & Viva Voce</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: EXAMINATIONS & EVALUATION MARKSHEET                                 */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-exams' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Award size={18} className="text-indigo-600" />
                                    Batch Examination Marksheet & Academic Scorecard
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Official practical assessment scores graded by Faculty Trainer and ratified by Academic Board
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {onNavigateSection && (
                                    <button
                                        type="button"
                                        onClick={() => onNavigateSection('feedback-hub')}
                                        className="px-3 py-1.5 bg-[#006837] hover:bg-[#00522b] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                    >
                                        <GraduationCap size={13} /> NSQF Certificate & Coaching Feedback
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Printer size={13} /> Print Official Marksheet
                                </button>
                            </div>
                        </div>

                        {loadingExam ? (
                            <p className="text-xs text-slate-400 py-6 text-center">Loading evaluation scores...</p>
                        ) : examScore ? (
                            <div className="space-y-5">
                                {/* Scorecard Summary Card */}
                                <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                                            Official Practical Evaluation Score (NSQF Level-4)
                                        </span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-4xl font-black text-indigo-950 font-mono">
                                                {examScore.score}
                                            </span>
                                            <span className="text-base font-semibold text-indigo-700">/ 100 Marks</span>
                                            <span className="ml-3 bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                                                {examScore.grade || (examScore.score >= 85 ? 'Grade A (Distinction)' : examScore.score >= 70 ? 'Grade B (Proficient)' : examScore.score >= 50 ? 'Grade C (Passing)' : 'Grade F')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-indigo-900 mt-2 font-medium italic">
                                            "{examScore.remarks || 'Practical evaluation successfully verified and recorded.'}"
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-indigo-800 bg-white/80 p-3 rounded-xl border border-indigo-100 shrink-0">
                                        <p className="font-bold">Evaluation Date: {examScore.evaluationDate || (examScore.evaluatedAt ? new Date(examScore.evaluatedAt).toLocaleDateString('en-GB') : 'Verified')}</p>
                                        <p className="text-[11px] text-indigo-600 mt-0.5">Ratified by Faculty Instructor</p>
                                    </div>
                                </div>

                                {/* Evaluation Rubric Breakdown */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        4-Parameter NSQF Competency Rubric Breakdown ({examScore.score} / 100)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Studio Practical (40M)</p>
                                            <p className="text-base font-black text-slate-800 mt-1">
                                                {rubricScores[studentId]?.studioPractical !== undefined
                                                    ? rubricScores[studentId].studioPractical
                                                    : ((examScore.score * 40) / 100).toFixed(1)} / 40
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Hands-on artisan skill execution</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Tool & Safety (20M)</p>
                                            <p className="text-base font-black text-slate-800 mt-1">
                                                {rubricScores[studentId]?.toolSafety !== undefined
                                                    ? rubricScores[studentId].toolSafety
                                                    : ((examScore.score * 20) / 100).toFixed(1)} / 20
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Workshop PPE & machine safety</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Material & Quality (20M)</p>
                                            <p className="text-base font-black text-slate-800 mt-1">
                                                {rubricScores[studentId]?.materialQuality !== undefined
                                                    ? rubricScores[studentId].materialQuality
                                                    : ((examScore.score * 20) / 100).toFixed(1)} / 20
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Zero-defect finish & zero-waste</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Viva Voce & Theory (20M)</p>
                                            <p className="text-base font-black text-slate-800 mt-1">
                                                {rubricScores[studentId]?.vivaTheory !== undefined
                                                    ? rubricScores[studentId].vivaTheory
                                                    : ((examScore.score * 20) / 100).toFixed(1)} / 20
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Artisan oral defense & SOP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Clock size={28} className="mx-auto text-amber-500 mb-1" />
                                <p className="text-xs font-bold text-slate-700">Practical Evaluation Awaited</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Your faculty instructor will record your examination score after the end-of-module assessment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: LEAVE MANAGEMENT (Apply & Track Leaves)                             */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-leaves' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left: Apply For Leave Form */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="border-b pb-3">
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <FileText size={18} className="text-teal-600" />
                                Apply For Leave
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Applications are reviewed by Faculty Trainer & Central Administration
                            </p>
                        </div>

                        {leaveSubmitted && (
                            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                                <CheckCircle2 size={16} /> Leave application successfully submitted to MySQL!
                            </div>
                        )}

                        <form onSubmit={handleApplyLeave} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Start Date (From)
                                    </label>
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#006837] bg-white cursor-pointer"
                                        required
                                    />
                                    <p className="text-[10px] text-slate-400 mt-0.5">Past dates disabled</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        End Date (To)
                                    </label>
                                    <input
                                        type="date"
                                        min={startDate || todayStr}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#006837] bg-white cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic Duration Badge */}
                            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                                <span className="text-emerald-900 font-medium">Leave Duration:</span>
                                <span className="bg-[#006837] text-white px-2.5 py-0.5 rounded-full font-bold">
                                    {calculateDuration(startDate, endDate)} {calculateDuration(startDate, endDate) === 1 ? 'Day' : 'Days'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Reason for Leave
                                </label>
                                <textarea
                                    rows="3"
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    placeholder="Enter legitimate reason (e.g. Village harvest festival, Medical appointment)..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                            >
                                <Send size={14} /> Submit Application
                            </button>
                        </form>
                    </div>

                    {/* Right: Live Leave History & Status Tracker */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="border-b pb-3 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Clock size={18} className="text-amber-600" />
                                    Leave Applications History & Approvals
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Live approval status synced across Trainer and Central Administration
                                </p>
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                                {leaves.length} Requests
                            </span>
                        </div>

                        {loadingLeaves ? (
                            <p className="text-xs text-slate-400 py-6 text-center">Loading leave applications...</p>
                        ) : leaves.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Clock size={28} className="mx-auto text-slate-400 mb-1" />
                                <p className="text-xs font-semibold text-slate-600">No leave requests submitted yet.</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Use the form on the left to submit an application.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {leaves.map((l) => (
                                    <div key={l.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:border-slate-300 transition">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-slate-800 text-sm">{l.reason}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                                l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                l.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 
                                                'bg-amber-100 text-amber-800 border border-amber-300'
                                            }`}>
                                                {l.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/60 text-slate-600 flex-wrap gap-2">
                                            <span className="font-medium text-[#006837] flex items-center gap-1">
                                                <Calendar size={12} /> {l.startDate || l.date} &rarr; {l.endDate || l.date}
                                            </span>
                                            <span className="font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                                                {l.days} {l.days === 1 ? 'Day' : 'Days'}
                                            </span>
                                        </div>

                                        {l.reviewRemarks && (
                                            <div className="mt-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 italic">
                                                <strong>Reviewer Remarks:</strong> {l.reviewRemarks}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* ========================================================================= */}
            {/* TAB 6: ATTENDANCE REPORT & 75% COMPLIANCE                                  */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-attendance' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <CalendarCheck size={18} className="text-[#006837]" />
                                    Practical Studio Attendance Record & Compliance Audit
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Synced live with Faculty Trainer daily markings & Central Administrative clearances
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                                <Printer size={13} /> Print Attendance Report
                            </button>
                        </div>

                        {/* Attendance Metric Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Overall Attendance</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{attendancePercentage}%</p>
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-1 ${
                                    isStipendEligible ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}>
                                    {isStipendEligible ? '✓ 75% Stipend Eligible' : '⚠️ Below 75% Threshold'}
                                </span>
                            </div>
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                <p className="text-[10px] text-emerald-800 font-bold uppercase">Present Sessions</p>
                                <p className="text-2xl font-black text-emerald-900 mt-1">{presentCount}</p>
                                <p className="text-[10px] text-emerald-700 mt-1">Verified Studio Days</p>
                            </div>
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                                <p className="text-[10px] text-rose-800 font-bold uppercase">Absent Sessions</p>
                                <p className="text-2xl font-black text-rose-900 mt-1">{absentCount}</p>
                                <p className="text-[10px] text-rose-700 mt-1">Unexcused Absences</p>
                            </div>
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                                <p className="text-[10px] text-purple-800 font-bold uppercase">Total Tracked</p>
                                <p className="text-2xl font-black text-purple-900 mt-1">{totalSessions}</p>
                                <p className="text-[10px] text-purple-700 mt-1">Database Sessions</p>
                            </div>
                        </div>

                        {/* Detailed Verified Session Attendance Log Table */}
                        <div>
                            <h4 className="font-bold text-slate-800 text-xs mb-2.5 flex items-center justify-between">
                                <span>Verified Session Logs Recorded in University Academic Registry:</span>
                                <span className="text-[10px] text-slate-400 font-normal">Source: Biometric & Studio Ledger</span>
                            </h4>

                            {loadingAttendance ? (
                                <p className="text-xs text-slate-400 py-6 text-center">Loading verified attendance logs...</p>
                            ) : attendanceLogs.length === 0 ? (
                                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar size={28} className="mx-auto text-slate-400 mb-1" />
                                    <p className="text-xs font-semibold text-slate-600">No session attendance records logged yet.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Faculty will mark daily practical attendance in their console.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[440px] shadow-xs scrollbar-thin">
                                    <table className="w-full text-left text-xs relative">
                                        <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs border-b border-slate-200">
                                            <tr>
                                                <th className="py-2.5 px-3">Session Date</th>
                                                <th className="py-2.5 px-3">Trade / Course</th>
                                                <th className="py-2.5 px-3">Attendance Status</th>
                                                <th className="py-2.5 px-3">Instructor / Admin Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {attendanceLogs.map((log, idx) => (
                                                <tr key={log.id || idx} className="hover:bg-slate-50 transition">
                                                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                                                        {log.date}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                                                        {log.courseName || log.courseCode || profile.trade}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                                                            log.status === 'PRESENT'
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                                : log.status === 'ABSENT'
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                                        }`}>
                                                            {log.status === 'PRESENT' ? <Check size={10} /> : <XCircle size={10} />}
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 italic max-w-sm truncate">
                                                        {log.remarks || 'Daily practical session attended'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: STIPENDS & PRODUCTION INCENTIVES (Earn-While-You-Learn)             */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-stipend' && (() => {
                const approvedBatchStipends = batchStipends.filter(s => s.status === 'APPROVED_AND_DISBURSED');
                const pendingBatchStipends = batchStipends.filter(s => s.status !== 'APPROVED_AND_DISBURSED');
                const approvedBonusTotal = approvedBatchStipends.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
                const pendingBonusTotal = pendingBatchStipends.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
                const baseAllowance = (totalSessions > 0 && isStipendEligible) ? 1500.0 : 0.0;
                const totalNetDisbursable = baseAllowance + approvedBonusTotal;

                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <Coins size={18} className="text-amber-600" />
                                        Earn-While-You-Learn Production Stipend & Incentives
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Monthly skill allowance and commercial production bonus credited directly via DBT
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                        isStipendEligible 
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                            : 'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}>
                                        {isStipendEligible ? '✓ 75% Attendance Met: Eligible' : '⚠️ Below 75%: Action Required'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={fetchAllData}
                                        className="p-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs flex items-center gap-1 font-bold"
                                        title="Refresh Stipend Balance"
                                    >
                                        <RefreshCw size={13} className={loadingStipends ? "animate-spin text-[#006837]" : ""} /> Sync
                                    </button>
                                </div>
                            </div>

                            {/* Current Month Earnings Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Monthly Base Skill Stipend</p>
                                    <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
                                        ₹{baseAllowance.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {totalSessions === 0 ? 'Pending attendance logging' : isStipendEligible ? '75% attendance threshold met' : 'Below 75% attendance requirement'}
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <p className="text-[10px] text-amber-800 font-bold uppercase">Production Unit Artisan Bonus</p>
                                    <p className="text-2xl font-black text-amber-900 mt-1 font-mono">
                                        ₹{approvedBonusTotal.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-amber-700 mt-1">
                                        {pendingBonusTotal > 0 ? `+ ₹${pendingBonusTotal.toFixed(2)} awaiting Admin clearance` : 'Credited upon commercial batch clearances'}
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-[10px] text-emerald-800 font-bold uppercase">Total Net Disbursable</p>
                                    <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                                        ₹{totalNetDisbursable.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 font-bold mt-1">Direct Benefit Transfer (DBT)</p>
                                </div>
                            </div>

                            {/* DBT Account Information */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center flex-wrap gap-2">
                                <div className="space-y-0.5">
                                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                        <CreditCard size={14} className="text-indigo-600" />
                                        DBT Bank Account: Direct Stipend & Production Incentive Account
                                    </span>
                                    <p className="text-slate-500">Scholar Roll No: <strong>{studentId}</strong> &bull; Direct Benefit Transfer</p>
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-bold">
                                    DBT Verified
                                </span>
                            </div>

                            {/* NSDC & KISS Trust DBT Attendance Criteria Audit Card */}
                            <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 rounded-xl border border-emerald-200 text-xs space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-[#006837] shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-slate-800">
                                                NSDC & Ministry of Skill Development Attendance Criteria
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                                Government & KISS Trust guidelines require &ge;75% studio attendance for monthly base stipend clearance.
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 ${
                                        isStipendEligible 
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                                    }`}>
                                        {isStipendEligible ? `✓ ${attendancePercentage}% Attendance — DBT Approved` : `⚠️ ${attendancePercentage}% Attendance — DBT Withheld`}
                                    </span>
                                </div>

                                {/* Attendance Progress Bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                        <span>Current Attendance: <strong>{presentCount} of {totalSessions} sessions ({attendancePercentage}%)</strong></span>
                                        <span className="text-[#006837]">Minimum Required: 75%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isStipendEligible ? 'bg-[#006837]' : 'bg-rose-500'}`}
                                            style={{ width: `${Math.min(100, Math.max(5, attendancePercentage))}%` }}
                                        />
                                        <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-700 opacity-60" title="75% NSDC Threshold" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                                    <span>
                                        {isStipendEligible 
                                            ? 'Base skill allowance of ₹1,500.00 will be credited directly to your bank account via DBT.'
                                            : 'Attendance below 75% places monthly base allowance on hold until practical sessions are completed.'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('trainee-attendance')}
                                        className="text-[#006837] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                                    >
                                        View Studio Attendance Logs &rarr;
                                    </button>
                                </div>
                            </div>

                            {/* Disbursement History Table */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Monthly Stipend & Production Artisan Disbursement Ledger
                                </h4>
                                <div className="border border-slate-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[440px] shadow-xs scrollbar-thin">
                                    <table className="w-full text-left text-xs relative">
                                        <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs border-b border-slate-200">
                                            <tr>
                                                <th className="py-2.5 px-3">Disbursement Cycle / Batch</th>
                                                <th className="py-2.5 px-3">Base Allowance</th>
                                                <th className="py-2.5 px-3">Production Incentive</th>
                                                <th className="py-2.5 px-3">Total Credited</th>
                                                <th className="py-2.5 px-3">Craft / Attendance</th>
                                                <th className="py-2.5 px-3 text-right">DBT Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {totalSessions === 0 && batchStipends.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                                        No stipend disbursements on file yet for this scholar. Monthly skill allowances and batch production bonuses will appear here once processed and approved.
                                                    </td>
                                                </tr>
                                            ) : (
                                                <>
                                                    {/* Monthly Base Skill Stipend Row (if sessions exist) */}
                                                    {totalSessions > 0 && (
                                                        <tr className="hover:bg-slate-50/70 transition">
                                                            <td className="py-3 px-3 font-semibold text-slate-800">
                                                                <div>Current Academic Cycle</div>
                                                                <span className="text-[10px] text-slate-400">Monthly Practical Allowance</span>
                                                            </td>
                                                            <td className="py-3 px-3 font-mono text-slate-600">
                                                                {isStipendEligible ? '₹1,500.00' : '₹0.00'}
                                                            </td>
                                                            <td className="py-3 px-3 font-mono text-slate-400">-</td>
                                                            <td className="py-3 px-3 font-bold font-mono text-emerald-800">
                                                                {isStipendEligible ? '₹1,500.00' : '₹0.00'}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                                    isStipendEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                                }`}>
                                                                    {attendancePercentage}% {isStipendEligible ? 'Met' : 'Below 75%'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-right">
                                                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                                                    isStipendEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {isStipendEligible ? 'PROCESSING' : 'ON HOLD'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Batch Production Incentives Rows */}
                                                    {batchStipends.map((stipend, idx) => {
                                                        const isApproved = stipend.status === 'APPROVED_AND_DISBURSED';
                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50/70 transition">
                                                                <td className="py-3 px-3 font-semibold text-slate-800">
                                                                    <div className="font-mono text-xs text-amber-900 font-bold">{stipend.batchNumber}</div>
                                                                    <div className="text-[11px] text-slate-500">{stipend.productName}</div>
                                                                </td>
                                                                <td className="py-3 px-3 font-mono text-slate-400">-</td>
                                                                <td className="py-3 px-3 font-bold font-mono text-amber-800">
                                                                    ₹{Number(stipend.amount).toFixed(2)}
                                                                </td>
                                                                <td className="py-3 px-3 font-bold font-mono text-emerald-800">
                                                                    {isApproved ? `₹${Number(stipend.amount).toFixed(2)}` : '₹0.00 (Pending)'}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                                        {stipend.unitsCrafted} units crafted
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 text-right">
                                                                    {isApproved ? (
                                                                        <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 inline-flex items-center gap-1 border border-emerald-300">
                                                                            <CheckCircle2 size={11} /> DBT CREDITED ({stipend.dbtReference || 'PAID'})
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 inline-flex items-center gap-1 border border-amber-300 animate-pulse">
                                                                            <Clock size={11} /> AWAITING ADMIN APPROVAL
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ========================================================================= */}
            {/* TAB 8: CAMPUS NOTICES & CIRCULARS                                          */}
            {/* ========================================================================= */}
            {activeTab === 'trainee-notices' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Bell size={18} className="text-amber-600" />
                                    Official Campus Notices & Trainee Directives
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Broadcast circulars published by KISS Central Administration and Academic Council
                                </p>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {notices.length} Active {notices.length === 1 ? 'Notice' : 'Notices'}
                            </span>
                        </div>

                        {loadingNotices ? (
                            <p className="text-xs text-slate-400 py-6 text-center">Loading circulars...</p>
                        ) : notices.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Megaphone size={28} className="mx-auto text-slate-400 mb-1" />
                                <p className="text-xs font-semibold text-slate-600">No active circulars at this time.</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Administrative announcements will appear here once broadcasted.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notices.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 rounded-xl border transition-all ${
                                            n.pinned 
                                                ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-200' 
                                                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                                    n.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                                                    n.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-teal-100 text-teal-800'
                                                }`}>
                                                    {n.priority || 'NORMAL'}
                                                </span>
                                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                                                    {n.category || 'GENERAL'}
                                                </span>
                                                {n.pinned && (
                                                    <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                                                        <Pin size={10} className="fill-amber-600" /> Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Active'}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                                            <span>Issued by: <strong className="text-slate-600">{n.postedBy || 'Central Administration'}</strong></span>
                                            <span className="text-teal-700 font-semibold font-mono">Audience: {n.targetAudience}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}