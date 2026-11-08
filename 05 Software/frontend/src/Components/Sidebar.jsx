import React from 'react';
import axios from 'axios';
import {
    ShieldCheck,
    LayoutDashboard,
    GraduationCap,
    UserCheck,
    Factory,
    Warehouse,
    ShoppingCart,
    BrainCircuit,
    ChevronRight,
    Layers,
    Activity,
    Sliders,
    BookOpen,
    UserPlus,
    Users,
    Bell,
    User,
    CalendarCheck,
    Clock,
    Award,
    Coins
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

export default function Sidebar({ activeTab, setActiveTab, currentUser, backendStatus, isOpen, setIsOpen }) {
    // Dynamic pending approvals count for Admin
    const [pendingApprovalCount, setPendingApprovalCount] = React.useState(0);

    // Safely determine Admin role
    let resolvedUser = currentUser;
    if (!resolvedUser) {
        try {
            resolvedUser = JSON.parse(localStorage.getItem('kvtms_user') || '{}');
        } catch (e) {}
    }
    const rawRole = (resolvedUser?.role || resolvedUser?.username || '').toUpperCase();
    const isAdmin = rawRole.includes('ADMIN') || rawRole.includes('ADM');

    React.useEffect(() => {
        const updatePendingCount = async () => {
            const seen = new Set();

            try {
                const reqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
                reqs.filter(r => (r.status || '').toUpperCase().includes('PENDING')).forEach(r => {
                    seen.add(r.batchNumber || r.id || r.runId);
                });
            } catch (e) {}

            try {
                const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
                Object.values(batchMap).filter(b => (b.status || '').toUpperCase().includes('PENDING')).forEach(b => {
                    seen.add(b.batchNumber || b.id);
                });
            } catch (e) {}

            try {
                const res = await axios.get(`${API_BASE_URL}/production/runs/pending-approval`);
                if (Array.isArray(res.data)) {
                    res.data.forEach(r => {
                        seen.add(r.batchNumber || r.id);
                    });
                }
            } catch (e) {}

            setPendingApprovalCount(seen.size);
        };

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 3000);
        window.addEventListener('kvtms_batch_updated', updatePendingCount);
        window.addEventListener('storage', updatePendingCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener('kvtms_batch_updated', updatePendingCount);
            window.removeEventListener('storage', updatePendingCount);
        };
    }, []);

    // Normalize role to determine accessible tabs
    const userRole = rawRole.includes('TRAINEE')
        ? 'ROLE_TRAINEE'
        : rawRole.includes('TRAINER') || rawRole.includes('FAC')
        ? 'ROLE_TRAINER'
        : rawRole.includes('PRODUCTION') || rawRole.includes('PRD')
        ? 'ROLE_PRODUCTION_MANAGER'
        : 'ROLE_ADMIN';

    // Role-specific navigation suites
    const navModules = [
        // 1. PRODUCTION MANAGER EXCLUSIVE SUITE
        {
            suiteTitle: 'Production & Quality Operations',
            roles: ['ROLE_PRODUCTION_MANAGER'],
            items: [
                {
                    id: 'production',
                    label: 'Production Line & BOM',
                    desc: 'Batch scheduling & rework loop',
                    icon: Factory
                },
                {
                    id: 'qa-defects',
                    label: 'QA, Defects & Lab Machines',
                    desc: 'Unit split, scrap & tool repair',
                    icon: ShieldCheck
                },
                {
                    id: 'inventory',
                    label: 'Dual Warehouse & Damage Log',
                    desc: 'Raw store, finished goods & breakage',
                    icon: Warehouse
                },
                {
                    id: 'sales',
                    label: 'Sales POS & Returns',
                    desc: 'GST billing, returns & reviews',
                    icon: ShoppingCart
                },
                {
                    id: 'forecast',
                    label: 'AI Demand Forecasting',
                    desc: 'Predictive seasonal analytics',
                    icon: BrainCircuit
                },
                {
                    id: 'feedback-hub',
                    label: 'Buyer & Workshop Feedback',
                    desc: 'Product ratings & tool grievances',
                    icon: Award
                },
                {
                    id: 'notice-board',
                    label: 'Campus Circulars & Directives',
                    desc: 'Official notices & workshop safety',
                    icon: Bell
                }
            ]
        },

        // 2. UNIVERSITY ADMIN GOVERNANCE SUITE
        {
            suiteTitle: 'Vocational Institute Governance',
            roles: ['ROLE_ADMIN'],
            items: [
                {
                    id: 'dashboard',
                    label: 'Executive KPI Dashboard',
                    desc: 'Institute metrics & live overview',
                    icon: LayoutDashboard
                },
                {
                    id: 'admin',
                    label: 'Trades & NSQF Curriculum',
                    desc: 'Vocational syllabi & lab hours',
                    icon: BookOpen
                },
                {
                    id: 'production',
                    label: 'Batch & Stipend Approvals',
                    desc: 'Review runs & disburse DBT',
                    icon: ShieldCheck
                },
                {
                    id: 'certifications-placements',
                    label: 'Certificates & Placements',
                    desc: 'NSQF certificates, OJT & jobs',
                    icon: Award
                },
                {
                    id: 'feedback-hub',
                    label: '360° Feedback & Grievances',
                    desc: 'Trainee, buyer & lab resolutions',
                    icon: Sliders
                },
                {
                    id: 'trainee-records',
                    label: 'Trainee Directory',
                    desc: 'Scholar profiles & attendance',
                    icon: Users
                },
                {
                    id: 'trainer-records',
                    label: 'Faculty & Master Artisans',
                    desc: 'Trainer roster & studio labs',
                    icon: UserCheck
                },
                {
                    id: 'trainee-reg',
                    label: 'Trainee Enrollment',
                    desc: 'Enroll tribal scholars',
                    icon: GraduationCap
                },
                {
                    id: 'trainer-reg',
                    label: 'Trainer Onboarding',
                    desc: 'Onboard faculty instructors',
                    icon: UserPlus
                },
                {
                    id: 'production-reg',
                    label: 'Workshop Staff Onboarding',
                    desc: 'Onboard production operators',
                    icon: Factory
                },
                {
                    id: 'admin-reg',
                    label: 'Admin Registration',
                    desc: 'Add university administrators',
                    icon: ShieldCheck
                },
                {
                    id: 'notice-board',
                    label: 'Institutional Circulars',
                    desc: 'Broadcast campus notices',
                    icon: Bell
                }
            ]
        },

        // 3. VOCATIONAL TRAINER CONSOLE
        {
            suiteTitle: 'Trainer Academic & Studio Suite',
            roles: ['ROLE_TRAINER'],
            items: [
                {
                    id: 'trainer-profile',
                    label: 'Faculty Profile',
                    desc: 'Personal details & studio lab',
                    icon: User
                },
                {
                    id: 'trainer-attendance',
                    label: 'Attendance & 75% Rule',
                    desc: 'Daily marker & lab attendance',
                    icon: CalendarCheck
                },
                {
                    id: 'trainer-courses',
                    label: 'Syllabus & Competency Rubric',
                    desc: 'Modules & 4-part skill grading',
                    icon: BookOpen
                },
                {
                    id: 'feedback-hub',
                    label: 'Skill Coaching & Feedback',
                    desc: 'Trainee coaching & lab reviews',
                    icon: Award
                },
                {
                    id: 'trainer-leaves',
                    label: 'Leave Management',
                    desc: 'Student & faculty leaves',
                    icon: Clock
                },
                {
                    id: 'trainer-students',
                    label: 'Enrolled Scholars',
                    desc: 'Scholar directory & progress',
                    icon: Users
                },
                {
                    id: 'trainer-notices',
                    label: 'Faculty Circulars',
                    desc: 'Administrative directives',
                    icon: Bell
                }
            ]
        },

        // 4. TRIBAL SCHOLAR / TRAINEE PORTAL
        {
            suiteTitle: 'Scholar Skill & Livelihood Portal',
            roles: ['ROLE_TRAINEE'],
            items: [
                {
                    id: 'trainee-profile',
                    label: 'Scholar Profile',
                    desc: 'Personal details & trade batch',
                    icon: User
                },
                {
                    id: 'trainee-training',
                    label: 'My Training & Lab Hours',
                    desc: 'NSQF curriculum & studio schedule',
                    icon: BookOpen
                },
                {
                    id: 'trainee-exams',
                    label: 'Competency & Trade Certificate',
                    desc: '4-part rubric & NSQF certificate',
                    icon: Award
                },
                {
                    id: 'trainee-attendance',
                    label: 'Attendance & Eligibility',
                    desc: 'Session logs & 75% requirement',
                    icon: CalendarCheck
                },
                {
                    id: 'trainee-stipend',
                    label: 'Stipends & DBT Ledger',
                    desc: 'Earn-While-Learn incentives',
                    icon: Coins
                },
                {
                    id: 'feedback-hub',
                    label: 'Feedback, Coaching & Placement',
                    desc: 'Rate course, trainer notes & OJT',
                    icon: Sliders
                },
                {
                    id: 'trainee-leaves',
                    label: 'Leave Applications',
                    desc: 'Apply & track leaves',
                    icon: Clock
                },
                {
                    id: 'trainee-notices',
                    label: 'Notice Board',
                    desc: 'Campus circulars & notices',
                    icon: Bell
                }
            ]
        }
    ];

    // Filter suites visible to current user
    const visibleSuites = navModules.filter((s) => s.roles.includes(userRole));

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
                    onClick={() => setIsOpen && setIsOpen(false)}
                />
            )}

            <aside
                className={`bg-white border-r border-slate-200 w-72 shrink-0 flex flex-col justify-between transition-all duration-200 z-30 select-none h-full ${
                    isOpen
                        ? 'fixed inset-y-0 left-0 shadow-2xl z-40 flex md:relative md:shadow-none'
                        : 'hidden md:flex'
                }`}
            >
                {/* Top Section with Independent Scroll */}
                <div className="flex flex-col flex-1 overflow-y-auto min-h-0">

                {/* Workspace Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#006837] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            <Layers size={16} />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-slate-800 leading-tight">Operations Workspace</h2>
                            <p className="text-[10px] text-slate-400 font-medium">KISS Vocational Training</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Live
                    </span>
                </div>

                {/* Navigation Suites */}
                <div className="p-3.5 space-y-4">
                    {visibleSuites.map((suite, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                            {/* Clean Single-Line Suite Header */}
                            <div className="px-2 pt-1 pb-1.5 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {suite.suiteTitle}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {suite.items.length} Modules
                                </span>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-1">
                                {suite.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                if (setIsOpen) setIsOpen(false); // Close mobile drawer on selection
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                                                isActive
                                                    ? 'bg-emerald-50 text-[#006837] font-bold border border-emerald-200 shadow-xs'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                                        isActive
                                                            ? 'bg-[#006837] text-white shadow-xs'
                                                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold leading-tight truncate">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-normal leading-tight truncate mt-0.5">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                                {item.id === 'production' && isAdmin && pendingApprovalCount > 0 && (
                                                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-md flex items-center gap-1">
                                                        <Bell size={10} className="fill-white" />
                                                        <span>{pendingApprovalCount}</span>
                                                    </span>
                                                )}
                                                <ChevronRight
                                                    size={14}
                                                    className={`transition-transform ${
                                                        isActive
                                                            ? 'text-[#006837] translate-x-0.5'
                                                            : 'text-slate-300 group-hover:text-slate-500'
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

            </div>

            {/* Bottom: User Card & System Status */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
                {/* Active User Information */}
                {currentUser && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2.5 shadow-xs">
                        <div className="w-8 h-8 rounded-full bg-[#fcb900] text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate leading-tight">
                                {currentUser.fullName || 'Authorized User'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                                {currentUser.collegeId || currentUser.email || userRole.replace('ROLE_', '')}
                            </p>
                        </div>
                    </div>
                )}

                {/* System & Backend Status Pill */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                            backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        <span>Backend: {backendStatus === 'online' ? 'Connected' : 'Offline'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">KV-TMS v1.0</span>
                </div>
            </div>
        </aside>
        </>
    );
}
