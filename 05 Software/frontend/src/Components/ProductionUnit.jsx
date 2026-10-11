import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Factory,
    Layers,
    PlusCircle,
    CheckCircle2,
    Clock,
    Scissors,
    Coins,
    PackageCheck,
    AlertTriangle,
    ShieldCheck,
    Check,
    X,
    Hourglass,
    AlertCircle,
    RefreshCw,
    Store,
    Filter,
    Search,
    UserCheck,
    Sparkles,
    FileText,
    ArrowRight,
    Warehouse,
    ShoppingCart,
    BrainCircuit,
    Pin,
    Megaphone,
    Bell,
    Users,
    Lock
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Comprehensive Vocational Workshop Configurations
const WORKSHOPS_CONFIG = [
    {
        id: 'ws-sewing',
        name: 'Workshop Lab #1 (Sewing & Textiles)',
        shortName: 'Sewing & Tailoring Lab #1',
        category: 'Textiles & Garments',
        productId: 1,
        sku: 'PRD-KURTI-01',
        productName: 'Handcrafted Cotton Kurti',
        batchPrefix: 'BATCH-2026-SEW',
        price: 650.0,
        incentive: 75.0,
        materials: [
            { name: 'Pure Cotton Fabric', code: 'MAT-RAW-001', req: '2.5 Meters / unit', stock: '350.0m', unitNum: 2.5, unitName: 'Meters', icon: Scissors, color: 'text-teal-600' },
            { name: 'Wooden Handicraft Buttons', code: 'MAT-RAW-002', req: '4 Pieces / unit', stock: '600 pcs', unitNum: 4, unitName: 'Pieces', icon: Layers, color: 'text-indigo-600' }
        ]
    },
    {
        id: 'ws-handloom',
        name: 'Workshop Lab #2 (Sambalpuri Handloom)',
        shortName: 'Tribal Handloom Workshop #2',
        category: 'Heritage Weaving',
        productId: 2,
        sku: 'PRD-SAM-02',
        productName: 'Sambalpuri Handloom Stole',
        batchPrefix: 'BATCH-2026-SAM',
        price: 1200.0,
        incentive: 180.0,
        materials: [
            { name: 'Handloom Silk Yarn', code: 'MAT-RAW-003', req: '0.8 Kg / unit', stock: '45.0 Kg', unitNum: 0.8, unitName: 'Kg', icon: Layers, color: 'text-amber-600' },
            { name: 'Organic Herbal Dyes', code: 'MAT-RAW-004', req: '0.5 Litres / unit', stock: '8.0 L', unitNum: 0.5, unitName: 'Litres', isLow: true, icon: Sparkles, color: 'text-purple-600' }
        ]
    },
    {
        id: 'ws-bamboo',
        name: 'Workshop Lab #3 (Bamboo & Handicraft Studio)',
        shortName: 'Bamboo & Woodcraft Studio #3',
        category: 'Eco-Artisan Crafts',
        productId: 3,
        sku: 'PRD-BAM-03',
        productName: 'Tribal Bamboo Table Lamp',
        batchPrefix: 'BATCH-2026-BAM',
        price: 850.0,
        incentive: 120.0,
        materials: [
            { name: 'Seasoned Bamboo Stalks', code: 'MAT-RAW-005', req: '3.0 Stalks / unit', stock: '120 pcs', unitNum: 3.0, unitName: 'Stalks', icon: Layers, color: 'text-emerald-600' },
            { name: 'Natural Lacquer & Varnish', code: 'MAT-RAW-006', req: '0.25 Litres / unit', stock: '25.0 L', unitNum: 0.25, unitName: 'Litres', icon: Sparkles, color: 'text-amber-600' },
            { name: 'Brass Fitting Fasteners', code: 'MAT-RAW-007', req: '6 Pieces / unit', stock: '400 pcs', unitNum: 6, unitName: 'Pieces', icon: Scissors, color: 'text-slate-600' }
        ]
    }
];

