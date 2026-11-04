import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShieldCheck,
    Users,
    BookOpen,
    CheckCircle2,
    Plus,
    Key,
    Clock,
    Lock,
    UserPlus,
    X,
    GraduationCap,
    UserCheck,
    Trash2,
    Calendar,
    Layers,
    FileText,
    Eye,
    BookMarked,
    RefreshCw,
    Power,
    PowerOff,
    Mail,
    Phone,
    User,
    Pencil,
    Edit2,
    Edit3,
    Save,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Filter,
    Bell,
    Pin,
    PinOff,
    CalendarCheck,
    Award,
    ThumbsUp,
    ThumbsDown,
    CheckCheck,
    XCircle,
    AlertCircle,
    Send,
    Megaphone,
    Factory,
    Printer,
    Coins,
    Check,
    Hourglass,
    AlertTriangle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function AdminConsole({ activeSection = 'courses', onNavigateSection, currentUser }) {
    let resolvedUser = currentUser;
    if (!resolvedUser) {
        try {
            resolvedUser = JSON.parse(localStorage.getItem('kvtms_user') || '{}');
        } catch (e) {}
    }
    const rawRole = (resolvedUser?.role || resolvedUser?.username || '').toUpperCase();
    const isAdmin = rawRole.includes('ADMIN') || rawRole.includes('ADM');

    const [subTab, setSubTab] = useState(activeSection === 'admin' ? 'courses' : (activeSection || 'courses'));

    useEffect(() => {
        if (activeSection) {
            setSubTab(activeSection === 'admin' ? 'courses' : activeSection);
        }
    }, [activeSection]);

    const handleSwitchSection = (section) => {
        setSubTab(section);
        if (onNavigateSection) {
            onNavigateSection(section);
        }
    };

    // =========================================================================
    // PRODUCTION APPROVAL & STIPEND CLEARANCE STATE (ADMIN EXCLUSIVE)
    // =========================================================================
    const [pendingRuns, setPendingRuns] = useState([]);
    const [loadingApprovals, setLoadingApprovals] = useState(false);
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [approvingRunId, setApprovingRunId] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [runToReject, setRunToReject] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');

    const fetchPendingProductionRuns = async () => {
        setLoadingApprovals(true);
        try {
            let runsData = [];
            try {
                const res = await axios.get(`${API_BASE_URL}/production/runs/pending-approval`);
                if (Array.isArray(res.data)) {
                    runsData = res.data;
                }
            } catch (err) {
                // api fallback
            }

            // Sync with local storage kvtms_stipend_requests & kvtms_batch_scholars
            try {
                const localStipends = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
                const pendingStipends = localStipends.filter(s => s.status === 'PENDING_ADMIN_APPROVAL');

                pendingStipends.forEach(st => {
                    const alreadyExists = runsData.some(r => r.id === st.runId || r.batchNumber === st.batchNumber);
                    if (!alreadyExists) {
                        runsData.push({
                            id: st.runId || st.id || Date.now(),
                            batchNumber: st.batchNumber,
                            product: {
                                name: st.productName || 'Handcrafted Artisan Item',
                                sellingPrice: 650.0,
                                incentiveRatePerUnit: st.ratePerUnit || 75.0,
                                sku: 'PRD-ART'
                            },
                            completedQuantity: st.completedQuantity || 10,
                            targetQuantity: st.completedQuantity || 10,
                            status: 'PENDING_APPROVAL',
                            remarks: `Apprentice Team: ${st.teamMembers?.map(m => m.name).join(', ') || 'Scholars'}`,
                            stipendReport: st
                        });
                    }
                });
            } catch (e) {}

            setPendingRuns(runsData);
        } catch (e) {
            console.error("Error fetching pending production runs in Admin:", e);
        } finally {
            setLoadingApprovals(false);
        }
    };

    useEffect(() => {
        fetchPendingProductionRuns();
        const interval = setInterval(fetchPendingProductionRuns, 6000);
        return () => clearInterval(interval);
    }, []);

    const getBatchTeamMembers = (run) => {
        if (run?.stipendReport?.teamMembers && Array.isArray(run.stipendReport.teamMembers)) {
            return run.stipendReport.teamMembers;
        }
        try {
            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            const found = batchMap[run?.batchNumber];
            if (found && Array.isArray(found.trainees) && found.trainees.length > 0) {
                return found.trainees;
            }
        } catch (e) {}

        try {
            const stipendReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
            const req = stipendReqs.find(r => r.batchNumber === run?.batchNumber || r.runId === run?.id);
            if (req && Array.isArray(req.teamMembers) && req.teamMembers.length > 0) {
                return req.teamMembers;
            }
        } catch (e) {}

        return [];
    };

    const handleApproveBatchFromAdmin = async (run) => {
        const runId = run.id;
        const batchNum = run.batchNumber;
        const dbtRef = `DBT-KISS-${Date.now()}`;
        const nowIso = new Date().toISOString();
        setApprovingRunId(runId);

        // 1. Update localStorage kvtms_stipend_requests & kvtms_batch_scholars
        try {
            const existingReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
            const updatedReqs = existingReqs.map(req => {
                if (req.runId === runId || req.batchNumber === batchNum) {
                    return {
                        ...req,
                        status: 'APPROVED_AND_DISBURSED',
                        dbtReference: dbtRef,
                        disbursedDate: nowIso
                    };
                }
                return req;
            });
            localStorage.setItem('kvtms_stipend_requests', JSON.stringify(updatedReqs));

            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            if (batchMap[batchNum]) {
                batchMap[batchNum].status = 'APPROVED_FOR_SALE';
                localStorage.setItem('kvtms_batch_scholars', JSON.stringify(batchMap));
            }
        } catch (e) {}

        // 2. Call backend APIs
        try {
            await axios.put(`${API_BASE_URL}/production/runs/${runId}/approve`);
        } catch (e) {
            console.warn("Backend run approve warning:", e);
        }

        try {
            await axios.put(`${API_BASE_URL}/incentives/batches/${runId}/disburse?txRef=${encodeURIComponent(dbtRef)}`);
        } catch (e) {
            console.warn("Backend incentive disburse warning:", e);
        }

        setPendingRuns(prev => prev.filter(r => r.id !== runId && r.batchNumber !== batchNum));
        setApprovingRunId(null);
        setNotification(`✓ Batch ${batchNum} Approved & Commercial clearance granted! Apprentice stipends successfully disbursed via DBT (${dbtRef}).`);
        setTimeout(() => setNotification(''), 7000);
    };

    const handleOpenRejectModalFromAdmin = (run) => {
        setRunToReject(run);
        setRejectRemarks('Quality inspection rework required by university administration.');
        setRejectModalOpen(true);
    };

    const handleConfirmRejectFromAdmin = async () => {
        if (!runToReject) return;
        const runId = runToReject.id;
        const batchNum = runToReject.batchNumber;

        try {
            await axios.put(`${API_BASE_URL}/production/runs/${runId}/reject?remarks=${encodeURIComponent(rejectRemarks || 'Rework requested by university administration')}`);
        } catch (e) {}

        try {
            const existingReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
            const updatedReqs = existingReqs.map(req => {
                if (req.runId === runId || req.batchNumber === batchNum) {
                    return { ...req, status: 'REJECTED', rejectRemarks: rejectRemarks };
                }
                return req;
            });
            localStorage.setItem('kvtms_stipend_requests', JSON.stringify(updatedReqs));

            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            if (batchMap[batchNum]) {
                batchMap[batchNum].status = 'REJECTED';
                localStorage.setItem('kvtms_batch_scholars', JSON.stringify(batchMap));
            }
        } catch (e) {}

        setPendingRuns(prev => prev.filter(r => r.id !== runId && r.batchNumber !== batchNum));
        setRejectModalOpen(false);
        setRunToReject(null);
        setNotification(`Batch ${batchNum} returned to production team for rework.`);
        setTimeout(() => setNotification(''), 6000);
    };

    // User Profile Inspection Modal State
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);

    // Admin Registration Form State
    const [newAdminForm, setNewAdminForm] = useState({
        collegeId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        department: 'Central Administration',
        password: ''
    });

    // Production Staff Registration Form State
    const [newProductionForm, setNewProductionForm] = useState({
        collegeId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        department: 'Central Production Unit',
        designation: 'Production Floor Operator (Data Entry)',
        password: ''
    });

    // Trainer Registration Form State
    const [newTrainerForm, setNewTrainerForm] = useState({
        employeeId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        specialization: 'Handicrafts & Tribal Art (VOC-ART-102)',
        address: '',
        dob: '',
        joiningDate: new Date().toISOString().split('T')[0],
        bloodGroup: 'B+',
        password: ''
    });

    // Trainee Registration Form State
    const [newTraineeForm, setNewTraineeForm] = useState({
        collegeId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        courseId: '',
        category: 'Scheduled Tribe (KISS Scholar)',
        address: '',
        dob: '',
        joiningDate: new Date().toISOString().split('T')[0],
        bloodGroup: '',
        passOutDate: '',
        password: ''
    });

    // Trainee Records Filtering & Pagination State
    const [traineeSearch, setTraineeSearch] = useState('');
    const [traineeCourseFilter, setTraineeCourseFilter] = useState('ALL');
    const [traineeStatusFilter, setTraineeStatusFilter] = useState('ALL');
    const [traineeCurrentPage, setTraineeCurrentPage] = useState(1);
    const [traineesPerPage, setTraineesPerPage] = useState(6);

    // Trainer Records Filtering & Pagination State
    const [trainerSearch, setTrainerSearch] = useState('');
    const [trainerTradeFilter, setTrainerTradeFilter] = useState('ALL');
    const [trainerStatusFilter, setTrainerStatusFilter] = useState('ALL');
    const [trainerCurrentPage, setTrainerCurrentPage] = useState(1);
    const [trainersPerPage, setTrainersPerPage] = useState(6);
    const [actionMenu, setActionMenu] = useState(null); // { id, user, type, top, right }

    const toggleActionMenu = (e, user, type) => {
        e.stopPropagation();
        if (actionMenu?.id === user.id && actionMenu?.type === type) {
            setActionMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const menuHeight = type === 'trainee' ? 300 : 250;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;
        const topPos = openUpward
            ? Math.max(12, rect.top - menuHeight - 6)
            : Math.min(window.innerHeight - menuHeight - 12, rect.bottom + 6);

        setActionMenu({
            id: user.id,
            user: user,
            type: type,
            top: topPos,
            right: Math.max(16, window.innerWidth - rect.right)
        });
    };

    useEffect(() => {
        const handleCloseActionMenu = () => {
            if (actionMenu) setActionMenu(null);
        };
        window.addEventListener('scroll', handleCloseActionMenu, true);
        window.addEventListener('resize', handleCloseActionMenu);
        return () => {
            window.removeEventListener('scroll', handleCloseActionMenu, true);
            window.removeEventListener('resize', handleCloseActionMenu);
        };
    }, [actionMenu]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState(null);
    const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
    const [courseForAddingModule, setCourseForAddingModule] = useState(null);

    // Course Search & Pagination State
    const [courseSearchQuery, setCourseSearchQuery] = useState('');
    const [courseStatusFilter, setCourseStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
    const [coursesCurrentPage, setCoursesCurrentPage] = useState(1);
    const [coursesPerPage, setCoursesPerPage] = useState(4);

    // Edit Syllabus Module State
    const [editingModule, setEditingModule] = useState(null);
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [editModuleForm, setEditModuleForm] = useState({ moduleTitle: '', durationHours: 40, description: '', orderNo: 1 });

    // Edit Course Info State
    const [courseForEditing, setCourseForEditing] = useState(null);
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const [editCourseForm, setEditCourseForm] = useState({ name: '', code: '', durationMonths: 6, description: '' });

    // Enrollments Modal State (Trainer & Trainee list for course)
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
    const [enrollmentCourse, setEnrollmentCourse] = useState(null);
    const [enrollmentData, setEnrollmentData] = useState({ trainers: [], trainees: [], totalTrainers: 0, totalTrainees: 0 });
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);

    // ==========================================
    // NOTICE BOARD STATE
    // ==========================================
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(false);
    const [noticeAudienceFilter, setNoticeAudienceFilter] = useState('ALL'); // 'ALL' | 'TRAINEES' | 'TRAINERS' | 'PRODUCTION'
    const [noticeSearchQuery, setNoticeSearchQuery] = useState('');
    const [isCreateNoticeModalOpen, setIsCreateNoticeModalOpen] = useState(false);
    const [newNoticeForm, setNewNoticeForm] = useState({
        title: '',
        content: '',
        targetAudience: 'ALL',
        priority: 'NORMAL',
        category: 'GENERAL',
        postedBy: currentUser?.fullName ? `${currentUser.fullName} (Admin)` : 'Central Administration',
        pinned: false
    });

    // ==========================================
    // TRAINEE INDIVIDUAL REPORT & LEAVE MODALS
    // ==========================================
    const [selectedTraineeForAttendance, setSelectedTraineeForAttendance] = useState(null);
    const [traineeAttendanceLogs, setTraineeAttendanceLogs] = useState([]);
    const [loadingTraineeAttendance, setLoadingTraineeAttendance] = useState(false);
    const [adminAttendanceForm, setAdminAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        remarks: 'Administrative override approved by Central Admin'
    });
    const [adminAttendanceMsg, setAdminAttendanceMsg] = useState('');
    const [submittingAdminAttendance, setSubmittingAdminAttendance] = useState(false);

    const [selectedTraineeForExam, setSelectedTraineeForExam] = useState(null);
    const [traineeExamReport, setTraineeExamReport] = useState(null);
    const [loadingTraineeExam, setLoadingTraineeExam] = useState(false);

    const [selectedTraineeForLeave, setSelectedTraineeForLeave] = useState(null);
    const [traineeLeaveRequests, setTraineeLeaveRequests] = useState([]);
    const [loadingTraineeLeaves, setLoadingTraineeLeaves] = useState(false);
    const [traineeLeaveForm, setTraineeLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [leaveReviewRemarks, setLeaveReviewRemarks] = useState({});

    // ==========================================
    // TRAINER INDIVIDUAL REPORT & LEAVE MODALS
    // ==========================================
    const [selectedTrainerForAttendance, setSelectedTrainerForAttendance] = useState(null);
    const [trainerAttendanceReport, setTrainerAttendanceReport] = useState(null);
    const [loadingTrainerAttendance, setLoadingTrainerAttendance] = useState(false);
    const [adminTrainerAttendanceForm, setAdminTrainerAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        hoursConducted: 4,
        sessionType: 'Practical Workshop & Artisan Mentorship',
        remarks: ''
    });
    const [submittingTrainerAttendance, setSubmittingTrainerAttendance] = useState(false);

    const [selectedTrainerForLeave, setSelectedTrainerForLeave] = useState(null);
    const [trainerLeaveRequests, setTrainerLeaveRequests] = useState([]);
    const [loadingTrainerLeaves, setLoadingTrainerLeaves] = useState(false);
    const [trainerLeaveForm, setTrainerLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

    // Default baseline admin
    const defaultUsers = [
        { id: 1, username: 'KISS-ADM-001', name: 'Dr. P. K. Routray', role: 'ROLE_ADMIN', trade: 'Central Administration', category: 'General', status: 'ACTIVE', password: 'Admin@123' }
    ];

    // 1. Permanent Users State loaded from localStorage & Database
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('kvtms_user_registry');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const cleaned = parsed.filter(u => 
                    u.name !== 'Ramesh Majhi' &&
                    u.name !== 'Sunita Murmu' &&
                    u.email !== 'ramesh.majhi@kiss.ac.in'
                );
                return cleaned.length > 0 ? cleaned : defaultUsers;
            } catch (e) {}
        }
        return defaultUsers;
    });

    // 2. Real Vocational Courses & Syllabus State loaded from MySQL
    const DEFAULT_COURSES = [
        {
            id: 1,
            name: "Sewing & Apparel Manufacturing",
            code: "VOC-SEW-101",
            durationMonths: 6,
            description: "Industrial garment manufacturing, pattern drafting, lockstitch machine mastery, NSQF Level 4 compliance.",
            active: true,
            fee: 12000.0,
            modulesCount: 4,
            enrolledScholarsCount: 3,
            syllabusModules: [
                { id: 101, orderNo: 1, moduleTitle: "Introduction to Textile Fibers & Fabrics", durationHours: 40, description: "Fiber classification, weave analysis, and grain line identification." },
                { id: 102, orderNo: 2, moduleTitle: "Industrial Sewing Machine Operation & Safety", durationHours: 60, description: "Single-needle lockstitch, overlock joinery, and needle calibration." },
                { id: 103, orderNo: 3, moduleTitle: "Apparel Pattern Making & Grading", durationHours: 80, description: "Bodice drafting, collar construction, and sizing specs." },
                { id: 104, orderNo: 4, moduleTitle: "Quality Audit, Finishing & NSQF Assessment", durationHours: 60, description: "Defect inspection, packaging standards, and certification assessment." }
            ]
        },
        {
            id: 2,
            name: "Handicrafts & Tribal Art",
            code: "VOC-ART-102",
            durationMonths: 6,
            description: "Traditional Odisha tribal painting, Saura art, Dokra metal casting, and eco-artisan handicraft development.",
            active: true,
            fee: 12000.0,
            modulesCount: 4,
            enrolledScholarsCount: 2,
            syllabusModules: [
                { id: 201, orderNo: 1, moduleTitle: "Heritage of Odisha Tribal Art & Motifs", durationHours: 40, description: "Saura icons, Pattachitra elements, and tribal symbology." },
                { id: 202, orderNo: 2, moduleTitle: "Natural Pigment Preparation & Surface Prep", durationHours: 50, description: "Organic binder extraction, canvas preparation, and bamboo etching." },
                { id: 203, orderNo: 3, moduleTitle: "Dokra Lost-Wax Bell Metal Craft", durationHours: 70, description: "Clay core modeling, wax ribbon work, and furnace casting." },
                { id: 204, orderNo: 4, moduleTitle: "Commercial Curation & Exhibition Standards", durationHours: 60, description: "Framing, boutique presentation, and online marketplace listing." }
            ]
        },
        {
            id: 3,
            name: "Food Processing & Preservation",
            code: "VOC-FOD-103",
            durationMonths: 4,
            description: "Agro-food processing, fruit pulp preservation, FSSAI hygiene standards, and value-added tribal forest produce.",
            active: true,
            fee: 12000.0,
            modulesCount: 3,
            enrolledScholarsCount: 1,
            syllabusModules: [
                { id: 301, orderNo: 1, moduleTitle: "Food Safety, FSSAI Hygiene & Sanitization", durationHours: 30, description: "GMP, HACCP guidelines, and sterile packaging protocols." },
                { id: 302, orderNo: 2, moduleTitle: "Thermal Processing, Jams & Fruit Canning", durationHours: 50, description: "Brix measurement, pasteurization, and vacuum sealing." },
                { id: 303, orderNo: 3, moduleTitle: "Tribal Forest Honey & Spice Extraction", durationHours: 40, description: "Pure honey testing, organic grading, and moisture reduction." }
            ]
        },
        {
            id: 4,
            name: "Carpentry & Woodwork",
            code: "VOC-CAR-104",
            durationMonths: 6,
            description: "Timber selection, precision joinery, lathe turning, and modern modular institutional furniture fabrication.",
            active: true,
            fee: 12000.0,
            modulesCount: 3,
            enrolledScholarsCount: 1,
            syllabusModules: [
                { id: 401, orderNo: 1, moduleTitle: "Timber Seasoning & Grain Grading", durationHours: 40, description: "Moisture content testing, wood defects, and sawing methods." },
                { id: 402, orderNo: 2, moduleTitle: "Power Tool Operation & Joinery Techniques", durationHours: 70, description: "Mortise & tenon, dovetail joinery, and planer maintenance." },
                { id: 403, orderNo: 3, moduleTitle: "Surface Sanding, Polishing & Polyurethane Coating", durationHours: 50, description: "Natural oil finish, wood filler, and lacquer spraying." }
            ]
        },
        {
            id: 5,
            name: "Bamboo Technology & Eco-Craft",
            code: "VOC-BAM-105",
            durationMonths: 6,
            description: "Bamboo curing, split weaving, artisan furniture, and eco-friendly home utility decor items.",
            active: true,
            fee: 12000.0,
            modulesCount: 3,
            enrolledScholarsCount: 2,
            syllabusModules: [
                { id: 501, orderNo: 1, moduleTitle: "Bamboo Species Identification & Borax Treatment", durationHours: 40, description: "Sap displacement, curing against borer attack, and seasoning." },
                { id: 502, orderNo: 2, moduleTitle: "Bamboo Splitting, Planing & Fine Weaving", durationHours: 60, description: "Sliver making, tensile grading, and basketry patterns." },
                { id: 503, orderNo: 3, moduleTitle: "Curved Bamboo Fabrication & Lighting Fixtures", durationHours: 60, description: "Heat bending, pin doweling, and electrical wiring assembly." }
            ]
        }
    ];

    const [courses, setCourses] = useState(() => {
        try {
            const cached = localStorage.getItem('kvtms_courses_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return DEFAULT_COURSES;
    });
    const [loadingCourses, setLoadingCourses] = useState(false);

    // Active courses filter: hides deactivated courses from registration forms
    const activeCourses = courses.filter(c => c.active !== false && c.status !== 'DEACTIVATED' && c.status !== 'INACTIVE');

    const fetchUsersFromDb = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/users`);
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setUsers(res.data);
                localStorage.setItem('kvtms_user_registry', JSON.stringify(res.data));
            }
        } catch (err) {
            console.warn("Could not sync users from DB API:", err.message);
        }
    };

    const fetchCoursesFromDb = async () => {
        setLoadingCourses(true);
        let list = [];
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/courses/detailed`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                list = res.data;
                setCourses(res.data);
                localStorage.setItem('kvtms_courses_cache', JSON.stringify(res.data));
            } else {
                const fallback = await axios.get(`${API_BASE_URL}/auth/courses`);
                if (Array.isArray(fallback.data) && fallback.data.length > 0) {
                    list = fallback.data;
                    setCourses(fallback.data);
                    localStorage.setItem('kvtms_courses_cache', JSON.stringify(fallback.data));
                }
            }
        } catch (err) {
            try {
                const fallback = await axios.get(`${API_BASE_URL}/auth/courses`);
                if (Array.isArray(fallback.data) && fallback.data.length > 0) {
                    list = fallback.data;
                    setCourses(fallback.data);
                    localStorage.setItem('kvtms_courses_cache', JSON.stringify(fallback.data));
                } else {
                    const cached = localStorage.getItem('kvtms_courses_cache');
                    if (cached) setCourses(JSON.parse(cached));
                }
            } catch (e) {
                const cached = localStorage.getItem('kvtms_courses_cache');
                if (cached) setCourses(JSON.parse(cached));
            }
        } finally {
            setLoadingCourses(false);
        }
        return list;
    };

    const fetchNotices = async () => {
        setLoadingNotices(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/notices`);
            if (res.data && Array.isArray(res.data)) {
                setNotices(res.data);
                localStorage.setItem('kvtms_notices_registry', JSON.stringify(res.data));
            }
        } catch (err) {
            console.warn("Could not sync notices from DB API:", err.message);
            const saved = localStorage.getItem('kvtms_notices_registry');
            if (saved) {
                try { setNotices(JSON.parse(saved)); } catch (e) {}
            }
        } finally {
            setLoadingNotices(false);
        }
    };

    useEffect(() => {
        fetchUsersFromDb();
        fetchCoursesFromDb();
        fetchNotices();
    }, []);

    // Save to localStorage whenever users list changes
    useEffect(() => {
        localStorage.setItem('kvtms_user_registry', JSON.stringify(users));
    }, [users]);

    // Helper: Compute Pass Out Date as per selected course duration & joining date
    const computePassOutDate = (joiningDateStr, durationMonths) => {
        if (!joiningDateStr) return '';
        try {
            const parts = joiningDateStr.split('-');
            if (parts.length !== 3) return '';
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            const dt = new Date(y, m, d);
            dt.setMonth(dt.getMonth() + (parseInt(durationMonths, 10) || 6));
            const ry = dt.getFullYear();
            const rm = String(dt.getMonth() + 1).padStart(2, '0');
            const rd = String(dt.getDate()).padStart(2, '0');
            return `${ry}-${rm}-${rd}`;
        } catch (e) {
            return '';
        }
    };

    // Auto calculate pass-out date whenever course or joining date changes
    useEffect(() => {
        if (courses && courses.length > 0) {
            const activeCoursesList = courses.filter(c => c.active !== false && c.status !== 'DEACTIVATED' && c.status !== 'INACTIVE');
            const targetList = activeCoursesList.length > 0 ? activeCoursesList : courses;
            const currentSelected = targetList.find(c => String(c.id) === String(newTraineeForm.courseId));
            const matchedCourse = currentSelected || targetList[0];
            const activeCourseId = matchedCourse ? matchedCourse.id : '';
            const duration = matchedCourse?.durationMonths || 6;
            const calculated = computePassOutDate(newTraineeForm.joiningDate, duration);

            setNewTraineeForm(prev => {
                const needsCourseUpdate = !prev.courseId || !targetList.some(c => String(c.id) === String(prev.courseId));
                const needsDateUpdate = calculated && calculated !== prev.passOutDate;
                if (needsCourseUpdate || needsDateUpdate) {
                    return {
                        ...prev,
                        courseId: needsCourseUpdate ? activeCourseId : prev.courseId,
                        passOutDate: calculated || prev.passOutDate
                    };
                }
                return prev;
            });
        }
    }, [newTraineeForm.courseId, newTraineeForm.joiningDate, courses]);

    // Ensure Trainer specialization defaults to an active course
    useEffect(() => {
        if (courses && courses.length > 0) {
            const activeCoursesList = courses.filter(c => c.active !== false && c.status !== 'DEACTIVATED' && c.status !== 'INACTIVE');
            if (activeCoursesList.length > 0) {
                setNewTrainerForm(prev => {
                    const match = activeCoursesList.some(c => `${c.name} (${c.code})` === prev.specialization);
                    if (!match && !['Dokra Metal Casting & Craft', 'Terracotta & Pottery Design'].includes(prev.specialization)) {
                        return {
                            ...prev,
                            specialization: `${activeCoursesList[0].name} (${activeCoursesList[0].code})`
                        };
                    }
                    return prev;
                });
            }
        }
    }, [courses]);

    // Onboarding User Form State
    const [newUser, setNewUser] = useState({
        role: 'ROLE_TRAINEE',
        name: '',
        username: 'KISS-TRN-2026-001',
        password: 'Password@123',
        trade: 'VOC-ART-102 (Handicrafts & Tribal Art)',
        category: 'Scheduled Tribe (Santhal)',
        email: '',
        contactNumber: ''
    });

    // New Course with Syllabus Form State
    const [newCourse, setNewCourse] = useState({
        name: '',
        code: '',
        durationMonths: 6,
        description: '',
        syllabusModules: [
            { orderNo: 1, moduleTitle: '', durationHours: 40, description: '' }
        ]
    });

    // New Module to Existing Course Form State
    const [newSingleModule, setNewSingleModule] = useState({
        moduleTitle: '',
        durationHours: 40,
        description: ''
    });

    const [notification, setNotification] = useState('');

    // Dynamic Syllabus Module Handlers
    const handleAddModuleField = () => {
        setNewCourse(prev => ({
            ...prev,
            syllabusModules: [
                ...prev.syllabusModules,
                { orderNo: prev.syllabusModules.length + 1, moduleTitle: '', durationHours: 40, description: '' }
            ]
        }));
    };

    const handleRemoveModuleField = (index) => {
        setNewCourse(prev => ({
            ...prev,
            syllabusModules: prev.syllabusModules.filter((_, i) => i !== index)
        }));
    };

    const handleModuleChange = (index, field, value) => {
        setNewCourse(prev => {
            const updated = [...prev.syllabusModules];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, syllabusModules: updated };
        });
    };

    // Submit New Course with Syllabus to MySQL
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.name.trim() || !newCourse.code.trim()) return;

        try {
            const validModules = newCourse.syllabusModules
                .filter(m => m.moduleTitle && m.moduleTitle.trim() !== '')
                .map((m, idx) => ({
                    orderNo: idx + 1,
                    moduleTitle: m.moduleTitle.trim(),
                    durationHours: Number(m.durationHours) || 40,
                    description: (m.description || '').trim()
                }));

            const payload = {
                name: newCourse.name.trim(),
                code: newCourse.code.trim().toUpperCase(),
                durationMonths: Number(newCourse.durationMonths) || 6,
                description: newCourse.description.trim(),
                syllabusModules: validModules
            };

            await axios.post(`${API_BASE_URL}/academics/courses`, payload);

            setNotification(`✓ Course "${payload.name}" (${payload.code}) with ${validModules.length} syllabus modules registered in University Vocational Registry!`);
            setTimeout(() => setNotification(''), 4500);

            setIsCourseModalOpen(false);
            setNewCourse({
                name: '',
                code: '',
                durationMonths: 6,
                description: '',
                syllabusModules: [
                    { orderNo: 1, moduleTitle: '', durationHours: 40, description: '' }
                ]
            });

            await fetchCoursesFromDb();
            setSubTab('courses');
        } catch (err) {
            console.error("Create course error:", err);
            setNotification(`⚠️ Failed to create course: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // Delete Course Permanently from MySQL Database & Frontend State
    const handleDeleteCourse = async (course) => {
        if (window.confirm(`Are you sure you want to permanently delete course "${course.name}" (${course.code}) from database?\n\nThis will remove its syllabus modules and unassign any enrolled scholars.`)) {
            try {
                await axios.delete(`${API_BASE_URL}/academics/courses/${course.id}`);
                setCourses(prev => prev.filter(c => c.id !== course.id));
                setNotification(`✓ Course "${course.name}" (${course.code}) permanently deleted from database.`);
                setTimeout(() => setNotification(''), 4500);
            } catch (err) {
                console.error("Delete course error:", err);
                setNotification(`⚠️ Failed to delete course: ${err.response?.data || err.message}`);
                setTimeout(() => setNotification(''), 4500);
            }
        }
    };

    // Toggle Course Active / Inactive Status (Deactivate / Activate)
    const handleToggleCourseStatus = async (course) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/academics/courses/${course.id}/toggle-status`);
            const updatedActive = res.data.active;
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, active: updatedActive } : c));
            setNotification(`✓ Course "${course.name}" is now ${updatedActive ? 'ACTIVE (visible to trainees and trainers)' : 'DEACTIVATED (hidden from trainees and trainers)'}.`);
            setTimeout(() => setNotification(''), 4500);
        } catch (err) {
            console.error("Toggle course status error:", err);
            setNotification(`⚠️ Failed to update course status: ${err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // Open Enrolled Faculty & Scholars Popup Modal
    const handleOpenEnrollments = async (course) => {
        setEnrollmentCourse(course);
        setIsEnrollmentModalOpen(true);
        setLoadingEnrollments(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/courses/${course.id}/enrollments`);
            if (res.data) {
                setEnrollmentData(res.data);
            }
        } catch (err) {
            console.error("Fetch enrollments error:", err);
            // Fallback from local user registry
            const matchedTrainers = users.filter(u => (u.role || '').includes('TRAINER') && (u.trade || '').includes(course.code));
            const matchedTrainees = users.filter(u => (u.role || '').includes('TRAINEE') && (u.trade || '').includes(course.code));
            setEnrollmentData({
                trainers: matchedTrainers,
                trainees: matchedTrainees,
                totalTrainers: matchedTrainers.length,
                totalTrainees: matchedTrainees.length
            });
        } finally {
            setLoadingEnrollments(false);
        }
    };

    // Add Single Module to an Existing Course
    const handleAddModuleToExisting = async (e) => {
        e.preventDefault();
        if (!courseForAddingModule || !newSingleModule.moduleTitle.trim()) return;

        try {
            const orderNo = (courseForAddingModule.syllabus ? courseForAddingModule.syllabus.length : 0) + 1;
            await axios.post(`${API_BASE_URL}/academics/courses/${courseForAddingModule.id}/syllabus`, {
                moduleTitle: newSingleModule.moduleTitle.trim(),
                durationHours: Number(newSingleModule.durationHours) || 40,
                description: newSingleModule.description.trim(),
                orderNo: orderNo
            });

            setNotification(`✓ Module "${newSingleModule.moduleTitle}" added to ${courseForAddingModule.name}!`);
            setTimeout(() => setNotification(''), 4500);

            setIsAddModuleModalOpen(false);
            setNewSingleModule({ moduleTitle: '', durationHours: 40, description: '' });
            const updatedList = await fetchCoursesFromDb();

            // Refresh the currently inspected modal course if open
            if (selectedCourseForSyllabus && selectedCourseForSyllabus.id === courseForAddingModule.id) {
                const refreshed = updatedList.find(c => c.id === courseForAddingModule.id);
                if (refreshed) setSelectedCourseForSyllabus(refreshed);
            }
        } catch (err) {
            console.error("Add module error:", err);
            setNotification(`⚠️ Failed to add module: ${err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // Open Edit Module Modal
    const handleOpenEditModule = (mod) => {
        setEditingModule(mod);
        setEditModuleForm({
            moduleTitle: mod.moduleTitle || '',
            durationHours: mod.durationHours || 40,
            description: mod.description || '',
            orderNo: mod.orderNo || 1
        });
        setIsEditModuleModalOpen(true);
    };

    // Save Updated Module to MySQL
    const handleSaveEditModule = async (e) => {
        e.preventDefault();
        if (!editingModule || !editModuleForm.moduleTitle.trim()) return;

        try {
            await axios.put(`${API_BASE_URL}/academics/syllabus-modules/${editingModule.id}`, {
                moduleTitle: editModuleForm.moduleTitle.trim(),
                durationHours: Number(editModuleForm.durationHours) || 40,
                description: editModuleForm.description.trim(),
                orderNo: Number(editModuleForm.orderNo) || 1
            });

            setNotification(`✓ Syllabus module "${editModuleForm.moduleTitle}" updated successfully in database!`);
            setTimeout(() => setNotification(''), 4500);

            setIsEditModuleModalOpen(false);
            setEditingModule(null);

            const updatedList = await fetchCoursesFromDb();
            if (selectedCourseForSyllabus) {
                const refreshed = updatedList.find(c => c.id === selectedCourseForSyllabus.id);
                if (refreshed) setSelectedCourseForSyllabus(refreshed);
            }
        } catch (err) {
            console.error("Update syllabus module error:", err);
            setNotification(`⚠️ Failed to update module: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // Delete Module from Syllabus in MySQL
    const handleDeleteModule = async (mod) => {
        if (!window.confirm(`Are you sure you want to delete module "${mod.moduleTitle}"? This cannot be undone.`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/academics/syllabus-modules/${mod.id}`);
            setNotification(`✓ Module "${mod.moduleTitle}" deleted from database.`);
            setTimeout(() => setNotification(''), 4500);

            const updatedList = await fetchCoursesFromDb();
            if (selectedCourseForSyllabus) {
                const refreshed = updatedList.find(c => c.id === selectedCourseForSyllabus.id);
                if (refreshed) setSelectedCourseForSyllabus(refreshed);
            }
        } catch (err) {
            console.error("Delete syllabus module error:", err);
            setNotification(`⚠️ Failed to delete module: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // Open Edit Course Modal
    const handleOpenEditCourse = (course) => {
        setCourseForEditing(course);
        setEditCourseForm({
            name: course.name || '',
            code: course.code || '',
            durationMonths: course.durationMonths || 6,
            description: course.description || ''
        });
        setIsEditCourseModalOpen(true);
    };

    // Save Updated Course to MySQL
    const handleSaveEditCourse = async (e) => {
        e.preventDefault();
        if (!courseForEditing || !editCourseForm.name.trim() || !editCourseForm.code.trim()) return;

        try {
            await axios.put(`${API_BASE_URL}/academics/courses/${courseForEditing.id}`, {
                name: editCourseForm.name.trim(),
                code: editCourseForm.code.trim(),
                durationMonths: Number(editCourseForm.durationMonths) || 6,
                description: editCourseForm.description.trim()
            });

            setNotification(`✓ Course "${editCourseForm.name}" updated successfully in database!`);
            setTimeout(() => setNotification(''), 4500);

            setIsEditCourseModalOpen(false);
            setCourseForEditing(null);

            const updatedList = await fetchCoursesFromDb();
            if (selectedCourseForSyllabus && selectedCourseForSyllabus.id === courseForEditing.id) {
                const refreshed = updatedList.find(c => c.id === courseForEditing.id);
                if (refreshed) setSelectedCourseForSyllabus(refreshed);
            }
        } catch (err) {
            console.error("Update course error:", err);
            setNotification(`⚠️ Failed to update course: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setNotification(''), 4500);
        }
    };

    // ==========================================
    // NOTICE BOARD HANDLERS
    // ==========================================
    const handleCreateNotice = async (e) => {
        e.preventDefault();
        if (!newNoticeForm.title.trim() || !newNoticeForm.content.trim()) return;

        const payload = {
            title: newNoticeForm.title.trim(),
            content: newNoticeForm.content.trim(),
            targetAudience: newNoticeForm.targetAudience,
            priority: newNoticeForm.priority,
            category: newNoticeForm.category,
            postedBy: newNoticeForm.postedBy || (currentUser?.fullName ? `${currentUser.fullName} (Admin)` : 'Central Administration'),
            pinned: newNoticeForm.pinned,
            active: true,
            createdAt: new Date().toISOString()
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/notices`, payload);
            if (res.data) {
                setNotices(prev => [res.data, ...prev]);
            } else {
                setNotices(prev => [{ ...payload, id: Date.now() }, ...prev]);
            }
            setNotification(`✓ Notice "${payload.title}" published successfully!`);
        } catch (err) {
            console.warn("Notice API fallback:", err.message);
            const fallback = { ...payload, id: Date.now() };
            const updated = [fallback, ...notices];
            setNotices(updated);
            localStorage.setItem('kvtms_notices_registry', JSON.stringify(updated));
            setNotification(`✓ Notice "${payload.title}" published!`);
        }
        setTimeout(() => setNotification(''), 4000);
        setIsCreateNoticeModalOpen(false);
        setNewNoticeForm({
            title: '',
            content: '',
            targetAudience: 'ALL',
            priority: 'NORMAL',
            category: 'GENERAL',
            postedBy: currentUser?.fullName ? `${currentUser.fullName} (Admin)` : 'Central Administration',
            pinned: false
        });
    };

    const handleDeleteNotice = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete notice "${title}"?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/notices/${id}`);
            } catch (err) {}
            const updated = notices.filter(n => n.id !== id);
            setNotices(updated);
            localStorage.setItem('kvtms_notices_registry', JSON.stringify(updated));
            setNotification(`✓ Notice deleted.`);
            setTimeout(() => setNotification(''), 3000);
        }
    };

    const handleTogglePinNotice = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notices/${id}/pin`);
        } catch (err) {}
        const updated = notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
        setNotices(updated);
        localStorage.setItem('kvtms_notices_registry', JSON.stringify(updated));
    };

    // ==========================================
    // TRAINEE REPORT & LEAVE HANDLERS
    // ==========================================
    const handleOpenTraineeAttendance = async (trainee) => {
        setSelectedTraineeForAttendance(trainee);
        setAdminAttendanceMsg('');
        setAdminAttendanceForm({
            date: new Date().toISOString().split('T')[0],
            status: 'PRESENT',
            remarks: 'Administrative override approved by Central Admin'
        });
        setLoadingTraineeAttendance(true);
        const cid = trainee.username || trainee.collegeId;
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/trainees/by-college-id/${cid}/attendance`);
            if (res.data && Array.isArray(res.data)) {
                setTraineeAttendanceLogs(res.data);
            } else {
                setTraineeAttendanceLogs([]);
            }
        } catch (err) {
            console.warn("Attendance fetch error:", err.message);
            setTraineeAttendanceLogs([]);
        } finally {
            setLoadingTraineeAttendance(false);
        }
    };

    const handleAdminUpdateAttendance = async (date, newStatus, customRemarks) => {
        if (!selectedTraineeForAttendance) return;
        const cid = selectedTraineeForAttendance.username || selectedTraineeForAttendance.collegeId;
        const traineeId = selectedTraineeForAttendance.traineeId || selectedTraineeForAttendance.id;
        setSubmittingAdminAttendance(true);
        try {
            const remarks = customRemarks || `Administrative override: Marked ${newStatus} by Central Admin`;
            await axios.post(`${API_BASE_URL}/academics/attendance/admin-override`, {
                collegeId: cid,
                traineeId: traineeId,
                date: date,
                status: newStatus,
                remarks: remarks
            });
            setAdminAttendanceMsg(`✓ Session on ${date} successfully updated to ${newStatus} in database.`);
            const res = await axios.get(`${API_BASE_URL}/academics/trainees/by-college-id/${cid}/attendance`);
            if (res.data && Array.isArray(res.data)) {
                setTraineeAttendanceLogs(res.data);
            }
            setTimeout(() => setAdminAttendanceMsg(''), 4500);
        } catch (err) {
            console.error("Admin attendance override error:", err);
            setAdminAttendanceMsg(`⚠️ Failed to update attendance: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setAdminAttendanceMsg(''), 5000);
        } finally {
            setSubmittingAdminAttendance(false);
        }
    };

    const handleAdminSubmitCustomAttendance = async (e) => {
        if (e) e.preventDefault();
        if (!adminAttendanceForm.date) {
            alert("Please select an attendance date.");
            return;
        }
        await handleAdminUpdateAttendance(
            adminAttendanceForm.date,
            adminAttendanceForm.status,
            adminAttendanceForm.remarks || 'Administrative session clearance approved by Central Admin'
        );
    };

    const handleOpenTraineeExam = async (trainee) => {
        setSelectedTraineeForExam(trainee);
        setLoadingTraineeExam(true);
        const cid = trainee.username || trainee.collegeId;
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/scores/by-college-id/${cid}`);
            if (res.data) {
                setTraineeExamReport(res.data);
            } else {
                setTraineeExamReport(null);
            }
        } catch (err) {
            console.warn("Exam score fetch error:", err.message);
            setTraineeExamReport(null);
        } finally {
            setLoadingTraineeExam(false);
        }
    };

    const handleOpenTraineeLeave = async (trainee) => {
        setSelectedTraineeForLeave(trainee);
        setLoadingTraineeLeaves(true);
        const cid = trainee.username || trainee.collegeId;
        try {
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${cid}`);
            if (res.data && Array.isArray(res.data)) {
                setTraineeLeaveRequests(res.data);
            } else {
                setTraineeLeaveRequests([]);
            }
        } catch (err) {
            console.warn("Leave fetch error:", err.message);
            setTraineeLeaveRequests([]);
        } finally {
            setLoadingTraineeLeaves(false);
        }
    };

    const handleApplyTraineeLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTraineeForLeave || !traineeLeaveForm.startDate || !traineeLeaveForm.endDate || !traineeLeaveForm.reason.trim()) return;
        const cid = selectedTraineeForLeave.username || selectedTraineeForLeave.collegeId;
        try {
            await axios.post(`${API_BASE_URL}/leaves/apply`, {
                collegeId: cid,
                startDate: traineeLeaveForm.startDate,
                endDate: traineeLeaveForm.endDate,
                reason: traineeLeaveForm.reason.trim()
            });
            setNotification(`✓ Leave application registered for ${selectedTraineeForLeave.name || selectedTraineeForLeave.fullName}!`);
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${cid}`);
            if (res.data && Array.isArray(res.data)) setTraineeLeaveRequests(res.data);
            setTraineeLeaveForm({ startDate: '', endDate: '', reason: '' });
        } catch (err) {
            console.error("Apply leave error:", err);
            const newL = {
                id: Date.now(),
                studentId: cid,
                trainee: selectedTraineeForLeave.name || selectedTraineeForLeave.fullName,
                startDate: traineeLeaveForm.startDate,
                endDate: traineeLeaveForm.endDate,
                days: 3,
                reason: traineeLeaveForm.reason,
                status: 'PENDING',
                date: new Date().toISOString().split('T')[0]
            };
            setTraineeLeaveRequests(prev => [newL, ...prev]);
            setNotification(`✓ Leave request registered!`);
            setTraineeLeaveForm({ startDate: '', endDate: '', reason: '' });
        }
        setTimeout(() => setNotification(''), 4000);
    };

    // ==========================================
    // TRAINER REPORT & LEAVE HANDLERS
    // ==========================================
    const handleOpenTrainerAttendance = async (trainer) => {
        setSelectedTrainerForAttendance(trainer);
        setLoadingTrainerAttendance(true);
        const cid = trainer.username || trainer.collegeId;
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/trainers/by-college-id/${cid}/attendance`);
            if (res.data) {
                setTrainerAttendanceReport(res.data);
            } else {
                setTrainerAttendanceReport(null);
            }
        } catch (err) {
            console.warn("Trainer attendance fetch error:", err.message);
            setTrainerAttendanceReport(null);
        } finally {
            setLoadingTrainerAttendance(false);
        }
    };

    const handleAdminSubmitTrainerAttendance = async (e) => {
        e.preventDefault();
        if (!selectedTrainerForAttendance) return;
        const cid = selectedTrainerForAttendance.username || selectedTrainerForAttendance.collegeId;
        setSubmittingTrainerAttendance(true);
        try {
            const payload = {
                collegeId: cid,
                date: adminTrainerAttendanceForm.date,
                status: adminTrainerAttendanceForm.status,
                hoursConducted: Number(adminTrainerAttendanceForm.hoursConducted) || 4,
                sessionType: adminTrainerAttendanceForm.sessionType || 'Practical Workshop & Artisan Mentorship',
                remarks: adminTrainerAttendanceForm.remarks || `Faculty session recorded as ${adminTrainerAttendanceForm.status} by Central Admin`
            };
            await axios.post(`${API_BASE_URL}/academics/trainers/attendance/mark`, payload);
            setNotification(`✓ Faculty attendance record saved for ${selectedTrainerForAttendance.name || selectedTrainerForAttendance.fullName}!`);
            const res = await axios.get(`${API_BASE_URL}/academics/trainers/by-college-id/${cid}/attendance`);
            if (res.data) setTrainerAttendanceReport(res.data);
            setAdminTrainerAttendanceForm(prev => ({ ...prev, remarks: '' }));
        } catch (err) {
            console.error("Trainer attendance override error:", err);
            setNotification(`⚠️ Failed to record faculty attendance: ${err.message}`);
        } finally {
            setSubmittingTrainerAttendance(false);
            setTimeout(() => setNotification(''), 4000);
        }
    };

    const handleOpenTrainerLeave = async (trainer) => {
        setSelectedTrainerForLeave(trainer);
        setLoadingTrainerLeaves(true);
        const cid = trainer.username || trainer.collegeId;
        try {
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${cid}`);
            if (res.data && Array.isArray(res.data)) {
                setTrainerLeaveRequests(res.data);
            } else {
                setTrainerLeaveRequests([]);
            }
        } catch (err) {
            console.warn("Trainer leave fetch error:", err.message);
            setTrainerLeaveRequests([]);
        } finally {
            setLoadingTrainerLeaves(false);
        }
    };

    const handleApplyTrainerLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTrainerForLeave || !trainerLeaveForm.startDate || !trainerLeaveForm.endDate || !trainerLeaveForm.reason.trim()) return;
        const cid = selectedTrainerForLeave.username || selectedTrainerForLeave.collegeId;
        try {
            await axios.post(`${API_BASE_URL}/leaves/apply`, {
                collegeId: cid,
                startDate: trainerLeaveForm.startDate,
                endDate: trainerLeaveForm.endDate,
                reason: trainerLeaveForm.reason.trim()
            });
            setNotification(`✓ Leave application registered for ${selectedTrainerForLeave.name || selectedTrainerForLeave.fullName}!`);
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${cid}`);
            if (res.data && Array.isArray(res.data)) setTrainerLeaveRequests(res.data);
            setTrainerLeaveForm({ startDate: '', endDate: '', reason: '' });
        } catch (err) {
            console.error("Apply trainer leave error:", err);
            const newL = {
                id: Date.now(),
                studentId: cid,
                trainee: selectedTrainerForLeave.name || selectedTrainerForLeave.fullName,
                startDate: trainerLeaveForm.startDate,
                endDate: trainerLeaveForm.endDate,
                days: 2,
                reason: trainerLeaveForm.reason,
                status: 'PENDING',
                date: new Date().toISOString().split('T')[0]
            };
            setTrainerLeaveRequests(prev => [newL, ...prev]);
            setNotification(`✓ Faculty leave request registered!`);
            setTrainerLeaveForm({ startDate: '', endDate: '', reason: '' });
        }
        setTimeout(() => setNotification(''), 4000);
    };

    // ==========================================
    // ADMINISTRATIVE FINAL LEAVE APPROVAL / DECLINE
    // ==========================================
    const handleReviewLeaveAction = async (leaveId, newStatus, applicantCollegeId, isTrainer = false) => {
        const remark = leaveReviewRemarks[leaveId] || (newStatus === 'APPROVED' ? 'Approved by University Central Administration.' : 'Declined by University Central Administration.');
        try {
            await axios.put(`${API_BASE_URL}/leaves/${leaveId}/review`, {
                status: newStatus,
                reviewRemarks: remark
            });
            setNotification(`✓ Leave request marked as ${newStatus} successfully!`);
            setTimeout(() => setNotification(''), 4000);

            if (isTrainer) {
                const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${applicantCollegeId}`);
                if (res.data && Array.isArray(res.data)) {
                    setTrainerLeaveRequests(res.data);
                }
            } else {
                const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${applicantCollegeId}`);
                if (res.data && Array.isArray(res.data)) {
                    setTraineeLeaveRequests(res.data);
                }
            }
        } catch (err) {
            console.error("Leave review error:", err);
            if (isTrainer) {
                setTrainerLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus, reviewRemarks: remark } : l));
            } else {
                setTraineeLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus, reviewRemarks: remark } : l));
            }
            setNotification(`✓ Leave request marked as ${newStatus}.`);
            setTimeout(() => setNotification(''), 4000);
        }
    };

    // Submit User Onboarding to MySQL
    const handleAddUser = async (e) => {
        e.preventDefault();

        const createdUser = {
            id: Date.now(),
            username: newUser.username,
            name: newUser.name,
            role: newUser.role,
            trade: newUser.trade,
            category: newUser.category,
            email: newUser.email,
            contactNumber: newUser.contactNumber,
            password: newUser.password,
            status: 'ACTIVE'
        };

        // Try sending to real Spring Boot backend
        try {
            let courseId = 2; // Default Handicrafts & Tribal Art
            const matchedCourse = courses.find(c => newUser.trade.includes(c.code) || newUser.trade.includes(c.name));
            if (matchedCourse) {
                courseId = matchedCourse.id;
            } else if (newUser.trade.includes('101') || newUser.trade.includes('SEW')) courseId = 1;
            else if (newUser.trade.includes('102') || newUser.trade.includes('ART')) courseId = 2;
            else if (newUser.trade.includes('103') || newUser.trade.includes('FOD')) courseId = 3;
            else if (newUser.trade.includes('104') || newUser.trade.includes('CAR')) courseId = 4;

            if (newUser.role === 'ROLE_TRAINEE') {
                await axios.post(`${API_BASE_URL}/auth/register-trainee`, {
                    collegeId: newUser.username,
                    fullName: newUser.name,
                    email: newUser.email,
                    contactNumber: newUser.contactNumber,
                    courseId: courseId,
                    password: newUser.password
                });
            } else {
                await axios.post(`${API_BASE_URL}/auth/register-trainer`, {
                    employeeId: newUser.username,
                    fullName: newUser.name,
                    email: newUser.email,
                    contactNumber: newUser.contactNumber,
                    specialization: newUser.trade,
                    password: newUser.password
                });
            }

            // Sync fresh list from database
            const res = await axios.get(`${API_BASE_URL}/auth/users`);
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setUsers(res.data);
                localStorage.setItem('kvtms_user_registry', JSON.stringify(res.data));
                setNotification(`✓ Successfully enrolled ${newUser.name} (${newUser.username}) into University Vocational Registry!`);
                setIsModalOpen(false);
                fetchCoursesFromDb();
                return;
            }
        } catch (err) {
            console.warn("Backend API sync warning:", err);
        }

        // Fallback save in state + localStorage
        const updated = [...users, createdUser];
        setUsers(updated);
        localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));

        setNotification(`✓ Successfully enrolled ${newUser.name} (${newUser.username})!`);
        setIsModalOpen(false);
    };

    // Toggle User Status
    const toggleUserStatus = (id) => {
        const updated = users.map(u => {
            if (u.id === id) {
                return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
            }
            return u;
        });
        setUsers(updated);
        localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
    };

    // Delete User
    const handleDeleteUser = async (id, name, username) => {
        if (username === 'KISS-ADM-001') {
            alert('Cannot delete primary Root Administrator account (KISS-ADM-001)!');
            return;
        }
        if (window.confirm(`Are you sure you want to permanently delete "${name}" (${username})?`)) {
            try {
                const res = await axios.delete(`${API_BASE_URL}/auth/users/${username}`);
                if (res.status === 200) {
                    const updated = users.filter(u => u.username !== username && u.id !== id);
                    setUsers(updated);
                    localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
                    setNotification(`✓ User "${name}" (${username}) deleted from database.`);
                    setTimeout(() => setNotification(''), 3500);
                    return;
                }
            } catch (e) {}

            const updated = users.filter(u => u.id !== id && u.username !== username);
            setUsers(updated);
            localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
            setNotification(`✓ User "${name}" (${username}) removed from registry.`);
            setTimeout(() => setNotification(''), 3500);
        }
    };

    // User Groups by Role
    const adminUsers = users.filter(u => (u.role || '').includes('ADMIN'));
    const trainerUsers = users.filter(u => (u.role || '').includes('TRAINER'));
    const traineeUsers = users.filter(u => (u.role || '').includes('TRAINEE'));
    const productionUsers = users.filter(u => (u.role || '').includes('PRODUCTION') || (u.role || '').includes('PRD'));

    // Auto-populate / Sync default institutional emails based on sequential College/Staff ID
    useEffect(() => {
        const nextId = `KISS-TRN-2026-00${traineeUsers.length + 1}`;
        if (!newTraineeForm.collegeId && (!newTraineeForm.email || newTraineeForm.email.includes('@kiss.ac.in'))) {
            setNewTraineeForm(prev => {
                if (!prev.collegeId && (!prev.email || prev.email.includes('@kiss.ac.in'))) {
                    return { ...prev, email: `${nextId.toLowerCase()}@kiss.ac.in` };
                }
                return prev;
            });
        }
    }, [traineeUsers.length]);

    useEffect(() => {
        const nextEid = `KISS-FAC-00${trainerUsers.length + 1}`;
        if (!newTrainerForm.employeeId && (!newTrainerForm.email || newTrainerForm.email.includes('@kiss.ac.in'))) {
            setNewTrainerForm(prev => {
                if (!prev.employeeId && (!prev.email || prev.email.includes('@kiss.ac.in'))) {
                    return { ...prev, email: `${nextEid.toLowerCase()}@kiss.ac.in` };
                }
                return prev;
            });
        }
    }, [trainerUsers.length]);

    useEffect(() => {
        const nextCid = `KISS-ADM-00${adminUsers.length + 1}`;
        if (!newAdminForm.collegeId && (!newAdminForm.email || newAdminForm.email.includes('@kiss.ac.in'))) {
            setNewAdminForm(prev => {
                if (!prev.collegeId && (!prev.email || prev.email.includes('@kiss.ac.in'))) {
                    return { ...prev, email: `${nextCid.toLowerCase()}@kiss.ac.in` };
                }
                return prev;
            });
        }
    }, [adminUsers.length]);

    useEffect(() => {
        const nextPid = `KISS-PRD-00${productionUsers.length + 1}`;
        if (!newProductionForm.collegeId && (!newProductionForm.email || newProductionForm.email.includes('@kiss.ac.in'))) {
            setNewProductionForm(prev => {
                if (!prev.collegeId && (!prev.email || prev.email.includes('@kiss.ac.in'))) {
                    return { ...prev, email: `${nextPid.toLowerCase()}@kiss.ac.in` };
                }
                return prev;
            });
        }
    }, [productionUsers.length]);

    // 1. Admin Registration Handler
    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        const cid = (newAdminForm.collegeId || '').trim() || `KISS-ADM-00${adminUsers.length + 1}`;
        const autoEmail = `${cid.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
        const emailToUse = (newAdminForm.email || '').trim() || autoEmail;

        if (newAdminForm.contactNumber && newAdminForm.contactNumber.trim().length !== 10) {
            setNotification('⚠️ Mobile number must be exactly 10 digits.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        if (!newAdminForm.fullName.trim() || !emailToUse || !newAdminForm.password.trim()) {
            setNotification('⚠️ Please enter full name, email, and password for new Administrator.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        const adminPayload = {
            collegeId: cid,
            fullName: newAdminForm.fullName.trim(),
            email: emailToUse,
            contactNumber: newAdminForm.contactNumber.trim(),
            department: newAdminForm.department.trim() || 'Central Administration',
            password: newAdminForm.password
        };

        try {
            await axios.post(`${API_BASE_URL}/auth/register-admin`, adminPayload);
            setNotification(`✓ Administrator "${adminPayload.fullName}" (${cid}) registered in database!`);
            await fetchUsersFromDb();
        } catch (err) {
            console.warn("Backend register-admin fallback:", err.message);
            const fallbackAdmin = {
                id: Date.now(),
                username: cid,
                name: adminPayload.fullName,
                email: adminPayload.email,
                contactNumber: adminPayload.contactNumber,
                trade: adminPayload.department,
                category: 'University Executive',
                role: 'ROLE_ADMIN',
                status: 'ACTIVE'
            };
            const updated = [...users, fallbackAdmin];
            setUsers(updated);
            localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
            setNotification(`✓ Administrator "${adminPayload.fullName}" (${cid}) onboarded!`);
        }
        setTimeout(() => setNotification(''), 4500);

        const nextAdminId = `KISS-ADM-00${adminUsers.length + 2}`;
        setNewAdminForm({
            collegeId: '',
            fullName: '',
            email: `${nextAdminId.toLowerCase()}@kiss.ac.in`,
            contactNumber: '',
            department: 'Central Administration',
            password: ''
        });
    };

    // 1b. Production Staff Registration Handler
    const handleRegisterProductionStaff = async (e) => {
        e.preventDefault();
        const pid = (newProductionForm.collegeId || '').trim() || `KISS-PRD-00${productionUsers.length + 1}`;
        const autoEmail = `${pid.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
        const emailToUse = (newProductionForm.email || '').trim() || autoEmail;

        if (newProductionForm.contactNumber && newProductionForm.contactNumber.trim().length !== 10) {
            setNotification('⚠️ Mobile number must be exactly 10 digits.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        if (!newProductionForm.fullName.trim() || !emailToUse || !newProductionForm.password.trim()) {
            setNotification('⚠️ Please enter full legal name, email, and password for Production Staff.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        const prodPayload = {
            collegeId: pid,
            fullName: newProductionForm.fullName.trim(),
            email: emailToUse,
            contactNumber: newProductionForm.contactNumber.trim(),
            department: newProductionForm.department.trim() || 'Central Production Unit',
            designation: newProductionForm.designation.trim() || 'Production Floor Operator (Data Entry)',
            password: newProductionForm.password
        };

        try {
            await axios.post(`${API_BASE_URL}/auth/register-production-staff`, prodPayload);
            setNotification(`✓ Production Staff "${prodPayload.fullName}" (${pid}) registered in database!`);
            await fetchUsersFromDb();
        } catch (err) {
            console.warn("Backend register-production-staff fallback:", err.message);
            const fallbackProd = {
                id: Date.now(),
                username: pid,
                name: prodPayload.fullName,
                email: prodPayload.email,
                contactNumber: prodPayload.contactNumber,
                trade: prodPayload.department,
                category: 'Production Unit',
                role: 'ROLE_PRODUCTION_MANAGER',
                status: 'ACTIVE'
            };
            const updated = [...users, fallbackProd];
            setUsers(updated);
            localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
            setNotification(`✓ Production Staff "${prodPayload.fullName}" (${pid}) onboarded!`);
        }
        setTimeout(() => setNotification(''), 4500);

        const nextPid = `KISS-PRD-00${productionUsers.length + 2}`;
        setNewProductionForm({
            collegeId: '',
            fullName: '',
            email: `${nextPid.toLowerCase()}@kiss.ac.in`,
            contactNumber: '',
            department: 'Central Production Unit',
            designation: 'Production Floor Operator (Data Entry)',
            password: ''
        });
    };

    // 2. Trainer Registration Handler
    const handleRegisterTrainer = async (e) => {
        e.preventDefault();
        const eid = (newTrainerForm.employeeId || '').trim() || `KISS-FAC-00${trainerUsers.length + 1}`;
        const autoEmail = `${eid.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
        const emailToUse = (newTrainerForm.email || '').trim() || autoEmail;

        if (newTrainerForm.contactNumber && newTrainerForm.contactNumber.trim().length !== 10) {
            setNotification('⚠️ Mobile number must be exactly 10 digits.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        if (!newTrainerForm.fullName.trim() || !emailToUse || !newTrainerForm.password.trim()) {
            setNotification('⚠️ Please enter full name, email, and password for faculty Trainer.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        const trainerPayload = {
            collegeId: eid,
            fullName: newTrainerForm.fullName.trim(),
            email: emailToUse,
            contactNumber: newTrainerForm.contactNumber.trim(),
            specialization: newTrainerForm.specialization.trim() || 'Vocational Training',
            address: newTrainerForm.address.trim(),
            dob: newTrainerForm.dob || null,
            joiningDate: newTrainerForm.joiningDate || new Date().toISOString().split('T')[0],
            bloodGroup: newTrainerForm.bloodGroup || '',
            password: newTrainerForm.password
        };

        try {
            await axios.post(`${API_BASE_URL}/auth/register-trainer`, trainerPayload);
            setNotification(`✓ Faculty Trainer "${trainerPayload.fullName}" (${eid}) onboarded in database!`);
            await fetchUsersFromDb();
        } catch (err) {
            console.warn("Backend register-trainer fallback:", err.message);
            const fallbackTrainer = {
                id: Date.now(),
                username: eid,
                name: trainerPayload.fullName,
                email: trainerPayload.email,
                contactNumber: trainerPayload.contactNumber,
                trade: trainerPayload.specialization,
                address: trainerPayload.address,
                dob: trainerPayload.dob,
                joiningDate: trainerPayload.joiningDate,
                bloodGroup: trainerPayload.bloodGroup,
                category: 'Faculty Staff',
                role: 'ROLE_TRAINER',
                status: 'ACTIVE'
            };
            const updated = [...users, fallbackTrainer];
            setUsers(updated);
            localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
            setNotification(`✓ Faculty Trainer "${trainerPayload.fullName}" (${eid}) registered!`);
        }
        setTimeout(() => setNotification(''), 4500);

        const nextTrainerId = `KISS-FAC-00${trainerUsers.length + 2}`;
        setNewTrainerForm({
            employeeId: '',
            fullName: '',
            email: `${nextTrainerId.toLowerCase()}@kiss.ac.in`,
            contactNumber: '',
            specialization: 'Handicrafts & Tribal Art (VOC-ART-102)',
            address: '',
            dob: '',
            joiningDate: new Date().toISOString().split('T')[0],
            bloodGroup: '',
            password: ''
        });
    };

    // 3. Trainee Registration Handler
    const handleRegisterTrainee = async (e) => {
        e.preventDefault();
        const tid = (newTraineeForm.collegeId || '').trim() || `KISS-TRN-2026-00${traineeUsers.length + 1}`;
        const autoEmail = `${tid.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
        const emailToUse = (newTraineeForm.email || '').trim() || autoEmail;

        if (newTraineeForm.contactNumber && newTraineeForm.contactNumber.trim().length !== 10) {
            setNotification('⚠️ Mobile number must be exactly 10 digits.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        if (!newTraineeForm.fullName.trim() || !emailToUse || !newTraineeForm.password.trim()) {
            setNotification('⚠️ Please enter full name, email, and password for tribal Trainee.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        const selectedCourse = activeCourses.find(c => String(c.id) === String(newTraineeForm.courseId)) || activeCourses[0] || courses.find(c => String(c.id) === String(newTraineeForm.courseId)) || courses[0];
        const courseId = selectedCourse ? selectedCourse.id : null;
        if (!courseId) {
            setNotification('⚠️ No active course selected or available.');
            setTimeout(() => setNotification(''), 4000);
            return;
        }

        const traineePayload = {
            collegeId: tid,
            fullName: newTraineeForm.fullName.trim(),
            email: emailToUse,
            contactNumber: newTraineeForm.contactNumber.trim(),
            courseId: courseId,
            address: newTraineeForm.address.trim(),
            dob: newTraineeForm.dob || null,
            joiningDate: newTraineeForm.joiningDate || new Date().toISOString().split('T')[0],
            bloodGroup: newTraineeForm.bloodGroup || '',
            passOutDate: newTraineeForm.passOutDate || null,
            password: newTraineeForm.password
        };

        try {
            await axios.post(`${API_BASE_URL}/auth/register-trainee`, traineePayload);
            setNotification(`✓ Tribal Scholar "${traineePayload.fullName}" (${tid}) enrolled in ${selectedCourse?.name || 'Vocational Trade'}!`);
            await fetchUsersFromDb();
        } catch (err) {
            console.warn("Backend register-trainee fallback:", err.message);
            const fallbackTrainee = {
                id: Date.now(),
                username: tid,
                name: traineePayload.fullName,
                email: traineePayload.email,
                contactNumber: traineePayload.contactNumber,
                trade: selectedCourse ? `${selectedCourse.code} (${selectedCourse.name})` : 'Handicrafts & Tribal Art (VOC-ART-102)',
                category: newTraineeForm.category || 'Scheduled Tribe (KISS Scholar)',
                address: traineePayload.address,
                dob: traineePayload.dob,
                joiningDate: traineePayload.joiningDate,
                bloodGroup: traineePayload.bloodGroup,
                passOutDate: traineePayload.passOutDate,
                role: 'ROLE_TRAINEE',
                status: 'ACTIVE'
            };
            const updated = [...users, fallbackTrainee];
            setUsers(updated);
            localStorage.setItem('kvtms_user_registry', JSON.stringify(updated));
            setNotification(`✓ Tribal Scholar "${traineePayload.fullName}" (${tid}) enrolled!`);
        }
        setTimeout(() => setNotification(''), 4500);

        const nextTraineeCount = traineeUsers.length + 2;
        const nextAutoId = `KISS-TRN-2026-00${nextTraineeCount}`;
        setNewTraineeForm({
            collegeId: '',
            fullName: '',
            email: `${nextAutoId.toLowerCase()}@kiss.ac.in`,
            contactNumber: '',
            courseId: courses[0]?.id || '',
            category: 'Scheduled Tribe (KISS Scholar)',
            address: '',
            dob: '',
            joiningDate: new Date().toISOString().split('T')[0],
            bloodGroup: 'O+',
            passOutDate: '',
            password: ''
        });
    };

    // Filtered Trainees
    const filteredTrainees = traineeUsers.filter(u => {
        if (traineeStatusFilter !== 'ALL' && u.status !== traineeStatusFilter) return false;
        if (traineeCourseFilter !== 'ALL') {
            const courseMatch = (u.trade || '').toLowerCase().includes(traineeCourseFilter.toLowerCase());
            if (!courseMatch) return false;
        }
        if (!traineeSearch.trim()) return true;
        const q = traineeSearch.toLowerCase().trim();
        return (
            (u.username || '').toLowerCase().includes(q) ||
            (u.name || u.fullName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.trade || '').toLowerCase().includes(q)
        );
    });
    const totalTraineePages = Math.max(1, Math.ceil(filteredTrainees.length / traineesPerPage));
    const safeTraineePage = Math.min(Math.max(1, traineeCurrentPage), totalTraineePages);
    const paginatedTrainees = filteredTrainees.slice((safeTraineePage - 1) * traineesPerPage, safeTraineePage * traineesPerPage);

    // Filtered Trainers
    const filteredTrainers = trainerUsers.filter(u => {
        if (trainerStatusFilter !== 'ALL' && u.status !== trainerStatusFilter) return false;
        if (trainerTradeFilter !== 'ALL') {
            const tradeMatch = (u.trade || '').toLowerCase().includes(trainerTradeFilter.toLowerCase());
            if (!tradeMatch) return false;
        }
        if (!trainerSearch.trim()) return true;
        const q = trainerSearch.toLowerCase().trim();
        return (
            (u.username || '').toLowerCase().includes(q) ||
            (u.name || u.fullName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.trade || '').toLowerCase().includes(q)
        );
    });
    const totalTrainerPages = Math.max(1, Math.ceil(filteredTrainers.length / trainersPerPage));
    const safeTrainerPage = Math.min(Math.max(1, trainerCurrentPage), totalTrainerPages);
    const paginatedTrainers = filteredTrainers.slice((safeTrainerPage - 1) * trainersPerPage, safeTrainerPage * trainersPerPage);

    // Filtered & Paginated Courses for Vocational Training Directory
    const filteredCourses = courses.filter((c) => {
        // Status filter
        if (courseStatusFilter === 'ACTIVE' && !c.active) return false;
        if (courseStatusFilter === 'INACTIVE' && c.active) return false;

        // Search query filter (matches name, code, description, or syllabus module)
        if (!courseSearchQuery.trim()) return true;
        const q = courseSearchQuery.toLowerCase().trim();
        const nameMatch = (c.name || '').toLowerCase().includes(q);
        const codeMatch = (c.code || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const moduleMatch = (c.syllabus || []).some(m =>
            (m.moduleTitle || '').toLowerCase().includes(q) ||
            (m.description || '').toLowerCase().includes(q)
        );
        return nameMatch || codeMatch || descMatch || moduleMatch;
    });

    const totalCoursePages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
    const safeCoursesPage = Math.min(Math.max(1, coursesCurrentPage), totalCoursePages);
    const courseStartIndex = (safeCoursesPage - 1) * coursesPerPage;
    const courseEndIndex = Math.min(courseStartIndex + coursesPerPage, filteredCourses.length);
    const paginatedCourses = filteredCourses.slice(courseStartIndex, courseStartIndex + coursesPerPage);

    return (
        <div className="space-y-6">

            {/* Banner Header */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            Admin Governance & Academic Authority
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800">System Administration Console</h2>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage university user registry, vocational courses, active curricula, and enrollment rosters.
                    </p>
                </div>
            </div>

            {/* Notification Banner */}
            {notification && (
                <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{notification}</span>
                </div>
            )}

            {/* ======================================================== */}
            {/* 1. ADMIN REGISTRATION (Admin can add more admins) */}
            {/* ======================================================== */}
            {subTab === 'admin-reg' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                        Multi-Admin Delegation
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <ShieldCheck size={20} className="text-purple-700" />
                                        University Administrator Registration
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Primary root admin can onboard institutional co-administrators for governance, exams, accounts, and academic oversight.
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200">
                                Active Administrators: {adminUsers.length}
                            </span>
                        </div>

                        {/* Admin Onboarding Form */}
                        <form onSubmit={handleRegisterAdmin} className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Admin Full Legal Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAdminForm.fullName}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                                        required
                                        placeholder="e.g. Prof. Rajesh Sharma"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Staff / Admin ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAdminForm.collegeId}
                                        onChange={(e) => {
                                            const cid = e.target.value;
                                            const defaultId = `KISS-ADM-00${adminUsers.length + 1}`;
                                            const cleanId = cid.trim() || defaultId;
                                            const autoEmail = `${cleanId.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
                                            setNewAdminForm(prev => ({
                                                ...prev,
                                                collegeId: cid,
                                                email: autoEmail
                                            }));
                                        }}
                                        placeholder={`Auto: KISS-ADM-00${adminUsers.length + 1}`}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-purple-600"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-0.5">Leave blank to auto-assign sequential ID</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Official University Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={newAdminForm.email}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                        required
                                        placeholder="e.g. rajesh.sharma@kiss.ac.in"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                                    />
                                    <p className="text-[10px] text-purple-600 font-medium mt-0.5 flex items-center gap-1">
                                        <CheckCircle2 size={11} /> Auto-generated as per Admin ID (@kiss.ac.in)
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Contact / Phone Number
                                        </label>
                                        <span className={`text-[10px] font-mono font-bold ${newAdminForm.contactNumber?.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {newAdminForm.contactNumber?.length || 0}/10 digits
                                        </span>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        inputMode="numeric"
                                        pattern="[0-9]{10}"
                                        value={newAdminForm.contactNumber}
                                        onChange={(e) => {
                                            const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setNewAdminForm(prev => ({ ...prev, contactNumber: cleanDigits }));
                                        }}
                                        placeholder="Enter 10-digit mobile number"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-600"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-0.5">Strictly 10 numerical digits</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Administrative Department
                                    </label>
                                    <select
                                        value={newAdminForm.department}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, department: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-600 bg-white"
                                    >
                                        <option value="Central Administration">Central Administration</option>
                                        <option value="Academic Governance & Standards">Academic Governance & Standards</option>
                                        <option value="Examinations & Evaluation">Examinations & Evaluation</option>
                                        <option value="Vocational Operations & Production">Vocational Operations & Production</option>
                                        <option value="Finance & Institutional Accounts">Finance & Institutional Accounts</option>
                                        <option value="Student Welfare & Tribal Affairs">Student Welfare & Tribal Affairs</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Master Login Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newAdminForm.password}
                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                        required
                                        placeholder="Set initial password for this administrator"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5"
                                >
                                    <ShieldCheck size={16} /> Register University Administrator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewAdminForm({ collegeId: '', fullName: '', email: '', contactNumber: '', department: 'Central Administration', password: '' })}
                                    className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2"
                                >
                                    Reset Form
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Active Administrators Directory */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Users size={16} className="text-purple-700" />
                                Official Administrators Directory ({adminUsers.length})
                            </h4>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 size={12} /> Real-Time Institutional Records
                            </span>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                            <table className="w-full text-left text-sm relative">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                    <tr className="text-slate-700 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
                                        <th className="py-2.5 px-3">Staff / Admin ID</th>
                                        <th className="py-2.5 px-3">Full Name</th>
                                        <th className="py-2.5 px-3">Department</th>
                                        <th className="py-2.5 px-3">University Email</th>
                                        <th className="py-2.5 px-3">Contact</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {adminUsers.map((u) => (
                                        <tr key={u.id || u.username} className="hover:bg-slate-50">
                                            <td className="py-3 px-3 font-mono font-bold text-slate-800">{u.username}</td>
                                            <td className="py-3 px-3 font-semibold text-slate-800">{u.name || u.fullName}</td>
                                            <td className="py-3 px-3 text-slate-600">{u.trade || 'Central Administration'}</td>
                                            <td className="py-3 px-3 text-slate-600 font-mono">{u.email}</td>
                                            <td className="py-3 px-3 text-slate-600 font-mono">{u.contactNumber || '—'}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                    u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {u.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                {u.username === 'KISS-ADM-001' ? (
                                                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded">
                                                        Primary Root Admin
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleUserStatus(u.id)}
                                                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                                                        >
                                                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(u.id, u.name || u.fullName, u.username, u.role)}
                                                            title={`Delete ${u.name || u.fullName}`}
                                                            className="p-1 rounded text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* 1b. PRODUCTION STAFF REGISTRATION (Multi-Operator Delegation) */}
            {/* ======================================================== */}
            {subTab === 'production-reg' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                        Shop-Floor Delegation
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Factory size={20} className="text-amber-600" />
                                        Production Team Member & Operator Onboarding
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Register workshop floor assistants, entry operators, and stock clerks to record raw materials, log daily batches, and update inventory under production oversight.
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
                                Active Production Staff: {productionUsers.length}
                            </span>
                        </div>

                        {/* Production Staff Onboarding Form */}
                        <form onSubmit={handleRegisterProductionStaff} className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Staff Full Legal Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newProductionForm.fullName}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, fullName: e.target.value })}
                                        required
                                        placeholder="e.g. Rahul Verma"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Staff / Operator ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newProductionForm.collegeId}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, collegeId: e.target.value })}
                                        placeholder={`Auto: KISS-PRD-00${productionUsers.length + 1}`}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-0.5">Leave blank to auto-assign sequential ID</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Official University Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={newProductionForm.email}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, email: e.target.value })}
                                        required
                                        placeholder="e.g. rahul.verma@kiss.ac.in"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Contact / Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={newProductionForm.contactNumber}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, contactNumber: e.target.value })}
                                        placeholder="e.g. 9861012345"
                                        maxLength="10"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Assigned Workshop Lab / Unit
                                    </label>
                                    <select
                                        value={newProductionForm.department}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, department: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600 bg-white"
                                    >
                                        <option value="Central Production Unit">Central Production Unit (All Workshops)</option>
                                        <option value="Sewing & Textiles Lab #1">Sewing & Textiles Lab #1 (Kurti & Uniforms)</option>
                                        <option value="Sambalpuri Handloom Workshop #2">Sambalpuri Handloom Workshop #2 (Shawls & Sarees)</option>
                                        <option value="Sabai Grass & Tribal Art Studio #3">Sabai Grass & Tribal Art Studio #3 (Baskets & Mats)</option>
                                        <option value="Tribal Carpentry & Woodcraft Lab #4">Tribal Carpentry & Woodcraft Lab #4 (Study Tables & Carvings)</option>
                                        <option value="Agro & Food Processing Unit #5">Agro & Food Processing Unit #5 (Organic Millets & Pickles)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Operational Role / Designation
                                    </label>
                                    <select
                                        value={newProductionForm.designation}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, designation: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600 bg-white"
                                    >
                                        <option value="Production Floor Operator (Data Entry)">Production Floor Operator (Data Entry)</option>
                                        <option value="Workshop Shop-Floor Assistant">Workshop Shop-Floor Assistant</option>
                                        <option value="Raw Materials & BOM Associate">Raw Materials & BOM Associate</option>
                                        <option value="Inventory & Finished Goods Logger">Inventory & Finished Goods Logger</option>
                                        <option value="Assistant Production Supervisor">Assistant Production Supervisor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Initial Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newProductionForm.password}
                                        onChange={(e) => setNewProductionForm({ ...newProductionForm, password: e.target.value })}
                                        required
                                        placeholder="Min 6 characters (e.g. Password@123)"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition shadow flex items-center justify-center gap-1.5"
                                    >
                                        <UserPlus size={15} />
                                        <span>Enroll Production Staff Member</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Active Production Staff Roster */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Users size={16} className="text-amber-600" />
                                    Active Production Team Roster ({productionUsers.length})
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Members authorized to log raw materials, daily production batches, and finished goods inventory.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                            <table className="w-full text-left text-xs relative">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                    <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                                        <th className="py-2.5 px-3">Staff ID</th>
                                        <th className="py-2.5 px-3">Full Legal Name</th>
                                        <th className="py-2.5 px-3">Assigned Workshop</th>
                                        <th className="py-2.5 px-3">Official Email</th>
                                        <th className="py-2.5 px-3">Phone</th>
                                        <th className="py-2.5 px-3">Account Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productionUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 font-mono font-bold text-amber-700">
                                                {u.username}
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-slate-800">
                                                {u.name || u.fullName}
                                            </td>
                                            <td className="py-3 px-3 text-slate-600">
                                                <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium border border-amber-200">
                                                    {u.trade || 'Central Production Unit'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                                                {u.email}
                                            </td>
                                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                                                {u.contactNumber || '—'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    u.status === 'ACTIVE'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                {u.username === 'KISS-PRD-001' ? (
                                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded">
                                                        Primary Manager
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleUserStatus(u.id)}
                                                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                                                        >
                                                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(u.id, u.name || u.fullName, u.username, u.role)}
                                                            title={`Delete ${u.name || u.fullName}`}
                                                            className="p-1 rounded text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* 2. TRAINER REGISTRATION */}
            {/* ======================================================== */}
            {subTab === 'trainer-reg' && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm max-w-4xl space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    Faculty & Master Artisans
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <UserPlus size={20} className="text-indigo-700" />
                                    Vocational Trainer Registration
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Onboard certified vocational instructors, trade masters, and craft specialists.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSwitchSection('trainer-records')}
                            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-2 rounded-lg border border-indigo-200 transition"
                        >
                            View All Trainer Records ({trainerUsers.length}) &rarr;
                        </button>
                    </div>

                    <form onSubmit={handleRegisterTrainer} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Trainer Full Legal Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTrainerForm.fullName}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, fullName: e.target.value })}
                                    required
                                    placeholder="e.g. Prof. S. Soren"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Faculty Staff ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTrainerForm.employeeId}
                                    onChange={(e) => {
                                        const eid = e.target.value;
                                        const defaultId = `KISS-FAC-00${trainerUsers.length + 1}`;
                                        const cleanId = eid.trim() || defaultId;
                                        const autoEmail = `${cleanId.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
                                        setNewTrainerForm(prev => ({
                                            ...prev,
                                            employeeId: eid,
                                            email: autoEmail
                                        }));
                                    }}
                                    placeholder={`Auto: KISS-FAC-00${trainerUsers.length + 1}`}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Leave blank to auto-assign sequential Staff ID</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Official Faculty Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={newTrainerForm.email}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, email: e.target.value })}
                                    required
                                    placeholder="e.g. soren@kiss.ac.in"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                />
                                <p className="text-[10px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Auto-generated as per Faculty ID (@kiss.ac.in)
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Contact / Mobile Number
                                    </label>
                                    <span className={`text-[10px] font-mono font-bold ${newTrainerForm.contactNumber?.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {newTrainerForm.contactNumber?.length || 0}/10 digits
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    value={newTrainerForm.contactNumber}
                                    onChange={(e) => {
                                        const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setNewTrainerForm(prev => ({ ...prev, contactNumber: cleanDigits }));
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Strictly 10 numerical digits</p>
                            </div>
                        </div>

                        {/* DOB & Date of Joining */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Date of Birth (DOB) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newTrainerForm.dob}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, dob: e.target.value })}
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Date of Joining <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newTrainerForm.joiningDate}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, joiningDate: e.target.value })}
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                                />
                            </div>
                        </div>

                        {/* Blood Group & Craft Specialization */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Blood Group <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={newTrainerForm.bloodGroup}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, bloodGroup: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white font-semibold"
                                >
                                    <option value="A+">A+ (A Positive)</option>
                                    <option value="A-">A- (A Negative)</option>
                                    <option value="B+">B+ (B Positive)</option>
                                    <option value="B-">B- (B Negative)</option>
                                    <option value="AB+">AB+ (AB Positive)</option>
                                    <option value="AB-">AB- (AB Negative)</option>
                                    <option value="O+">O+ (O Positive)</option>
                                    <option value="O-">O- (O Negative)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Craft Specialization & Trade
                                </label>
                                <select
                                    value={newTrainerForm.specialization}
                                    onChange={(e) => setNewTrainerForm({ ...newTrainerForm, specialization: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                                >
                                    {activeCourses.length === 0 ? (
                                        <option value="" disabled>No active courses available</option>
                                    ) : (
                                        activeCourses.map(c => (
                                            <option key={c.id} value={`${c.name} (${c.code})`}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))
                                    )}
                                    <option value="Dokra Metal Casting & Craft">Dokra Metal Casting & Craft</option>
                                    <option value="Terracotta & Pottery Design">Terracotta & Pottery Design</option>
                                </select>
                            </div>
                        </div>

                        {/* Residential Address */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Residential / Permanent Address
                            </label>
                            <textarea
                                rows={2}
                                value={newTrainerForm.address}
                                onChange={(e) => setNewTrainerForm({ ...newTrainerForm, address: e.target.value })}
                                placeholder="Plot/Street, Village/Town, District, State, PIN Code"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Faculty Portal Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={newTrainerForm.password}
                                onChange={(e) => setNewTrainerForm({ ...newTrainerForm, password: e.target.value })}
                                required
                                placeholder="Set temporary password for trainer"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                            />
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5"
                            >
                                <UserPlus size={16} /> Onboard Faculty Trainer
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTrainerForm({
                                    employeeId: '',
                                    fullName: '',
                                    email: '',
                                    contactNumber: '',
                                    specialization: 'Handicrafts & Tribal Art (VOC-ART-102)',
                                    address: '',
                                    dob: '',
                                    joiningDate: new Date().toISOString().split('T')[0],
                                    bloodGroup: 'B+',
                                    password: ''
                                })}
                                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ======================================================== */}
            {/* 3. TRAINEE REGISTRATION */}
            {/* ======================================================== */}
            {subTab === 'trainee-reg' && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm max-w-4xl space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    Tribal Scholar Enrollment
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <GraduationCap size={20} className="text-teal-700" />
                                    Trainee & Student Registration
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Enroll KISS scholars into vocational training programs and Earn-While-Learn practical tracks.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSwitchSection('trainee-records')}
                            className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold px-3 py-2 rounded-lg border border-teal-200 transition"
                        >
                            View All Trainee Records ({traineeUsers.length}) &rarr;
                        </button>
                    </div>

                    <form onSubmit={handleRegisterTrainee} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Scholar Full Legal Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTraineeForm.fullName}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, fullName: e.target.value })}
                                    required
                                    placeholder="Enter scholar's full legal name"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Roll Number / College ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTraineeForm.collegeId}
                                    onChange={(e) => {
                                        const cid = e.target.value;
                                        const defaultId = `KISS-TRN-2026-00${traineeUsers.length + 1}`;
                                        const cleanId = cid.trim() || defaultId;
                                        const autoEmail = `${cleanId.toLowerCase().replace(/\s+/g, '-')}@kiss.ac.in`;
                                        setNewTraineeForm(prev => ({
                                            ...prev,
                                            collegeId: cid,
                                            email: autoEmail
                                        }));
                                    }}
                                    placeholder={`Auto: KISS-TRN-2026-00${traineeUsers.length + 1}`}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-teal-600"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Leave blank to auto-assign sequential Roll Number</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Scholar Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={newTraineeForm.email}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, email: e.target.value })}
                                    required
                                    placeholder="scholar.name@kiss.ac.in"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600"
                                />
                                <p className="text-[10px] text-teal-600 font-medium mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Auto-generated as per College ID (@kiss.ac.in)
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Mobile / Phone Number
                                    </label>
                                    <span className={`text-[10px] font-mono font-bold ${newTraineeForm.contactNumber?.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {newTraineeForm.contactNumber?.length || 0}/10 digits
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    value={newTraineeForm.contactNumber}
                                    onChange={(e) => {
                                        const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setNewTraineeForm(prev => ({ ...prev, contactNumber: cleanDigits }));
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-teal-600"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Strictly 10 numerical digits</p>
                            </div>
                        </div>

                        {/* DOB & Date of Joining */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Date of Birth (DOB) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newTraineeForm.dob}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, dob: e.target.value })}
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Date of Joining / Admission <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newTraineeForm.joiningDate}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, joiningDate: e.target.value })}
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 bg-white"
                                />
                            </div>
                        </div>

                        {/* Blood Group & Demographic Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Blood Group <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={newTraineeForm.bloodGroup}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, bloodGroup: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 bg-white font-semibold"
                                >
                                    <option value="A+">A+ (A Positive)</option>
                                    <option value="A-">A- (A Negative)</option>
                                    <option value="B+">B+ (B Positive)</option>
                                    <option value="B-">B- (B Negative)</option>
                                    <option value="AB+">AB+ (AB Positive)</option>
                                    <option value="AB-">AB- (AB Negative)</option>
                                    <option value="O+">O+ (O Positive)</option>
                                    <option value="O-">O- (O Negative)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Demographic Category
                                </label>
                                <input
                                    type="text"
                                    value={newTraineeForm.category}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, category: e.target.value })}
                                    placeholder="Scheduled Tribe (KISS Scholar)"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        {/* Course & Auto-calculated Pass Out Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Assigned Vocational Course & Trade <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={newTraineeForm.courseId}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, courseId: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 bg-white"
                                >
                                    {activeCourses.length === 0 ? (
                                        <option value="" disabled>No active courses available</option>
                                    ) : (
                                        activeCourses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} ({c.durationMonths || 6} Months)
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-700">
                                        Date of Pass Out (Expected) <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        ⚡ Auto-Calculated
                                    </span>
                                </div>
                                <input
                                    type="date"
                                    value={newTraineeForm.passOutDate}
                                    onChange={(e) => setNewTraineeForm({ ...newTraineeForm, passOutDate: e.target.value })}
                                    required
                                    className="w-full border border-teal-300 bg-teal-50/70 font-semibold text-teal-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 shadow-sm"
                                />
                                <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                                    Joining Date + Course Duration ({activeCourses.find(c => String(c.id) === String(newTraineeForm.courseId))?.durationMonths || courses.find(c => String(c.id) === String(newTraineeForm.courseId))?.durationMonths || 6} Months)
                                </p>
                            </div>
                        </div>


                        {/* Permanent Address */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Permanent Residential / Native Village Address
                            </label>
                            <textarea
                                rows={2}
                                value={newTraineeForm.address}
                                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, address: e.target.value })}
                                placeholder="Village/GP, Block, Tribal District, State, PIN Code"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Scholar Portal Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={newTraineeForm.password}
                                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, password: e.target.value })}
                                required
                                placeholder="Set initial password for scholar login"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600"
                            />
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5"
                            >
                                <GraduationCap size={16} /> Enroll Tribal Scholar
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTraineeForm({
                                    collegeId: '',
                                    fullName: '',
                                    email: '',
                                    contactNumber: '',
                                    courseId: courses[0]?.id || '',
                                    category: 'Scheduled Tribe (KISS Scholar)',
                                    address: '',
                                    dob: '',
                                    joiningDate: new Date().toISOString().split('T')[0],
                                    bloodGroup: 'O+',
                                    passOutDate: '',
                                    password: ''
                                })}
                                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ======================================================== */}
            {/* 4. TRAINEE RECORDS */}
            {/* ======================================================== */}
            {(subTab === 'trainee-records' || subTab === 'users') && (
                <div className="space-y-4">
                    {/* Header + Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Scholars</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{traineeUsers.length}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Enrolled trainees</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 shadow-sm">
                            <p className="text-[11px] font-bold text-teal-700 uppercase">Active Trainees</p>
                            <p className="text-2xl font-black text-teal-900 mt-1">{traineeUsers.filter(u => u.status === 'ACTIVE').length}</p>
                            <p className="text-[10px] text-teal-700 mt-0.5">Attending workshops</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                            <p className="text-[11px] font-bold text-emerald-700 uppercase">Tribal Coverage</p>
                            <p className="text-2xl font-black text-emerald-900 mt-1">100%</p>
                            <p className="text-[10px] text-emerald-700 mt-0.5">Scheduled Tribe scholars</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm">
                            <p className="text-[11px] font-bold text-indigo-700 uppercase">Active Trades</p>
                            <p className="text-2xl font-black text-indigo-900 mt-1">{courses.length}</p>
                            <p className="text-[10px] text-indigo-700 mt-0.5">Vocational programs</p>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Users size={18} className="text-teal-700" />
                                    Official Trainee & Scholar Directory ({filteredTrainees.length})
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Search by roll number, name, trade, or toggle academic account active/suspended state.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchSection('trainee-reg')}
                                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow flex items-center gap-1.5"
                                >
                                    <GraduationCap size={15} /> + Enroll New Trainee
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchUsersFromDb}
                                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs"
                                    title="Sync live records"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={traineeSearch}
                                    onChange={(e) => {
                                        setTraineeSearch(e.target.value);
                                        setTraineeCurrentPage(1);
                                    }}
                                    placeholder="Search by Roll No, Scholar Name, or Trade..."
                                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600"
                                />
                            </div>

                            <select
                                value={traineeCourseFilter}
                                onChange={(e) => {
                                    setTraineeCourseFilter(e.target.value);
                                    setTraineeCurrentPage(1);
                                }}
                                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
                            >
                                <option value="ALL">All Vocational Trades</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.name}>{c.code} - {c.name}</option>
                                ))}
                            </select>

                            <select
                                value={traineeStatusFilter}
                                onChange={(e) => {
                                    setTraineeStatusFilter(e.target.value);
                                    setTraineeCurrentPage(1);
                                }}
                                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="SUSPENDED">Suspended Only</option>
                            </select>
                        </div>

                        {/* Trainees Data Table */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                            <table className="w-full text-left text-sm relative">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                    <tr className="text-slate-700 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
                                        <th className="py-2.5 px-3">Roll / College ID</th>
                                        <th className="py-2.5 px-3">Full Name</th>
                                        <th className="py-2.5 px-3">Enrolled Trade</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        <th className="py-2.5 px-3">Contact / Email</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {paginatedTrainees.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-slate-400">
                                                No trainee records found matching the filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTrainees.map((u, idx) => (
                                            <tr key={u.id || u.username} className="hover:bg-slate-50">
                                                <td className="py-3 px-3 font-mono font-bold text-teal-800">{u.username}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-semibold text-slate-800">{u.name || u.fullName}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="text-slate-700 font-medium">{u.trade}</div>
                                                    {(u.joiningDate || u.admissionDate || u.passOutDate) && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                                                            <span>DOJ: {u.joiningDate || u.admissionDate || '—'}</span>
                                                            {u.passOutDate && <span>&bull; Passout: {u.passOutDate}</span>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                                        {u.category || 'Scheduled Tribe'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                                                    <div>{u.email}</div>
                                                    <div className="text-slate-400">{u.contactNumber || '—'}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {u.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleActionMenu(e, u, 'trainee')}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs ${
                                                            actionMenu?.id === u.id && actionMenu?.type === 'trainee'
                                                                ? 'bg-teal-700 text-white border-teal-700 ring-2 ring-teal-200 shadow-sm'
                                                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                                                        }`}
                                                    >
                                                        <span>Actions</span>
                                                        <ChevronDown size={13} className={`transition-transform duration-200 ${actionMenu?.id === u.id && actionMenu?.type === 'trainee' ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Trainees Pagination */}
                        {totalTraineePages > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                <span>Showing Page {safeTraineePage} of {totalTraineePages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setTraineeCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={safeTraineePage === 1}
                                        className="px-2.5 py-1 border rounded disabled:opacity-40"
                                    >
                                        Prev
                                    </button>
                                    <span className="font-bold px-2">{safeTraineePage}</span>
                                    <button
                                        type="button"
                                        onClick={() => setTraineeCurrentPage(p => Math.min(totalTraineePages, p + 1))}
                                        disabled={safeTraineePage === totalTraineePages}
                                        className="px-2.5 py-1 border rounded disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* 5. TRAINER RECORDS */}
            {/* ======================================================== */}
            {subTab === 'trainer-records' && (
                <div className="space-y-4">
                    {/* Header + Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Faculty</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{trainerUsers.length}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Vocational instructors</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm">
                            <p className="text-[11px] font-bold text-indigo-700 uppercase">Active Instructors</p>
                            <p className="text-2xl font-black text-indigo-900 mt-1">{trainerUsers.filter(u => u.status === 'ACTIVE').length}</p>
                            <p className="text-[10px] text-indigo-700 mt-0.5">Conducting courses</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm">
                            <p className="text-[11px] font-bold text-purple-700 uppercase">Faculty Roles</p>
                            <p className="text-2xl font-black text-purple-900 mt-1">Master Artisans</p>
                            <p className="text-[10px] text-purple-700 mt-0.5">Craft specialists</p>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <UserCheck size={18} className="text-indigo-700" />
                                    Vocational Faculty & Trainer Directory ({filteredTrainers.length})
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Official directory of trade instructors, craft specializations, and contact rosters.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchSection('trainer-reg')}
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow flex items-center gap-1.5"
                                >
                                    <UserPlus size={15} /> + Onboard New Trainer
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchUsersFromDb}
                                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs"
                                    title="Sync live records"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={trainerSearch}
                                    onChange={(e) => {
                                        setTrainerSearch(e.target.value);
                                        setTrainerCurrentPage(1);
                                    }}
                                    placeholder="Search by Staff ID, Trainer Name, or Trade..."
                                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <select
                                value={trainerStatusFilter}
                                onChange={(e) => {
                                    setTrainerStatusFilter(e.target.value);
                                    setTrainerCurrentPage(1);
                                }}
                                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="SUSPENDED">Suspended Only</option>
                            </select>
                        </div>

                        {/* Trainers Data Table */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                            <table className="w-full text-left text-sm relative">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                    <tr className="text-slate-700 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
                                        <th className="py-2.5 px-3">Staff / Faculty ID</th>
                                        <th className="py-2.5 px-3">Full Name</th>
                                        <th className="py-2.5 px-3">Craft Specialization</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        <th className="py-2.5 px-3">Contact / Email</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {paginatedTrainers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-slate-400">
                                                No trainer records found matching the filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTrainers.map((u, idx) => (
                                            <tr key={u.id || u.username} className="hover:bg-slate-50">
                                                <td className="py-3 px-3 font-mono font-bold text-indigo-800">{u.username}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-semibold text-slate-800">{u.name || u.fullName}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="text-slate-700 font-medium">{u.trade}</div>
                                                    {u.joiningDate && (
                                                        <div className="text-[10px] text-indigo-700 mt-0.5 font-medium">
                                                            Joined: {u.joiningDate}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-[11px] bg-indigo-50 text-indigo-800 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                                                        Faculty Staff
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                                                    <div>{u.email}</div>
                                                    <div className="text-slate-400">{u.contactNumber || '—'}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {u.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleActionMenu(e, u, 'trainer')}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs ${
                                                            actionMenu?.id === u.id && actionMenu?.type === 'trainer'
                                                                ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-200 shadow-sm'
                                                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                                                        }`}
                                                    >
                                                        <span>Actions</span>
                                                        <ChevronDown size={13} className={`transition-transform duration-200 ${actionMenu?.id === u.id && actionMenu?.type === 'trainer' ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Trainers Pagination */}
                        {totalTrainerPages > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                <span>Showing Page {safeTrainerPage} of {totalTrainerPages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setTrainerCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={safeTrainerPage === 1}
                                        className="px-2.5 py-1 border rounded disabled:opacity-40"
                                    >
                                        Prev
                                    </button>
                                    <span className="font-bold px-2">{safeTrainerPage}</span>
                                    <button
                                        type="button"
                                        onClick={() => setTrainerCurrentPage(p => Math.min(totalTrainerPages, p + 1))}
                                        disabled={safeTrainerPage === totalTrainerPages}
                                        className="px-2.5 py-1 border rounded disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* 6. BROADCAST NOTICE BOARD & OFFICIAL CIRCULARS */}
            {/* ======================================================== */}
            {(subTab === 'notice-board' || subTab === 'notices') && (
                <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Bell size={12} /> University Broadcast System
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    Broadcast Notice Board & Circulars
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Publish university circulars, workshop directives, and urgent announcements for Trainees, Trainers, and Production units.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={fetchNotices}
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-slate-300"
                            >
                                <RefreshCw size={13} className={loadingNotices ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            {isAdmin ? (
                                <button
                                    type="button"
                                    onClick={() => setIsCreateNoticeModalOpen(true)}
                                    className="bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
                                >
                                    <Megaphone size={15} /> Post New Notice
                                </button>
                            ) : (
                                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg font-semibold border border-slate-200">
                                    Official Viewer Mode
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                                <span>Total Active Circulars</span>
                                <Bell size={15} className="text-slate-400" />
                            </div>
                            <p className="text-2xl font-black text-slate-800 mt-1">{notices.length}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Across all institutional portals</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-teal-200 bg-teal-50/20 shadow-2xs">
                            <div className="flex items-center justify-between text-teal-700 text-xs font-semibold">
                                <span>For Trainees</span>
                                <GraduationCap size={15} className="text-teal-600" />
                            </div>
                            <p className="text-2xl font-black text-teal-900 mt-1">
                                {notices.filter(n => n.targetAudience === 'TRAINEES' || n.targetAudience === 'ALL').length}
                            </p>
                            <p className="text-[10px] text-teal-700 mt-0.5">Scholars & student portal</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
                            <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold">
                                <span>For Trainers</span>
                                <UserCheck size={15} className="text-indigo-600" />
                            </div>
                            <p className="text-2xl font-black text-indigo-900 mt-1">
                                {notices.filter(n => n.targetAudience === 'TRAINERS' || n.targetAudience === 'ALL').length}
                            </p>
                            <p className="text-[10px] text-indigo-700 mt-0.5">Faculty instructors & staff</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                            <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                                <span>For Production</span>
                                <Factory size={15} className="text-amber-600" />
                            </div>
                            <p className="text-2xl font-black text-amber-900 mt-1">
                                {notices.filter(n => n.targetAudience === 'PRODUCTION' || n.targetAudience === 'ALL').length}
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5">Workshop floor & inventory</p>
                        </div>
                    </div>

                    {/* Filter Bar & Search */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Audience Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { id: 'ALL', label: 'All Portals' },
                                { id: 'TRAINEES', label: 'Trainees Only' },
                                { id: 'TRAINERS', label: 'Trainers Only' },
                                { id: 'PRODUCTION', label: 'Production Only' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setNoticeAudienceFilter(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        noticeAudienceFilter === tab.id
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 md:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={15} />
                            </div>
                            <input
                                type="text"
                                value={noticeSearchQuery}
                                onChange={(e) => setNoticeSearchQuery(e.target.value)}
                                placeholder="Search circular subject, body..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#006837]"
                            />
                        </div>
                    </div>

                    {/* Notice Cards Grid */}
                    {loadingNotices ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-xs text-slate-500">
                            Loading institutional notices & circulars...
                        </div>
                    ) : notices.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                            <Bell size={32} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-bold text-slate-700">No Circulars Available</p>
                            <p className="text-xs text-slate-500 mt-1">Click &quot;Post New Notice&quot; above to broadcast an official announcement.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                            {notices
                                .filter(n => {
                                    if (noticeAudienceFilter !== 'ALL') {
                                        const aud = (n.targetAudience || '').toUpperCase();
                                        if (aud !== 'ALL' && aud !== noticeAudienceFilter) return false;
                                    }
                                    if (!noticeSearchQuery.trim()) return true;
                                    const q = noticeSearchQuery.toLowerCase().trim();
                                    return (
                                        (n.title || '').toLowerCase().includes(q) ||
                                        (n.content || '').toLowerCase().includes(q) ||
                                        (n.category || '').toLowerCase().includes(q) ||
                                        (n.postedBy || '').toLowerCase().includes(q)
                                    );
                                })
                                .map(notice => {
                                    const aud = (notice.targetAudience || 'ALL').toUpperCase();
                                    return (
                                        <div
                                            key={notice.id}
                                            className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                                                notice.pinned ? 'border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/10' : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div>
                                                {/* Card Header */}
                                                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {/* Audience Tag */}
                                                        {aud === 'TRAINEES' && (
                                                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <GraduationCap size={11} /> Trainees
                                                            </span>
                                                        )}
                                                        {aud === 'TRAINERS' && (
                                                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <UserCheck size={11} /> Trainers
                                                            </span>
                                                        )}
                                                        {aud === 'PRODUCTION' && (
                                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Factory size={11} /> Production
                                                            </span>
                                                        )}
                                                        {aud === 'ALL' && (
                                                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Users size={11} /> All Portals
                                                            </span>
                                                        )}

                                                        {/* Priority Tag */}
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                            notice.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                                                            notice.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {notice.priority || 'NORMAL'}
                                                        </span>

                                                        {/* Category Tag */}
                                                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                                                            {notice.category || 'GENERAL'}
                                                        </span>

                                                        {notice.pinned && (
                                                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 border border-amber-300">
                                                                <Pin size={10} className="fill-amber-600 text-amber-600" /> Pinned
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isAdmin && (
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTogglePinNotice(notice.id)}
                                                                className={`p-1 rounded transition text-xs ${
                                                                    notice.pinned ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100'
                                                                }`}
                                                                title={notice.pinned ? "Unpin notice" : "Pin notice to top"}
                                                            >
                                                                <Pin size={14} className={notice.pinned ? "fill-amber-600" : ""} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteNotice(notice.id, notice.title)}
                                                                className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                                                                title="Delete notice"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notice Title */}
                                                <h4 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                                                    {notice.title}
                                                </h4>

                                                {/* Content */}
                                                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                                    {notice.content}
                                                </p>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                                <span className="font-medium text-slate-500">
                                                    By {notice.postedBy || 'Admin'}
                                                </span>
                                                <span className="font-mono">
                                                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}
            {subTab === 'courses' && (
                <div className="space-y-5">
                    {/* Courses Header Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-600" />
                                Vocational Training Courses & Official NSQF Syllabus
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Manage NSQF-aligned trade courses, toggle active/inactive status, inspect enrolled trainers &amp; scholars, and maintain syllabus modules.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchCoursesFromDb}
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-slate-300"
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                            <button
                                onClick={() => setIsCourseModalOpen(true)}
                                className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
                            >
                                <Plus size={14} /> Add Course with Syllabus
                            </button>
                        </div>
                    </div>

                    {/* Search Bar & Filter Controls */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                value={courseSearchQuery}
                                onChange={(e) => {
                                    setCourseSearchQuery(e.target.value);
                                    setCoursesCurrentPage(1);
                                }}
                                placeholder="Search courses by title, trade code (e.g. VOC-ART-102), topic, or syllabus..."
                                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                            />
                            {courseSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCourseSearchQuery('');
                                        setCoursesCurrentPage(1);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Status Filter & Per-Page Controls */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Status Filter Tabs */}
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCourseStatusFilter('ALL');
                                        setCoursesCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                        courseStatusFilter === 'ALL'
                                            ? 'bg-white text-indigo-700 shadow-xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    All ({courses.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCourseStatusFilter('ACTIVE');
                                        setCoursesCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                        courseStatusFilter === 'ACTIVE'
                                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Active ({courses.filter(c => c.active).length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCourseStatusFilter('INACTIVE');
                                        setCoursesCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                        courseStatusFilter === 'INACTIVE'
                                            ? 'bg-amber-600 text-white shadow-xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Deactivated ({courses.filter(c => !c.active).length})
                                </button>
                            </div>

                            {/* Per-Page Selector */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-1">
                                <span>Show:</span>
                                <select
                                    value={coursesPerPage}
                                    onChange={(e) => {
                                        setCoursesPerPage(Number(e.target.value));
                                        setCoursesCurrentPage(1);
                                    }}
                                    className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value={2}>2 / page</option>
                                    <option value={4}>4 / page</option>
                                    <option value={6}>6 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={100}>All</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Courses Cards Grid */}
                    {loadingCourses ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-xs text-slate-500">
                            Loading vocational courses and curriculum from University Registry...
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                            <BookOpen size={32} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-bold text-slate-700">No Courses Available</p>
                            <p className="text-xs text-slate-500 mt-1">Click &quot;Add Course with Syllabus&quot; above to create a new curriculum.</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                            <Search size={32} className="mx-auto text-slate-400" />
                            <div>
                                <p className="text-sm font-bold text-slate-700">No courses match &quot;{courseSearchQuery}&quot;</p>
                                <p className="text-xs text-slate-500 mt-1">Try searching by code (e.g. VOC-ART-102), course title, or reset filters.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setCourseSearchQuery('');
                                    setCourseStatusFilter('ALL');
                                    setCoursesCurrentPage(1);
                                }}
                                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                            >
                                Reset Search & Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {paginatedCourses.map((course) => {
                                const syllabusList = course.syllabus || [];
                                const totalHours = course.totalHours || syllabusList.reduce((acc, m) => acc + (m.durationHours || 0), 0);
                                return (
                                    <div key={course.id} className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                                        course.active ? 'border-slate-200 hover:border-indigo-300' : 'border-amber-200/90 bg-slate-50/50'
                                    }`}>
                                        <div>
                                            {/* Course Card Top Header */}
                                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-bold px-2 py-0.5 rounded">
                                                            {course.code}
                                                        </span>
                                                        <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                                            NSQF Level-4
                                                        </span>
                                                        <span className="bg-emerald-50 text-[#006837] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                                            ₹0 Fee (Free Tribal Grant)
                                                        </span>
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                                            course.active 
                                                                ? 'bg-emerald-100 text-emerald-800' 
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {course.active ? 'ACTIVE' : 'DEACTIVATED'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base font-bold text-slate-800 mt-1.5">
                                                        {course.name}
                                                    </h4>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md border border-slate-200 block">
                                                        {course.durationMonths} Months
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                                                {course.description || 'Comprehensive vocational training and practical industrial curriculum.'}
                                            </p>

                                            {/* Metrics Stats (MODULES, HOURS, and CLICKABLE ENROLLED BOX) */}
                                            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center">
                                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Modules</p>
                                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{syllabusList.length}</p>
                                                </div>
                                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center">
                                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Hours</p>
                                                    <p className="text-sm font-bold text-indigo-700 mt-0.5">{totalHours}h</p>
                                                </div>

                                                {/* CLICKABLE ENROLLED BOX (Requirement 3) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEnrollments(course)}
                                                    className="p-2 bg-emerald-50 hover:bg-emerald-100/90 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-all text-center cursor-pointer group shadow-2xs flex flex-col justify-center"
                                                    title="Click to view assigned trainers & enrolled trainees for this course"
                                                >
                                                    <p className="text-[10px] text-emerald-700 font-bold uppercase flex items-center justify-center gap-1">
                                                        <Users size={11} /> Enrolled
                                                    </p>
                                                    <p className="text-sm font-bold text-emerald-800 mt-0.5 group-hover:underline">
                                                        {course.enrolledCount || 0} Scholars
                                                    </p>
                                                    <span className="text-[9px] text-emerald-600 font-semibold group-hover:text-emerald-900 block mt-0.5">
                                                        View Roster &rarr;
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Syllabus Module Preview */}
                                            <div className="mt-4">
                                                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <Layers size={13} className="text-indigo-600" />
                                                    Syllabus Modules Preview:
                                                </p>
                                                {syllabusList.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">No syllabus modules added yet.</p>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {syllabusList.slice(0, 3).map((m) => (
                                                            <div key={m.id || m.orderNo} className="p-2 bg-slate-50 rounded-md border border-slate-200/80 text-xs flex items-center justify-between">
                                                                <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                                                                    #{m.orderNo}: {m.moduleTitle}
                                                                </span>
                                                                <span className="text-[11px] font-mono text-indigo-700 font-bold shrink-0 ml-2">
                                                                    {m.durationHours}h
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {syllabusList.length > 3 && (
                                                            <p className="text-[11px] text-indigo-600 font-semibold text-right">
                                                                +{syllabusList.length - 3} more modules in curriculum
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Course Card Action Footer (View Full Syllabus, Add Module, Active/Deactive, Delete) */}
                                        <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-slate-100">
                                            {/* View Full Syllabus */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCourseForSyllabus(course)}
                                                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 border border-indigo-200"
                                            >
                                                <Eye size={13} /> View Syllabus
                                            </button>

                                            {/* Add Module */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCourseForAddingModule(course);
                                                    setIsAddModuleModalOpen(true);
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-2 rounded-lg transition flex items-center gap-1 border border-slate-300"
                                                title="Add Module to this Course"
                                            >
                                                <Plus size={13} /> Module
                                            </button>

                                            {/* Edit Course Details */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditCourse(course)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-2 rounded-lg transition flex items-center gap-1 border border-slate-300"
                                                title="Edit Course Name, Code & Duration"
                                            >
                                                <Edit2 size={13} /> Edit
                                            </button>

                                            {/* Active / Deactivate Toggle Button (Requirement 2) */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleCourseStatus(course)}
                                                className={`text-xs font-bold px-3 py-2 rounded-lg transition flex items-center gap-1 border shadow-2xs ${
                                                    course.active
                                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                                }`}
                                                title={course.active ? "Deactivate course (hide from trainees and trainers)" : "Activate course (make available to trainees and trainers)"}
                                            >
                                                {course.active ? <PowerOff size={13} /> : <Power size={13} />}
                                                <span>{course.active ? 'Deactivate' : 'Activate'}</span>
                                            </button>

                                            {/* Delete Course Button (Requirement 1) */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCourse(course)}
                                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 text-xs font-bold p-2 rounded-lg transition shadow-2xs"
                                                title="Permanently delete course from database"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Courses Pagination Bar */}
                    {filteredCourses.length > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-xs text-slate-600 font-medium">
                                Showing <span className="font-bold text-slate-800">{filteredCourses.length === 0 ? 0 : courseStartIndex + 1}</span> to{' '}
                                <span className="font-bold text-slate-800">{courseEndIndex}</span> of{' '}
                                <span className="font-bold text-slate-800">{filteredCourses.length}</span> courses
                                {courseSearchQuery && ` (filtered from ${courses.length} total)`}
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCoursesCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={safeCoursesPage === 1}
                                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalCoursePages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setCoursesCurrentPage(pageNum)}
                                            className={`w-8 h-8 text-xs font-bold rounded-lg transition flex items-center justify-center cursor-pointer ${
                                                safeCoursesPage === pageNum
                                                    ? 'bg-indigo-700 text-white shadow-xs'
                                                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCoursesCurrentPage(prev => Math.min(totalCoursePages, prev + 1))}
                                    disabled={safeCoursesPage === totalCoursePages}
                                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                                    title="Next Page"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: ENROLLED TRAINERS & TRAINEES ROSTER (Req 3) */}
            {/* ======================================================== */}
            {isEnrollmentModalOpen && enrollmentCourse && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsEnrollmentModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border-4 border-emerald-600 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#fcb900] text-slate-950 font-mono font-bold text-xs px-2 py-0.5 rounded">
                                        {enrollmentCourse.code}
                                    </span>
                                    <span className="text-xs bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded">
                                        {enrollmentCourse.durationMonths} Months Duration
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                        enrollmentCourse.active ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                                    }`}>
                                        {enrollmentCourse.active ? 'ACTIVE' : 'DEACTIVATED'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                                    <Users size={20} className="text-[#fcb900]" />
                                    Enrolled Faculty & Scholars: {enrollmentCourse.name}
                                </h3>
                                <p className="text-xs text-green-100 mt-0.5">
                                    Direct live enrollment roster loaded from KISS University Vocational Registry
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEnrollmentModalOpen(false)}
                                className="text-green-200 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 overflow-y-auto space-y-5">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <p className="text-xs text-indigo-700 font-bold uppercase flex items-center justify-center gap-1">
                                        <UserCheck size={14} /> Assigned Trainers (Faculty)
                                    </p>
                                    <p className="text-xl font-black text-indigo-900 mt-1">
                                        {loadingEnrollments ? '...' : (enrollmentData.trainers?.length || 0)} Faculty
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-xs text-emerald-700 font-bold uppercase flex items-center justify-center gap-1">
                                        <GraduationCap size={14} /> Enrolled Trainees (Scholars)
                                    </p>
                                    <p className="text-xl font-black text-emerald-900 mt-1">
                                        {loadingEnrollments ? '...' : (enrollmentData.trainees?.length || 0)} Scholars
                                    </p>
                                </div>
                            </div>

                            {/* Section 1: Assigned Faculty / Trainers */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <UserCheck size={15} className="text-indigo-600" />
                                    1. Assigned Faculty / Trainers ({enrollmentData.trainers?.length || 0})
                                </h4>

                                {loadingEnrollments ? (
                                    <div className="py-4 text-center text-xs text-slate-500">Loading faculty...</div>
                                ) : (!enrollmentData.trainers || enrollmentData.trainers.length === 0) ? (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                                        <p className="text-xs font-semibold text-slate-600">No faculty members currently assigned to this course trade.</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Onboard a trainer with this specialization to assign them.</p>
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                    <th className="py-2.5 px-3 font-semibold">Faculty Name</th>
                                                    <th className="py-2.5 px-3 font-semibold">Employee ID</th>
                                                    <th className="py-2.5 px-3 font-semibold">Official Email</th>
                                                    <th className="py-2.5 px-3 font-semibold">Contact</th>
                                                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {enrollmentData.trainers.map((tr) => (
                                                    <tr key={tr.id || tr.employeeId || tr.username} className="hover:bg-slate-50">
                                                        <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                                                {(tr.fullName || tr.name || 'F').charAt(0)}
                                                            </div>
                                                            <span>{tr.fullName || tr.name}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                                            {tr.employeeId || tr.username}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                                                            {tr.email || 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                                                            {tr.contactNumber || 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                {tr.status || 'ACTIVE'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Enrolled Trainees / Scholars */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <GraduationCap size={15} className="text-emerald-600" />
                                    2. Enrolled Trainee Scholars ({enrollmentData.trainees?.length || 0})
                                </h4>

                                {loadingEnrollments ? (
                                    <div className="py-4 text-center text-xs text-slate-500">Loading scholars...</div>
                                ) : (!enrollmentData.trainees || enrollmentData.trainees.length === 0) ? (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                                        <p className="text-xs font-semibold text-slate-600">No scholars enrolled in this vocational course yet.</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Use &quot;Onboard New User&quot; to admit scholars into this trade.</p>
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                    <th className="py-2.5 px-3 font-semibold">Scholar Name</th>
                                                    <th className="py-2.5 px-3 font-semibold">College Roll ID</th>
                                                    <th className="py-2.5 px-3 font-semibold">Email</th>
                                                    <th className="py-2.5 px-3 font-semibold">Contact</th>
                                                    <th className="py-2.5 px-3 font-semibold">Admission Date</th>
                                                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {enrollmentData.trainees.map((st) => (
                                                    <tr key={st.id || st.collegeId || st.username} className="hover:bg-slate-50">
                                                        <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                                                                {(st.fullName || st.name || 'S').charAt(0)}
                                                            </div>
                                                            <span>{st.fullName || st.name}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                                            {st.collegeId || st.username}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                                                            {st.email || 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                                                            {st.contactNumber || 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600">
                                                            {st.admissionDate || 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                {st.status || 'ACTIVE'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <span className="text-[11px] text-slate-500">
                                * Official KISS Vocational Training Roster synced with University Registry
                            </span>
                            <button
                                onClick={() => setIsEnrollmentModalOpen(false)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-1.5 rounded-lg text-xs transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: ADD COURSE WITH SYLLABUS */}
            {/* ======================================================== */}
            {isCourseModalOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsCourseModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border-4 border-indigo-700 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-[#fcb900]" />
                                <h3 className="font-bold text-base">Add New Vocational Course with Syllabus</h3>
                            </div>
                            <button
                                onClick={() => setIsCourseModalOpen(false)}
                                className="text-indigo-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateCourse} className="p-6 overflow-y-auto space-y-4">
                            {/* Course Basic Information */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookMarked size={14} className="text-indigo-700" />
                                    1. Course Basic Information
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                                        <input
                                            type="text"
                                            value={newCourse.name}
                                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                            required
                                            placeholder="e.g. Bamboo Craft & Eco-Furniture"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                                        <input
                                            type="text"
                                            value={newCourse.code}
                                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                                            required
                                            placeholder="e.g. VOC-BAM-105"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Months)</label>
                                        <select
                                            value={newCourse.durationMonths}
                                            onChange={(e) => setNewCourse({ ...newCourse, durationMonths: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                        >
                                            <option value={3}>3 Months Certificate</option>
                                            <option value={4}>4 Months Diploma</option>
                                            <option value={6}>6 Months Advanced Diploma</option>
                                            <option value={12}>12 Months Full Trade</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description</label>
                                        <input
                                            type="text"
                                            value={newCourse.description}
                                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                            placeholder="Brief overview of curriculum..."
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Syllabus Modules Builder */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers size={14} className="text-indigo-700" />
                                        2. Curriculum Syllabus Modules ({newCourse.syllabusModules.length})
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAddModuleField}
                                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg border border-indigo-200 transition flex items-center gap-1"
                                    >
                                        <Plus size={13} /> Add Module
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {newCourse.syllabusModules.map((module, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                                                    Module #{idx + 1}
                                                </span>
                                                {newCourse.syllabusModules.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveModuleField(idx)}
                                                        className="text-rose-600 hover:text-rose-800 p-1"
                                                        title="Remove module"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div className="sm:col-span-2">
                                                    <input
                                                        type="text"
                                                        value={module.moduleTitle}
                                                        onChange={(e) => handleModuleChange(idx, 'moduleTitle', e.target.value)}
                                                        required
                                                        placeholder="Module Title (e.g. Raw Material Sourcing & Processing)"
                                                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={200}
                                                        value={module.durationHours}
                                                        onChange={(e) => handleModuleChange(idx, 'durationHours', Number(e.target.value))}
                                                        placeholder="Hours (e.g. 40)"
                                                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600 font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <input
                                                type="text"
                                                value={module.description}
                                                onChange={(e) => handleModuleChange(idx, 'description', e.target.value)}
                                                placeholder="Learning topics and practical techniques covered in this module..."
                                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCourseModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-2.5 rounded-lg transition shadow"
                                >
                                    Save Course & Syllabus in Database
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: VIEW FULL SYLLABUS DETAILS */}
            {/* ======================================================== */}
            {selectedCourseForSyllabus && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedCourseForSyllabus(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border-4 border-indigo-700 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-indigo-700 text-white p-5 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#fcb900] text-slate-950 font-mono font-bold text-xs px-2 py-0.5 rounded">
                                        {selectedCourseForSyllabus.code}
                                    </span>
                                    <span className="text-xs bg-indigo-800/80 text-indigo-100 px-2 py-0.5 rounded">
                                        {selectedCourseForSyllabus.durationMonths} Months Duration
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEditCourse(selectedCourseForSyllabus)}
                                        className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-0.5 rounded transition flex items-center gap-1 border border-white/30 shadow-2xs"
                                        title="Edit Course Name, Code, and Duration"
                                    >
                                        <Edit2 size={11} /> Edit Course Details
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-white mt-1.5">
                                    {selectedCourseForSyllabus.name}
                                </h3>
                                <p className="text-xs text-indigo-200 mt-0.5">
                                    {selectedCourseForSyllabus.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCourseForSyllabus(null)}
                                className="text-indigo-200 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body: Modules List */}
                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers size={14} className="text-indigo-600" />
                                    Full Curriculum Breakdown ({selectedCourseForSyllabus.syllabus?.length || 0} Modules)
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCourseForAddingModule(selectedCourseForSyllabus);
                                        setIsAddModuleModalOpen(true);
                                    }}
                                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-md border border-indigo-200 transition flex items-center gap-1"
                                >
                                    <Plus size={13} /> Add Module to this Course
                                </button>
                            </div>

                            {(!selectedCourseForSyllabus.syllabus || selectedCourseForSyllabus.syllabus.length === 0) ? (
                                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <BookOpen size={28} className="mx-auto text-slate-400 mb-1" />
                                    <p className="text-xs font-semibold text-slate-600">No syllabus modules recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedCourseForSyllabus.syllabus.map((mod) => (
                                        <div key={mod.id || mod.orderNo} className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 shadow-sm hover:border-indigo-200 transition">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                                                        Module {mod.orderNo}
                                                    </span>
                                                    <h5 className="text-sm font-bold text-slate-800 mt-1">
                                                        {mod.moduleTitle}
                                                    </h5>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-xs font-bold font-mono text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-md">
                                                        {mod.durationHours} Hours
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModule(mod)}
                                                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md border border-indigo-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                                        title="Edit this module title, hours, or description"
                                                    >
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteModule(mod)}
                                                        className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-1 rounded-md border border-rose-200 transition shadow-2xs cursor-pointer"
                                                        title="Delete this module from syllabus"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                                {mod.description || 'Hands-on practical training covering tools, machinery, and quality control.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <span className="text-[11px] text-slate-500">
                                * Official KISS Vocational Curriculum stored in University Registry
                            </span>
                            <button
                                onClick={() => setSelectedCourseForSyllabus(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-1.5 rounded-lg text-xs transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: ADD SINGLE MODULE TO AN EXISTING COURSE */}
            {/* ======================================================== */}
            {isAddModuleModalOpen && courseForAddingModule && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsAddModuleModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-4 border-indigo-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-sm">Add Module to Curriculum</h3>
                                <p className="text-xs text-indigo-200">{courseForAddingModule.name} ({courseForAddingModule.code})</p>
                            </div>
                            <button
                                onClick={() => setIsAddModuleModalOpen(false)}
                                className="text-indigo-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddModuleToExisting} className="p-5 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Title</label>
                                <input
                                    type="text"
                                    value={newSingleModule.moduleTitle}
                                    onChange={(e) => setNewSingleModule({ ...newSingleModule, moduleTitle: e.target.value })}
                                    required
                                    placeholder="e.g. Quality Finishing & Packaging"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={newSingleModule.durationHours}
                                    onChange={(e) => setNewSingleModule({ ...newSingleModule, durationHours: Number(e.target.value) })}
                                    required
                                    placeholder="40"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Description</label>
                                <textarea
                                    rows={3}
                                    value={newSingleModule.description}
                                    onChange={(e) => setNewSingleModule({ ...newSingleModule, description: e.target.value })}
                                    placeholder="Practical skills, machinery, and techniques taught in this module..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModuleModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-2 rounded-lg transition shadow"
                                >
                                    Save Module in Database
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: EDIT SYLLABUS MODULE */}
            {/* ======================================================== */}
            {isEditModuleModalOpen && editingModule && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsEditModuleModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-indigo-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                                    <Pencil size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-white">Edit Syllabus Module</h3>
                                    <p className="text-xs text-indigo-200">Modify module topic, learning hours, and curriculum</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModuleModalOpen(false)}
                                className="text-indigo-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditModule} className="p-5 space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Module Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editModuleForm.moduleTitle}
                                    onChange={(e) => setEditModuleForm({ ...editModuleForm, moduleTitle: e.target.value })}
                                    placeholder="e.g. Clay Preparation & Wheel Throwing"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Module Sequence # *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={editModuleForm.orderNo}
                                        onChange={(e) => setEditModuleForm({ ...editModuleForm, orderNo: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Duration (Hours) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        required
                                        value={editModuleForm.durationHours}
                                        onChange={(e) => setEditModuleForm({ ...editModuleForm, durationHours: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Module Syllabus & Topic Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={editModuleForm.description}
                                    onChange={(e) => setEditModuleForm({ ...editModuleForm, description: e.target.value })}
                                    placeholder="Practical skills, machinery, and techniques taught in this module..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 resize-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModuleModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-2 rounded-lg transition shadow flex items-center justify-center gap-1.5"
                                >
                                    <Save size={14} /> Update Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* POPUP MODAL: EDIT COURSE DETAILS */}
            {/* ======================================================== */}
            {isEditCourseModalOpen && courseForEditing && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsEditCourseModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-indigo-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                                    <Edit2 size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-white">Edit Course Details</h3>
                                    <p className="text-xs text-indigo-200">Modify course title, official trade code, and duration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditCourseModalOpen(false)}
                                className="text-indigo-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditCourse} className="p-5 space-y-3.5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editCourseForm.name}
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, name: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Course Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editCourseForm.code}
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, code: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Duration (Months) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="48"
                                    required
                                    value={editCourseForm.durationMonths}
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, durationMonths: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Course Description / Scope
                                </label>
                                <textarea
                                    rows={3}
                                    value={editCourseForm.description}
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 resize-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditCourseModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-2 rounded-lg transition shadow flex items-center justify-center gap-1.5"
                                >
                                    <Save size={14} /> Update Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-[#006837] overflow-hidden animate-in fade-in zoom-in duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="bg-[#006837] text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <UserPlus size={20} className="text-[#fcb900]" />
                                <h3 className="font-bold text-base">Onboard University User (Admin Authority)</h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-green-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">

                            {/* Select Role */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">User Role Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewUser(prev => ({
                                            ...prev,
                                            role: 'ROLE_TRAINEE',
                                            username: `KISS-TRN-2026-00${users.length + 1}`,
                                            category: 'Scheduled Tribe (Santhal)'
                                        }))}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                                            newUser.role === 'ROLE_TRAINEE'
                                                ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                                                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <GraduationCap size={16} /> Trainee (Scholar)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewUser(prev => ({
                                            ...prev,
                                            role: 'ROLE_TRAINER',
                                            username: `KISS-FAC-00${users.length + 1}`,
                                            category: 'Faculty Staff'
                                        }))}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                                            newUser.role === 'ROLE_TRAINER'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                                                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <UserCheck size={16} /> Trainer (Faculty)
                                    </button>
                                </div>
                            </div>

                            {/* Name & ID */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        placeholder="e.g. Full Name"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned ID</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            {/* Email & Contact Number */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="e.g. scholar@kiss.ac.in"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone Number</label>
                                    <input
                                        type="tel"
                                        value={newUser.contactNumber}
                                        onChange={(e) => setNewUser({ ...newUser, contactNumber: e.target.value })}
                                        required
                                        placeholder="e.g. 9876543210"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            {/* Assigned Trade (Dynamic from Database Courses) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Vocational Trade</label>
                                <select
                                    value={newUser.trade}
                                    onChange={(e) => setNewUser({ ...newUser, trade: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                >
                                    {activeCourses.length > 0 ? (
                                        activeCourses.map((c) => (
                                            <option key={c.id} value={`${c.code} (${c.name})`}>
                                                {c.code} ({c.name})
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="VOC-SEW-101 (Sewing & Tailoring)">VOC-SEW-101 (Sewing & Tailoring)</option>
                                            <option value="VOC-ART-102 (Handicrafts & Tribal Art)">VOC-ART-102 (Handicrafts & Tribal Art)</option>
                                            <option value="VOC-FOD-103 (Food Processing)">VOC-FOD-103 (Food Processing)</option>
                                            <option value="VOC-CAR-104 (Carpentry & Woodwork)">VOC-CAR-104 (Carpentry & Woodwork)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Category (for Trainee) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Demographics</label>
                                <input
                                    type="text"
                                    value={newUser.category}
                                    onChange={(e) => setNewUser({ ...newUser, category: e.target.value })}
                                    required
                                    placeholder="e.g. Scheduled Tribe (Santhal, Bonda, Juang)"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold py-2.5 rounded-lg transition shadow"
                                >
                                    Confirm & Enrol Permanently
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* User Profile Details Inspection Modal */}
            {selectedUserProfile && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedUserProfile(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#fcb900] text-slate-900 flex items-center justify-center font-black text-lg shadow-sm">
                                    {(selectedUserProfile.name || selectedUserProfile.fullName || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white leading-tight">
                                        {selectedUserProfile.name || selectedUserProfile.fullName}
                                    </h3>
                                    <p className="text-xs text-green-200 font-mono mt-0.5">
                                        {selectedUserProfile.username}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedUserProfile(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-3.5 text-xs text-slate-700">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="font-semibold text-slate-500">System Role:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    (selectedUserProfile.role || '').includes('ADMIN') ? 'bg-purple-100 text-purple-800' :
                                    (selectedUserProfile.role || '').includes('TRAINER') ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-teal-100 text-teal-800'
                                }`}>
                                    {(selectedUserProfile.role || '').replace('ROLE_', '')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="font-semibold text-slate-500">Trade / Department:</span>
                                <span className="font-bold text-slate-800 text-right max-w-[240px]">
                                    {selectedUserProfile.trade || 'Vocational Training'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="font-semibold text-slate-500">Social Category:</span>
                                <span className="font-medium text-slate-800">
                                    {selectedUserProfile.category || 'Scheduled Tribe (KISS Scholar)'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="font-semibold text-slate-500">Official Email:</span>
                                <span className="font-mono text-slate-800">
                                    {selectedUserProfile.email || '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="font-semibold text-slate-500">Contact Number:</span>
                                <span className="font-mono text-slate-800">
                                    {selectedUserProfile.contactNumber || '—'}
                                </span>
                            </div>

                            {/* DOB & Blood Group */}
                            <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                                <div>
                                    <span className="font-semibold text-slate-500 block">Date of Birth (DOB):</span>
                                    <span className="font-medium text-slate-800">
                                        {selectedUserProfile.dob || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block">Blood Group:</span>
                                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200 inline-block">
                                        {selectedUserProfile.bloodGroup || '—'}
                                    </span>
                                </div>
                            </div>

                            {/* Date of Joining & Pass Out Date */}
                            <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                                <div>
                                    <span className="font-semibold text-slate-500 block">Date of Joining:</span>
                                    <span className="font-medium text-slate-800">
                                        {selectedUserProfile.joiningDate || selectedUserProfile.admissionDate || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block">Expected Pass Out:</span>
                                    <span className="font-semibold text-teal-800">
                                        {selectedUserProfile.passOutDate || (selectedUserProfile.role === 'ROLE_TRAINER' ? 'N/A (Faculty)' : '—')}
                                    </span>
                                </div>
                            </div>

                            {/* Permanent Address */}
                            <div className="pb-2 border-b">
                                <span className="font-semibold text-slate-500 block mb-0.5">Permanent Address:</span>
                                <span className="text-slate-800 text-[11px] leading-relaxed block bg-slate-50 p-2 rounded border border-slate-200">
                                    {selectedUserProfile.address || '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-500">Account Status:</span>
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                    selectedUserProfile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {selectedUserProfile.status || 'ACTIVE'}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedUserProfile(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 1: POST NEW OFFICIAL NOTICE & CIRCULAR */}
            {/* ======================================================== */}
            {isCreateNoticeModalOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setIsCreateNoticeModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <Megaphone size={20} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">Post New Circular / Notice</h3>
                                    <p className="text-xs text-green-200">Broadcast official notification to campus portals</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateNoticeModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateNotice} className="p-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Circular Subject / Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newNoticeForm.title}
                                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                                    required
                                    placeholder="e.g. Schedule Revision for Annual Practical Grading"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Target Audience <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={newNoticeForm.targetAudience}
                                        onChange={(e) => setNewNoticeForm({ ...newNoticeForm, targetAudience: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] bg-white font-semibold"
                                    >
                                        <option value="ALL">All Portals (Campus-Wide)</option>
                                        <option value="TRAINEES">Scholars & Trainees Only</option>
                                        <option value="TRAINERS">Faculty & Trainers Only</option>
                                        <option value="PRODUCTION">Production Unit & Inventory Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Priority Level
                                    </label>
                                    <select
                                        value={newNoticeForm.priority}
                                        onChange={(e) => setNewNoticeForm({ ...newNoticeForm, priority: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] bg-white font-semibold"
                                    >
                                        <option value="NORMAL">Normal Notice</option>
                                        <option value="IMPORTANT">Important Directive</option>
                                        <option value="URGENT">Urgent Announcement</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={newNoticeForm.category}
                                        onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] bg-white font-semibold"
                                    >
                                        <option value="GENERAL">General Notice</option>
                                        <option value="ACADEMIC">Academic Directive</option>
                                        <option value="WORKSHOP">Workshop Safety & Tools</option>
                                        <option value="EXAMINATION">Examinations & Grading</option>
                                        <option value="HOLIDAY">Holiday & Schedule</option>
                                        <option value="PRODUCTION_ADVISORY">Production & Warehouse Advisory</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Posted Authority
                                    </label>
                                    <input
                                        type="text"
                                        value={newNoticeForm.postedBy}
                                        onChange={(e) => setNewNoticeForm({ ...newNoticeForm, postedBy: e.target.value })}
                                        placeholder="Dr. P. K. Routray (Admin)"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Notice Description & Instructions <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={newNoticeForm.content}
                                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, content: e.target.value })}
                                    required
                                    rows={4}
                                    placeholder="Enter complete circular text, requirements, or guidelines..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="pinnedCheckbox"
                                    checked={newNoticeForm.pinned}
                                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, pinned: e.target.checked })}
                                    className="w-4 h-4 text-[#006837] rounded border-slate-300 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="pinnedCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer select-none">
                                    Pin this announcement to top of Notice Board
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateNoticeModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#006837] hover:bg-[#004d28] text-white font-bold py-2 rounded-lg transition shadow flex items-center justify-center gap-1.5"
                                >
                                    <Send size={13} /> Publish Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: INDIVIDUAL TRAINEE ATTENDANCE REPORT */}
            {/* ======================================================== */}
            {selectedTraineeForAttendance && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedTraineeForAttendance(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <CalendarCheck size={22} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Attendance Report: {selectedTraineeForAttendance.name || selectedTraineeForAttendance.fullName}
                                    </h3>
                                    <p className="text-xs text-green-200 font-mono">
                                        Roll No: {selectedTraineeForAttendance.username || selectedTraineeForAttendance.collegeId} &bull; {selectedTraineeForAttendance.trade}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForAttendance(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 overflow-y-auto text-xs">
                            {/* Admin Status Feedback Banner */}
                            {adminAttendanceMsg && (
                                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
                                    adminAttendanceMsg.includes('✓') 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="shrink-0" />
                                        {adminAttendanceMsg}
                                    </span>
                                    <button type="button" onClick={() => setAdminAttendanceMsg('')} className="p-0.5 hover:opacity-75">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Summary Metrics */}
                            {(() => {
                                const logs = traineeAttendanceLogs;
                                const presentCount = logs.filter(l => l.status === 'PRESENT').length;
                                const absentCount = logs.filter(l => l.status === 'ABSENT').length;
                                const total = logs.length;
                                const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                                const isCompliant = total > 0 && pct >= 75;

                                return (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Overall Attendance</p>
                                            <p className="text-xl font-black text-slate-900 mt-1">{total > 0 ? `${pct}%` : 'N/A'}</p>
                                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 ${
                                                total === 0 ? 'bg-slate-100 text-slate-600' : isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {total === 0 ? 'No Sessions Recorded' : isCompliant ? '✓ 75% Stipend Eligible' : '⚠️ Below 75% Threshold'}
                                            </span>
                                        </div>
                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                                            <p className="text-[10px] text-emerald-700 font-bold uppercase">Present Days</p>
                                            <p className="text-xl font-black text-emerald-900 mt-1">{presentCount}</p>
                                            <p className="text-[10px] text-emerald-700 mt-1">Attended Studio Sessions</p>
                                        </div>
                                        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                                            <p className="text-[10px] text-rose-700 font-bold uppercase">Absent Days</p>
                                            <p className="text-xl font-black text-rose-900 mt-1">{absentCount}</p>
                                            <p className="text-[10px] text-rose-700 mt-1">Unexcused Absences</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
                                            <p className="text-[10px] text-purple-700 font-bold uppercase">Total Tracked</p>
                                            <p className="text-xl font-black text-purple-900 mt-1">{total}</p>
                                            <p className="text-[10px] text-purple-700 mt-1">Recorded Sessions</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Detailed Attendance Log Table */}
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                                    <span>Verified Session Attendance Records:</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Source: Faculty Biometric & Studio Log</span>
                                </h4>

                                {loadingTraineeAttendance ? (
                                    <p className="py-6 text-center text-slate-400">Loading verified attendance logs...</p>
                                ) : traineeAttendanceLogs.length === 0 ? (
                                    <p className="py-6 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        No individual session attendance records logged yet for this scholar.
                                    </p>
                                ) : (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 border-b">
                                                <tr>
                                                    <th className="py-2 px-3">Date</th>
                                                    <th className="py-2 px-3">Trade / Course</th>
                                                    <th className="py-2 px-3">Status</th>
                                                    <th className="py-2 px-3">Instructor Remarks</th>
                                                    <th className="py-2 px-3 text-right">Admin Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {traineeAttendanceLogs.map((log, idx) => (
                                                    <tr key={log.id || idx} className="hover:bg-slate-50">
                                                        <td className="py-2 px-3 font-mono text-slate-700">{log.date}</td>
                                                        <td className="py-2 px-3 text-slate-800 font-medium">{log.courseName || log.courseCode || 'Vocational Studio'}</td>
                                                        <td className="py-2 px-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                                                                log.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' :
                                                                'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-slate-500 text-[11px]">{log.remarks || 'Practical studio workshop attended'}</td>
                                                        <td className="py-2 px-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {log.status === 'PRESENT' ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled={submittingAdminAttendance}
                                                                        onClick={() => handleAdminUpdateAttendance(log.date, 'ABSENT')}
                                                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold transition disabled:opacity-50"
                                                                        title="Admin Override: Toggle status to Absent"
                                                                    >
                                                                        Set Absent
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        disabled={submittingAdminAttendance}
                                                                        onClick={() => handleAdminUpdateAttendance(log.date, 'PRESENT')}
                                                                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold transition disabled:opacity-50"
                                                                        title="Admin Override: Toggle status to Present"
                                                                    >
                                                                        Set Present
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Admin Attendance Clearance & Past Session Override Form */}
                            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-amber-700" />
                                        <h5 className="font-bold text-xs text-amber-900">
                                            Admin Historical Attendance Clearance & Override Form
                                        </h5>
                                    </div>
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                                        Full Central Administrative Clearance Authority
                                    </span>
                                </div>
                                <p className="text-[11px] text-amber-800">
                                    Trainers are restricted to the last 7 days of attendance. As Central Administrator, you have full authority to modify any prior historical date or record retroactive attendance for this scholar.
                                </p>
                                <form onSubmit={handleAdminSubmitCustomAttendance} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Session Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={adminAttendanceForm.date}
                                            onChange={(e) => setAdminAttendanceForm({ ...adminAttendanceForm, date: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Cleared Status</label>
                                        <select
                                            value={adminAttendanceForm.status}
                                            onChange={(e) => setAdminAttendanceForm({ ...adminAttendanceForm, status: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        >
                                            <option value="PRESENT">PRESENT (Studio Attended)</option>
                                            <option value="ABSENT">ABSENT (Unexcused)</option>
                                            <option value="ON_DUTY_LEAVE">ON_DUTY_LEAVE (Approved Leave)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-4">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Administrative Remarks</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Medical certificate approved by Admin"
                                            value={adminAttendanceForm.remarks}
                                            onChange={(e) => setAdminAttendanceForm({ ...adminAttendanceForm, remarks: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex items-end">
                                        <button
                                            type="submit"
                                            disabled={submittingAdminAttendance}
                                            className="w-full bg-[#006837] hover:bg-[#004d28] text-white font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1 disabled:opacity-50"
                                        >
                                            <Save size={13} />
                                            <span>{submittingAdminAttendance ? 'Saving...' : 'Apply Record'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                            >
                                <Printer size={13} /> Print Attendance Summary
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForAttendance(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3: INDIVIDUAL TRAINEE EXAM & ASSESSMENT REPORT */}
            {/* ======================================================== */}
            {selectedTraineeForExam && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedTraineeForExam(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <Award size={22} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Official Academic & Skill Assessment Report
                                    </h3>
                                    <p className="text-xs text-green-200">
                                        {selectedTraineeForExam.name || selectedTraineeForExam.fullName} ({selectedTraineeForExam.username || selectedTraineeForExam.collegeId})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForExam(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 text-xs">
                            {loadingTraineeExam ? (
                                <div className="py-12 text-center text-slate-500 space-y-2">
                                    <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="font-semibold text-xs">Checking examination evaluation records...</p>
                                </div>
                            ) : (!traineeExamReport || (traineeExamReport.score === undefined && !traineeExamReport.grade)) ? (
                                <div className="py-6 px-4 text-center space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                                        <Award size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-800">
                                            No Examination Records Found
                                        </h4>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                            This scholar has not yet attended or been evaluated in any vocational examination.
                                        </p>
                                    </div>

                                    {/* Student Enrollment Status Card */}
                                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 max-w-md mx-auto text-left space-y-2">
                                        <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Scholar Name:</span>
                                            <span className="font-bold text-slate-800">{selectedTraineeForExam.name || selectedTraineeForExam.fullName}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Roll / Registration No:</span>
                                            <span className="font-mono font-bold text-slate-800">{selectedTraineeForExam.username || selectedTraineeForExam.collegeId}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Enrolled Vocational Trade:</span>
                                            <span className="font-medium text-slate-800">{selectedTraineeForExam.trade || 'Vocational Craft'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Assessment Status:</span>
                                            <span className="font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full text-[10px]">
                                                Awaiting Practical Examination
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 max-w-md mx-auto text-left flex items-start gap-2.5">
                                        <span className="text-blue-600 text-sm mt-0.5">ℹ️</span>
                                        <p className="text-[11px] text-blue-900 leading-relaxed">
                                            Official practical marks, grade classifications, and appraisal remarks will appear here automatically once the assigned faculty trainer conducts the evaluation and inputs marks in the Trainer Console.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Score Banner Card */}
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-5 flex items-center justify-between shadow-sm">
                                        <div>
                                            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                Vocational Competency Grade
                                            </span>
                                            <h4 className="text-2xl font-black mt-1">
                                                {traineeExamReport.grade || (traineeExamReport.score >= 85 ? 'Grade A (Distinction)' : traineeExamReport.score >= 70 ? 'Grade B (Proficient)' : traineeExamReport.score >= 50 ? 'Grade C (Passing)' : 'Grade F (Needs Re-assessment)')}
                                            </h4>
                                            <p className="text-xs text-emerald-100 mt-0.5">
                                                Evaluation Date: {traineeExamReport.evaluationDate || new Date().toISOString().split('T')[0]}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black">
                                                {traineeExamReport.score}%
                                            </p>
                                            <span className="text-[10px] bg-white text-emerald-900 font-bold px-2 py-0.5 rounded shadow-2xs">
                                                Certified Tribal Artisan
                                            </span>
                                        </div>
                                    </div>

                                    {/* Marks Breakdown Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Practical Craft</p>
                                            <p className="text-lg font-black text-slate-800 mt-0.5">
                                                {traineeExamReport.practicalMarks !== undefined ? traineeExamReport.practicalMarks : traineeExamReport.score} / 100
                                            </p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">Studio execution</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Workshop Safety</p>
                                            <p className="text-lg font-black text-slate-800 mt-0.5">
                                                {traineeExamReport.safetyMarks !== undefined ? `${traineeExamReport.safetyMarks} / 50` : 'Verified / Pass'}
                                            </p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">Tool handling & SOP</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Heritage Viva</p>
                                            <p className="text-lg font-black text-slate-800 mt-0.5">
                                                {traineeExamReport.vivaMarks !== undefined ? `${traineeExamReport.vivaMarks} / 50` : 'Verified / Pass'}
                                            </p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">Craft theory & motifs</p>
                                        </div>
                                    </div>

                                    {/* Evaluator Remarks */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                        <span className="font-bold text-slate-700 block mb-1 text-[11px]">
                                            Faculty Evaluator & Master Trainer Appraisal:
                                        </span>
                                        <p className="text-xs text-slate-600 italic leading-relaxed">
                                            &ldquo;{traineeExamReport.remarks || 'Practical evaluation conducted and recorded by faculty instructor.'}&rdquo;
                                        </p>
                                    </div>

                                    {/* Enrolled Trade Details */}
                                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                                        <span>Academic Trade: <strong className="text-slate-700">{traineeExamReport.courseName || selectedTraineeForExam.trade}</strong></span>
                                        <span>Status: <strong className={traineeExamReport.score >= 50 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                                            {traineeExamReport.score >= 50 ? 'Passed & Verified' : 'Needs Reassessment'}
                                        </strong></span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            {traineeExamReport && (traineeExamReport.score !== undefined || traineeExamReport.grade) ? (
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                                >
                                    <Printer size={13} /> Print Official Marksheet
                                </button>
                            ) : (
                                <div className="text-[11px] text-slate-400 font-medium italic">
                                    Evaluation pending by Trainer
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForExam(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 4: INDIVIDUAL TRAINEE LEAVE APPROVAL & DECISION */}
            {/* ======================================================== */}
            {selectedTraineeForLeave && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedTraineeForLeave(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <Clock size={22} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Leave Approval Authority: {selectedTraineeForLeave.name || selectedTraineeForLeave.fullName}
                                    </h3>
                                    <p className="text-xs text-green-200">
                                        Roll No: {selectedTraineeForLeave.username || selectedTraineeForLeave.collegeId} &bull; Admin holds final right to Approve or Decline
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForLeave(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 overflow-y-auto text-xs">
                            {/* Applications List */}
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs mb-2">
                                    Submitted Leave Applications ({traineeLeaveRequests.length}):
                                </h4>

                                {loadingTraineeLeaves ? (
                                    <p className="py-6 text-center text-slate-400">Loading leave requests from database...</p>
                                ) : traineeLeaveRequests.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-300 text-center space-y-3">
                                        <p className="text-xs text-slate-500">No leave applications on file for this scholar.</p>
                                        
                                        {/* Quick apply form */}
                                        <form onSubmit={handleApplyTraineeLeaveSubmit} className="bg-white p-4 rounded-lg border border-slate-200 text-left space-y-3">
                                            <p className="font-bold text-slate-700 text-xs">Record Leave on Behalf of Scholar:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={traineeLeaveForm.startDate}
                                                        onChange={(e) => setTraineeLeaveForm({ ...traineeLeaveForm, startDate: e.target.value })}
                                                        required
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={traineeLeaveForm.endDate}
                                                        onChange={(e) => setTraineeLeaveForm({ ...traineeLeaveForm, endDate: e.target.value })}
                                                        required
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Reason</label>
                                                <input
                                                    type="text"
                                                    value={traineeLeaveForm.reason}
                                                    onChange={(e) => setTraineeLeaveForm({ ...traineeLeaveForm, reason: e.target.value })}
                                                    required
                                                    placeholder="e.g. Attending Annual Tribal Ritual / Medical Leave"
                                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1.5 rounded text-xs transition"
                                            >
                                                Submit Leave Request
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1.5 scrollbar-thin">
                                        {traineeLeaveRequests.map((leave) => {
                                            const isPending = leave.status === 'PENDING';
                                            return (
                                                <div 
                                                    key={leave.id}
                                                    className={`p-4 rounded-xl border transition ${
                                                        isPending 
                                                            ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200' 
                                                            : leave.status === 'APPROVED' 
                                                            ? 'bg-emerald-50/30 border-emerald-200' 
                                                            : 'bg-rose-50/30 border-rose-200'
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5 mb-2.5">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-xs">
                                                                    {leave.startDate} &rarr; {leave.endDate}
                                                                </span>
                                                                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                                                                    {leave.days} Days
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                                Applied on: {leave.date || 'Recent'}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                            leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                                            'bg-amber-100 text-amber-800 animate-pulse'
                                                        }`}>
                                                            {leave.status === 'PENDING' ? '⏳ PENDING REVIEW' : leave.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed">
                                                        <strong>Reason:</strong> {leave.reason}
                                                    </p>

                                                    {leave.reviewRemarks && (
                                                        <p className="text-[11px] text-slate-500 mt-1 italic">
                                                            <strong>Review Remarks:</strong> {leave.reviewRemarks}
                                                        </p>
                                                    )}

                                                    {/* Admin Approval Decision Controls */}
                                                    {isPending && (
                                                        <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Optional remarks (e.g. Approved / Verified Medical grounds)..."
                                                                value={leaveReviewRemarks[leave.id] || ''}
                                                                onChange={(e) => setLeaveReviewRemarks({ ...leaveReviewRemarks, [leave.id]: e.target.value })}
                                                                className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#006837]"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReviewLeaveAction(leave.id, 'APPROVED', selectedTraineeForLeave.username || selectedTraineeForLeave.collegeId, false)}
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                                                                >
                                                                    <ThumbsUp size={13} /> Approve Leave
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReviewLeaveAction(leave.id, 'REJECTED', selectedTraineeForLeave.username || selectedTraineeForLeave.collegeId, false)}
                                                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                                                                >
                                                                    <ThumbsDown size={13} /> Decline Leave
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedTraineeForLeave(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Decision Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 5: INDIVIDUAL TRAINER ATTENDANCE REPORT */}
            {/* ======================================================== */}
            {selectedTrainerForAttendance && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedTrainerForAttendance(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <CalendarCheck size={22} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Faculty Attendance & Workshop Delivery: {selectedTrainerForAttendance.name || selectedTrainerForAttendance.fullName}
                                    </h3>
                                    <p className="text-xs text-green-200 font-mono">
                                        Staff ID: {selectedTrainerForAttendance.username || selectedTrainerForAttendance.collegeId} &bull; {selectedTrainerForAttendance.trade}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTrainerForAttendance(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 overflow-y-auto text-xs">
                            {/* Stats */}
                            {(() => {
                                const hasLogs = trainerAttendanceReport && Array.isArray(trainerAttendanceReport.logs) && trainerAttendanceReport.logs.length > 0;
                                const pct = hasLogs ? (trainerAttendanceReport.attendancePercentage !== undefined ? trainerAttendanceReport.attendancePercentage : 0) : 'N/A';
                                const present = hasLogs ? (trainerAttendanceReport.presentDays || 0) : 0;
                                const sessions = hasLogs ? (trainerAttendanceReport.sessionsConducted || 0) : 0;
                                const onDuty = hasLogs ? (trainerAttendanceReport.onDutyDays || 0) : 0;

                                return (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Attendance %</p>
                                            <p className="text-xl font-black text-slate-900 mt-1">{hasLogs ? `${pct}%` : 'N/A'}</p>
                                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {hasLogs ? 'Regular Faculty' : 'No Sessions Logged'}
                                            </span>
                                        </div>
                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                                            <p className="text-[10px] text-emerald-700 font-bold uppercase">Days Present</p>
                                            <p className="text-xl font-black text-emerald-900 mt-1">{present}</p>
                                            <p className="text-[10px] text-emerald-700 mt-1">On-Campus Studio</p>
                                        </div>
                                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
                                            <p className="text-[10px] text-indigo-700 font-bold uppercase">Sessions Delivered</p>
                                            <p className="text-xl font-black text-indigo-900 mt-1">{sessions}</p>
                                            <p className="text-[10px] text-indigo-700 mt-1">Practical Workshops</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
                                            <p className="text-[10px] text-purple-700 font-bold uppercase">On-Duty Deputations</p>
                                            <p className="text-xl font-black text-purple-900 mt-1">{onDuty}</p>
                                            <p className="text-[10px] text-purple-700 mt-1">Craft Fair / Outreach</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Session Delivery Log Table */}
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                                    <span>Faculty Studio Delivery & Attendance History:</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Departmental Verification</span>
                                </h4>

                                {loadingTrainerAttendance ? (
                                    <p className="py-6 text-center text-slate-400">Loading faculty attendance records...</p>
                                ) : (!trainerAttendanceReport?.logs || trainerAttendanceReport.logs.length === 0) ? (
                                    <p className="py-6 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        No studio workshop delivery or attendance logs on file yet for this faculty member.
                                    </p>
                                ) : (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 border-b">
                                                <tr>
                                                    <th className="py-2 px-3">Date</th>
                                                    <th className="py-2 px-3">Specialization Workshop</th>
                                                    <th className="py-2 px-3">Hours</th>
                                                    <th className="py-2 px-3">Status</th>
                                                    <th className="py-2 px-3">Session Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {(trainerAttendanceReport.logs).map((log, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="py-2 px-3 font-mono text-slate-700">{log.date}</td>
                                                        <td className="py-2 px-3 text-slate-800 font-medium">{log.specialization}</td>
                                                        <td className="py-2 px-3 font-mono text-indigo-700 font-bold">{log.hoursConducted}h</td>
                                                        <td className="py-2 px-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                                                                log.status === 'ON_DUTY_LEAVE' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-rose-100 text-rose-800'
                                                            }`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-slate-500 text-[11px]">{log.remarks}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Administrative Session Logging & Attendance Override */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                    <Clock size={13} className="text-[#006837]" />
                                    <span>Log Faculty Workshop Session / Record Attendance:</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Record faculty on-campus studio workshop delivery, on-duty exhibition deputations, or leaves directly into official university records.
                                </p>
                                <form onSubmit={handleAdminSubmitTrainerAttendance} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Session Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={adminTrainerAttendanceForm.date}
                                            onChange={(e) => setAdminTrainerAttendanceForm({ ...adminTrainerAttendanceForm, date: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Status</label>
                                        <select
                                            value={adminTrainerAttendanceForm.status}
                                            onChange={(e) => setAdminTrainerAttendanceForm({ ...adminTrainerAttendanceForm, status: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        >
                                            <option value="PRESENT">PRESENT (Studio Conducted)</option>
                                            <option value="ON_DUTY_LEAVE">ON_DUTY_LEAVE (Exhibition / Fair)</option>
                                            <option value="ABSENT">ABSENT (Casual / Unexcused)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Hours</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={adminTrainerAttendanceForm.hoursConducted}
                                            onChange={(e) => setAdminTrainerAttendanceForm({ ...adminTrainerAttendanceForm, hoursConducted: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Administrative Remarks</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Conducted morning studio workshop"
                                            value={adminTrainerAttendanceForm.remarks}
                                            onChange={(e) => setAdminTrainerAttendanceForm({ ...adminTrainerAttendanceForm, remarks: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div className="sm:col-span-12 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submittingTrainerAttendance}
                                            className="bg-[#006837] hover:bg-[#004d28] text-white font-bold py-1.5 px-4 rounded-lg text-xs transition shadow flex items-center justify-center gap-1 disabled:opacity-50"
                                        >
                                            <Save size={13} />
                                            <span>{submittingTrainerAttendance ? 'Saving...' : 'Log Session Record'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                            >
                                <Printer size={13} /> Print Faculty Report
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTrainerForAttendance(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 6: INDIVIDUAL TRAINER LEAVE APPROVAL & DECISION */}
            {/* ======================================================== */}
            {selectedTrainerForLeave && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedTrainerForLeave(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#006837] text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <Clock size={22} className="text-[#fcb900]" />
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Faculty Leave Review: {selectedTrainerForLeave.name || selectedTrainerForLeave.fullName}
                                    </h3>
                                    <p className="text-xs text-green-200">
                                        Staff ID: {selectedTrainerForLeave.username || selectedTrainerForLeave.collegeId} &bull; University Administration holds final right to Approve or Decline
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTrainerForLeave(null)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 overflow-y-auto text-xs">
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs mb-2">
                                    Faculty Leave Applications ({trainerLeaveRequests.length}):
                                </h4>

                                {loadingTrainerLeaves ? (
                                    <p className="py-6 text-center text-slate-400">Loading faculty leaves...</p>
                                ) : trainerLeaveRequests.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-300 text-center space-y-3">
                                        <p className="text-xs text-slate-500">No leave applications currently submitted by this faculty member.</p>
                                        
                                        {/* Quick apply form */}
                                        <form onSubmit={handleApplyTrainerLeaveSubmit} className="bg-white p-4 rounded-lg border border-slate-200 text-left space-y-3">
                                            <p className="font-bold text-slate-700 text-xs">Submit Leave Application on Behalf of Faculty:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={trainerLeaveForm.startDate}
                                                        onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, startDate: e.target.value })}
                                                        required
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={trainerLeaveForm.endDate}
                                                        onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, endDate: e.target.value })}
                                                        required
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Reason</label>
                                                <input
                                                    type="text"
                                                    value={trainerLeaveForm.reason}
                                                    onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, reason: e.target.value })}
                                                    required
                                                    placeholder="e.g. Deputation for State Craft Summit / Casual Leave"
                                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-3 py-1.5 rounded text-xs transition"
                                            >
                                                Submit Faculty Leave
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1.5 scrollbar-thin">
                                        {trainerLeaveRequests.map((leave) => {
                                            const isPending = leave.status === 'PENDING';
                                            return (
                                                <div 
                                                    key={leave.id}
                                                    className={`p-4 rounded-xl border transition ${
                                                        isPending 
                                                            ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200' 
                                                            : leave.status === 'APPROVED' 
                                                            ? 'bg-emerald-50/30 border-emerald-200' 
                                                            : 'bg-rose-50/30 border-rose-200'
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5 mb-2.5">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-xs">
                                                                    {leave.startDate} &rarr; {leave.endDate}
                                                                </span>
                                                                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                                                                    {leave.days} Days
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                                Applied on: {leave.date || 'Recent'}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                            leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                                            'bg-amber-100 text-amber-800 animate-pulse'
                                                        }`}>
                                                            {leave.status === 'PENDING' ? '⏳ PENDING REVIEW' : leave.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed">
                                                        <strong>Reason:</strong> {leave.reason}
                                                    </p>

                                                    {leave.reviewRemarks && (
                                                        <p className="text-[11px] text-slate-500 mt-1 italic">
                                                            <strong>Review Remarks:</strong> {leave.reviewRemarks}
                                                        </p>
                                                    )}

                                                    {/* Admin Approval Decision Controls */}
                                                    {isPending && (
                                                        <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Admin remarks / substitute instructor assignment..."
                                                                value={leaveReviewRemarks[leave.id] || ''}
                                                                onChange={(e) => setLeaveReviewRemarks({ ...leaveReviewRemarks, [leave.id]: e.target.value })}
                                                                className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#006837]"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReviewLeaveAction(leave.id, 'APPROVED', selectedTrainerForLeave.username || selectedTrainerForLeave.collegeId, true)}
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                                                                >
                                                                    <ThumbsUp size={13} /> Approve Leave
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReviewLeaveAction(leave.id, 'REJECTED', selectedTrainerForLeave.username || selectedTrainerForLeave.collegeId, true)}
                                                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                                                                >
                                                                    <ThumbsDown size={13} /> Decline Leave
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedTrainerForLeave(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition"
                            >
                                Close Decision Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Viewport-Fixed Action Menu for Trainee & Trainer Directories */}
            {actionMenu && (
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-transparent"
                        onClick={() => setActionMenu(null)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: `${actionMenu.top}px`,
                            right: `${actionMenu.right}px`,
                            zIndex: 9999,
                            width: '220px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 text-left select-none ring-1 ring-slate-900/10"
                    >
                        {/* Header with Name & ID */}
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 rounded-t-xl mb-1">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{actionMenu.user.name || actionMenu.user.fullName}</p>
                            <p className={`text-[10px] font-mono font-semibold ${actionMenu.type === 'trainee' ? 'text-teal-700' : 'text-indigo-700'}`}>
                                {actionMenu.user.username}
                            </p>
                        </div>

                        {actionMenu.type === 'trainee' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        setSelectedUserProfile(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition font-medium"
                                >
                                    <Eye size={14} className="text-teal-600 shrink-0" />
                                    <span>View Full Profile</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleOpenTraineeAttendance(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition font-medium"
                                >
                                    <CalendarCheck size={14} className="text-blue-600 shrink-0" />
                                    <span>Attendance Report</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleOpenTraineeExam(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition font-medium"
                                >
                                    <Award size={14} className="text-amber-600 shrink-0" />
                                    <span>Exam Report</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleOpenTraineeLeave(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition font-medium"
                                >
                                    <Clock size={14} className="text-purple-600 shrink-0" />
                                    <span>Leave Management</span>
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const uid = actionMenu.user.id;
                                        setActionMenu(null);
                                        toggleUserStatus(uid);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 transition font-medium"
                                >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${actionMenu.user.status === 'ACTIVE' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <span>{actionMenu.user.status === 'ACTIVE' ? 'Suspend Scholar' : 'Activate Scholar'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleDeleteUser(u.id, u.name || u.fullName, u.username, u.role);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition font-semibold"
                                >
                                    <Trash2 size={14} className="text-rose-600 shrink-0" />
                                    <span>Delete Scholar</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        setSelectedUserProfile(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 transition font-medium"
                                >
                                    <Eye size={14} className="text-indigo-600 shrink-0" />
                                    <span>View Faculty Profile</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleOpenTrainerAttendance(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition font-medium"
                                >
                                    <CalendarCheck size={14} className="text-blue-600 shrink-0" />
                                    <span>Attendance & Delivery</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleOpenTrainerLeave(u);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition font-medium"
                                >
                                    <Clock size={14} className="text-purple-600 shrink-0" />
                                    <span>Leave Management</span>
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const uid = actionMenu.user.id;
                                        setActionMenu(null);
                                        toggleUserStatus(uid);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 transition font-medium"
                                >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${actionMenu.user.status === 'ACTIVE' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <span>{actionMenu.user.status === 'ACTIVE' ? 'Suspend Faculty' : 'Activate Faculty'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = actionMenu.user;
                                        setActionMenu(null);
                                        handleDeleteUser(u.id, u.name || u.fullName, u.username, u.role);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition font-semibold"
                                >
                                    <Trash2 size={14} className="text-rose-600 shrink-0" />
                                    <span>Delete Faculty</span>
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ========================================================================= */}
            {/* PRODUCTION BATCH CLEARANCE & SCHOLAR STIPEND APPROVAL MODAL (ADMIN)      */}
            {/* ========================================================================= */}
            {approvalModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-[#006837] text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                    <ShieldCheck size={22} className="text-yellow-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold text-base tracking-tight">
                                            Production Approvals & Apprentice Stipend Disbursal (DBT)
                                        </h3>
                                        <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {pendingRuns.length} Pending
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-100">
                                        University Governance: Verify apprentice manufacturing work and disburse student stipends directly to bank accounts via DBT.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApprovalModalOpen(false)}
                                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {pendingRuns.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-2" />
                                    <h4 className="font-bold text-slate-800 text-base">All Production Batches Cleared!</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                        There are currently no finished batches waiting for administrative clearance. All submitted student stipends have been disbursed.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRuns.map((run) => {
                                        const productName = run.product?.name || 'Artisan Finished Item';
                                        const productSku = run.product?.sku || 'PRD-001';
                                        const price = run.product?.sellingPrice || 650.0;
                                        const incentive = run.product?.incentiveRatePerUnit || 75.0;
                                        const qty = run.completedQuantity || run.targetQuantity || 1;
                                        const totalValue = qty * price;
                                        const totalIncentive = qty * incentive;
                                        const team = getBatchTeamMembers(run);
                                        const perScholar = team.length > 0 ? (totalIncentive / team.length).toFixed(2) : totalIncentive.toFixed(2);
                                        const isApproving = approvingRunId === run.id;

                                        return (
                                            <div
                                                key={run.id || run.batchNumber}
                                                className="bg-white border-2 border-amber-300 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                                                                {run.batchNumber}
                                                            </span>
                                                            <h4 className="font-bold text-slate-900 text-base mt-2">
                                                                {productName}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 font-mono">
                                                                SKU: {productSku}
                                                            </p>
                                                        </div>
                                                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                                                            <Hourglass size={12} className="animate-spin" /> PENDING ADMIN CLEARANCE
                                                        </span>
                                                    </div>

                                                    <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-slate-500">Completed Qty:</span>
                                                            <p className="font-bold text-slate-900 text-sm">{qty} Units</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Retail POS Value:</span>
                                                            <p className="font-bold text-emerald-700 text-sm">₹{totalValue.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Total Stipend Pool:</span>
                                                            <p className="font-bold text-amber-800 text-sm">₹{totalIncentive.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Status:</span>
                                                            <p className="font-semibold text-blue-700">Finished (QA Pass)</p>
                                                        </div>
                                                    </div>

                                                    {run.remarks && (
                                                        <div className="mb-3 text-xs bg-amber-50 text-amber-900 p-2.5 rounded border border-amber-200 italic">
                                                            <strong>Supervisor Remark:</strong> "{run.remarks}"
                                                        </div>
                                                    )}

                                                    {/* Apprentice Artisan Team Stipend Breakdown */}
                                                    {team.length > 0 ? (
                                                        <div className="mb-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs">
                                                            <p className="font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                                                                <Coins size={14} className="text-amber-600" />
                                                                Apprentice Team Stipend Allocation ({team.length} Scholars):
                                                            </p>
                                                            <div className="divide-y divide-emerald-200/60 bg-white/60 rounded-md p-2">
                                                                {team.map((m, idx) => (
                                                                    <div key={idx} className="py-1 flex justify-between items-center text-slate-700">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium text-slate-900">{m.name || m.fullName || m.username}</span>
                                                                            <span className="text-[10px] text-slate-500 font-mono">({m.collegeId || m.username})</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] text-slate-400 font-mono">DBT Share:</span>
                                                                            <span className="font-extrabold text-[#006837] font-mono">₹{perScholar}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-2 pt-1.5 border-t border-emerald-200 flex justify-between font-bold text-emerald-900 text-xs">
                                                                <span>Total Disbursable via DBT:</span>
                                                                <span className="font-mono text-sm">₹{totalIncentive.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-3 p-2.5 bg-slate-100 rounded text-xs text-slate-500 italic">
                                                            No individual scholars assigned to this run.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons for Admin */}
                                                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isApproving}
                                                        onClick={() => handleApproveBatchFromAdmin(run)}
                                                        className="w-full sm:flex-1 bg-[#006837] hover:bg-[#004d28] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                                                    >
                                                        {isApproving ? (
                                                            <>
                                                                <RefreshCw size={14} className="animate-spin" />
                                                                <span>Authorizing DBT Disbursal...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check size={15} />
                                                                <span>Approve Batch & Disburse Stipend (DBT)</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenRejectModalFromAdmin(run)}
                                                        className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <X size={15} /> Request Rework / Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setApprovalModalOpen(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                                Close Queue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && runToReject && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Return Batch for Rework</h3>
                                <p className="text-xs text-slate-500 font-mono">{runToReject.batchNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <label className="block text-xs font-semibold text-slate-700">
                                Quality Inspection / Rework Instructions:
                            </label>
                            <textarea
                                rows={3}
                                value={rejectRemarks}
                                onChange={(e) => setRejectRemarks(e.target.value)}
                                placeholder="Enter reason for sending batch back to production floor..."
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setRejectModalOpen(false); setRunToReject(null); }}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRejectFromAdmin}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                            >
                                <X size={14} /> Send Back for Rework
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}