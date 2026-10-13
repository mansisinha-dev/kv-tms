import React, { useState, useEffect } from 'react';
import {
    MessageSquarePlus,
    Star,
    Award,
    Briefcase,
    CheckCircle2,
    Printer,
    Send,
    UserCheck,
    GraduationCap,
    Sparkles,
    ShieldCheck,
    Clock,
    Wrench,
    X
} from 'lucide-react';
import { VocationalStore } from '../utils/vocationalStore';

export default function FeedbackCertificationHub({ currentUser, initialMode = 'feedback' }) {
    const rawRole = (currentUser?.role || currentUser?.username || '').toUpperCase();
    const isTrainee = rawRole.includes('TRAINEE') || rawRole.includes('TRN');
    const isTrainer = rawRole.includes('TRAINER') || rawRole.includes('FAC');
    const isAdmin = rawRole.includes('ADMIN') || rawRole.includes('ADM');

    const [activeSection, setActiveSection] = useState(
        initialMode === 'certifications-placements' ? 'certification' : 'feedback'
    );

    useEffect(() => {
        if (initialMode === 'certifications-placements') {
            setActiveSection('certification');
        } else if (initialMode === 'feedback-hub') {
            setActiveSection('feedback');
        }
    }, [initialMode]);

    const [feedbackList, setFeedbackList] = useState(() => VocationalStore.getFeedbackLogs());
    const [skillNotes, setSkillNotes] = useState(() => VocationalStore.getTrainerSkillNotes());
    const [placements, setPlacements] = useState(() => VocationalStore.getPlacements());
    const [toast, setToast] = useState('');
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    // Form: Submit Feedback (Trainee / Buyer / Trainer)
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [fbForm, setFbForm] = useState({
        sourceRole: isTrainee ? 'TRAINEE' : 'CUSTOMER_BUYER',
        tradeOrProduct: isTrainee ? (currentUser?.trade || 'Apparels & Tailoring (VOC-SEW-101)') : 'Tribal Motif Handwoven Cotton Kurta',
        category: isTrainee ? 'TRAINING_AND_LAB_FEEDBACK' : 'PRODUCT_QUALITY_REVIEW',
        rating: 5,
        subject: '',
        message: ''
    });

    // Admin resolution inputs
    const [replyMap, setReplyMap] = useState({});

    // Form: Trainer Skill Note
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteForm, setNoteForm] = useState({
        traineeId: 'KISS-TRN-2026-001',
        traineeName: 'Laxman Majhi',
        trade: currentUser?.trade || 'Apparels & Tailoring',
        competencyArea: 'Pattern Alignment & Lockstitch Tension',
        skillObservation: '',
        defectPreventionTip: '',
        practicalHoursLogged: 162,
        requiredHours: 180
    });

    // Form: Add Placement / Apprenticeship
    const [showPlacementForm, setShowPlacementForm] = useState(false);
    const [plcForm, setPlcForm] = useState({
        traineeId: 'KISS-TRN-2026-004',
        traineeName: 'DamayantiPradhan',
        tribeAndDistrict: 'Gond Tribe • Koraput, Odisha',
        trade: 'Food Processing',
        nsqfLevel: 'NSQF Level 4 (Agro & Food Preservation Technician)',
        attendancePct: 89.0,
        examScore: 87,
        pathwayType: 'APPRENTICESHIP_OJT',
        partnerOrganization: 'Odisha Agro Industries Corporation (OAIC)',
        roleOffered: 'Food Quality & Packaging Apprentice',
        monthlyStipendOrIncome: 14800,
        status: 'PLACED_AND_CERTIFIED'
    });

    useEffect(() => {
        const syncAll = () => {
            setFeedbackList(VocationalStore.getFeedbackLogs());
            setSkillNotes(VocationalStore.getTrainerSkillNotes());
            setPlacements(VocationalStore.getPlacements());
        };
        window.addEventListener('kvtms_vocational_sync', syncAll);
        return () => window.removeEventListener('kvtms_vocational_sync', syncAll);
    }, []);

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        VocationalStore.addFeedback({
            ...fbForm,
            rating: Number(fbForm.rating),
            submittedBy: `${currentUser?.fullName || 'Campus User'} (${currentUser?.collegeId || 'Visitor'})`
        });
        setFeedbackList(VocationalStore.getFeedbackLogs());
        setShowFeedbackForm(false);
        setFbForm({ ...fbForm, subject: '', message: '' });
        notify('Your feedback / grievance has been recorded in the Vocational Quality & Grievance Portal.');
    };

    const handleResolveFeedback = (id) => {
        const responseText = replyMap[id] || 'Reviewed by Vocational Directorate. Necessary workshop action completed.';
        VocationalStore.resolveFeedback(id, responseText);
        setFeedbackList(VocationalStore.getFeedbackLogs());
        notify(`Feedback #${id} marked as Resolved with official response.`);
    };

    const handleAddSkillNote = (e) => {
        e.preventDefault();
        VocationalStore.addTrainerSkillNote({
            ...noteForm,
            trainerName: `${currentUser?.fullName || 'Faculty Trainer'} (${currentUser?.collegeId || 'KISS-FAC-001'})`,
            practicalHoursLogged: Number(noteForm.practicalHoursLogged),
            requiredHours: Number(noteForm.requiredHours)
        });
        setSkillNotes(VocationalStore.getTrainerSkillNotes());
        setShowNoteForm(false);
        setNoteForm({ ...noteForm, skillObservation: '', defectPreventionTip: '' });
        notify(`Constructive skill & defect-prevention feedback sent to ${noteForm.traineeName}.`);
    };

    const handleAddPlacement = (e) => {
        e.preventDefault();
        VocationalStore.addPlacement({
            ...plcForm,
            attendancePct: Number(plcForm.attendancePct),
            examScore: Number(plcForm.examScore),
            monthlyStipendOrIncome: Number(plcForm.monthlyStipendOrIncome)
        });
        setPlacements(VocationalStore.getPlacements());
        setShowPlacementForm(false);
        notify(`Trade Certification & Livelihood Placement recorded for ${plcForm.traineeName}!`);
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-[#006837] to-emerald-900 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full font-bold">
                            KISS Skill India • NSQF Livelihood & Stakeholder Voice
                        </span>
                        <h2 className="text-xl font-black mt-2 flex items-center gap-2">
                            <Award size={24} className="text-amber-300" />
                            360° Stakeholder Feedback, Skill Coaching & NSQF Certification Cell
                        </h2>
                        <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                            Trainee course & workshop feedback, customer product quality reviews, trainer defect-prevention coaching, NSQF Trade Certificates, and OJT/Placement tracking.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto text-center">
                        <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Avg Rating</p>
                            <p className="text-lg font-black text-amber-300">4.8 ★</p>
                        </div>
                        <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Skill Notes</p>
                            <p className="text-lg font-black text-white">{skillNotes.length}</p>
                        </div>
                        <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Certified/Placed</p>
                            <p className="text-lg font-black text-emerald-300">{placements.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                    <CheckCircle2 size={16} className="text-[#006837] shrink-0" />
                    {toast}
                </div>
            )}

            {/* Sub-Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    type="button"
                    onClick={() => setActiveSection('feedback')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        activeSection === 'feedback'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <MessageSquarePlus size={15} />
                    1. Trainee, Workshop & Buyer Feedback ({feedbackList.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('skill-coaching')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        activeSection === 'skill-coaching'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <UserCheck size={15} />
                    2. Trainer Skill & Defect Coaching Log ({skillNotes.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('certification')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        activeSection === 'certification'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <Award size={15} />
                    3. NSQF Trade Certificates, OJT & Placements ({placements.length})
                </button>
            </div>

            {/* ===================================================================== */}
            {/* TAB 1: 360° USER FEEDBACK & GRIEVANCE RESOLUTION                      */}
            {/* ===================================================================== */}
            {activeSection === 'feedback' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <MessageSquarePlus size={18} className="text-[#006837]" />
                                Stakeholder Feedback, Lab Grievances & Product Quality Reviews
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Captures trainee feedback on courses/labs, workshop tool grievances, and buyer reviews on student-manufactured crafts.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                            className="bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                            <Send size={13} />
                            {showFeedbackForm ? 'Close Form' : 'Submit Feedback / Grievance'}
                        </button>
                    </div>

                    {showFeedbackForm && (
                        <form onSubmit={handleSubmitFeedback} className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-[#006837] text-sm border-b border-emerald-200 pb-2">
                                Submit Official Feedback, Product Quality Rating, or Workshop Grievance
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Stakeholder Type</label>
                                    <select
                                        value={fbForm.sourceRole}
                                        onChange={e => setFbForm({ ...fbForm, sourceRole: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option value="TRAINEE">Vocational Scholar / Trainee</option>
                                        <option value="CUSTOMER_BUYER">Showroom Buyer / Customer</option>
                                        <option value="TRAINER">Faculty Trainer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Feedback Category</label>
                                    <select
                                        value={fbForm.category}
                                        onChange={e => setFbForm({ ...fbForm, category: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option value="TRAINING_AND_LAB_FEEDBACK">Course & Practical Lab Feedback</option>
                                        <option value="WORKSHOP_TOOL_GRIEVANCE">Workshop Machine / Toolkit Grievance</option>
                                        <option value="PRODUCT_QUALITY_REVIEW">Craft Product Quality Review</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Trade / Craft Product</label>
                                    <input
                                        type="text"
                                        required
                                        value={fbForm.tradeOrProduct}
                                        onChange={e => setFbForm({ ...fbForm, tradeOrProduct: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Satisfaction Rating (1-5 ★)</label>
                                    <select
                                        value={fbForm.rating}
                                        onChange={e => setFbForm({ ...fbForm, rating: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-amber-700"
                                    >
                                        <option value={5}>★★★★★ (5/5 - Excellent)</option>
                                        <option value={4}>★★★★☆ (4/5 - Good)</option>
                                        <option value={3}>★★★☆☆ (3/5 - Satisfactory)</option>
                                        <option value={2}>★★☆☆☆ (2/5 - Needs Improvement)</option>
                                        <option value={1}>★☆☆☆☆ (1/5 - Urgent Issue)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Subject / Headline</label>
                                <input
                                    type="text"
                                    required
                                    value={fbForm.subject}
                                    onChange={e => setFbForm({ ...fbForm, subject: e.target.value })}
                                    placeholder="e.g. Request for additional bobbin cases in Tailoring Studio Lab-1 / Product review..."
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Detailed Feedback or Grievance Description</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={fbForm.message}
                                    onChange={e => setFbForm({ ...fbForm, message: e.target.value })}
                                    placeholder="Describe your experience, suggestion, or equipment issue..."
                                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowFeedbackForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-[#006837] text-white font-bold rounded-lg shadow">Submit Feedback</button>
                            </div>
                        </form>
                    )}

                    {/* Feedback Cards */}
                    <div className="space-y-4">
                        {feedbackList.map(fb => (
                            <div key={fb.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                                fb.sourceRole === 'TRAINEE'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                                {fb.sourceRole === 'TRAINEE' ? '🎓 Scholar Feedback' : '🛍️ Buyer Quality Review'}
                                            </span>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                                {fb.tradeOrProduct}
                                            </span>
                                            <span className="text-amber-500 font-black tracking-wider">
                                                {'★'.repeat(fb.rating || 5)}{'☆'.repeat(5 - (fb.rating || 5))}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm mt-1.5">{fb.subject}</h4>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                        fb.status === 'OPEN'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}>
                                        {fb.status === 'OPEN' ? '⏳ Pending Resolution' : '✓ Action Taken & Resolved'}
                                    </span>
                                </div>

                                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                                    "{fb.message}"
                                    <span className="block text-[11px] text-slate-400 mt-1 font-medium">
                                        — Submitted by <strong>{fb.submittedBy}</strong> on {fb.date}
                                    </span>
                                </p>

                                {fb.adminResponse ? (
                                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950">
                                        <span className="font-bold text-[#006837]">Official Directorate Resolution: </span>
                                        {fb.adminResponse}
                                    </div>
                                ) : (isAdmin || isTrainer) && (
                                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                        <input
                                            type="text"
                                            value={replyMap[fb.id] || ''}
                                            onChange={e => setReplyMap({ ...replyMap, [fb.id]: e.target.value })}
                                            placeholder="Enter official resolution or action taken (e.g. Issued 320-grit sandpaper to Bamboo Lab-3)..."
                                            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleResolveFeedback(fb.id)}
                                            className="bg-[#006837] hover:bg-[#004d28] text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shrink-0 cursor-pointer"
                                        >
                                            Post Resolution
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 2: TRAINER-TO-TRAINEE SKILL & DEFECT COACHING                     */}
            {/* ===================================================================== */}
            {activeSection === 'skill-coaching' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <UserCheck size={18} className="text-indigo-600" />
                                Trainer-to-Scholar Skill Coaching & Defect-Prevention Logbook
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Connects workshop QA outcomes directly to student learning with personalized trainer feedback and practical lab hour tracking.
                            </p>
                        </div>
                        {!isTrainee && (
                            <button
                                type="button"
                                onClick={() => setShowNoteForm(!showNoteForm)}
                                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                            >
                                <Send size={13} />
                                {showNoteForm ? 'Close Form' : 'Record Scholar Skill Feedback'}
                            </button>
                        )}
                    </div>

                    {showNoteForm && (
                        <form onSubmit={handleAddSkillNote} className="bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-indigo-900 text-sm border-b border-indigo-200 pb-2">
                                Record Individual Scholar Skill Observation & Defect Prevention Advice
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Scholar Roll / ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={noteForm.traineeId}
                                        onChange={e => setNoteForm({ ...noteForm, traineeId: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Scholar Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={noteForm.traineeName}
                                        onChange={e => setNoteForm({ ...noteForm, traineeName: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Competency Area</label>
                                    <input
                                        type="text"
                                        required
                                        value={noteForm.competencyArea}
                                        onChange={e => setNoteForm({ ...noteForm, competencyArea: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Completed Lab Hours (/180)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="240"
                                        required
                                        value={noteForm.practicalHoursLogged}
                                        onChange={e => setNoteForm({ ...noteForm, practicalHoursLogged: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Practical Skill Observation</label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={noteForm.skillObservation}
                                        onChange={e => setNoteForm({ ...noteForm, skillObservation: e.target.value })}
                                        placeholder="Evaluate machine handling, precision, and speed..."
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Defect-Prevention & Quality Tip</label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={noteForm.defectPreventionTip}
                                        onChange={e => setNoteForm({ ...noteForm, defectPreventionTip: e.target.value })}
                                        placeholder="Specific technique to prevent batch defects or material waste..."
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowNoteForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-indigo-700 text-white font-bold rounded-lg shadow">Save Coaching Note</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skillNotes.map(note => {
                            const pct = Math.min(100, Math.round((note.practicalHoursLogged / (note.requiredHours || 180)) * 100));
                            return (
                                <div key={note.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                        <div>
                                            <span className="font-mono font-bold text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                                {note.traineeId}
                                            </span>
                                            <h4 className="font-bold text-slate-900 text-sm mt-1">
                                                {note.traineeName} — <span className="text-[#006837]">{note.competencyArea}</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">Coach: {note.trainerName} • {note.date}</p>
                                        </div>
                                        <span className="bg-emerald-50 text-[#006837] border border-emerald-200 font-bold px-2.5 py-1 rounded-lg">
                                            {note.practicalHoursLogged}/{note.requiredHours} Lab Hrs ({pct}%)
                                        </span>
                                    </div>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                                        <strong>Skill Assessment:</strong> {note.skillObservation}
                                    </p>
                                    <p className="text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                                        <strong>QA & Defect Prevention Tip:</strong> {note.defectPreventionTip}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 3: NSQF TRADE CERTIFICATES, OJT APPRENTICESHIPS & PLACEMENTS      */}
            {/* ===================================================================== */}
            {activeSection === 'certification' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <Award size={18} className="text-[#006837]" />
                                NSQF Skill Certification, Apprenticeships (OJT) & Livelihood Placement Cell
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Issue verifiable KISS Vocational Trade Certificates and track post-training placements, industry OJT apprenticeships, and tribal micro-enterprises.
                            </p>
                        </div>
                        {!isTrainee && (
                            <button
                                type="button"
                                onClick={() => setShowPlacementForm(!showPlacementForm)}
                                className="bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                            >
                                <Briefcase size={13} />
                                {showPlacementForm ? 'Close Form' : 'Record Certification & Livelihood Placement'}
                            </button>
                        )}
                    </div>

                    {showPlacementForm && (
                        <form onSubmit={handleAddPlacement} className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-[#006837] text-sm border-b border-emerald-200 pb-2">
                                Issue Trade Skill Certificate & Record Livelihood Outcome
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Scholar ID</label>
                                    <input type="text" required value={plcForm.traineeId} onChange={e => setPlcForm({ ...plcForm, traineeId: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Scholar Full Name</label>
                                    <input type="text" required value={plcForm.traineeName} onChange={e => setPlcForm({ ...plcForm, traineeName: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Tribal Community & District</label>
                                    <input type="text" required value={plcForm.tribeAndDistrict} onChange={e => setPlcForm({ ...plcForm, tribeAndDistrict: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Vocational Trade</label>
                                    <input type="text" required value={plcForm.trade} onChange={e => setPlcForm({ ...plcForm, trade: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">NSQF Qualification Level</label>
                                    <input type="text" required value={plcForm.nsqfLevel} onChange={e => setPlcForm({ ...plcForm, nsqfLevel: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Livelihood Pathway</label>
                                    <select value={plcForm.pathwayType} onChange={e => setPlcForm({ ...plcForm, pathwayType: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5">
                                        <option value="APPRENTICESHIP_OJT">Paid Industry Apprenticeship (OJT)</option>
                                        <option value="INDUSTRY_PLACEMENT">Full-Time Industry Job Placement</option>
                                        <option value="SELF_EMPLOYED_SHG">Self-Employed Tribal Enterprise / SHG</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Employer / Cooperative Partner</label>
                                    <input type="text" required value={plcForm.partnerOrganization} onChange={e => setPlcForm({ ...plcForm, partnerOrganization: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Role / Trade Designation</label>
                                    <input type="text" required value={plcForm.roleOffered} onChange={e => setPlcForm({ ...plcForm, roleOffered: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Monthly Earnings / Stipend (₹)</label>
                                    <input type="number" required value={plcForm.monthlyStipendOrIncome} onChange={e => setPlcForm({ ...plcForm, monthlyStipendOrIncome: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPlacementForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-[#006837] text-white font-bold rounded-lg shadow">Issue Certificate & Save Placement</button>
                            </div>
                        </form>
                    )}

                    {/* Placement & Certification Cards */}
                    <div className="space-y-4">
                        {placements.map(plc => (
                            <div key={plc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono font-bold bg-[#006837] text-white px-2.5 py-0.5 rounded">
                                            {plc.certificateNo}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-sm">{plc.traineeName} ({plc.traineeId})</h4>
                                        <span className="text-[11px] text-slate-500">{plc.tribeAndDistrict}</span>
                                    </div>
                                    <p className="text-slate-700 font-semibold">
                                        {plc.trade} • <span className="text-indigo-700">{plc.nsqfLevel}</span>
                                    </p>
                                    <p className="text-slate-600">
                                        <strong>Placement / Partner:</strong> {plc.partnerOrganization} — <em>{plc.roleOffered}</em>
                                    </p>
                                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                                            Attendance: {plc.attendancePct}% (≥75% Verified)
                                        </span>
                                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                                            Competency Score: {plc.examScore}/100
                                        </span>
                                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold">
                                            Livelihood Income: ₹{Number(plc.monthlyStipendOrIncome).toLocaleString('en-IN')}/mo
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 w-full md:w-auto">
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-center">
                                        ✓ {plc.pathwayType.replace(/_/g, ' ')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCertificate(plc)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                    >
                                        <Award size={14} className="text-amber-300" />
                                        View / Print Trade Certificate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* MODAL: PRINTABLE NSQF-ALIGNED KISS VOCATIONAL TRADE CERTIFICATE       */}
            {/* ===================================================================== */}
            {selectedCertificate && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border-8 border-double border-[#006837] relative">
                        <button
                            type="button"
                            onClick={() => setSelectedCertificate(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center space-y-2 border-b-2 border-emerald-800/20 pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#006837]">
                                Kalinga Institute of Social Sciences (KISS) Deemed to be University • Bhubaneswar, Odisha
                            </p>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                Directorate of Vocational Skill Development & Social Enterprise
                            </h2>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Official Trade Competency Certificate (Aligned with National Skills Qualification Framework - NSQF)
                            </p>
                        </div>

                        <div className="py-6 text-center space-y-4">
                            <p className="text-xs text-slate-600 italic">This is to certify that</p>
                            <h3 className="text-2xl font-black text-[#006837] underline decoration-amber-400 decoration-2 underline-offset-4">
                                {selectedCertificate.traineeName}
                            </h3>
                            <p className="text-xs text-slate-700">
                                Scholar ID: <strong>{selectedCertificate.traineeId}</strong> ({selectedCertificate.tribeAndDistrict})
                            </p>
                            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                                has successfully completed the prescribed <strong>240-Hour Intensive Practical Studio & Theory Curriculum</strong> under the 100% Free Indigenous Skill Empowerment & <em>Earn-While-You-Learn</em> Mandate in the trade of:
                            </p>
                            <div className="inline-block bg-emerald-50 border-2 border-[#006837] px-6 py-2.5 rounded-xl">
                                <p className="text-base font-black text-slate-900">{selectedCertificate.trade}</p>
                                <p className="text-xs font-bold text-[#006837]">{selectedCertificate.nsqfLevel}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-xs">
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-[10px] text-slate-500">Certificate No.</p>
                                    <p className="font-mono font-bold text-slate-900">{selectedCertificate.certificateNo}</p>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-[10px] text-slate-500">Attendance Verified</p>
                                    <p className="font-bold text-emerald-800">{selectedCertificate.attendancePct}% (≥75%)</p>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-[10px] text-slate-500">Competency Score</p>
                                    <p className="font-bold text-indigo-800">{selectedCertificate.examScore} / 100 (Grade A)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-slate-200 text-xs text-slate-600 gap-4">
                            <div className="text-center sm:text-left">
                                <p className="font-bold text-slate-900">Master Trade Instructor</p>
                                <p className="text-[11px] text-slate-500">Vocational Studio Assessment Board</p>
                            </div>
                            <div className="text-center">
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px]">
                                    ✓ QR VERIFIED • NSDC / KISS SKILL REGISTRY
                                </span>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="font-bold text-slate-900">Director, Vocational Directorate</p>
                                <p className="text-[11px] text-slate-500">KISS Deemed to be University</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-[#006837] hover:bg-[#004d28] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                            >
                                <Printer size={14} /> Print Official Trade Certificate
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCertificate(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
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
