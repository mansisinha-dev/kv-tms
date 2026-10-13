import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    Wrench,
    CheckCircle2,
    XCircle,
    RefreshCw,
    PlusCircle,
    ClipboardCheck,
    PackageX,
    Hammer,
    Sliders,
    RotateCcw,
    Award,
    Layers
} from 'lucide-react';
import { VocationalStore } from '../utils/vocationalStore';

export default function QualityDefectCenter({ currentUser, initialSubTab = 'qa-checklist' }) {
    const [subTab, setSubTab] = useState(initialSubTab);
    const [qaList, setQaList] = useState(() => VocationalStore.getQAInspections());
    const [damageList, setDamageList] = useState(() => VocationalStore.getDamageLogs());
    const [equipmentList, setEquipmentList] = useState(() => VocationalStore.getEquipmentLogs());
    const [posReturns, setPosReturns] = useState(() => VocationalStore.getPosReturns());
    const [toast, setToast] = useState('');

    // Form state: New Multi-Point QA Inspection
    const [showQaForm, setShowQaForm] = useState(false);
    const [qaForm, setQaForm] = useState({
        batchNumber: 'BATCH-2026-004',
        productName: 'Handwoven Tribal Ikat Stole',
        trade: 'Apparels & Tailoring',
        workshopName: 'Tailoring Studio Lab-1',
        producedQty: 25,
        passedQty: 22,
        reworkQty: 2,
        scrapQty: 1,
        dimensionalAccuracy: 9,
        craftsmanship: 9,
        surfaceFinish: 8,
        packagingHygiene: 10,
        defectCategory: 'Minor Weft Thread Tension Variance',
        correctiveAction: '2 stoles assigned for border re-hemming in Afternoon Shift Batch-B; 1 unit logged as loom setup scrap.'
    });

    // Form state: Report Damage / Wastage
    const [showDamageForm, setShowDamageForm] = useState(false);
    const [damageForm, setDamageForm] = useState({
        itemType: 'FINISHED_GOOD',
        itemName: 'Terracotta Painted Tribal Lamp Set',
        batchOrSku: 'BATCH-2026-004',
        quantityDamaged: 2,
        unit: 'Units',
        damageStage: 'Kiln Firing & Cooling (Workshop)',
        reason: 'Hairline crack during high-temperature firing by beginner cohort',
        disposition: 'RECYCLED_FOR_PATCHWORK',
        estimatedLoss: 350,
        preventionNote: 'Pre-heat clay moulds for 30 mins to remove residual moisture before kiln loading.'
    });

    // Form state: Report Machine / Toolkit Issue
    const [showEquipForm, setShowEquipForm] = useState(false);
    const [equipForm, setEquipForm] = useState({
        equipmentName: 'Juki DDL-8700 Industrial Sewing Machine #12',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Tailoring Studio Lab-1',
        trade: 'Apparels & Tailoring',
        totalUnits: 15,
        workingUnits: 14,
        damagedUnits: 1,
        status: 'NEEDS_MAINTENANCE',
        issueReported: 'Needle guard alignment shifted during thick canvas stitching',
        assignedTechnician: 'Campus Mechanical Maintenance Cell'
    });

    useEffect(() => {
        const syncAll = () => {
            setQaList(VocationalStore.getQAInspections());
            setDamageList(VocationalStore.getDamageLogs());
            setEquipmentList(VocationalStore.getEquipmentLogs());
            setPosReturns(VocationalStore.getPosReturns());
        };
        window.addEventListener('kvtms_vocational_sync', syncAll);
        return () => window.removeEventListener('kvtms_vocational_sync', syncAll);
    }, []);

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    const handleQaSubmit = (e) => {
        e.preventDefault();
        const passed = Number(qaForm.passedQty) || 0;
        const rework = Number(qaForm.reworkQty) || 0;
        const scrap = Number(qaForm.scrapQty) || 0;
        const total = passed + rework + scrap;

        VocationalStore.saveQAInspection({
            batchNumber: qaForm.batchNumber,
            productName: qaForm.productName,
            trade: qaForm.trade,
            workshopName: qaForm.workshopName,
            inspectorName: `${currentUser?.fullName || 'QA Inspector'} (${currentUser?.collegeId || 'KISS-QA'})`,
            targetQty: total,
            producedQty: total,
            passedQty: passed,
            reworkQty: rework,
            scrapQty: scrap,
            checklist: {
                dimensionalAccuracy: Number(qaForm.dimensionalAccuracy),
                craftsmanship: Number(qaForm.craftsmanship),
                surfaceFinish: Number(qaForm.surfaceFinish),
                packagingHygiene: Number(qaForm.packagingHygiene)
            },
            defectCategory: qaForm.defectCategory,
            correctiveAction: qaForm.correctiveAction,
            status: rework > 0 ? 'CLEARED_WITH_PARTIAL_REWORK' : 'CLEARED_FOR_SALE'
        });

        // Also auto-log scrap if scrapQty > 0
        if (scrap > 0) {
            VocationalStore.addDamageLog({
                itemType: 'FINISHED_GOOD',
                itemName: qaForm.productName,
                batchOrSku: qaForm.batchNumber,
                quantityDamaged: scrap,
                unit: 'Units',
                damageStage: `QA Inspection (${qaForm.workshopName})`,
                reason: qaForm.defectCategory,
                disposition: 'SCRAP_WRITE_OFF',
                reportedBy: currentUser?.fullName || 'QA Inspector',
                estimatedLoss: scrap * 220,
                preventionNote: qaForm.correctiveAction
            });
        }

        setQaList(VocationalStore.getQAInspections());
        setDamageList(VocationalStore.getDamageLogs());
        setShowQaForm(false);
        notify(`QA Inspection saved for ${qaForm.batchNumber}: ${passed} Passed, ${rework} Rework, ${scrap} Scrap.`);
    };

    const handleMarkReworkCompleted = (qaItem) => {
        const updatedPassed = Number(qaItem.passedQty) + Number(qaItem.reworkQty);
        VocationalStore.saveQAInspection({
            ...qaItem,
            passedQty: updatedPassed,
            reworkQty: 0,
            status: 'CLEARED_FOR_SALE',
            correctiveAction: `${qaItem.correctiveAction} [✓ Rework completed & re-verified on ${new Date().toISOString().slice(0, 10)}]`
        });
        setQaList(VocationalStore.getQAInspections());
        notify(`All reworked units in ${qaItem.batchNumber} re-inspected and cleared for showroom sale!`);
    };

    const handleDamageSubmit = (e) => {
        e.preventDefault();
        VocationalStore.addDamageLog({
            ...damageForm,
            quantityDamaged: Number(damageForm.quantityDamaged),
            estimatedLoss: Number(damageForm.estimatedLoss),
            reportedBy: `${currentUser?.fullName || 'Workshop Staff'} (${currentUser?.collegeId || 'KISS'})`
        });
        setDamageList(VocationalStore.getDamageLogs());
        setShowDamageForm(false);
        notify(`Damage/Wastage report logged for ${damageForm.itemName} (${damageForm.quantityDamaged} ${damageForm.unit}).`);
    };

    const handleEquipSubmit = (e) => {
        e.preventDefault();
        VocationalStore.addOrUpdateEquipment({
            ...equipForm,
            totalUnits: Number(equipForm.totalUnits),
            workingUnits: Number(equipForm.workingUnits),
            damagedUnits: Number(equipForm.damagedUnits),
            reportedBy: `${currentUser?.fullName || 'Faculty/Staff'} (${currentUser?.collegeId || 'KISS'})`
        });
        setEquipmentList(VocationalStore.getEquipmentLogs());
        setShowEquipForm(false);
        notify(`Workshop equipment/toolkit record updated for ${equipForm.equipmentName}.`);
    };

    const handleRepairEquipment = (eq) => {
        VocationalStore.addOrUpdateEquipment({
            ...eq,
            workingUnits: eq.totalUnits,
            damagedUnits: 0,
            status: 'OPERATIONAL',
            issueReported: `Serviced & calibrated on ${new Date().toISOString().slice(0, 10)} — 100% Operational`
        });
        setEquipmentList(VocationalStore.getEquipmentLogs());
        notify(`${eq.equipmentName} marked as Repaired & 100% Operational!`);
    };

    // Summary KPI calculations
    const totalInspected = qaList.reduce((acc, q) => acc + (Number(q.producedQty) || 0), 0);
    const totalPassed = qaList.reduce((acc, q) => acc + (Number(q.passedQty) || 0), 0);
    const totalRework = qaList.reduce((acc, q) => acc + (Number(q.reworkQty) || 0), 0);
    const totalScrap = qaList.reduce((acc, q) => acc + (Number(q.scrapQty) || 0), 0);
    const firstPassYield = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : '100.0';

    return (
        <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-[#006837] via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full font-bold">
                            NSQF Quality Control & Workshop Safety Directorate
                        </span>
                        <h2 className="text-xl font-black mt-2 flex items-center gap-2">
                            <ShieldCheck size={24} className="text-amber-300" />
                            Vocational Quality Assurance, Defect & Workshop Asset Hub
                        </h2>
                        <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                            Unit-level quality grading (Grade-A Pass vs. Rework vs. Scrap), warehouse damage/spoilage write-offs, POS defective return claims, and training lab machine/toolkit maintenance.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto text-center">
                        <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">First-Pass Yield</p>
                            <p className="text-lg font-black text-white">{firstPassYield}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Grade-A Cleared</p>
                            <p className="text-lg font-black text-amber-300">{totalPassed} Units</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Active Rework</p>
                            <p className="text-lg font-black text-orange-300">{totalRework} Units</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                            <p className="text-[10px] text-emerald-200 uppercase font-bold">Damage/Scrap</p>
                            <p className="text-lg font-black text-rose-300">{damageList.length} Logs</p>
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

            {/* Navigation Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    type="button"
                    onClick={() => setSubTab('qa-checklist')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        subTab === 'qa-checklist'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <ClipboardCheck size={15} />
                    1. Multi-Point QA & Rework Split ({qaList.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('damage-scrap')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        subTab === 'damage-scrap'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <PackageX size={15} />
                    2. Defect, Damage, Scrap & POS Returns ({damageList.length + posReturns.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('equipment-toolkits')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        subTab === 'equipment-toolkits'
                            ? 'bg-[#006837] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <Wrench size={15} />
                    3. Lab Machinery & Student Toolkits ({equipmentList.length})
                </button>
            </div>

            {/* ===================================================================== */}
            {/* SUB-TAB 1: MULTI-POINT QA INSPECTION & UNIT-LEVEL SPLIT               */}
            {/* ===================================================================== */}
            {subTab === 'qa-checklist' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <ClipboardCheck size={18} className="text-[#006837]" />
                                Unit-Level Quality Assurance & Rework Inspection Ledger
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Instead of binary all-or-nothing batch rejection, inspect and split each batch into Grade-A Passed, Reworkable, and Damaged/Scrap units.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowQaForm(!showQaForm)}
                            className="bg-[#006837] hover:bg-[#004d28] text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                            <PlusCircle size={14} />
                            {showQaForm ? 'Close QA Form' : 'Record New Batch QA Inspection'}
                        </button>
                    </div>

                    {showQaForm && (
                        <form onSubmit={handleQaSubmit} className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-[#006837] text-sm flex items-center gap-2 border-b border-emerald-200 pb-2">
                                <Sliders size={15} /> Record Multi-Point Batch Quality Inspection (Unit-Level Split)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Batch Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={qaForm.batchNumber}
                                        onChange={e => setQaForm({ ...qaForm, batchNumber: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Craft / Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={qaForm.productName}
                                        onChange={e => setQaForm({ ...qaForm, productName: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Vocational Trade</label>
                                    <select
                                        value={qaForm.trade}
                                        onChange={e => setQaForm({ ...qaForm, trade: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option>Apparels & Tailoring</option>
                                        <option>Terracotta & Pottery</option>
                                        <option>Bamboo & Wood Crafts</option>
                                        <option>Food Processing</option>
                                        <option>Tribal Handloom Weaving</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Training Studio / Lab</label>
                                    <input
                                        type="text"
                                        required
                                        value={qaForm.workshopName}
                                        onChange={e => setQaForm({ ...qaForm, workshopName: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            {/* Unit-Level Split */}
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-bold text-emerald-800 mb-1">✓ Grade-A Passed Units (For Sale)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={qaForm.passedQty}
                                        onChange={e => setQaForm({ ...qaForm, passedQty: e.target.value })}
                                        className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 font-bold text-emerald-900 bg-emerald-50/40"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-amber-800 mb-1">↻ Rework Required Units (Repairable)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={qaForm.reworkQty}
                                        onChange={e => setQaForm({ ...qaForm, reworkQty: e.target.value })}
                                        className="w-full border border-amber-300 rounded-lg px-3 py-1.5 font-bold text-amber-900 bg-amber-50/40"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-rose-800 mb-1">✕ Damaged / Scrap Units (Write-off)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={qaForm.scrapQty}
                                        onChange={e => setQaForm({ ...qaForm, scrapQty: e.target.value })}
                                        className="w-full border border-rose-300 rounded-lg px-3 py-1.5 font-bold text-rose-900 bg-rose-50/40"
                                    />
                                </div>
                            </div>

                            {/* 4-Point Rubric Sliders */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                                <div>
                                    <label className="block font-bold text-slate-700">1. Dimensional Accuracy ({qaForm.dimensionalAccuracy}/10)</label>
                                    <input type="range" min="1" max="10" value={qaForm.dimensionalAccuracy} onChange={e => setQaForm({ ...qaForm, dimensionalAccuracy: e.target.value })} className="w-full mt-1 accent-[#006837]" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700">2. Craftsmanship & Joinery ({qaForm.craftsmanship}/10)</label>
                                    <input type="range" min="1" max="10" value={qaForm.craftsmanship} onChange={e => setQaForm({ ...qaForm, craftsmanship: e.target.value })} className="w-full mt-1 accent-[#006837]" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700">3. Surface / Stitch Finish ({qaForm.surfaceFinish}/10)</label>
                                    <input type="range" min="1" max="10" value={qaForm.surfaceFinish} onChange={e => setQaForm({ ...qaForm, surfaceFinish: e.target.value })} className="w-full mt-1 accent-[#006837]" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700">4. Packaging & Hygiene ({qaForm.packagingHygiene}/10)</label>
                                    <input type="range" min="1" max="10" value={qaForm.packagingHygiene} onChange={e => setQaForm({ ...qaForm, packagingHygiene: e.target.value })} className="w-full mt-1 accent-[#006837]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Observed Defect Category (If any)</label>
                                    <input
                                        type="text"
                                        value={qaForm.defectCategory}
                                        onChange={e => setQaForm({ ...qaForm, defectCategory: e.target.value })}
                                        placeholder="e.g. Collar seam tension variance / Kiln glaze bubble"
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Corrective Action & Trainer Feedback</label>
                                    <input
                                        type="text"
                                        value={qaForm.correctiveAction}
                                        onChange={e => setQaForm({ ...qaForm, correctiveAction: e.target.value })}
                                        placeholder="Instructions for reworking defective units..."
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowQaForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-[#006837] text-white font-bold rounded-lg shadow">Save QA Inspection & Split Batch</button>
                            </div>
                        </form>
                    )}

                    {/* QA Inspections List */}
                    <div className="space-y-4">
                        {qaList.map(item => {
                            const yieldPct = item.producedQty > 0 ? ((item.passedQty / item.producedQty) * 100).toFixed(1) : '100.0';
                            const score40 = (item.checklist?.dimensionalAccuracy || 9) + (item.checklist?.craftsmanship || 9) + (item.checklist?.surfaceFinish || 9) + (item.checklist?.packagingHygiene || 9);

                            return (
                                <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded">
                                                    {item.batchNumber}
                                                </span>
                                                <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                                                <span className="text-[11px] bg-emerald-50 text-[#006837] border border-emerald-200 px-2 py-0.5 rounded font-bold">
                                                    {item.trade} • {item.workshopName}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                Inspected on <strong>{item.inspectionDate}</strong> by <strong>{item.inspectorName}</strong> • QA Rubric Score: <strong>{score40}/40</strong>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                                                item.reworkQty > 0
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            }`}>
                                                {item.reworkQty > 0 ? `⏳ ${item.reworkQty} Units In Rework` : '✓ 100% QA Cleared'}
                                            </span>
                                            {item.reworkQty > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkReworkCompleted(item)}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                                                >
                                                    <RotateCcw size={12} /> Complete Rework & Clear ({item.reworkQty})
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unit Split Bar */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Total Inspected</p>
                                            <p className="text-base font-black text-slate-800 mt-0.5">{item.producedQty} Units</p>
                                        </div>
                                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <p className="text-[10px] text-emerald-700 font-bold uppercase">Grade-A Passed</p>
                                            <p className="text-base font-black text-emerald-900 mt-0.5">{item.passedQty} Units</p>
                                        </div>
                                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="text-[10px] text-amber-700 font-bold uppercase">Sent for Rework</p>
                                            <p className="text-base font-black text-amber-900 mt-0.5">{item.reworkQty} Units</p>
                                        </div>
                                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                                            <p className="text-[10px] text-rose-700 font-bold uppercase">Damaged / Scrap</p>
                                            <p className="text-base font-black text-rose-900 mt-0.5">{item.scrapQty} Units</p>
                                        </div>
                                        <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                                            <p className="text-[10px] text-indigo-700 font-bold uppercase">Pass Yield Rate</p>
                                            <p className="text-base font-black text-indigo-900 mt-0.5">{yieldPct}%</p>
                                        </div>
                                    </div>

                                    {/* Defect & Corrective Guidance */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                                        <div>
                                            <span className="font-bold text-slate-700">Defect Diagnosis: </span>
                                            <span className="text-slate-600">{item.defectCategory}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700">Corrective & Rework Action: </span>
                                            <span className="text-slate-600">{item.correctiveAction}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-TAB 2: DEFECT, DAMAGE, SCRAP & POS CUSTOMER RETURNS               */}
            {/* ===================================================================== */}
            {subTab === 'damage-scrap' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <PackageX size={18} className="text-rose-600" />
                                Warehouse Damage, Kiln Breakage, Practice Scrap & Customer Returns
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Tracks damaged raw materials, broken/spoiled finished crafts, training material wastage, and POS customer defective product claims.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDamageForm(!showDamageForm)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                            <PlusCircle size={14} />
                            {showDamageForm ? 'Close Form' : 'Log Damaged Stock / Training Scrap'}
                        </button>
                    </div>

                    {showDamageForm && (
                        <form onSubmit={handleDamageSubmit} className="bg-rose-50/60 border-2 border-rose-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2 border-b border-rose-200 pb-2">
                                <AlertTriangle size={15} /> Report Damaged Raw Material, Broken Craft, or Training Scrap
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Stock Category</label>
                                    <select
                                        value={damageForm.itemType}
                                        onChange={e => setDamageForm({ ...damageForm, itemType: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option value="FINISHED_GOOD">Finished Craft Product (WH-2)</option>
                                        <option value="RAW_MATERIAL">Raw Material Store (WH-1)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Material / Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={damageForm.itemName}
                                        onChange={e => setDamageForm({ ...damageForm, itemName: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Batch Code / Material SKU</label>
                                    <input
                                        type="text"
                                        required
                                        value={damageForm.batchOrSku}
                                        onChange={e => setDamageForm({ ...damageForm, batchOrSku: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Quantity Damaged</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        required
                                        value={damageForm.quantityDamaged}
                                        onChange={e => setDamageForm({ ...damageForm, quantityDamaged: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Unit</label>
                                    <select
                                        value={damageForm.unit}
                                        onChange={e => setDamageForm({ ...damageForm, unit: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option>Units</option>
                                        <option>Meters</option>
                                        <option>Kg</option>
                                        <option>Liters</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Stage of Damage</label>
                                    <select
                                        value={damageForm.damageStage}
                                        onChange={e => setDamageForm({ ...damageForm, damageStage: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option>Kiln Firing & Cooling (Workshop)</option>
                                        <option>Pattern Cutting Practice (Training Lab)</option>
                                        <option>Warehouse Storage Inspection</option>
                                        <option>Showroom Transit & Handling</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Disposition Action</label>
                                    <select
                                        value={damageForm.disposition}
                                        onChange={e => setDamageForm({ ...damageForm, disposition: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option value="RECYCLED_FOR_PATCHWORK">Recycled for Trainee Practice / Patchwork</option>
                                        <option value="SENT_FOR_REWORK">Sent Back to Studio for Repair</option>
                                        <option value="SCRAP_WRITE_OFF">Scrap Write-Off (Deducted from Inventory)</option>
                                        <option value="DISPOSED_SAFETY_PROTOCOL">Disposed per Food/Hygiene Protocol</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Cause of Damage / Defect</label>
                                    <input
                                        type="text"
                                        required
                                        value={damageForm.reason}
                                        onChange={e => setDamageForm({ ...damageForm, reason: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Preventive Guideline for Trainees</label>
                                    <input
                                        type="text"
                                        required
                                        value={damageForm.preventionNote}
                                        onChange={e => setDamageForm({ ...damageForm, preventionNote: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowDamageForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-rose-600 text-white font-bold rounded-lg shadow">Record Damage & Update Register</button>
                            </div>
                        </form>
                    )}

                    {/* Damage & Wastage Cards */}
                    <div className="space-y-3">
                        {damageList.map(dmg => (
                            <div key={dmg.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between gap-4 text-xs">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono font-bold text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                                            {dmg.id}
                                        </span>
                                        <span className="font-bold text-slate-900 text-sm">{dmg.itemName}</span>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                            {dmg.batchOrSku}
                                        </span>
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                            {dmg.damageStage}
                                        </span>
                                    </div>
                                    <p className="text-slate-600">
                                        <strong>Root Cause:</strong> {dmg.reason}
                                    </p>
                                    <p className="text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded border border-emerald-200">
                                        <strong>Training Prevention Note:</strong> {dmg.preventionNote}
                                    </p>
                                </div>
                                <div className="md:text-right flex flex-col justify-between shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                                    <div>
                                        <span className="text-sm font-black text-rose-700">
                                            -{dmg.quantityDamaged} {dmg.unit}
                                        </span>
                                        <p className="text-[10px] text-slate-400">Reported on {dmg.date} by {dmg.reportedBy}</p>
                                    </div>
                                    <span className="inline-block mt-2 text-[10px] font-bold bg-slate-800 text-white px-2.5 py-1 rounded">
                                        Action: {dmg.disposition.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* POS Customer Defective Returns Section */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                            <RotateCcw size={16} className="text-indigo-600" />
                            Showroom POS Defective Product Returns & Exchanges ({posReturns.length})
                        </h4>
                        <div className="space-y-2.5">
                            {posReturns.map(ret => (
                                <div key={ret.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                                    <div>
                                        <span className="font-mono font-bold text-indigo-700">{ret.invoiceNumber}</span>
                                        <span className="mx-2 text-slate-400">•</span>
                                        <strong className="text-slate-800">{ret.productName} (Qty: {ret.quantity})</strong>
                                        <p className="text-slate-600 mt-1">
                                            Customer: <strong>{ret.customerName}</strong> — Reported Defect: <em>"{ret.defectReported}"</em>
                                        </p>
                                    </div>
                                    <div className="sm:text-right shrink-0">
                                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded">
                                            {ret.resolutionAction.replace(/_/g, ' ')}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">Date: {ret.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-TAB 3: LAB MACHINERY & STUDENT TOOLKIT MAINTENANCE                */}
            {/* ===================================================================== */}
            {subTab === 'equipment-toolkits' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <Wrench size={18} className="text-indigo-600" />
                                Vocational Workshop Machinery & Trainee Toolkit Health Register
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Track operational status of sewing machines, looms, kilns, food dehydrators, and student personal toolkits across all training studios.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowEquipForm(!showEquipForm)}
                            className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                            <PlusCircle size={14} />
                            {showEquipForm ? 'Close Form' : 'Report Machine / Toolkit Breakdown'}
                        </button>
                    </div>

                    {showEquipForm && (
                        <form onSubmit={handleEquipSubmit} className="bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl p-5 space-y-4 text-xs">
                            <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2 border-b border-indigo-200 pb-2">
                                <Hammer size={15} /> Log Workshop Machine Breakdown or Trainee Toolkit Damage
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Equipment / Toolkit Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={equipForm.equipmentName}
                                        onChange={e => setEquipForm({ ...equipForm, equipmentName: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Asset Category</label>
                                    <select
                                        value={equipForm.category}
                                        onChange={e => setEquipForm({ ...equipForm, category: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    >
                                        <option value="WORKSHOP_MACHINERY">Workshop Lab Machinery</option>
                                        <option value="STUDENT_TOOLKIT">Trainee Issued Toolkit & Safety PPE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Studio Lab Location</label>
                                    <input
                                        type="text"
                                        required
                                        value={equipForm.workshopLab}
                                        onChange={e => setEquipForm({ ...equipForm, workshopLab: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Total Lab Units</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={equipForm.totalUnits}
                                        onChange={e => setEquipForm({ ...equipForm, totalUnits: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Working Units</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={equipForm.workingUnits}
                                        onChange={e => setEquipForm({ ...equipForm, workingUnits: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Damaged / Maintenance Units</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={equipForm.damagedUnits}
                                        onChange={e => setEquipForm({ ...equipForm, damagedUnits: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Damage / Maintenance Issue Description</label>
                                <input
                                    type="text"
                                    required
                                    value={equipForm.issueReported}
                                    onChange={e => setEquipForm({ ...equipForm, issueReported: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowEquipForm(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-1.5 bg-indigo-700 text-white font-bold rounded-lg shadow">Submit Maintenance Ticket</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipmentList.map(eq => (
                            <div key={eq.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                                {eq.category === 'STUDENT_TOOLKIT' ? 'Trainee Toolkit & PPE' : 'Studio Machinery'} • {eq.workshopLab}
                                            </span>
                                            <h4 className="font-bold text-slate-900 text-sm mt-1">{eq.equipmentName}</h4>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                            eq.damagedUnits > 0
                                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}>
                                            {eq.damagedUnits > 0 ? `${eq.damagedUnits} Unit(s) Under Repair` : '✓ 100% Operational'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                            <p className="text-[10px] text-slate-500">Total Issued</p>
                                            <p className="font-black text-slate-800 text-sm">{eq.totalUnits}</p>
                                        </div>
                                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                                            <p className="text-[10px] text-emerald-700">Operational</p>
                                            <p className="font-black text-emerald-900 text-sm">{eq.workingUnits}</p>
                                        </div>
                                        <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-center">
                                            <p className="text-[10px] text-rose-700">Damaged</p>
                                            <p className="font-black text-rose-900 text-sm">{eq.damagedUnits}</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                                        <strong>Status Note:</strong> {eq.issueReported}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                    <span>Last Serviced: <strong>{eq.lastServiced}</strong></span>
                                    {eq.damagedUnits > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRepairEquipment(eq)}
                                            className="bg-[#006837] hover:bg-[#004d28] text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                                        >
                                            ✓ Mark Repaired / Replaced
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