export default function ProductionUnit({ currentUser, onNavigateTab }) {
    // Safely determine Role
    let resolvedUser = currentUser;
    if (!resolvedUser) {
        try {
            resolvedUser = JSON.parse(localStorage.getItem('kvtms_user') || '{}');
        } catch (e) {}
    }
    const rawRole = (resolvedUser?.role || resolvedUser?.username || '').toUpperCase();
    const isAdmin = rawRole.includes('ADMIN') || rawRole.includes('ADM');
    const isProductionManager = !isAdmin && (rawRole.includes('PRODUCTION') || rawRole.includes('PRD'));

    // Tab state (Admin is strictly focused on Approvals & Clearances)
    const [viewMode, setViewMode] = useState(isAdmin ? 'admin-approval' : 'production-manager');

    useEffect(() => {
        if (isAdmin) {
            setViewMode('admin-approval');
        } else {
            setViewMode('production-manager');
        }
    }, [isAdmin]);

    // Data states
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalBatches: 0,
        inProgress: 0,
        pendingApproval: 0,
        approvedForSale: 0,
        totalUnitsProduced: 0
    });
    const [runs, setRuns] = useState([]);
    const [pendingRuns, setPendingRuns] = useState([]);
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [notification, setNotification] = useState(null);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Selected Workshop state
    const [selectedWorkshop, setSelectedWorkshop] = useState('Workshop Lab #1 (Sewing & Textiles)');
    const [selectedProductId, setSelectedProductId] = useState(1);
    const [batchCode, setBatchCode] = useState('BATCH-2026-SEW-003');
    const [targetQuantity, setTargetQuantity] = useState('10');
    const [batchRemarks, setBatchRemarks] = useState('');
    const [submittingBatch, setSubmittingBatch] = useState(false);

    // Dynamic workshops and courses loaded from backend
    const [workshopsList, setWorkshopsList] = useState([]);
    const [pendingWorkshops, setPendingWorkshops] = useState([]);
    const [coursesList, setCoursesList] = useState([]);

    // Propose New Workshop Modal state (for Production Manager)
    const [proposeModalOpen, setProposeModalOpen] = useState(false);
    const [proposingWorkshop, setProposingWorkshop] = useState(false);
    const [workshopForm, setWorkshopForm] = useState({
        name: '',
        shortName: '',
        category: 'Heritage Craft & Tribal Arts',
        courseId: 2,
        productName: '',
        sku: '',
        batchPrefix: '',
        sellingPrice: '950',
        incentiveRate: '150',
        bomSummary: '',
        proposalRemarks: ''
    });

    // Completion Modal state (for Production Manager)
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [batchToComplete, setBatchToComplete] = useState(null);
    const [completedQty, setCompletedQty] = useState(10);
    const [completionSubmitting, setCompletionSubmitting] = useState(false);

    // Rejection Modal state (for Admin)
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [batchToReject, setBatchToReject] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [rejectSubmitting, setRejectSubmitting] = useState(false);

    // Official Production Bulletins & Notices from Admin
    const [productionNotices, setProductionNotices] = useState([]);

    // Dynamic enrolled trainees from user registry & live database
    const [traineesList, setTraineesList] = useState(() => {
        try {
            const saved = localStorage.getItem('kvtms_user_registry');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.filter(u =>
                    (u.role || '').toUpperCase().includes('TRAINEE')
                );
            }
        } catch (e) {}
        return [];
    });

    const enrolledTrainees = traineesList;

    // Multi-artisan selection for batch assignment
    const [selectedTrainees, setSelectedTrainees] = useState([]);

    // Helper: Identify if a trainee is already allotted to an active/in-progress batch
    const getActiveBatchForTrainee = (username) => {
        if (!username || !runs || runs.length === 0) return null;
        return runs.find(r => {
            // Only batches actively running lock the artisans
            if (r.status !== 'IN_PROGRESS' && r.status !== 'PLANNED') return false;

            // 1. Direct assignedScholars array on batch run
            if (Array.isArray(r.assignedScholars)) {
                if (r.assignedScholars.includes(username)) return true;
                if (r.assignedScholars.some(s => (s.username || s.collegeId || s) === username)) return true;
            }

            // 2. kvtms_batch_scholars in localStorage
            try {
                const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
                const bInfo = batchMap[r.batchNumber];
                if (bInfo && Array.isArray(bInfo.trainees)) {
                    if (bInfo.trainees.some(t => (t.username || t.collegeId || t) === username)) return true;
                }
            } catch (e) {}

            // 3. String matches in remarks
            if (r.remarks && (r.remarks.includes(username) || r.remarks.includes(`(${username})`))) return true;
            const tObj = traineesList.find(t => t.username === username);
            if (tObj && r.remarks && r.remarks.includes(tObj.name)) return true;

            return false;
        });
    };

    // Toggle multi-trainee selection
    const toggleTrainee = (username) => {
        setSelectedTrainees(prev => 
            prev.includes(username) 
                ? prev.filter(u => u !== username) 
                : [...prev, username]
        );
    };

    // Helper: Retrieve assigned team members for a given batch run
    const getBatchTeamMembers = (batch) => {
        if (!batch) return [];
        try {
            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            const bInfo = batchMap[batch.batchNumber];
            if (bInfo && Array.isArray(bInfo.trainees) && bInfo.trainees.length > 0) {
                return bInfo.trainees;
            }
        } catch (e) {}

        if (Array.isArray(batch.assignedScholars) && batch.assignedScholars.length > 0) {
            return batch.assignedScholars.map(u => {
                const username = typeof u === 'string' ? u : (u.username || u.name);
                const found = traineesList.find(t => t.username === username || t.collegeId === username);
                return {
                    username,
                    name: found?.name || found?.fullName || username,
                    collegeId: found?.collegeId || username,
                    id: found?.id
                };
            });
        }

        if (batch.remarks) {
            const found = traineesList.filter(t => batch.remarks.includes(t.name) || batch.remarks.includes(t.username));
            if (found.length > 0) {
                return found.map(t => ({
                    username: t.username,
                    name: t.name,
                    collegeId: t.collegeId || t.username,
                    id: t.id
                }));
            }
        }

        if (traineesList.length > 0) {
            return [{
                username: traineesList[0].username,
                name: traineesList[0].name,
                collegeId: traineesList[0].collegeId || traineesList[0].username,
                id: traineesList[0].id
            }];
        }
        return [];
    };

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Helper: Lookup live raw material stock from database
    const getLiveMaterial = (matName) => {
        if (!rawMaterials || rawMaterials.length === 0 || !matName) return null;
        const normalized = matName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return rawMaterials.find(rm => {
            const rmNorm = (rm.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return rmNorm.includes(normalized) || normalized.includes(rmNorm);
        });
    };

    // Load initial data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 0. Sync fresh trainees list from auth users
            try {
                const usersRes = await axios.get(`${API_BASE_URL}/auth/users`);
                if (usersRes.data && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
                    const freshTrainees = usersRes.data.filter(u => (u.role || '').toUpperCase().includes('TRAINEE'));
                    if (freshTrainees.length > 0) {
                        setTraineesList(freshTrainees);
                    }
                }
            } catch (uErr) {}

            // 1. Summary Report
            const summaryRes = await axios.get(`${API_BASE_URL}/production/reports/summary`);
            if (summaryRes.data) {
                setSummary(summaryRes.data);
            }

            // 2. All Runs (Enriched with assigned scholars from local registry)
            const runsRes = await axios.get(`${API_BASE_URL}/production/runs`);
            if (runsRes.data && Array.isArray(runsRes.data)) {
                try {
                    const savedBatchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
                    const enriched = runsRes.data.map(r => {
                        const local = savedBatchMap[r.batchNumber];
                        return {
                            ...r,
                            assignedScholars: r.assignedScholars || (local?.trainees ? local.trainees.map(t => t.username || t) : [])
                        };
                    });
                    setRuns(enriched);
                } catch (e) {
                    setRuns(runsRes.data);
                }
            }

            // 3. Pending Approval Runs (Enriched from API + localStorage)
            let pendingRunsList = [];
            try {
                const pendingRes = await axios.get(`${API_BASE_URL}/production/runs/pending-approval`);
                if (pendingRes.data && Array.isArray(pendingRes.data)) {
                    pendingRunsList = pendingRes.data;
                }
            } catch (err) {}

            try {
                const savedBatchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
                const localStipends = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
                
                // Merge pending stipends
                localStipends.filter(s => (s.status || '').toUpperCase().includes('PENDING')).forEach(st => {
                    const alreadyExists = pendingRunsList.some(r => r.id === st.runId || r.batchNumber === st.batchNumber);
                    if (!alreadyExists) {
                        pendingRunsList.push({
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

                const enriched = pendingRunsList.map(r => {
                    const local = savedBatchMap[r.batchNumber];
                    return {
                        ...r,
                        assignedScholars: r.assignedScholars || (local?.trainees ? local.trainees.map(t => t.username || t) : [])
                    };
                });
                setPendingRuns(enriched);
            } catch (e) {
                setPendingRuns(pendingRunsList);
            }

            // 4. Products
            const prodRes = await axios.get(`${API_BASE_URL}/production/products`);
            if (prodRes.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
                setProducts(prodRes.data);
                if (!selectedProductId) setSelectedProductId(prodRes.data[0].id);
            }

            // 5. Raw Materials (Live Stock)
            const matRes = await axios.get(`${API_BASE_URL}/production/raw-materials`);
            if (matRes.data && Array.isArray(matRes.data)) {
                setRawMaterials(matRes.data);
            }

            // 6. Active Workshops from Backend
            try {
                const wsRes = await axios.get(`${API_BASE_URL}/production/workshops/active`);
                if (wsRes.data && Array.isArray(wsRes.data) && wsRes.data.length > 0) {
                    const mapped = wsRes.data.map(w => {
                        const existing = WORKSHOPS_CONFIG.find(item => item.sku === w.sku || item.name === w.name);
                        if (existing) {
                            return {
                                ...existing,
                                id: `ws-${w.id}`,
                                dbId: w.id,
                                name: w.name,
                                shortName: w.shortName || w.name,
                                category: w.category || existing.category,
                                productName: w.productName,
                                sku: w.sku,
                                batchPrefix: w.batchPrefix || existing.batchPrefix,
                                price: w.sellingPrice || existing.price,
                                incentive: w.incentiveRate || existing.incentive,
                                bomSummary: w.bomSummary || existing.bomSummary
                            };
                        }
                        return {
                            id: `ws-${w.id}`,
                            dbId: w.id,
                            name: w.name,
                            shortName: w.shortName || w.name,
                            category: w.category || 'Specialized Craft Studio',
                            productId: w.productId || (w.course?.id ? w.course.id + 10 : w.id + 10),
                            sku: w.sku || `PRD-WS-${w.id}`,
                            productName: w.productName || w.name,
                            batchPrefix: w.batchPrefix || `BATCH-2026-W${w.id}`,
                            price: w.sellingPrice || 850.0,
                            incentive: w.incentiveRate || 120.0,
                            bomSummary: w.bomSummary || 'Raw materials allocated by lab supervisor',
                            materials: [
                                {
                                    name: w.bomSummary ? w.bomSummary.split('+')[0].trim() : 'Artisan Craft Stock',
                                    code: `MAT-WS-${w.id}`,
                                    req: '1.0 unit / pc',
                                    stock: '50 units',
                                    unitNum: 1.0,
                                    unitName: 'units',
                                    icon: Layers,
                                    color: 'text-indigo-600'
                                }
                            ]
                        };
                    });
                    setWorkshopsList(mapped);
                }
            } catch (wsErr) {
                console.warn("Could not fetch active workshops from backend, using presets:", wsErr.message);
            }

            // 7. Pending Workshops from Backend
            try {
                const pendWsRes = await axios.get(`${API_BASE_URL}/production/workshops/pending`);
                if (pendWsRes.data && Array.isArray(pendWsRes.data)) {
                    setPendingWorkshops(pendWsRes.data);
                }
            } catch (pWsErr) {
                console.warn("Could not fetch pending workshops:", pWsErr.message);
            }

            // 8. Courses for Proposal Modal
            try {
                const coursesRes = await axios.get(`${API_BASE_URL}/academics/courses/detailed`);
                if (coursesRes.data && Array.isArray(coursesRes.data)) {
                    setCoursesList(coursesRes.data);
                }
            } catch (cErr) {
                console.warn("Could not fetch detailed courses:", cErr.message);
            }

            // 9. Official Production Notices & Circulars from Admin
            try {
                const noticeRes = await axios.get(`${API_BASE_URL}/notices/audience/PRODUCTION`);
                if (noticeRes.data && Array.isArray(noticeRes.data)) {
                    setProductionNotices(noticeRes.data);
                }
            } catch (nErr) {
                console.warn("Could not fetch production notices:", nErr.message);
            }

        } catch (err) {
            console.warn("Backend production data fetch notice:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Workshop and Product synchronization
    const currentWorkshop = workshopsList.find(w => w.name === selectedWorkshop) ||
        workshopsList.find(w => w.productId === Number(selectedProductId)) ||
        workshopsList[0] || WORKSHOPS_CONFIG[0];

    const currentProduct = products.find(p => p.id === Number(selectedProductId)) || {
        id: currentWorkshop.productId,
        name: currentWorkshop.productName,
        sku: currentWorkshop.sku,
        sellingPrice: currentWorkshop.price,
        incentiveRatePerUnit: currentWorkshop.incentive
    };

    // Handler when user selects a workshop from the dropdown
    const handleWorkshopChange = (wsName) => {
        setSelectedWorkshop(wsName);
        const ws = workshopsList.find(w => w.name === wsName) || workshopsList[0];
        setSelectedProductId(ws.productId);
        
        // Auto-generate next batch code for this specific workshop
        const matchingRuns = runs.filter(r => (r.batchNumber || '').includes(ws.batchPrefix));
        const nextSeq = String(matchingRuns.length + 1).padStart(3, '0');
        setBatchCode(`${ws.batchPrefix}-${nextSeq}`);
    };

    // Handler when user selects a product from the BOM card dropdown
    const handleProductChange = (prodId) => {
        const idNum = Number(prodId);
        setSelectedProductId(idNum);
        const ws = workshopsList.find(w => w.productId === idNum);
        if (ws) {
            setSelectedWorkshop(ws.name);
            const matchingRuns = runs.filter(r => (r.batchNumber || '').includes(ws.batchPrefix));
            const nextSeq = String(matchingRuns.length + 1).padStart(3, '0');
            setBatchCode(`${ws.batchPrefix}-${nextSeq}`);
        }
    };

    // Propose New Workshop (Production Manager)
    const handleProposeWorkshop = async (e) => {
        e.preventDefault();
        if (!workshopForm.name.trim() || !workshopForm.productName.trim()) {
            showToast('Please provide both Workshop Name and Target Product Name.', 'warning');
            return;
        }

        setProposingWorkshop(true);
        try {
            const payload = {
                name: workshopForm.name.trim(),
                shortName: workshopForm.shortName.trim() || workshopForm.name.trim(),
                category: workshopForm.category.trim() || 'Vocational Craft Studio',
                courseId: Number(workshopForm.courseId) || 2,
                productName: workshopForm.productName.trim(),
                sku: workshopForm.sku.trim().toUpperCase() || `PRD-WS-${Date.now().toString().slice(-4)}`,
                batchPrefix: workshopForm.batchPrefix.trim().toUpperCase() || `BATCH-2026-WS`,
                sellingPrice: parseFloat(workshopForm.sellingPrice) || 600.0,
                incentiveRate: parseFloat(workshopForm.incentiveRate) || 80.0,
                bomSummary: workshopForm.bomSummary.trim() || 'Standard artisanal raw material kit',
                proposalRemarks: workshopForm.proposalRemarks.trim() || 'Proposed new vocational lab line'
            };

            await axios.post(`${API_BASE_URL}/production/workshops/propose`, payload);
            showToast(`Proposal for "${workshopForm.name}" submitted! Awaiting Administrative Quality Approval.`, 'success');
            setProposeModalOpen(false);
            setWorkshopForm({
                name: '',
                shortName: '',
                category: 'Heritage Craft & Tribal Arts',
                courseId: 2,
                productName: '',
                sku: '',
                batchPrefix: '',
                sellingPrice: '950',
                incentiveRate: '150',
                bomSummary: '',
                proposalRemarks: ''
            });
            fetchData();
        } catch (err) {
            console.error("Workshop proposal error:", err);
            showToast(err.response?.data?.message || 'Failed to submit workshop proposal.', 'error');
        } finally {
            setProposingWorkshop(false);
        }
    };

    // Approve Workshop (Admin Exclusive)
    const handleApproveWorkshop = async (workshopId, wsName) => {
        try {
            await axios.put(`${API_BASE_URL}/production/workshops/${workshopId}/approve?remarks=Approved+by+University+Administration`);
            showToast(`Workshop "${wsName}" Approved & Activated! It is now available across Production, Warehouses & POS.`, 'success');
            fetchData();
        } catch (err) {
            console.error("Approve workshop error:", err);
            showToast('Failed to approve workshop.', 'error');
        }
    };

    // Reject Workshop Proposal (Admin Exclusive)
    const handleRejectWorkshop = async (workshopId, wsName) => {
        try {
            await axios.put(`${API_BASE_URL}/production/workshops/${workshopId}/reject?remarks=Proposal+declined+by+Administration`);
            showToast(`Workshop proposal "${wsName}" declined.`, 'warning');
            fetchData();
        } catch (err) {
            console.error("Reject workshop error:", err);
            showToast('Failed to reject workshop proposal.', 'error');
        }
    };

    // Clean numeric quantity & Dynamic estimations
    const qtyNum = parseInt(targetQuantity, 10) || 0;
    const estimatedHours = Math.round(qtyNum * 1.8);
    const estimatedDays = Math.max(1, Math.ceil(estimatedHours / 8));
    const recommendedTeamSize = Math.max(1, Math.ceil(qtyNum / 4));

    const currentIncentiveRate = currentWorkshop?.incentive || (currentProduct?.incentiveRatePerUnit || 75.0);
    const totalStipendPool = qtyNum * currentIncentiveRate;
    const stipendPerScholar = selectedTrainees.length > 0 
        ? (totalStipendPool / selectedTrainees.length).toFixed(2) 
        : totalStipendPool.toFixed(2);

    // Launch Batch (Production Manager)
    const handleLaunchBatch = async (e) => {
        e.preventDefault();
        const quantityToLaunch = parseInt(targetQuantity, 10);
        if (!quantityToLaunch || quantityToLaunch < 1) {
            showToast('Please enter a valid target quantity (at least 1 unit).', 'warning');
            return;
        }

        if (selectedTrainees.length === 0) {
            showToast('Please select at least 1 available apprentice team member for this batch.', 'warning');
            return;
        }

        // Verify none of the selected members are busy
        const busySelected = selectedTrainees.filter(u => getActiveBatchForTrainee(u));
        if (busySelected.length > 0) {
            showToast('One or more selected scholars are currently allotted to an active batch.', 'error');
            return;
        }

        setSubmittingBatch(true);

        const teamDetails = selectedTrainees.map(u => {
            const t = traineesList.find(tr => tr.username === u || tr.collegeId === u);
            return {
                username: u,
                name: t?.name || t?.fullName || u,
                collegeId: t?.collegeId || u,
                id: t?.id
            };
        });

        const teamNamesStr = teamDetails.map(t => `${t.name} (${t.username})`).join(', ');

        // Save into local batch-scholars registry
        try {
            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            batchMap[batchCode.trim()] = {
                batchNumber: batchCode.trim(),
                productName: currentProduct.name,
                workshop: currentWorkshop.shortName,
                targetQuantity: quantityToLaunch,
                trainees: teamDetails,
                status: 'IN_PROGRESS',
                launchedAt: new Date().toISOString()
            };
            localStorage.setItem('kvtms_batch_scholars', JSON.stringify(batchMap));
        } catch (e) {}

        try {
            const payload = {
                productId: currentProduct.id,
                batchNumber: batchCode.trim(),
                targetQuantity: quantityToLaunch,
                remarks: `Assigned Team (${teamDetails.length}): ${teamNamesStr}. Workshop: ${currentWorkshop.shortName}`
            };

            const res = await axios.post(`${API_BASE_URL}/production/runs/start`, payload);
            showToast(`Batch ${batchCode} launched with ${teamDetails.length} scholars! Materials deducted from warehouse.`, 'success');
            
            setSelectedTrainees([]);
            // Advance batch code for this workshop
            const matchingRuns = runs.filter(r => (r.batchNumber || '').includes(currentWorkshop.batchPrefix));
            const nextSeq = String(matchingRuns.length + 2).padStart(3, '0');
            setBatchCode(`${currentWorkshop.batchPrefix}-${nextSeq}`);
            setBatchRemarks('');
            fetchData();
        } catch (err) {
            console.error("Batch launch error:", err);
            // Local fallback simulation
            const newBatch = {
                id: runs.length + 10,
                batchNumber: batchCode,
                product: currentProduct,
                targetQuantity: quantityToLaunch,
                completedQuantity: 0,
                status: 'IN_PROGRESS',
                startDate: new Date().toISOString().split('T')[0],
                assignedScholars: selectedTrainees,
                remarks: `Assigned Team (${teamDetails.length}): ${teamNamesStr}. Workshop: ${currentWorkshop.shortName}`
            };
            setRuns([newBatch, ...runs]);
            showToast(`Batch ${batchCode} initialized locally with ${teamDetails.length} scholars. Materials locked.`, 'success');
            setSelectedTrainees([]);
            const matchingRuns = runs.filter(r => (r.batchNumber || '').includes(currentWorkshop.batchPrefix));
            const nextSeq = String(matchingRuns.length + 2).padStart(3, '0');
            setBatchCode(`${currentWorkshop.batchPrefix}-${nextSeq}`);
        } finally {
            setSubmittingBatch(false);
        }
    };

    // Complete Batch and Submit for Admin Approval & Stipend Clearance
    const handleOpenCompleteModal = (run) => {
        setBatchToComplete(run);
        setCompletedQty(run.targetQuantity || 10);
        setCompleteModalOpen(true);
    };

    const handleConfirmComplete = async () => {
        if (!batchToComplete) return;
        setCompletionSubmitting(true);

        const teamMembers = getBatchTeamMembers(batchToComplete);
        const incentiveRate = batchToComplete.product?.incentiveRatePerUnit || currentWorkshop.incentive || 75.0;
        const finalQty = Number(completedQty);
        const totalStipend = finalQty * incentiveRate;
        const perScholarAmount = teamMembers.length > 0 ? Number((totalStipend / teamMembers.length).toFixed(2)) : totalStipend;

        const contributorsPayload = teamMembers.map(m => ({
            traineeId: m.id || 1,
            unitsCrafted: teamMembers.length > 0 ? Math.max(1, Math.round(finalQty / teamMembers.length)) : finalQty
        }));

        const stipendReport = {
            id: `STIPEND-${batchToComplete.id || Date.now()}`,
            runId: batchToComplete.id,
            batchNumber: batchToComplete.batchNumber,
            productName: batchToComplete.product?.name || currentProduct.name,
            workshop: currentWorkshop.shortName,
            completedQuantity: finalQty,
            ratePerUnit: incentiveRate,
            totalStipendPool: totalStipend,
            stipendPerScholar: perScholarAmount,
            teamMembers: teamMembers.map(m => ({
                username: m.username,
                name: m.name,
                collegeId: m.collegeId || m.username,
                unitsCrafted: teamMembers.length > 0 ? Number((finalQty / teamMembers.length).toFixed(1)) : finalQty,
                amount: perScholarAmount
            })),
            status: 'PENDING_ADMIN_APPROVAL',
            submittedAt: new Date().toISOString()
        };

        try {
            const existingReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
            const updatedReqs = [stipendReport, ...existingReqs.filter(r => r.batchNumber !== batchToComplete.batchNumber && r.runId !== batchToComplete.id)];
            localStorage.setItem('kvtms_stipend_requests', JSON.stringify(updatedReqs));

            const batchMap = JSON.parse(localStorage.getItem('kvtms_batch_scholars') || '{}');
            if (batchMap[batchToComplete.batchNumber]) {
                batchMap[batchToComplete.batchNumber].status = 'PENDING_APPROVAL';
                localStorage.setItem('kvtms_batch_scholars', JSON.stringify(batchMap));
            }
        } catch (e) {}

        try {
            const payload = {
                completedQuantity: finalQty,
                contributors: contributorsPayload
            };

            await axios.put(`${API_BASE_URL}/production/runs/${batchToComplete.id}/complete`, payload);
            showToast(`Batch ${batchToComplete.batchNumber} completed! Stipend report of ₹${totalStipend.toFixed(2)} submitted to Admin for approval.`, 'success');
            setCompleteModalOpen(false);
            setBatchToComplete(null);
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
            fetchData();
        } catch (err) {
            console.error("Complete error:", err);
            // Local fallback update
            setRuns(runs.map(r => r.id === batchToComplete.id ? {
                ...r,
                completedQuantity: finalQty,
                status: 'PENDING_APPROVAL',
                completionDate: new Date().toISOString().split('T')[0]
            } : r));
            showToast(`Batch ${batchToComplete.batchNumber} completed! Stipend report of ₹${totalStipend.toFixed(2)} submitted to Admin for approval.`, 'success');
            setCompleteModalOpen(false);
            setBatchToComplete(null);
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
        } finally {
            setCompletionSubmitting(false);
        }
    };

    // Approve Batch for Sale / POS & Disburse Student Stipends via DBT (Admin Exclusive)
    const handleApproveBatch = async (runId, batchNum) => {
        const dbtRef = `DBT-KISS-${Date.now()}`;
        const nowIso = new Date().toISOString();

        // 1. Update kvtms_stipend_requests
        let approvedPool = 0;
        try {
            const existingReqs = JSON.parse(localStorage.getItem('kvtms_stipend_requests') || '[]');
            const updatedReqs = existingReqs.map(req => {
                if (req.runId === runId || req.batchNumber === batchNum) {
                    approvedPool = req.totalStipendPool;
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

        try {
            await axios.put(`${API_BASE_URL}/production/runs/${runId}/approve`);
            try {
                await axios.put(`${API_BASE_URL}/incentives/batches/${runId}/disburse?txRef=${encodeURIComponent(dbtRef)}`);
            } catch (incErr) {
                console.log("Incentive disburse note:", incErr);
            }
            showToast(`Batch ${batchNum} Approved & Student Stipend disbursed via DBT (${dbtRef})!`, 'success');
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
            fetchData();
        } catch (err) {
            console.error("Approve error:", err);
            // Local fallback update
            setRuns(runs.map(r => r.id === runId ? { ...r, status: 'APPROVED_FOR_SALE' } : r));
            setPendingRuns(pendingRuns.filter(r => r.id !== runId));
            showToast(`Batch ${batchNum} Approved & Student Stipend disbursed via DBT (${dbtRef})!`, 'success');
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
        }
    };

    // Open Reject Modal (Admin Exclusive)
    const handleOpenRejectModal = (run) => {
        setBatchToReject(run);
        setRejectRemarks('Requires thread trim inspection & QA redo.');
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!batchToReject) return;
        setRejectSubmitting(true);

        try {
            await axios.put(`${API_BASE_URL}/production/runs/${batchToReject.id}/reject?remarks=${encodeURIComponent(rejectRemarks)}`);
            showToast(`Batch ${batchToReject.batchNumber} rejected with remark: "${rejectRemarks}".`, 'warning');
            setRejectModalOpen(false);
            setBatchToReject(null);
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
            fetchData();
        } catch (err) {
            console.error("Reject error:", err);
            setRuns(runs.map(r => r.id === batchToReject.id ? { ...r, status: 'REJECTED', remarks: rejectRemarks } : r));
            setPendingRuns(pendingRuns.filter(r => r.id !== batchToReject.id));
            showToast(`Batch ${batchToReject.batchNumber} marked REJECTED.`, 'warning');
            setRejectModalOpen(false);
            setBatchToReject(null);
            try {
                window.dispatchEvent(new Event('kvtms_batch_updated'));
            } catch (e) {}
        } finally {
            setRejectSubmitting(false);
        }
    };

    // Filter runs for table
    const filteredRuns = runs.filter(run => {
        const matchesSearch =
            (run.batchNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (run.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (run.remarks || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">

            {/* Notification Toast */}
            {notification && (
                <div className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between transition-all ${
                    notification.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : notification.type === 'warning'
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-amber-600" />}
                        <span>{notification.message}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Top Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            isAdmin
                                ? 'bg-emerald-100 text-[#006837] border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                            {isAdmin ? <ShieldCheck size={13} /> : <Factory size={13} />}
                            {isAdmin ? 'University Administration • Clearance & Approval Desk' : 'Production Manager Console'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-bold">
                            Increment 3: BOM & Manufacturing
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                        {isAdmin
                            ? 'Admin Batch Clearance & Student Stipend Approval Desk'
                            : 'Production Unit & Shop Floor Controller'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                        {isAdmin
                            ? 'Institutional Governance Desk: University Admin receives notifications to verify completed artisan production batches submitted by the Production Manager, inspect apprentice team stipend reports, and disburse student stipends via Direct Benefit Transfer (DBT).'
                            : 'Manage artisan manufacturing lines, allocate Bill of Materials (BOM) stock, assign apprentice team scholars, and submit finished batches to University Administration for sale clearance.'}
                    </p>
                </div>

                {/* Right Header Status */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {isAdmin ? (
                        <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 shadow-xs">
                            <ShieldCheck size={16} className="text-[#006837]" />
                            <span>Approvals Desk</span>
                            {(pendingRuns.length + pendingWorkshops.length) > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                    {pendingRuns.length + pendingWorkshops.length} Pending
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
                            <Factory size={16} className="text-amber-700" />
                            <span>Shop Floor Workshop Controller</span>
                        </div>
                    )}

                    <button
                        onClick={fetchData}
                        title="Sync with Backend"
                        className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition flex items-center justify-center"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin text-[#006837]" : ""} />
                    </button>
                </div>
            </div>

            {/* KPI Executive Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Total Batches</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalBatches || runs.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Manufacturing runs</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                    <p className="text-[11px] font-bold text-amber-700 uppercase">In Production</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">
                        {summary.inProgress || runs.filter(r => r.status === 'IN_PROGRESS').length}
                    </p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Active shop floor</p>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden">
                    <p className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                        Pending Approval
                        {pendingRuns.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                    </p>
                    <p className="text-2xl font-black text-rose-900 mt-1">
                        {pendingRuns.length || summary.pendingApproval || 0}
                    </p>
                    <p className="text-[10px] text-rose-700 mt-0.5">Awaiting Admin sign-off</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase">Approved for Sale</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">
                        {summary.approvedForSale || runs.filter(r => r.status === 'APPROVED_FOR_SALE').length}
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Stocked in POS</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-[11px] font-bold text-indigo-700 uppercase">Units Completed</p>
                    <p className="text-2xl font-black text-indigo-900 mt-1">{summary.totalUnitsProduced ?? 0}</p>
                    <p className="text-[10px] text-indigo-700 mt-0.5">Artisan finished goods</p>
                </div>
            </div>

            {/* Official Production Bulletins & Directives from Administration */}
            {productionNotices.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                                <Megaphone size={16} />
                            </span>
                            <h3 className="font-bold text-slate-800 text-sm">Official Production Bulletins & Workshop Advisories</h3>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {productionNotices.length} {productionNotices.length === 1 ? 'Bulletin' : 'Bulletins'}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Pin size={12} className="text-amber-500" /> Executive Directives
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {productionNotices.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-3.5 rounded-lg border transition ${
                                    n.pinned 
                                        ? 'bg-amber-50/20 border-amber-300 ring-1 ring-amber-200/50' 
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                            n.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                                            n.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' :
                                            'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {n.priority || 'NORMAL'}
                                        </span>
                                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold uppercase">
                                            {n.category || 'OPERATIONS'}
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
                                <h4 className="text-xs font-bold text-slate-900 mb-1">{n.title}</h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed">{n.content}</p>
                                <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Issued by: <strong className="text-slate-600">{n.postedBy || 'University Administration'}</strong></span>
                                    <span className="text-amber-800 font-semibold font-mono">{n.targetAudience}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: ADMIN COMMERCIAL APPROVAL & CLEARANCE QUEUE (When in Admin Mode)   */}
            {/* ========================================================================= */}
            {isAdmin && (
                <div className="space-y-6">
                    {/* Admin Policy Notice */}
                    <div className="bg-emerald-900 text-white p-4 rounded-xl shadow flex items-start gap-3">
                        <ShieldCheck size={22} className="text-[#fcb900] shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <h4 className="font-bold text-sm text-yellow-300">
                                Administrative Quality Assurance & Sales Clearance Policy
                            </h4>
                            <p className="text-emerald-100 mt-1 leading-relaxed">
                                Under institutional governance, only university administration can grant commercial sale clearance.
                                Batches submitted by Production Manager <strong>Er. B. K. Jena (KISS-PRD-001)</strong> require verification of
                                raw material reconciliation and artisan stipend eligibility before items are made available on the Point of Sale (POS) system.
                            </p>
                        </div>
                    </div>

                    {/* Pending Approval Notification Banner for Admin */}
                    {pendingRuns.length > 0 && (
                        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-xl p-4 shadow-md flex items-center justify-between gap-3 animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <Hourglass size={20} className="text-yellow-200 animate-pulse shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">
                                        🔔 {pendingRuns.length} Production Batch{pendingRuns.length > 1 ? 'es' : ''} Awaiting Your Clearance & Stipend Sign-off
                                    </p>
                                    <p className="text-xs text-amber-100">
                                        Review the apprentice team stipend calculations below and click "Approve Batch & Disburse Stipend (DBT)".
                                    </p>
                                </div>
                            </div>
                            <span className="bg-white text-amber-900 font-extrabold text-xs px-3 py-1 rounded-lg shrink-0">
                                Action Required
                            </span>
                        </div>
                    )}

                    {/* Pending Approval Cards Queue */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Hourglass size={20} className="text-amber-500" />
                                    Commercial Approval Queue (Finished Batches Awaiting Admin Sign-off)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Review finished product batches and approve them to transfer inventory to Sales POS for commercial retail.
                                </p>
                            </div>
                            <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full font-bold">
                                {pendingRuns.length} Batches Awaiting Action
                            </span>
                        </div>

                        {pendingRuns.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-3" />
                                <h4 className="font-bold text-slate-800 text-base">All Batches Reviewed & Cleared!</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                    There are currently no finished batches waiting for admin commercial approval. All submitted goods have been reviewed and released for retail sale.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingRuns.map((run) => {
                                    const productName = run.product?.name || 'Handcrafted Artisan Item';
                                    const productSku = run.product?.sku || 'PRD-ART-01';
                                    const price = run.product?.sellingPrice || 650.0;
                                    const incentive = run.product?.incentiveRatePerUnit || 75.0;
                                    const qty = run.completedQuantity || run.targetQuantity || 1;
                                    const totalValue = qty * price;
                                    const totalIncentive = qty * incentive;

                                    return (
                                        <div
                                            key={run.id}
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
                                                        <Clock size={12} /> PENDING APPROVAL
                                                    </span>
                                                </div>

                                                <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-slate-500">Completed Qty:</span>
                                                        <p className="font-bold text-slate-900 text-sm">{qty} Units</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Commercial POS Value:</span>
                                                        <p className="font-bold text-emerald-700 text-sm">₹{totalValue.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Artisan Stipend Pool:</span>
                                                        <p className="font-bold text-amber-800">₹{totalIncentive.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Completion Date:</span>
                                                        <p className="font-semibold text-slate-700">{run.completionDate || 'Recent'}</p>
                                                    </div>
                                                </div>

                                                {run.remarks && (
                                                    <div className="mb-3 text-xs bg-amber-50 text-amber-900 p-2.5 rounded border border-amber-200 italic">
                                                        <strong>Supervisor Note:</strong> "{run.remarks}"
                                                    </div>
                                                )}

                                                {/* Apprentice Artisan Team Stipend Breakdown */}
                                                {(() => {
                                                    const team = getBatchTeamMembers(run);
                                                    const perScholar = team.length > 0 ? (totalIncentive / team.length).toFixed(2) : totalIncentive.toFixed(2);
                                                    if (team.length === 0) return null;
                                                    return (
                                                        <div className="mb-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                                                            <p className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                                                                <Coins size={13} className="text-amber-600" />
                                                                Apprentice Team Stipend Report ({team.length} Scholars):
                                                            </p>
                                                            <div className="space-y-1">
                                                                {team.map((m, idx) => (
                                                                    <div key={idx} className="flex justify-between text-slate-700">
                                                                        <span>• {m.name} <span className="text-[10px] text-slate-500 font-mono">({m.username})</span></span>
                                                                        <span className="font-bold text-emerald-800 font-mono">₹{perScholar}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-1.5 pt-1 border-t border-emerald-200 flex justify-between font-bold text-emerald-900 text-[11px]">
                                                                <span>Total Disbursable via DBT:</span>
                                                                <span className="font-mono">₹{totalIncentive.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Action Buttons for Admin */}
                                            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApproveBatch(run.id, run.batchNumber)}
                                                    className="flex-1 bg-[#006837] hover:bg-[#004d28] text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
                                                >
                                                    <Check size={14} /> Approve Batch & Disburse Stipend (DBT)
                                                </button>
                                                <button
                                                    onClick={() => handleOpenRejectModal(run)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                                                >
                                                    <X size={14} /> Reject / Rework
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Active Workshop Proposals Queue for Admin Quality Review */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Factory size={20} className="text-[#006837]" />
                                    Active Workshop Proposals & Studio Expansion Requests
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Review proposals submitted by the Production Manager for establishing new vocational production studios. Approved workshops immediately activate across shop floor scheduling, warehouses, and POS sales.
                                </p>
                            </div>
                            <span className="bg-emerald-100 text-[#006837] text-xs px-3 py-1 rounded-full font-bold">
                                {pendingWorkshops.length} Proposals Awaiting Action
                            </span>
                        </div>

                        {pendingWorkshops.length === 0 ? (
                            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-2" />
                                <h4 className="font-bold text-slate-800 text-sm">All Workshop Proposals Cleared!</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                    There are currently no vocational workshops waiting for administrative authorization. All proposed studios are active.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingWorkshops.map((ws) => (
                                    <div
                                        key={ws.id}
                                        className="bg-white border-2 border-emerald-300 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-mono text-xs font-bold text-[#006837] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                                        {ws.shortName || ws.name}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 text-base mt-2">
                                                        {ws.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                        Category: <strong className="text-slate-800">{ws.category}</strong>
                                                    </p>
                                                    {ws.course && (
                                                        <p className="text-[11px] text-[#006837] font-semibold mt-0.5">
                                                            Course: {ws.course.name} ({ws.course.code})
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Clock size={12} /> PROPOSAL PENDING
                                                </span>
                                            </div>

                                            <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-slate-500">Commercial Product:</span>
                                                    <p className="font-bold text-slate-900 text-xs">{ws.productName}</p>
                                                    <span className="text-[10px] text-slate-400 font-mono">SKU: {ws.sku}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Batch Code Prefix:</span>
                                                    <p className="font-bold text-slate-800 font-mono text-xs">{ws.batchPrefix}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Retail POS Price:</span>
                                                    <p className="font-bold text-emerald-700 text-sm">₹{ws.sellingPrice?.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Student Stipend Rate:</span>
                                                    <p className="font-bold text-amber-800 text-sm">₹{ws.incentiveRate?.toFixed(2)} / pc</p>
                                                </div>
                                            </div>

                                            {ws.bomSummary && (
                                                <div className="mb-2.5 text-xs bg-slate-100 p-2.5 rounded border border-slate-200 text-slate-700">
                                                    <strong>BOM Recipe Allocation:</strong> {ws.bomSummary}
                                                </div>
                                            )}

                                            {ws.approvalRemarks && (
                                                <div className="mb-3 text-xs bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 italic">
                                                    <strong>Proposal Justification:</strong> "{ws.approvalRemarks}"
                                                </div>
                                            )}

                                            <p className="text-[10px] text-slate-400 font-mono">
                                                Proposed by: {ws.proposedBy || 'Production Manager'}
                                            </p>
                                        </div>

                                        {/* Action Buttons for Admin */}
                                        <div className="pt-3 border-t border-slate-200 flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleApproveWorkshop(ws.id, ws.name)}
                                                className="flex-1 bg-[#006837] hover:bg-[#004d28] text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
                                            >
                                                <Check size={14} /> Approve & Activate Workshop
                                            </button>
                                            <button
                                                onClick={() => handleRejectWorkshop(ws.id, ws.name)}
                                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                                            >
                                                <X size={14} /> Reject Proposal
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: PRODUCTION MANAGER WORKSHOP CONSOLE (When in Production Mode)      */}
            {/* ========================================================================= */}
            {!isAdmin && isProductionManager && (
                <div className="space-y-6">

                    {/* Workshop Control Bar */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow">
                                <Factory size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        {currentWorkshop.shortName}
                                    </h3>
                                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                        {currentWorkshop.category}
                                    </span>
                                </div>
                                <p className="text-xs text-amber-800">
                                    Supervisor: <strong>Er. B. K. Jena (Production Head • KISS-PRD-001)</strong>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-600">Active Workshop:</span>
                                <select
                                    value={selectedWorkshop}
                                    onChange={(e) => handleWorkshopChange(e.target.value)}
                                    className="bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-sm"
                                >
                                    {workshopsList.map(w => (
                                        <option key={w.id} value={w.name}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Propose Workshop Button */}
                            <button
                                type="button"
                                onClick={() => setProposeModalOpen(true)}
                                className="bg-[#006837] hover:bg-[#004d28] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow"
                                title="Request Admin approval to activate a new production workshop lab"
                            >
                                <PlusCircle size={14} /> + Propose New Workshop
                            </button>
                        </div>
                    </div>

                    {/* Pending Workshop Notification for Production Team */}
                    {pendingWorkshops.length > 0 && (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-amber-950">
                                <Hourglass size={16} className="text-amber-600 shrink-0 animate-pulse" />
                                <span>
                                    <strong>{pendingWorkshops.length} Workshop Proposal(s) Pending Admin Approval:</strong>{' '}
                                    {pendingWorkshops.map(pw => pw.shortName || pw.name).join(', ')}
                                </span>
                            </div>
                            <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                Awaiting University Admin Clearance
                            </span>
                        </div>
                    )}

                    {/* Grid: 1. BOM Recipe Card & Materials + 2. Launch Batch Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 1. BOM Recipe Card & Raw Material Availability */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center border-b pb-3 mb-4">
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <Layers size={18} className="text-[#006837]" />
                                        Standard BOM Recipe & Material Rates
                                    </h3>
                                    <select
                                        value={selectedProductId}
                                        onChange={(e) => handleProductChange(e.target.value)}
                                        className="text-xs font-bold border border-slate-300 rounded px-2 py-1 text-slate-700 bg-slate-50 focus:outline-none focus:border-[#006837]"
                                    >
                                        {workshopsList.map(w => (
                                            <option key={w.productId} value={w.productId}>
                                                {w.productName} ({w.sku})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    {currentWorkshop.materials.map((mat, idx) => {
                                        const MatIcon = mat.icon || Layers;
                                        const liveMat = getLiveMaterial(mat.name);
                                        const liveStockDisplay = liveMat ? `${liveMat.currentStock} ${liveMat.unitOfMeasure}` : mat.stock;
                                        const isLow = liveMat ? (Number(liveMat.currentStock) <= Number(liveMat.reorderLevel)) : mat.isLow;

                                        return (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2.5">
                                                    <MatIcon size={18} className={mat.color || 'text-slate-600'} />
                                                    <div>
                                                        <p className="font-bold text-slate-800">{mat.name}</p>
                                                        <p className={`text-[11px] font-mono ${isLow ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                                            {mat.code} {isLow && '• Low Stock!'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-[#006837]">{mat.req}</span>
                                                    <p className={`text-[10px] ${isLow ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                                        Live Stock: <strong className="font-mono">{liveStockDisplay}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Student Incentive Stipend Rate */}
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <Coins size={18} className="text-amber-600" />
                                            <div>
                                                <p className="font-bold text-amber-900">Student Artisan Stipend Rate</p>
                                                <p className="text-[11px] text-amber-700">"Earn While Learn" incentive credit</p>
                                            </div>
                                        </div>
                                        <span className="text-base font-extrabold text-amber-900">
                                            ₹{currentWorkshop.incentive.toFixed(2)} / pc
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                                <span>Expected Retail POS Price:</span>
                                <span className="font-bold text-slate-900 text-sm">
                                    ₹{currentWorkshop.price.toFixed(2)} / piece
                                </span>
                            </div>
                        </div>

                        {/* 2. Schedule & Launch Production Batch */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between border-b pb-3 mb-4">
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <PlusCircle size={18} className="text-amber-600" />
                                    Schedule & Launch Production Batch
                                </h3>
                                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                    Auto Material Deduct
                                </span>
                            </div>

                            <form onSubmit={handleLaunchBatch} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Batch Code (Auto Format)
                                    </label>
                                    <input
                                        type="text"
                                        value={batchCode}
                                        onChange={(e) => setBatchCode(e.target.value)}
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#006837]"
                                    />
                                </div>

                                {/* Dynamic Estimated Time Limit & Recommended Team Members */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                                            <Clock size={12} /> Estimated Time Limit
                                        </span>
                                        <p className="font-extrabold text-blue-900 text-sm mt-0.5">
                                            {estimatedHours} Working Hours
                                        </p>
                                        <p className="text-[10px] text-blue-700">~{estimatedDays} Working Days ({qtyNum} units)</p>
                                    </div>

                                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                                        <span className="text-[10px] font-bold text-purple-800 uppercase flex items-center gap-1">
                                            <Users size={12} /> Recommended Team
                                        </span>
                                        <p className="font-extrabold text-purple-900 text-sm mt-0.5">
                                            {recommendedTeamSize} Apprentice Scholars
                                        </p>
                                        <p className="text-[10px] text-purple-700">Estimated ~4 units/artisan</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Target Batch Quantity (Units)
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setTargetQuantity(prev => {
                                                const n = parseInt(prev, 10) || 1;
                                                return String(Math.max(1, n - 1));
                                            })}
                                            className="w-9 h-9 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition text-sm select-none"
                                            title="Decrease quantity"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={targetQuantity}
                                            onChange={(e) => {
                                                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                setTargetQuantity(cleaned);
                                            }}
                                            onBlur={() => {
                                                if (!targetQuantity || parseInt(targetQuantity, 10) < 1) {
                                                    setTargetQuantity('1');
                                                }
                                            }}
                                            placeholder="10"
                                            className="w-full text-center border border-slate-300 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#006837]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setTargetQuantity(prev => {
                                                const n = parseInt(prev, 10) || 0;
                                                return String(Math.min(100, n + 1));
                                            })}
                                            className="w-9 h-9 rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition text-sm select-none"
                                            title="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Multi-Scholar Assignment with Checkboxes and In-Progress Lock */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Select Production Team Members (Checkboxes)
                                        </label>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                            selectedTrainees.length >= recommendedTeamSize
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : selectedTrainees.length > 0
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {selectedTrainees.length} Selected / {recommendedTeamSize} Recommended
                                        </span>
                                    </div>

                                    <div className="border border-slate-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50 p-1">
                                        {traineesList.length === 0 ? (
                                            <p className="text-xs text-slate-400 p-3 text-center italic">No enrolled trainees found in registry.</p>
                                        ) : (
                                            traineesList.map(t => {
                                                const activeBatch = getActiveBatchForTrainee(t.username);
                                                const isBusy = !!activeBatch;
                                                const isSelected = selectedTrainees.includes(t.username);

                                                return (
                                                    <div
                                                        key={t.username}
                                                        onClick={() => {
                                                            if (!isBusy) toggleTrainee(t.username);
                                                        }}
                                                        className={`flex items-center justify-between p-2 rounded transition cursor-pointer text-xs ${
                                                            isBusy
                                                                ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-75'
                                                                : isSelected
                                                                ? 'bg-emerald-50 border border-emerald-300 font-semibold'
                                                                : 'hover:bg-white text-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                disabled={isBusy}
                                                                onChange={() => {}}
                                                                className="w-4 h-4 text-[#006837] rounded border-slate-300 focus:ring-[#006837] cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                            <div>
                                                                <span className={isBusy ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}>
                                                                    {t.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                                                    ({t.username})
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            {isBusy ? (
                                                                <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                    🔒 ALLOTTED & BUSY (Batch: {activeBatch.batchNumber})
                                                                </span>
                                                            ) : isSelected ? (
                                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                    ✓ Selected
                                                                </span>
                                                            ) : (
                                                                <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                                                                    Available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        * Scholars allotted to an in-progress batch cannot be assigned to another batch until the current work is completed.
                                    </p>
                                </div>

                                {/* Dynamic Auto-calculated Material Estimation & Individual Stipend Share */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                                    <p className="font-bold text-slate-700">Estimated Auto-Consumption via BOM ({currentWorkshop.shortName}):</p>
                                    {currentWorkshop.materials.map((mat, idx) => (
                                        <div key={idx} className="flex justify-between text-slate-600">
                                            <span>• {mat.name} Required:</span>
                                            <span className="font-bold text-slate-800">
                                                {(qtyNum * mat.unitNum).toFixed(mat.unitNum % 1 !== 0 ? 1 : 0)} {mat.unitName}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-amber-800 font-semibold pt-1 border-t border-slate-200">
                                        <span>• Total Estimated Student Stipend Pool:</span>
                                        <span className="font-bold font-mono">
                                            ₹{totalStipendPool.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-emerald-800 font-semibold">
                                        <span>• Estimated Individual Scholar Stipend:</span>
                                        <span className="font-bold font-mono">
                                            ₹{stipendPerScholar} each ({selectedTrainees.length} scholars)
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingBatch}
                                    className="w-full bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                                >
                                    <Factory size={15} />
                                    {submittingBatch ? 'Deducting Stock & Starting...' : 'Launch Batch & Lock Materials'}
                                </button>
                            </form>
                        </div>

                    </div>

                </div>
            )}

            {/* ========================================================================= */}
            {/* COMMON: PRODUCTION RUNS AUDIT LEDGER TABLE                                 */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4 mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <PackageCheck size={18} className="text-teal-600" />
                            Production Batches Ledger & Stage Tracker
                        </h3>
                        <p className="text-xs text-slate-500">
                            Track manufacturing lifecycle: In Progress ➔ Pending Admin Approval ➔ Approved for Sale (POS).
                        </p>
                    </div>

                    {/* Filter and Search */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#006837]"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 bg-slate-50"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                            <option value="APPROVED_FOR_SALE">Approved for Sale</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-xl border border-slate-200 shadow-2xs scrollbar-thin">
                    <table className="w-full text-left text-sm relative">
                        <thead className="sticky top-0 z-10 bg-slate-100 shadow-xs">
                        <tr className="text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                            <th className="py-3 px-3">Batch Number</th>
                            <th className="py-3 px-3">Finished Product</th>
                            <th className="py-3 px-3">Units</th>
                            <th className="py-3 px-3">Supervisor / Remarks</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Actions / Workflow</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredRuns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                                    No batches matching criteria found.
                                </td>
                            </tr>
                        ) : (
                            filteredRuns.map((b) => {
                                const productName = b.product?.name || 'Cotton Garment';
                                const targetQty = b.targetQuantity || 0;
                                const compQty = b.completedQuantity || 0;

                                return (
                                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                                            {b.batchNumber}
                                        </td>
                                        <td className="py-3 px-3 font-medium text-slate-800">
                                            <div>{productName}</div>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {b.product?.sku || 'PRD-001'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="font-bold text-slate-900">{compQty}</span>
                                            <span className="text-slate-400"> / {targetQty} Units</span>
                                        </td>
                                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={b.remarks || ''}>
                                            {b.remarks || 'Standard production batch'}
                                        </td>
                                        <td className="py-3 px-3">
                                            {b.status === 'APPROVED_FOR_SALE' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                                                    <CheckCircle2 size={12} /> Approved for Sale
                                                </span>
                                            )}
                                            {b.status === 'PENDING_APPROVAL' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 bg-amber-100 text-amber-800 animate-pulse">
                                                    <Hourglass size={12} /> Awaiting Admin Approval
                                                </span>
                                            )}
                                            {b.status === 'IN_PROGRESS' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 bg-blue-100 text-blue-800">
                                                    <Clock size={12} /> In Production
                                                </span>
                                            )}
                                            {b.status === 'REJECTED' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 bg-rose-100 text-rose-800">
                                                    <X size={12} /> Rejected / Rework
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {/* Production Manager Action: Complete & Submit to Admin (STRICTLY HIDDEN FOR ADMIN) */}
                                            {b.status === 'IN_PROGRESS' && !isAdmin && (
                                                <button
                                                    onClick={() => handleOpenCompleteModal(b)}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-2.5 rounded text-[11px] transition shadow inline-flex items-center gap-1"
                                                >
                                                    <Check size={12} /> Complete & Submit to Admin
                                                </button>
                                            )}

                                            {b.status === 'IN_PROGRESS' && isAdmin && (
                                                <span className="text-[11px] text-blue-700 font-semibold inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                                                    <Clock size={11} /> Running on Shop Floor
                                                </span>
                                            )}

                                            {/* Admin Action: Approve / Reject buttons right in table if pending */}
                                            {b.status === 'PENDING_APPROVAL' && isAdmin && (
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleApproveBatch(b.id, b.batchNumber)}
                                                        className="bg-[#006837] hover:bg-[#004d28] text-white font-bold py-1 px-2 rounded text-[11px] transition shadow inline-flex items-center gap-0.5"
                                                    >
                                                        <Check size={12} /> Approve & Disburse
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenRejectModal(b)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-1 px-2 rounded text-[11px] transition"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}

                                            {b.status === 'PENDING_APPROVAL' && !isAdmin && (
                                                <span className="text-[11px] text-amber-700 font-semibold italic">
                                                    Waiting for Admin Sign-off
                                                </span>
                                            )}

                                            {b.status === 'APPROVED_FOR_SALE' && (
                                                <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1">
                                                    <Store size={12} /> Cleared for POS
                                                </span>
                                            )}

                                            {b.status === 'REJECTED' && (
                                                <span className="text-[11px] text-rose-700 font-bold">
                                                    Rework Requested
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: COMPLETE BATCH & SUBMIT TO ADMIN (For Production Manager)         */}
            {/* ========================================================================= */}
            {completeModalOpen && batchToComplete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400">
                        <div className="flex justify-between items-start border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                                    <PackageCheck size={18} className="text-amber-600" />
                                    Complete Batch & Submit for Approval
                                </h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    {batchToComplete.batchNumber} • {batchToComplete.product?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setCompleteModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Please confirm the actual number of units successfully finished by apprentice artisans.
                                Upon submission, the batch status will be set to <strong>PENDING_APPROVAL</strong> for University Administration quality review.
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Actual Completed Units (Finished Goods)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={completedQty}
                                    onChange={(e) => setCompletedQty(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-600"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Target was: {batchToComplete.targetQuantity} units
                                </p>
                            </div>

                            {/* Dynamic Team Stipend Calculation Preview */}
                            {(() => {
                                const team = getBatchTeamMembers(batchToComplete);
                                const incRate = batchToComplete.product?.incentiveRatePerUnit || currentWorkshop.incentive || 75.0;
                                const finalUnits = Number(completedQty) || 0;
                                const totalPool = finalUnits * incRate;
                                const perScholar = team.length > 0 ? (totalPool / team.length).toFixed(2) : totalPool.toFixed(2);

                                return (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-2">
                                        <div className="flex justify-between items-center text-amber-900 font-bold border-b border-amber-200 pb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Coins size={14} className="text-amber-700" />
                                                Apprentice Stipend Pool:
                                            </span>
                                            <span className="text-sm font-black font-mono">₹{totalPool.toFixed(2)}</span>
                                        </div>
                                        <div className="space-y-1 text-slate-700">
                                            <p className="font-semibold text-slate-800 text-[11px]">
                                                Team Member Breakdown ({team.length} Scholars):
                                            </p>
                                            {team.length > 0 ? (
                                                team.map((m, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span>• {m.name} ({m.username})</span>
                                                        <span className="font-bold text-emerald-800 font-mono">₹{perScholar}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="italic text-slate-500">Individual artisan allocation calculated automatically upon Admin approval.</p>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-amber-800 pt-1 border-t border-amber-200">
                                            * Upon submission, this stipend report is sent to Admin for QA verification and DBT disbursement.
                                        </p>
                                    </div>
                                );
                            })()}

                            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700">
                                <strong>Institutional Rule:</strong> Finished goods cannot be sold at the university POS shop until Admin grants commercial sale clearance.
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setCompleteModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={completionSubmitting}
                                onClick={handleConfirmComplete}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                            >
                                <Check size={14} />
                                {completionSubmitting ? 'Submitting...' : 'Submit to Admin for Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: REJECT / REQUEST REWORK MODAL (For Admin)                         */}
            {/* ========================================================================= */}
            {rejectModalOpen && batchToReject && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-400">
                        <div className="flex justify-between items-start border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5 text-rose-700">
                                    <AlertTriangle size={18} />
                                    Reject / Request Rework
                                </h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    {batchToReject.batchNumber} • {batchToReject.product?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Quality Assurance Remarks / Reason for Rejection
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectRemarks}
                                    onChange={(e) => setRejectRemarks(e.target.value)}
                                    placeholder="Enter inspection feedback for the production team..."
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-600"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={rejectSubmitting}
                                onClick={handleConfirmReject}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                            >
                                <X size={14} />
                                {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: PROPOSE / REQUEST NEW WORKSHOP (For Production Manager)          */}
            {/* ========================================================================= */}
            {proposeModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#006837] my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5 text-[#006837]">
                                    <PlusCircle size={20} />
                                    Propose / Request New Workshop Lab
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Submit new vocational production studio proposal for University Admin approval.
                                </p>
                            </div>
                            <button
                                onClick={() => setProposeModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleProposeWorkshop} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Workshop Lab Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Workshop Lab #4 (Tribal Dokra Metal Casting)"
                                    value={workshopForm.name}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Studio Short Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dokra Metal Studio #4"
                                        value={workshopForm.shortName}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, shortName: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Studio Category
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Heritage Metalwork"
                                        value={workshopForm.category}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, category: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Associated Vocational Training Course
                                </label>
                                <select
                                    value={workshopForm.courseId}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, courseId: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] bg-white font-medium"
                                >
                                    {coursesList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Commercial Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Dokra Tribal Bell Figurine"
                                        value={workshopForm.productName}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, productName: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Product SKU
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PRD-DKR-04"
                                        value={workshopForm.sku}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, sku: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Batch Prefix
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="BATCH-2026-DKR"
                                        value={workshopForm.batchPrefix}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, batchPrefix: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Selling Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1200"
                                        value={workshopForm.sellingPrice}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, sellingPrice: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Stipend Rate (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="180"
                                        value={workshopForm.incentiveRate}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, incentiveRate: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Bill of Materials (BOM) Recipe Summary
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Brass Metal Scrap (0.5 kg) + Natural Beeswax (0.2 kg)"
                                    value={workshopForm.bomSummary}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, bomSummary: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Justification / Proposal Remarks
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Explain the vocational benefit, artisan market demand, and workshop setup..."
                                    value={workshopForm.proposalRemarks}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, proposalRemarks: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950">
                                <strong>Institutional Workflow:</strong> The proposed workshop will start with status <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1 rounded">PENDING_APPROVAL</span>. Once university administration approves it, it will be activated in the workshop schedule, BOM recipes, and POS catalog.
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setProposeModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={proposingWorkshop}
                                    className="px-4 py-2 bg-[#006837] hover:bg-[#004d28] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                                >
                                    <PlusCircle size={14} />
                                    {proposingWorkshop ? 'Submitting Proposal...' : 'Submit Proposal to Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}