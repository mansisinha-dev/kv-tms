import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    UserCheck,
    BookOpen,
    Award,
    CheckCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    Check,
    Users,
    AlertCircle,
    Calendar,
    RefreshCw,
    Eye,
    X,
    User,
    Bell,
    Megaphone,
    Pin,
    Camera,
    Upload,
    Printer,
    Download,
    Search,
    Filter,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Tag,
    IdCard,
    FileText,
    Send,
    GraduationCap,
    Layers,
    PlusCircle,
    CalendarCheck,
    Trash2
} from 'lucide-react';
import { VocationalStore } from '../utils/vocationalStore';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function TrainerConsole({ currentUser, activeSection = 'trainer-profile', onNavigateSection }) {
    // Current active tab (synchronized with Left Sidebar navigation)
    const [currentTab, setCurrentTab] = useState(activeSection || 'trainer-profile');

    useEffect(() => {
        if (activeSection) {
            setCurrentTab(activeSection);
        }
    }, [activeSection]);

    const handleSwitchTab = (tabId) => {
        setCurrentTab(tabId);
        if (onNavigateSection) {
            onNavigateSection(tabId);
        }
    };

    // Helper for local YYYY-MM-DD
    const getTodayDateStr = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getYesterdayDateStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getWeekAgoDateStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const staffId = currentUser?.collegeId || currentUser?.username || '';
    const trainerName = currentUser?.fullName || currentUser?.name || '';
    const departmentName = currentUser?.trade || currentUser?.specialization || '';

    // =========================================================================
    // 1. FACULTY PROFILE STATE (With Photo Upload Circle)
    // =========================================================================
    const fileInputRef = useRef(null);
    const [photoUrl, setPhotoUrl] = useState(() => {
        return staffId ? (localStorage.getItem(`trainer_photo_${staffId}`) || '') : '';
    });
    const [profileData, setProfileData] = useState({
        fullName: trainerName,
        collegeId: staffId,
        email: currentUser?.email || '',
        contactNumber: currentUser?.contactNumber || '',
        trade: departmentName,
        address: currentUser?.address || '',
        joiningDate: currentUser?.joiningDate || currentUser?.dateOfJoining || '',
        bloodGroup: currentUser?.bloodGroup || '',
        designation: currentUser?.designation || 'Vocational Faculty & Master Artisan',
        workshopLab: currentUser?.workshopLab || '',
        status: currentUser?.status || 'ACTIVE'
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setPhotoUrl(base64);
                localStorage.setItem(`trainer_photo_${staffId}`, base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoUrl('');
        localStorage.removeItem(`trainer_photo_${staffId}`);
    };

    // =========================================================================
    // 2. ENROLLED TRAINEES & ATTENDANCE STATE
    // =========================================================================
    const [enrolledTrainees, setEnrolledTrainees] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(2);
    const [attendanceDate, setAttendanceDate] = useState(getTodayDateStr());
    const [attendance, setAttendance] = useState({});
    const [attendanceSaved, setAttendanceSaved] = useState(false);
    const [autoSavedMsg, setAutoSavedMsg] = useState('');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    // Attendance sub-view: 'marker' | 'report'
    const [attendanceSubView, setAttendanceSubView] = useState('marker');
    const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

    // Modal popup for Individual Student Attendance Details
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
    const [studentAttendanceLogs, setStudentAttendanceLogs] = useState([]);
    const [loadingModalLogs, setLoadingModalLogs] = useState(false);

    // =========================================================================
    // 3. LEAVE MANAGEMENT STATE (Student approvals + Faculty applying)
    // =========================================================================
    const [leaveSubTab, setLeaveSubTab] = useState('student-approvals'); // 'student-approvals' | 'apply-own' | 'my-history'
    const [studentLeaves, setStudentLeaves] = useState([]);
    const [loadingStudentLeaves, setLoadingStudentLeaves] = useState(false);

    // Faculty Own Leave Form
    const [trainerLeaveForm, setTrainerLeaveForm] = useState({
        startDate: getTodayDateStr(),
        endDate: getTodayDateStr(),
        reason: ''
    });
    const [applyingTrainerLeave, setApplyingTrainerLeave] = useState(false);
    const [trainerLeaveMsg, setTrainerLeaveMsg] = useState('');
    const [myFacultyLeaves, setMyFacultyLeaves] = useState([]);
    const [loadingMyLeaves, setLoadingMyLeaves] = useState(false);

    // =========================================================================
    // 4. COURSE & EXAMINATION STATE (Syllabus + Practical Grading)
    // =========================================================================
    const [courseSubTab, setCourseSubTab] = useState('syllabus'); // 'syllabus' | 'grading'
    const [syllabusModules, setSyllabusModules] = useState([]);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [newModuleForm, setNewModuleForm] = useState({
        moduleTitle: '',
        description: '',
        durationHours: 40
    });
    const [addingModule, setAddingModule] = useState(false);
    const [moduleMsg, setModuleMsg] = useState('');

    // Practical Grading State (4-Parameter NSQF Competency Rubric)
    const [selectedStudent, setSelectedStudent] = useState('');
    const [score, setScore] = useState('');
    const [rubricForm, setRubricForm] = useState({
        studioPractical: 36,
        toolSafety: 18,
        materialQuality: 18,
        vivaTheory: 18
    });
    const [remarks, setRemarks] = useState('');
    const [gradeSaved, setGradeSaved] = useState(false);
    const [batchScoresMap, setBatchScoresMap] = useState({});

    const handleRubricChange = (field, val, maxVal) => {
        const clamped = Math.max(0, Math.min(maxVal, Number(val) || 0));
        const next = { ...rubricForm, [field]: clamped };
        setRubricForm(next);
        const total = Number((next.studioPractical + next.toolSafety + next.materialQuality + next.vivaTheory).toFixed(1));
        setScore(total);
    };

    // =========================================================================
    // 5. MANAGE STUDENTS STATE
    // =========================================================================
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    // =========================================================================
    // 6. OFFICIAL NOTICES STATE
    // =========================================================================
    const [facultyNotices, setFacultyNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(false);

    // Helper to calculate duration in days
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

    // Load attendance records for a specific date from MySQL
    const loadAttendanceForDate = async (targetDate, list) => {
        const currentList = (list && list.length > 0) ? list : enrolledTrainees;
        setLoadingAttendance(true);
        try {
            const attRes = await axios.get(`${API_BASE_URL}/academics/attendance/by-date?date=${targetDate}`);
            const attMap = {};
            currentList.forEach(t => {
                const roll = t.collegeId || t.username;
                const match = (Array.isArray(attRes.data))
                    ? attRes.data.find(a => (a.collegeId && a.collegeId === roll) || (a.traineeId && a.traineeId === (t.traineeId || t.id)))
                    : null;
                attMap[roll] = match ? match.status : 'PRESENT';
            });
            setAttendance(attMap);
        } catch (err) {
            const initial = {};
            currentList.forEach(t => {
                initial[t.collegeId || t.username] = 'PRESENT';
            });
            setAttendance(initial);
        } finally {
            setLoadingAttendance(false);
        }
    };

    // Load entire date-wise attendance history from MySQL
    const loadAttendanceHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/attendance/history`);
            if (Array.isArray(res.data)) {
                setAttendanceHistory(res.data);
            }
        } catch (err) {
            console.error("Attendance history load error:", err);
        }
    };

    // Load Syllabus Modules
    const loadSyllabus = async (cid) => {
        setLoadingSyllabus(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/academics/courses/${cid || selectedCourseId || 2}/syllabus`);
            if (Array.isArray(res.data)) {
                setSyllabusModules(res.data);
            }
        } catch (err) {
            console.error("Load syllabus error:", err);
        } finally {
            setLoadingSyllabus(false);
        }
    };

    // Load Trainer's Own Leaves
    const loadMyFacultyLeaves = async () => {
        setLoadingMyLeaves(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/leaves/by-student/${staffId}`);
            if (Array.isArray(res.data)) {
                setMyFacultyLeaves(res.data);
            }
        } catch (err) {
            console.error("Load my leaves error:", err);
        } finally {
            setLoadingMyLeaves(false);
        }
    };

    // Load Student Leaves (Pending)
    const loadStudentLeaves = async () => {
        setLoadingStudentLeaves(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/leaves/pending`);
            if (Array.isArray(res.data)) {
                setStudentLeaves(res.data);
            }
        } catch (err) {
            console.error("Load student leaves error:", err);
        } finally {
            setLoadingStudentLeaves(false);
        }
    };

    // Initial Data Fetching from MySQL Database
    useEffect(() => {
        const fetchAllBackendData = async () => {
            // 1. Fetch Trainees
            let traineesList = [];
            try {
                const res = await axios.get(`${API_BASE_URL}/academics/trainees`);
                if (Array.isArray(res.data) && res.data.length > 0) {
                    traineesList = res.data;
                    setEnrolledTrainees(traineesList);
                    if (traineesList[0].courseId) {
                        setSelectedCourseId(traineesList[0].courseId);
                        loadSyllabus(traineesList[0].courseId);
                    } else {
                        loadSyllabus(2);
                    }
                    setSelectedStudent(traineesList[0].collegeId || traineesList[0].username);
                }
            } catch (err) {
                try {
                    const uRes = await axios.get(`${API_BASE_URL}/auth/users`);
                    if (Array.isArray(uRes.data)) {
                        traineesList = uRes.data.filter(u => (u.role || '').toUpperCase().includes('TRAINEE'));
                        setEnrolledTrainees(traineesList);
                        if (traineesList.length > 0) {
                            setSelectedStudent(traineesList[0].username);
                        }
                    }
                } catch (e) {}
                loadSyllabus(2);
            }

            // 2. Fetch Attendance for Selected Date
            await loadAttendanceForDate(attendanceDate, traineesList);

            // 3. Fetch Full Attendance History Log
            await loadAttendanceHistory();

            // 4. Fetch Pending Student Leaves
            await loadStudentLeaves();

            // 5. Fetch Faculty's Own Leaves
            await loadMyFacultyLeaves();

            // 6. Fetch Faculty Notices
            setLoadingNotices(true);
            try {
                const nRes = await axios.get(`${API_BASE_URL}/notices/audience/TRAINERS`);
                if (Array.isArray(nRes.data)) {
                    setFacultyNotices(nRes.data);
                }
            } catch (err) {}
            finally {
                setLoadingNotices(false);
            }

            // 7. Load Recorded Examination Scores
            if (traineesList.length > 0) {
                const scoresMap = {};
                for (const t of traineesList) {
                    const roll = t.collegeId || t.username;
                    try {
                        const sRes = await axios.get(`${API_BASE_URL}/academics/scores/by-college-id/${roll}`);
                        if (sRes.data && sRes.data.score !== undefined) {
                            scoresMap[roll] = sRes.data;
                        }
                    } catch (e) {}
                }
                setBatchScoresMap(scoresMap);
            }

            // 8. Try fetching Trainer Profile from Backend
            try {
                const pRes = await axios.get(`${API_BASE_URL}/auth/profile/${staffId}`);
                if (pRes.data) {
                    setProfileData(prev => ({
                        ...prev,
                        ...pRes.data,
                        trade: pRes.data.trade || prev.trade,
                        address: pRes.data.address || prev.address,
                        bloodGroup: pRes.data.bloodGroup || prev.bloodGroup,
                        joiningDate: pRes.data.dateOfJoining || pRes.data.joiningDate || prev.joiningDate
                    }));
                }
            } catch (e) {}
        };

        fetchAllBackendData();
    }, []);

    // When date picker changes, reload attendance for that specific date from MySQL (Restricted to past 7 days)
    const handleDateChange = async (newDate) => {
        if (!newDate) return;
        const weekAgo = getWeekAgoDateStr();
        const today = getTodayDateStr();
        if (newDate < weekAgo) {
            alert(`⚠️ Attendance Window Policy:\nTrainers are authorized to modify attendance only for up to 1 week (from ${weekAgo} onwards).\n\nFor earlier dates, administrative clearance is required via Central Administration.`);
            return;
        }
        if (newDate > today) {
            alert("⚠️ Attendance cannot be recorded for future dates.");
            return;
        }
        setAttendanceDate(newDate);
        await loadAttendanceForDate(newDate, enrolledTrainees);
    };

    // When selected student changes in grading, fetch their recorded score and NSQF rubric
    useEffect(() => {
        if (!selectedStudent) return;
        const savedRubrics = VocationalStore.getRubricScores();
        const existingRubric = savedRubrics[selectedStudent];
        const fetchStudentScore = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/academics/scores/by-college-id/${selectedStudent}`);
                if (res.data && res.data.score !== undefined && res.data.score !== null) {
                    const s = Number(res.data.score);
                    setScore(s);
                    setRemarks(res.data.remarks || '');
                    if (existingRubric) {
                        setRubricForm(existingRubric);
                    } else {
                        setRubricForm({
                            studioPractical: Number(((s * 40) / 100).toFixed(1)),
                            toolSafety: Number(((s * 20) / 100).toFixed(1)),
                            materialQuality: Number(((s * 20) / 100).toFixed(1)),
                            vivaTheory: Number(((s * 20) / 100).toFixed(1))
                        });
                    }
                } else if (existingRubric) {
                    setRubricForm(existingRubric);
                    setScore(existingRubric.studioPractical + existingRubric.toolSafety + existingRubric.materialQuality + existingRubric.vivaTheory);
                    setRemarks('');
                } else {
                    setScore(90);
                    setRubricForm({ studioPractical: 36, toolSafety: 18, materialQuality: 18, vivaTheory: 18 });
                    setRemarks('');
                }
            } catch (err) {
                if (existingRubric) {
                    setRubricForm(existingRubric);
                    setScore(existingRubric.studioPractical + existingRubric.toolSafety + existingRubric.materialQuality + existingRubric.vivaTheory);
                } else {
                    setScore(90);
                    setRubricForm({ studioPractical: 36, toolSafety: 18, materialQuality: 18, vivaTheory: 18 });
                }
                setRemarks('');
            }
        };
        fetchStudentScore();
    }, [selectedStudent]);

    // Toggle Attendance and IMMEDIATELY auto-save to Academic Registry
    const toggleAttendance = async (roll) => {
        const currentStatus = attendance[roll] || 'PRESENT';
        const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';

        setAttendance(prev => ({
            ...prev,
            [roll]: newStatus
        }));

        try {
            const targetTrainee = enrolledTrainees.find(t => (t.collegeId === roll || t.username === roll));
            if (targetTrainee) {
                await axios.post(`${API_BASE_URL}/academics/attendance/mark`, {
                    courseId: targetTrainee.courseId || selectedCourseId || 2,
                    date: attendanceDate,
                    attendanceList: [{
                        traineeId: targetTrainee.traineeId || targetTrainee.id || 1,
                        status: newStatus,
                        remarks: `Practical attendance marked as ${newStatus} for session on ${attendanceDate}`
                    }]
                });

                await loadAttendanceHistory();
                setAutoSavedMsg(`✓ Auto-saved in Academic Registry: ${targetTrainee.fullName || targetTrainee.name} marked ${newStatus} for ${attendanceDate}`);
                setTimeout(() => setAutoSavedMsg(''), 4000);
            }
        } catch (err) {
            console.error("Instant attendance save error:", err);
            setAutoSavedMsg(`⚠️ Saved locally (Offline sync mode): ${roll} marked ${newStatus} for ${attendanceDate}`);
            setTimeout(() => setAutoSavedMsg(''), 4000);
        }
    };

    // Save Attendance directly to Academic Registry for all scholars on selected date
    const handleSaveAttendance = async () => {
        setAttendanceSaved(true);
        try {
            const attendanceList = enrolledTrainees.map(t => {
                const roll = t.collegeId || t.username;
                return {
                    traineeId: t.traineeId || t.id,
                    status: attendance[roll] || 'PRESENT',
                    remarks: `Practical session attendance on ${attendanceDate}`
                };
            });

            await axios.post(`${API_BASE_URL}/academics/attendance/mark`, {
                courseId: selectedCourseId || 2,
                date: attendanceDate,
                attendanceList: attendanceList
            });

            await loadAttendanceHistory();
            setAutoSavedMsg(`✓ All ${enrolledTrainees.length} scholars attendance saved in University Academic Registry for ${attendanceDate}`);
            setTimeout(() => setAutoSavedMsg(''), 4000);
        } catch (err) {
            console.error("Attendance API error:", err);
        }
        setTimeout(() => setAttendanceSaved(false), 2500);
    };

    // Open Student Attendance Details Modal Popup
    const handleOpenStudentDetails = async (trainee) => {
        setSelectedStudentForModal(trainee);
        setIsModalOpen(true);
        setLoadingModalLogs(true);
        const roll = trainee.collegeId || trainee.username;

        try {
            const res = await axios.get(`${API_BASE_URL}/academics/trainees/by-college-id/${roll}/attendance`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                setStudentAttendanceLogs(res.data);
            } else {
                const filtered = attendanceHistory.filter(a => a.collegeId === roll || a.traineeId === (trainee.traineeId || trainee.id));
                setStudentAttendanceLogs(filtered);
            }
        } catch (err) {
            const filtered = attendanceHistory.filter(a => a.collegeId === roll || a.traineeId === (trainee.traineeId || trainee.id));
            setStudentAttendanceLogs(filtered);
        } finally {
            setLoadingModalLogs(false);
        }
    };

    // Quick toggle attendance status for a past date directly inside Modal Popup
    const handleToggleInModal = async (logItem) => {
        const newStatus = logItem.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
        try {
            await axios.post(`${API_BASE_URL}/academics/attendance/mark`, {
                courseId: selectedStudentForModal?.courseId || selectedCourseId || 2,
                date: logItem.date,
                attendanceList: [{
                    traineeId: logItem.traineeId || selectedStudentForModal?.traineeId || selectedStudentForModal?.id || 1,
                    status: newStatus,
                    remarks: `Updated ${newStatus} on ${logItem.date} via Details Modal`
                }]
            });

            setStudentAttendanceLogs(prev => prev.map(l => (
                (l.id === logItem.id || (l.date === logItem.date && l.traineeId === logItem.traineeId))
                    ? { ...l, status: newStatus }
                    : l
            )));

            if (logItem.date === attendanceDate && selectedStudentForModal) {
                const roll = selectedStudentForModal.collegeId || selectedStudentForModal.username;
                setAttendance(prev => ({
                    ...prev,
                    [roll]: newStatus
                }));
            }

            await loadAttendanceHistory();
        } catch (err) {
            console.error("Modal attendance update error:", err);
        }
    };

    // Helper to calculate student summary statistics
    const getStudentSummary = (roll, traineeId) => {
        const logs = attendanceHistory.filter(a => a.collegeId === roll || a.traineeId === traineeId);
        const total = logs.length;
        const present = logs.filter(a => a.status === 'PRESENT').length;
        const absent = total - present;
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;
        return { total, present, absent, percent };
    };

    // Review Student Leave (Approve/Reject) directly in MySQL
    const handleLeaveDecision = async (id, newStatus) => {
        try {
            await axios.put(`${API_BASE_URL}/leaves/${id}/review`, {
                status: newStatus,
                reviewRemarks: `Leave ${newStatus.toLowerCase()} by faculty instructor.`
            });
            setStudentLeaves(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            console.error("Leave review error:", err);
        }
    };

    // Submit Trainer's Own Leave Application to Admin
    const handleApplyTrainerLeave = async (e) => {
        e.preventDefault();
        if (!trainerLeaveForm.startDate || !trainerLeaveForm.endDate || !trainerLeaveForm.reason.trim()) return;
        setApplyingTrainerLeave(true);
        try {
            await axios.post(`${API_BASE_URL}/leaves/apply`, {
                collegeId: staffId,
                startDate: trainerLeaveForm.startDate,
                endDate: trainerLeaveForm.endDate,
                reason: trainerLeaveForm.reason.trim()
            });
            setTrainerLeaveMsg('✓ Leave request submitted successfully to University Administration!');
            await loadMyFacultyLeaves();
            setTrainerLeaveForm({
                startDate: getTodayDateStr(),
                endDate: getTodayDateStr(),
                reason: ''
            });
        } catch (err) {
            console.error("Apply trainer leave error:", err);
            setTrainerLeaveMsg(`⚠️ Submission failed: ${err.message}`);
        } finally {
            setApplyingTrainerLeave(false);
            setTimeout(() => setTrainerLeaveMsg(''), 5000);
        }
    };

    // Save Practical Grade & 4-Parameter NSQF Rubric
    const handleSaveGrade = async (e) => {
        e.preventDefault();
        if (!selectedStudent || score === '') return;
        setGradeSaved(true);

        // Save 4-parameter NSQF competency rubric to VocationalStore
        VocationalStore.saveRubricScore(selectedStudent, rubricForm);

        // Update local batch scores map immediately
        setBatchScoresMap(prev => ({
            ...prev,
            [selectedStudent]: {
                score: Number(score),
                grade: calculateGrade(score),
                remarks: remarks.trim() || 'Practical assessment verified by faculty.',
                evaluationDate: getTodayDateStr()
            }
        }));

        try {
            const target = enrolledTrainees.find(t => t.username === selectedStudent || t.collegeId === selectedStudent);
            await axios.post(`${API_BASE_URL}/academics/scores`, {
                traineeId: target?.traineeId || target?.id || 1,
                courseId: target?.courseId || selectedCourseId || 2,
                overallScore: Number(score),
                practicalMarks: Number(score),
                grade: calculateGrade(score),
                remarks: remarks.trim() || 'Practical assessment verified by faculty.'
            });
        } catch (err) {
            console.error("Score API error:", err);
        }
        setTimeout(() => setGradeSaved(false), 2500);
    };

    // Add New Syllabus Module
    const handleAddModuleSubmit = async (e) => {
        e.preventDefault();
        if (!newModuleForm.moduleTitle.trim()) return;
        setAddingModule(true);
        try {
            await axios.post(`${API_BASE_URL}/academics/courses/${selectedCourseId || 2}/syllabus`, {
                moduleTitle: newModuleForm.moduleTitle.trim(),
                description: newModuleForm.description.trim(),
                durationHours: Number(newModuleForm.durationHours) || 40,
                orderNo: syllabusModules.length + 1
            });
            setModuleMsg('✓ Syllabus module successfully added to course curriculum!');
            setIsAddModuleOpen(false);
            setNewModuleForm({ moduleTitle: '', description: '', durationHours: 40 });
            await loadSyllabus();
        } catch (err) {
            console.error("Add module error:", err);
            setModuleMsg(`⚠️ Failed to save module: ${err.message}`);
        } finally {
            setAddingModule(false);
            setTimeout(() => setModuleMsg(''), 5000);
        }
    };

    // Grade calculator helper
    const calculateGrade = (val) => {
        if (val === '' || val === null || val === undefined) return 'Score Pending';
        const num = Number(val);
        if (isNaN(num)) return 'Score Pending';
        if (num >= 85) return 'Grade A (Distinction)';
        if (num >= 70) return 'Grade B (Proficient)';
        if (num >= 50) return 'Grade C (Passing)';
        return 'Grade F (Needs Re-assessment)';
    };

    // Export CSV report
    const handleExportAttendanceCSV = () => {
        const headers = ["Scholar Name", "Student ID", "Trade", "Total Sessions", "Present", "Absent", "Attendance %", "NAAC Compliant"];
        const rows = enrolledTrainees.map(t => {
            const roll = t.collegeId || t.username;
            const summary = getStudentSummary(roll, t.traineeId || t.id);
            return [
                `"${t.fullName || t.name}"`,
                `"${roll}"`,
                `"${t.trade || 'Handicrafts & Tribal Art'}"`,
                summary.total,
                summary.present,
                summary.absent,
                `${summary.percent}%`,
                summary.percent >= 75 ? "YES" : "NO"
            ];
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `KISS_Attendance_Report_${getTodayDateStr()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print Report
    const handlePrintAttendanceReport = () => {
        window.print();
    };

    // Live counts for selected date
    const presentCount = enrolledTrainees.filter(t => (attendance[t.collegeId || t.username] || 'PRESENT') === 'PRESENT').length;
    const absentCount = enrolledTrainees.length - presentCount;

    // Filtered scholars for Attendance Report view
    const filteredReportTrainees = enrolledTrainees.filter(t => {
        if (!attendanceSearchQuery.trim()) return true;
        const q = attendanceSearchQuery.toLowerCase().trim();
        const name = (t.fullName || t.name || '').toLowerCase();
        const roll = (t.collegeId || t.username || '').toLowerCase();
        return name.includes(q) || roll.includes(q);
    });

    // Filtered scholars for Manage Students view
    const filteredManageTrainees = enrolledTrainees.filter(t => {
        if (!studentSearchQuery.trim()) return true;
        const q = studentSearchQuery.toLowerCase().trim();
        const name = (t.fullName || t.name || '').toLowerCase();
        const roll = (t.collegeId || t.username || '').toLowerCase();
        const trade = (t.trade || t.courseName || '').toLowerCase();
        return name.includes(q) || roll.includes(q) || trade.includes(q);
    });

    // Profile Initials Fallback
    const profileInitials = (profileData.fullName || 'Trainer')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TR';

    return (
        <div className="space-y-6">

            {/* ========================================================================= */}
            {/* MASTER CONSOLE HEADER & QUICK SECTION PILLS                               */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                    {/* Compact Profile Circle Preview in Header */}
                    <div 
                        onClick={() => handleSwitchTab('trainer-profile')}
                        className="w-12 h-12 rounded-full border-2 border-[#006837] overflow-hidden bg-emerald-50 text-[#006837] flex items-center justify-center font-black text-base shadow-sm cursor-pointer hover:ring-2 hover:ring-[#006837]/30 transition shrink-0"
                        title="Click to view full faculty profile"
                    >
                        {photoUrl ? (
                            <img src={photoUrl} alt="Trainer" className="w-full h-full object-cover" />
                        ) : (
                            profileInitials
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-[#006837] text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                                Faculty Console
                            </span>
                            <h2 className="text-xl font-black text-slate-800">{profileData.fullName}</h2>
                            <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2 py-0.5 rounded">
                                {profileData.collegeId}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Department: <strong className="text-slate-700">{profileData.trade}</strong> &bull; Batch: <strong className="text-[#006837]">{enrolledTrainees.length} Scholars</strong>
                        </p>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck size={14} className="text-emerald-600" /> NAAC 'A' Accredited Faculty
                    </span>
                    <button
                        type="button"
                        onClick={loadAttendanceHistory}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                        title="Sync with University Academic Registry"
                    >
                        <RefreshCw size={14} className={loadingAttendance ? "animate-spin text-[#006837]" : ""} />
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: FACULTY PROFILE (With Profile Photo Circle)                        */}
            {/* ========================================================================= */}
            {(currentTab === 'trainer-profile' || currentTab === 'trainer') && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                            
                            {/* Prominent Profile Photo Circle with Upload Control */}
                            <div className="relative group shrink-0">
                                <div className="w-28 h-28 rounded-full border-4 border-[#006837] bg-emerald-50 text-[#006837] overflow-hidden flex items-center justify-center font-black text-3xl shadow-md transition-transform group-hover:scale-[1.02]">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Faculty Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{profileInitials}</span>
                                    )}
                                </div>

                                {/* Floating Camera Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-[#006837] hover:bg-[#004d28] text-white p-2 rounded-full shadow-lg border-2 border-white transition-all hover:scale-110"
                                    title="Upload / Change Profile Photo"
                                >
                                    <Camera size={14} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Faculty Name & Key Badges */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                    <h3 className="text-2xl font-black text-slate-900">{profileData.fullName}</h3>
                                    <span className="bg-[#006837] text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm inline-block">
                                        Staff ID: {profileData.collegeId}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mt-1">
                                    {profileData.designation} &bull; {profileData.trade}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Kalinga Institute of Social Sciences (KISS Deemed to be University) &bull; Vocational Training Directorate
                                </p>

                                {/* Photo Management Action Buttons */}
                                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-emerald-50 text-[#006837] border border-emerald-200 hover:bg-emerald-100 font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5"
                                    >
                                        <Upload size={12} /> Upload New Photo
                                    </button>
                                    {photoUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Registration Grid (Synced with Admin Registration Fields) */}
                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <IdCard size={15} className="text-[#006837]" /> Faculty Institutional Record & Registration Details
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                {/* 1. Full Legal Name */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <User size={13} className="text-[#006837]" /> Full Legal Name
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 truncate">{profileData.fullName}</p>
                                </div>

                                {/* 2. Staff College ID */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <ShieldCheck size={13} className="text-teal-600" /> Faculty Employee ID
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 font-mono">{profileData.collegeId}</p>
                                </div>

                                {/* 3. Official Email */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <Mail size={13} className="text-indigo-600" /> Official Email Address
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 font-mono truncate">{profileData.email}</p>
                                </div>

                                {/* 4. Phone Number */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <Phone size={13} className="text-emerald-600" /> Contact Number
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 font-mono">{profileData.contactNumber}</p>
                                </div>

                                {/* 5. Vocational Specialization */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <Tag size={13} className="text-purple-600" /> Assigned Trade / Dept
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 truncate">{profileData.trade}</p>
                                </div>

                                {/* 6. Date of Joining */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <Calendar size={13} className="text-amber-600" /> Date of Joining
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 font-mono">{profileData.joiningDate}</p>
                                </div>

                                {/* 7. Blood Group */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <AlertCircle size={13} className="text-rose-600" /> Blood Group
                                    </span>
                                    <p className="text-sm font-bold text-rose-700 font-mono">{profileData.bloodGroup}</p>
                                </div>

                                {/* 8. Workshop Lab */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <Layers size={13} className="text-blue-600" /> Assigned Studio Lab
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 truncate">{profileData.workshopLab}</p>
                                </div>
                            </div>

                            {/* Residential Campus Address */}
                            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                    <MapPin size={13} className="text-rose-600" /> Permanent / Campus Residential Address
                                </span>
                                <p className="text-xs font-bold text-slate-800">{profileData.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Teaching Portfolio KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Assigned Trade</p>
                            <p className="text-xl font-black text-slate-900 mt-1">1 Course</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">VOC-ART-102</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase">Enrolled Scholars</p>
                            <p className="text-xl font-black text-emerald-900 mt-1">{enrolledTrainees.length} Students</p>
                            <p className="text-[10px] text-emerald-700 mt-0.5">Active apprentices</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm text-center">
                            <p className="text-[11px] font-bold text-indigo-800 uppercase">Sessions Delivered</p>
                            <p className="text-xl font-black text-indigo-900 mt-1">20 Sessions</p>
                            <p className="text-[10px] text-indigo-700 mt-0.5">Practical Studio Hours</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm text-center">
                            <p className="text-[11px] font-bold text-purple-800 uppercase">Faculty Attendance</p>
                            <p className="text-xl font-black text-purple-900 mt-1">91.7%</p>
                            <p className="text-[10px] text-purple-700 mt-0.5">Regular On-Campus</p>
                        </div>
                    </div>

                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: ATTENDANCE MANAGEMENT & STUDENT REPORTS                            */}
            {/* ========================================================================= */}
            {currentTab === 'trainer-attendance' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Sub-view Navigation Pills */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setAttendanceSubView('marker')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    attendanceSubView === 'marker'
                                        ? 'bg-[#006837] text-white shadow'
                                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                                }`}
                            >
                                <CalendarCheck size={14} /> Daily Practical Attendance Marker
                            </button>
                            <button
                                type="button"
                                onClick={() => setAttendanceSubView('report')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    attendanceSubView === 'report'
                                        ? 'bg-[#006837] text-white shadow'
                                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                                }`}
                            >
                                <Users size={14} /> Student Attendance Reports & Logs
                            </button>
                        </div>

                        {attendanceSubView === 'report' && (
                            <div className="flex items-center gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={handleExportAttendanceCSV}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-[#006837] border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                    title="Export attendance ledger as CSV"
                                >
                                    <Download size={13} /> Export CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrintAttendanceReport}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                    title="Print formal university attendance report"
                                >
                                    <Printer size={13} /> Print Report
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SUB-VIEW A: DAILY PRACTICAL ATTENDANCE MARKER */}
                    {attendanceSubView === 'marker' && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            {/* Card Header with Interactive Date Picker */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <UserCheck size={18} className="text-[#006837]" />
                                        Daily Practical Attendance Marker
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                        <span>Per-day studio attendance synced directly with University Academic Registry</span>
                                        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                                            <Clock size={11} className="text-amber-600" /> Trainer Window: Last 7 Days (Admin required for earlier dates)
                                        </span>
                                    </p>
                                </div>
                                
                                {/* Date Picker Control */}
                                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                    <Calendar size={14} className="text-[#006837] shrink-0" />
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        min={getWeekAgoDateStr()}
                                        max={getTodayDateStr()}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#006837]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDateChange(getTodayDateStr())}
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition border ${
                                            attendanceDate === getTodayDateStr()
                                                ? 'bg-[#006837] text-white border-[#006837]'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300'
                                        }`}
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDateChange(getYesterdayDateStr())}
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition border ${
                                            attendanceDate === getYesterdayDateStr()
                                                ? 'bg-[#006837] text-white border-[#006837]'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300'
                                        }`}
                                    >
                                        Yesterday
                                    </button>
                                </div>
                            </div>

                            {/* Instant Auto-Save Toast Banner */}
                            {autoSavedMsg && (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center justify-between font-semibold shadow-sm animate-fade-in">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                        {autoSavedMsg}
                                    </span>
                                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded uppercase">
                                        Saved
                                    </span>
                                </div>
                            )}

                            {attendanceSaved && (
                                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5 font-semibold">
                                    <CheckCircle2 size={15} className="text-emerald-600" />
                                    All attendance records successfully finalized & synced to University Academic Registry!
                                </div>
                            )}

                            {/* Date Summary Stats */}
                            {enrolledTrainees.length > 0 && (
                                <div className="flex items-center justify-between px-1 text-xs text-slate-600">
                                    <span>
                                        Session Date: <strong className="text-slate-800">{attendanceDate}</strong>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[11px]">
                                            ✓ Present: {presentCount}
                                        </span>
                                        <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded text-[11px]">
                                            ✕ Absent: {absentCount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Scholars List with Quick Toggle */}
                            {enrolledTrainees.length === 0 ? (
                                <div className="py-8 px-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                    <Users className="mx-auto text-slate-400 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-slate-700">No Scholars Enrolled Yet</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                        Please onboard trainees via Admin Console to record daily practical attendance.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {enrolledTrainees.map(t => {
                                        const roll = t.collegeId || t.username;
                                        const currentStatus = attendance[roll] || 'PRESENT';
                                        return (
                                            <div key={roll} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100/60 transition">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{t.fullName || t.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{roll} &bull; {t.trade || t.courseName || 'Vocational Trade'}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAttendance(roll)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 ${
                                                        currentStatus === 'PRESENT'
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                            : 'bg-rose-600 text-white hover:bg-rose-700'
                                                    }`}
                                                >
                                                    {currentStatus === 'PRESENT' ? <Check size={14} /> : <XCircle size={14} />}
                                                    {currentStatus}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSaveAttendance}
                                disabled={enrolledTrainees.length === 0}
                                className={`w-full text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow ${
                                    enrolledTrainees.length === 0
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : 'bg-[#006837] hover:bg-[#004d28] text-white'
                                }`}
                            >
                                <Save size={14} /> Save & Finalize Attendance for {attendanceDate}
                            </button>
                        </div>
                    )}

                    {/* SUB-VIEW B: STUDENT ATTENDANCE REPORT & ANALYTICS */}
                    {attendanceSubView === 'report' && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            
                            {/* Search & Statistics Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by scholar name or roll ID..."
                                        value={attendanceSearchQuery}
                                        onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md border border-slate-200">
                                        Scholars: {filteredReportTrainees.length}
                                    </span>
                                </div>
                            </div>

                            {/* Attendance Ledger Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                            <th className="py-2.5 px-3 font-semibold">Scholar Name</th>
                                            <th className="py-2.5 px-3 font-semibold">Student ID / Roll</th>
                                            <th className="py-2.5 px-3 font-semibold">Total Sessions</th>
                                            <th className="py-2.5 px-3 font-semibold text-emerald-800">Present</th>
                                            <th className="py-2.5 px-3 font-semibold text-rose-800">Absent</th>
                                            <th className="py-2.5 px-3 font-semibold">Attendance %</th>
                                            <th className="py-2.5 px-3 font-semibold">NAAC Eligibility</th>
                                            <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredReportTrainees.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-8 text-center text-slate-400">
                                                    No scholars match the search criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredReportTrainees.map((trainee) => {
                                                const roll = trainee.collegeId || trainee.username;
                                                const summary = getStudentSummary(roll, trainee.traineeId || trainee.id);
                                                const isCompliant = summary.percent >= 75;

                                                return (
                                                    <tr key={roll} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-[#006837]/10 text-[#006837] flex items-center justify-center font-bold text-xs">
                                                                {(trainee.fullName || trainee.name || 'S').charAt(0)}
                                                            </div>
                                                            <span>{trainee.fullName || trainee.name}</span>
                                                        </td>
                                                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                                                            {roll}
                                                        </td>
                                                        <td className="py-3 px-3 font-mono text-slate-800 font-bold">
                                                            {summary.total}
                                                        </td>
                                                        <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                                                            {summary.present}
                                                        </td>
                                                        <td className="py-3 px-3 font-mono text-rose-700 font-bold">
                                                            {summary.absent}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                                                                isCompliant
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : summary.percent >= 50
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                            }`}>
                                                                {summary.percent}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                isCompliant
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                                                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                                                            }`}>
                                                                {isCompliant ? '✓ Exam Eligible (>=75%)' : '⚠ Below 75% Requirement'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenStudentDetails(trainee)}
                                                                className="inline-flex items-center gap-1 bg-[#006837] hover:bg-[#004d28] text-white font-bold px-2.5 py-1 rounded text-xs transition"
                                                            >
                                                                <Eye size={12} /> View Logs
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: LEAVE MANAGEMENT (Subtabs: Student Approvals + Apply Own Leave)    */}
            {/* ========================================================================= */}
            {currentTab === 'trainer-leaves' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Subtab Segmented Switch */}
                    <div className="flex items-center border-b border-slate-200 pb-3 gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setLeaveSubTab('student-approvals')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                leaveSubTab === 'student-approvals'
                                    ? 'bg-[#006837] text-white shadow'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <UserCheck size={14} /> Student Leave Approvals
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                leaveSubTab === 'student-approvals' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {studentLeaves.length} Pending
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLeaveSubTab('apply-own')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                leaveSubTab === 'apply-own'
                                    ? 'bg-[#006837] text-white shadow'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <Send size={14} /> Apply for Faculty Leave (to Admin)
                        </button>
                        <button
                            type="button"
                            onClick={() => setLeaveSubTab('my-history')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                leaveSubTab === 'my-history'
                                    ? 'bg-[#006837] text-white shadow'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <Clock size={14} /> My Leave History & Admin Decisions
                            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {myFacultyLeaves.length}
                            </span>
                        </button>
                    </div>

                    {/* SUBTAB 1: APPROVE STUDENT LEAVES */}
                    {leaveSubTab === 'student-approvals' && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <Clock size={18} className="text-amber-500" />
                                        Approve Trainee Leave Requests
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Scholars enrolled in your vocational trade who applied for leave
                                    </p>
                                </div>
                                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
                                    Pending: {studentLeaves.length}
                                </span>
                            </div>

                            {studentLeaves.length === 0 ? (
                                <div className="py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-sm font-bold text-slate-700">All Student Leaves Reviewed!</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                        There are currently no pending leave applications from your apprentices.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {studentLeaves.map((l) => (
                                        <div key={l.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:border-slate-300 transition">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 text-sm">{l.trainee || l.applicantName || 'Enrolled Scholar'}</h4>
                                                        <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                                                            {l.studentId || 'Scholar'}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 font-medium mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                                                        "{l.reason}"
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-slate-500 text-[11px]">
                                                        {l.startDate && l.endDate ? (
                                                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                                <Calendar size={12} className="text-[#006837]" /> {l.startDate} to {l.endDate}
                                                            </span>
                                                        ) : (
                                                            <span>Applied on {l.date}</span>
                                                        )}
                                                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                                            Duration: {l.days} {l.days === 1 ? 'Day' : 'Days'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded self-start bg-amber-100 text-amber-800">
                                                    {l.status}
                                                </span>
                                            </div>

                                            {l.status === 'PENDING' && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLeaveDecision(l.id, 'APPROVED')}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm text-xs"
                                                    >
                                                        <Check size={14} /> Approve Leave
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLeaveDecision(l.id, 'REJECTED')}
                                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm text-xs"
                                                    >
                                                        <XCircle size={14} /> Reject Leave
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500">
                                * Approved scholar leaves are automatically accounted for without stipend or academic penalty as per university policy.
                            </div>
                        </div>
                    )}

                    {/* SUBTAB 2: APPLY FOR FACULTY LEAVE (TO ADMIN) */}
                    {leaveSubTab === 'apply-own' && (
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
                            <div className="border-b pb-3">
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Send size={18} className="text-[#006837]" />
                                    Submit Faculty Leave Application to Central Administration
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Your request will be submitted directly to the University Administration for official review & approval
                                </p>
                            </div>

                            {/* Administration Final Authority Notice */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                                <ShieldCheck size={16} className="text-[#006837] shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Administrative Governance Notice:</p>
                                    <p className="text-emerald-700 mt-0.5">
                                        The University Administration holds the final authority to Approve or Decline faculty leave applications based on semester schedules and workshop requirements.
                                    </p>
                                </div>
                            </div>

                            {trainerLeaveMsg && (
                                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold animate-fade-in">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    {trainerLeaveMsg}
                                </div>
                            )}

                            <form onSubmit={handleApplyTrainerLeave} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                            <Calendar size={13} className="text-[#006837]" /> Start Date (From)
                                        </label>
                                        <input
                                            type="date"
                                            min={getTodayDateStr()}
                                            value={trainerLeaveForm.startDate}
                                            onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, startDate: e.target.value })}
                                            required
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                            <Calendar size={13} className="text-[#006837]" /> End Date (To)
                                        </label>
                                        <input
                                            type="date"
                                            min={trainerLeaveForm.startDate || getTodayDateStr()}
                                            value={trainerLeaveForm.endDate}
                                            onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, endDate: e.target.value })}
                                            required
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Duration Pill */}
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                    <span className="text-slate-600 font-medium">Calculated Leave Duration:</span>
                                    <span className="bg-[#006837] text-white px-2.5 py-0.5 rounded-full font-bold">
                                        {calculateDuration(trainerLeaveForm.startDate, trainerLeaveForm.endDate)} Day(s)
                                    </span>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Official Reason for Faculty Leave <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={trainerLeaveForm.reason}
                                        onChange={(e) => setTrainerLeaveForm({ ...trainerLeaveForm, reason: e.target.value })}
                                        placeholder="e.g. Attending National Tribal Craft Symposium / Health Emergency / Family Ceremony..."
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={applyingTrainerLeave}
                                    className="w-full bg-[#006837] hover:bg-[#004d28] text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                                >
                                    <Send size={14} /> Submit Application to Admin
                                </button>
                            </form>
                        </div>
                    )}

                    {/* SUBTAB 3: MY LEAVE APPLICATIONS STATUS (ADMIN DECISIONS) */}
                    {leaveSubTab === 'my-history' && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <Clock size={18} className="text-[#006837]" />
                                        My Submitted Leave Applications & Administrative Status
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Official record of leaves applied by {trainerName} ({staffId})
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={loadMyFacultyLeaves}
                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-md transition flex items-center gap-1"
                                >
                                    <RefreshCw size={12} className={loadingMyLeaves ? "animate-spin text-[#006837]" : ""} /> Refresh
                                </button>
                            </div>

                            {myFacultyLeaves.length === 0 ? (
                                <div className="py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <Clock size={32} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm font-semibold text-slate-700">No Leave Applications on Record</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Use the "Apply for Faculty Leave" tab above to request leave from the University Administration.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myFacultyLeaves.map((leave) => (
                                        <div key={leave.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{leave.reason}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-slate-500">
                                                        <span className="font-medium text-[#006837] flex items-center gap-1">
                                                            <Calendar size={12} /> {leave.startDate} to {leave.endDate}
                                                        </span>
                                                        <span className="font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                                            {leave.days} {leave.days === 1 ? 'Day' : 'Days'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded shrink-0 ${
                                                    leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                    leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                                    'bg-amber-100 text-amber-800 border border-amber-300'
                                                }`}>
                                                    {leave.status === 'APPROVED' ? '✓ APPROVED BY ADMIN' :
                                                     leave.status === 'REJECTED' ? '✕ DECLINED BY ADMIN' :
                                                     '⏳ PENDING ADMIN REVIEW'}
                                                </span>
                                            </div>

                                            {/* Administrative Review Remarks */}
                                            {leave.reviewRemarks && (
                                                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                                                    <span className="font-bold text-slate-900">Admin Remarks: </span>
                                                    {leave.reviewRemarks}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: COURSE & EXAMINATION (Syllabus Modules + Practical Grading)        */}
            {/* ========================================================================= */}
            {currentTab === 'trainer-courses' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Subtab Segmented Switch */}
                    <div className="flex items-center border-b border-slate-200 pb-3 gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setCourseSubTab('syllabus')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                courseSubTab === 'syllabus'
                                    ? 'bg-[#006837] text-white shadow'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <BookOpen size={14} /> Course Curriculum & Syllabus Modules
                            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {syllabusModules.length} Modules
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCourseSubTab('grading')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                courseSubTab === 'grading'
                                    ? 'bg-[#006837] text-white shadow'
                                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                            }`}
                        >
                            <Award size={14} /> Practical Examination & Rubric Grading
                        </button>
                    </div>

                    {/* SUBTAB A: SYLLABUS MODULES */}
                    {courseSubTab === 'syllabus' && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <BookOpen size={18} className="text-[#006837]" />
                                        Vocational Course Curriculum: {profileData.trade}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Accredited skill training syllabus under KISS Deemed to be University
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModuleOpen(true)}
                                    className="bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <PlusCircle size={14} /> Add Curriculum Module
                                </button>
                            </div>

                            {moduleMsg && (
                                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-semibold">
                                    <CheckCircle2 size={15} /> {moduleMsg}
                                </div>
                            )}

                            {/* Add Module Modal/Form */}
                            {isAddModuleOpen && (
                                <form onSubmit={handleAddModuleSubmit} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 text-xs animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-[#006837] text-sm">Add New Syllabus Module</h4>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddModuleOpen(false)}
                                            className="text-slate-400 hover:text-slate-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">Module Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={newModuleForm.moduleTitle}
                                                onChange={(e) => setNewModuleForm({ ...newModuleForm, moduleTitle: e.target.value })}
                                                placeholder="e.g. Traditional Saura Art Glazing Techniques"
                                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">Practical Hours</label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="120"
                                                required
                                                value={newModuleForm.durationHours}
                                                onChange={(e) => setNewModuleForm({ ...newModuleForm, durationHours: e.target.value })}
                                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Module Learning Outcomes & Topics</label>
                                        <textarea
                                            rows="2"
                                            value={newModuleForm.description}
                                            onChange={(e) => setNewModuleForm({ ...newModuleForm, description: e.target.value })}
                                            placeholder="Detail key artisan competencies, tools required, and safety guidelines..."
                                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddModuleOpen(false)}
                                            className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addingModule}
                                            className="bg-[#006837] text-white font-bold px-4 py-1.5 rounded text-xs shadow"
                                        >
                                            Save Module
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Modules List */}
                            {loadingSyllabus ? (
                                <p className="py-6 text-center text-slate-400 text-xs">Loading course modules from database...</p>
                            ) : syllabusModules.length === 0 ? (
                                <p className="py-6 text-center text-slate-400 text-xs">No syllabus modules defined yet for this course.</p>
                            ) : (
                                <div className="space-y-3">
                                    {syllabusModules.map((m, idx) => (
                                        <div key={m.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:bg-slate-100/60 transition">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-[#006837] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                                                            Module {idx + 1}
                                                        </span>
                                                        <h4 className="font-bold text-slate-900 text-sm">{m.moduleTitle}</h4>
                                                    </div>
                                                    <p className="text-slate-600 mt-1.5 leading-relaxed">{m.description}</p>
                                                </div>
                                                <span className="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded shrink-0">
                                                    {m.durationHours || 40} Hours
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUBTAB B: PRACTICAL EXAMINATION & RUBRIC GRADING */}
                    {courseSubTab === 'grading' && (
                        <div className="space-y-6">
                            
                            {/* Grading Form Card */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                            <Award size={18} className="text-indigo-600" />
                                            Record 4-Parameter NSQF Practical Competency Rubric & Score
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Evaluate hands-on studio execution, workshop safety, zero-defect quality, and oral viva defense
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchTab('feedback-hub')}
                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                                    >
                                        <GraduationCap size={14} /> Open Skill & Defect Coaching Log
                                    </button>
                                </div>

                                {gradeSaved && (
                                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded text-xs flex items-center gap-1.5 font-semibold">
                                        <CheckCircle2 size={14} /> NSQF 4-Parameter Rubric & Score of {score}% recorded for {selectedStudent}!
                                    </div>
                                )}

                                <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block font-semibold text-slate-600 mb-1">Select Scholar</label>
                                            <select
                                                value={selectedStudent}
                                                onChange={(e) => setSelectedStudent(e.target.value)}
                                                disabled={enrolledTrainees.length === 0}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] disabled:bg-slate-100"
                                            >
                                                {enrolledTrainees.length === 0 ? (
                                                    <option value="">No scholars enrolled yet</option>
                                                ) : (
                                                    enrolledTrainees.map(t => {
                                                        const roll = t.collegeId || t.username;
                                                        return (
                                                            <option key={roll} value={roll}>
                                                                {t.fullName || t.name} ({roll})
                                                            </option>
                                                        );
                                                    })
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-semibold text-slate-600">Total Practical Score (/100)</label>
                                                <span className="font-bold text-indigo-700">{calculateGrade(score)}</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={score}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                    setScore(val);
                                                    if (val !== '') {
                                                        setRubricForm({
                                                            studioPractical: Number(((val * 40) / 100).toFixed(1)),
                                                            toolSafety: Number(((val * 20) / 100).toFixed(1)),
                                                            materialQuality: Number(((val * 20) / 100).toFixed(1)),
                                                            vivaTheory: Number(((val * 20) / 100).toFixed(1))
                                                        });
                                                    }
                                                }}
                                                placeholder="Auto-summed from rubric (0 - 100)..."
                                                disabled={enrolledTrainees.length === 0}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 bg-indigo-50/40 focus:outline-none focus:border-[#006837] disabled:bg-slate-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-600 mb-1">Rubric Remarks & Defect Feedback</label>
                                            <input
                                                type="text"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="e.g. Zero-defect finish, accurate tribal motifs & safe tool handling..."
                                                disabled={enrolledTrainees.length === 0}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>

                                    {/* 4-Parameter NSQF Rubric Inputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                                <span>1. Studio Practical</span>
                                                <span className="text-[#006837]">{rubricForm.studioPractical} / 40M</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="40"
                                                step="0.5"
                                                value={rubricForm.studioPractical}
                                                onChange={(e) => handleRubricChange('studioPractical', e.target.value, 40)}
                                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Hands-on trade craftsmanship</p>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                                <span>2. Tool & PPE Safety</span>
                                                <span className="text-[#006837]">{rubricForm.toolSafety} / 20M</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={rubricForm.toolSafety}
                                                onChange={(e) => handleRubricChange('toolSafety', e.target.value, 20)}
                                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Machine care & workshop safety</p>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                                <span>3. Material & Quality</span>
                                                <span className="text-[#006837]">{rubricForm.materialQuality} / 20M</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={rubricForm.materialQuality}
                                                onChange={(e) => handleRubricChange('materialQuality', e.target.value, 20)}
                                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Zero-defect finish & low wastage</p>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                                <span>4. Viva Voce & Theory</span>
                                                <span className="text-[#006837]">{rubricForm.vivaTheory} / 20M</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={rubricForm.vivaTheory}
                                                onChange={(e) => handleRubricChange('vivaTheory', e.target.value, 20)}
                                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Oral defense & SOP knowledge</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={enrolledTrainees.length === 0}
                                            className={`text-xs font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow ${
                                                enrolledTrainees.length === 0
                                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                    : 'bg-[#006837] hover:bg-[#004d28] text-white'
                                            }`}
                                        >
                                            <Save size={14} /> Submit NSQF Rubric & Practical Grade
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Batch Examination Marksheet Ledger */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                                    <span>Batch Examination Marksheet & Evaluation Ledger</span>
                                    <span className="text-xs text-slate-400 font-normal">Synced with Admin Trainee Records</span>
                                </h4>

                                <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                                    <table className="w-full text-left text-xs border-collapse relative">
                                        <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                <th className="py-2.5 px-3 font-semibold">Scholar Name</th>
                                                <th className="py-2.5 px-3 font-semibold">Student ID</th>
                                                <th className="py-2.5 px-3 font-semibold">Practical Score</th>
                                                <th className="py-2.5 px-3 font-semibold">Assigned Grade</th>
                                                <th className="py-2.5 px-3 font-semibold">Faculty Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {enrolledTrainees.map(t => {
                                                const roll = t.collegeId || t.username;
                                                const evaluation = batchScoresMap[roll];
                                                return (
                                                    <tr key={roll} className="hover:bg-slate-50">
                                                        <td className="py-2.5 px-3 font-bold text-slate-800">
                                                            {t.fullName || t.name}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-slate-600">
                                                            {roll}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-bold text-indigo-700 font-mono">
                                                            {evaluation ? `${evaluation.score} / 100` : 'Pending'}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            {evaluation ? (
                                                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                    {evaluation.grade}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">Not evaluated</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 italic truncate max-w-sm">
                                                            {evaluation?.remarks || 'Awaiting practical examination.'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: MANAGING STUDENTS (Directory & Roster)                              */}
            {/* ========================================================================= */}
            {currentTab === 'trainer-students' && (
                <div className="space-y-6 animate-fade-in">
                    
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Users size={18} className="text-[#006837]" />
                                    Manage Enrolled Apprentices & Scholars
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Complete student directory for {profileData.trade}
                                </p>
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md border border-slate-200">
                                Total Enrolled: {enrolledTrainees.length} Scholars
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search scholars by name, roll ID, or course..."
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#006837]"
                            />
                        </div>

                        {/* Scholars Roster Table */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                            <table className="w-full text-left text-xs border-collapse relative">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                        <th className="py-2.5 px-3 font-semibold">Scholar Name</th>
                                        <th className="py-2.5 px-3 font-semibold">Student ID / Roll</th>
                                        <th className="py-2.5 px-3 font-semibold">Trade Department</th>
                                        <th className="py-2.5 px-3 font-semibold">Attendance %</th>
                                        <th className="py-2.5 px-3 font-semibold">Evaluation Status</th>
                                        <th className="py-2.5 px-3 font-semibold text-right">Quick Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredManageTrainees.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-slate-400">
                                                No scholars match the search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredManageTrainees.map((trainee) => {
                                            const roll = trainee.collegeId || trainee.username;
                                            const summary = getStudentSummary(roll, trainee.traineeId || trainee.id);
                                            const evaluation = batchScoresMap[roll];

                                            return (
                                                <tr key={roll} className="hover:bg-slate-50 transition">
                                                    <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#006837]/10 text-[#006837] flex items-center justify-center font-bold text-xs shrink-0">
                                                            {(trainee.fullName || trainee.name || 'S').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{trainee.fullName || trainee.name}</p>
                                                            <p className="text-[11px] text-slate-400 font-mono">{trainee.email || 'scholar@kiss.ac.in'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                                                        {roll}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600">
                                                        {trainee.trade || trainee.courseName || profileData.trade}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                                                            summary.percent >= 75
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {summary.percent}% ({summary.present}/{summary.total})
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        {evaluation ? (
                                                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                {evaluation.grade} ({evaluation.score}%)
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-[11px]">Pending evaluation</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenStudentDetails(trainee)}
                                                                className="bg-[#006837] hover:bg-[#004d28] text-white font-bold px-2.5 py-1 rounded text-xs transition flex items-center gap-1"
                                                            >
                                                                <Eye size={11} /> Attendance
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedStudent(roll);
                                                                    setCourseSubTab('grading');
                                                                    handleSwitchTab('trainer-courses');
                                                                }}
                                                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2.5 py-1 rounded text-xs transition flex items-center gap-1"
                                                            >
                                                                <Award size={11} /> Grade
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: FACULTY CIRCULARS & DIRECTIVES                                     */}
            {/* ========================================================================= */}
            {currentTab === 'trainer-notices' && (
                <div className="space-y-6 animate-fade-in">
                    
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                                    <Megaphone size={16} />
                                </span>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">
                                        Official Faculty Circulars & Administrative Directives
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Circulars issued by University Administration for Faculty & Trainers
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Pin size={12} className="text-amber-500" /> Admin Notice Board
                            </span>
                        </div>

                        {loadingNotices ? (
                            <p className="py-8 text-center text-slate-400 text-xs">Loading faculty circulars...</p>
                        ) : facultyNotices.length === 0 ? (
                            <div className="py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Bell size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm font-semibold text-slate-700">No Circulars Issued Yet</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Official notices issued by the administration for faculty will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {facultyNotices.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 rounded-xl border transition ${
                                            n.pinned 
                                                ? 'bg-amber-50/20 border-amber-300 ring-1 ring-amber-200/50' 
                                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                    n.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                                                    n.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {n.priority || 'NORMAL'}
                                                </span>
                                                <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                                                    {n.category || 'ACADEMIC'}
                                                </span>
                                                {n.pinned && (
                                                    <span className="text-[9px] text-amber-700 font-bold flex items-center gap-0.5">
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
                                        <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                                            <span>Issued by: <strong className="text-slate-600">{n.postedBy || 'University Administration'}</strong></span>
                                            <span className="text-indigo-700 font-semibold font-mono">Audience: {n.targetAudience}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* ========================================================================= */}
            {/* POPUP MODAL: STUDENT ATTENDANCE DETAILS & SESSION LOGS                    */}
            {/* ========================================================================= */}
            {isModalOpen && selectedStudentForModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-[#006837]/15 text-[#006837] flex items-center justify-center font-black text-lg shadow-sm">
                                    {(selectedStudentForModal.fullName || selectedStudentForModal.name || 'S').charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {selectedStudentForModal.fullName || selectedStudentForModal.name}
                                        </h3>
                                        <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                                            {selectedStudentForModal.collegeId || selectedStudentForModal.username}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Trade: <strong className="text-slate-700">{selectedStudentForModal.trade || selectedStudentForModal.courseName || profileData.trade}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 overflow-y-auto space-y-4 text-xs">
                            {/* Summary Metrics Bar */}
                            {(() => {
                                const total = studentAttendanceLogs.length;
                                const present = studentAttendanceLogs.filter(l => l.status === 'PRESENT').length;
                                const absent = total - present;
                                const percent = total > 0 ? Math.round((present / total) * 100) : 0;
                                return (
                                    <div className="grid grid-cols-4 gap-3 text-center">
                                        <div className="p-3 bg-slate-100 rounded-xl">
                                            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Sessions</p>
                                            <p className="text-xl font-black text-slate-800 mt-0.5">{total}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-[11px] text-emerald-700 font-semibold uppercase">Present</p>
                                            <p className="text-xl font-black text-emerald-800 mt-0.5">{present}</p>
                                        </div>
                                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                            <p className="text-[11px] text-rose-700 font-semibold uppercase">Absent</p>
                                            <p className="text-xl font-black text-rose-800 mt-0.5">{absent}</p>
                                        </div>
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <p className="text-[11px] text-indigo-700 font-semibold uppercase">Rate %</p>
                                            <p className="text-xl font-black text-indigo-800 mt-0.5">{percent}%</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Date-wise Attendance Ledger */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={14} className="text-[#006837]" />
                                        Date-wise Attendance Details
                                    </h4>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {studentAttendanceLogs.length} Records Found in Database
                                    </span>
                                </div>

                                {loadingModalLogs ? (
                                    <div className="py-8 text-center text-xs text-slate-500">
                                        Loading attendance records from database...
                                    </div>
                                ) : studentAttendanceLogs.length === 0 ? (
                                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <Calendar size={28} className="mx-auto text-slate-400 mb-1" />
                                        <p className="text-xs font-semibold text-slate-600">No attendance marked yet for this scholar</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Use the attendance marker tab to record daily attendance.</p>
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                    <th className="py-2.5 px-3 font-semibold">Date</th>
                                                    <th className="py-2.5 px-3 font-semibold">Attendance Status</th>
                                                    <th className="py-2.5 px-3 font-semibold">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {studentAttendanceLogs.map((log) => (
                                                    <tr key={log.id || log.date} className="hover:bg-slate-50 transition">
                                                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                                                            {log.date}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                                                                log.status === 'PRESENT'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : log.status === 'ABSENT'
                                                                        ? 'bg-rose-100 text-rose-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {log.status === 'PRESENT' ? <Check size={11} /> : <XCircle size={11} />}
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500 italic max-w-sm">
                                                            {log.remarks || 'Daily practical session'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                                * Official Trainee Attendance Ledger (Read-Only). Any historical corrections must be cleared via Central Administration.
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-1.5 rounded-lg text-xs transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}