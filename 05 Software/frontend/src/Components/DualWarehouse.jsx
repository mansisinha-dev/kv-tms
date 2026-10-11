import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Warehouse,
    Package,
    Scissors,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    Layers,
    Tag,
    Clock,
    Sparkles,
    Plus,
    PlusCircle,
    ArrowRight,
    Hammer,
    Palette,
    Shirt,
    X,
    Building2,
    Info,
    Check,
    SlidersHorizontal,
    Workflow,
    Search,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet
} from 'lucide-react';

export default function DualWarehouse({ onNavigateTab }) {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [finishedGoods, setFinishedGoods] = useState([]);
    const [productionRuns, setProductionRuns] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    // Section view vs flat view: 'SECTIONS' | 'FLAT'
    const [viewMode, setViewMode] = useState('SECTIONS');
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'ADEQUATE'

    // Search & Pagination States
    const [rawSearch, setRawSearch] = useState('');
    const [rawPage, setRawPage] = useState(1);
    const rawSectionPageSize = 2; // 2 sections per page for clean scrolling
    const rawFlatPageSize = 5;

    const [finishedSearch, setFinishedSearch] = useState('');
    const [finishedPage, setFinishedPage] = useState(1);
    const finishedPageSize = 3; // 3 finished goods per page

    // Restock Raw Material Modal State
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedMaterialForRestock, setSelectedMaterialForRestock] = useState(null);
    const [restockQty, setRestockQty] = useState(25);
    const [restockCost, setRestockCost] = useState('');
    const [restockSupplier, setRestockSupplier] = useState('KISS Central Procurement Depo');
    const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);

    // Manual Finished Goods Stock Adjustment Modal
    const [isAdjustFinishedModalOpen, setIsAdjustFinishedModalOpen] = useState(false);
    const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
    const [adjustQty, setAdjustQty] = useState(10);
    const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

    // Fetch warehouse data: raw materials, finished stock, production runs, and active workshops
    const fetchWarehouseData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        try {
            const [rawRes, finishedRes, runsRes, workshopsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/production/raw-materials'),
                axios.get('http://localhost:8080/api/v1/inventory/finished-goods'),
                axios.get('http://localhost:8080/api/v1/production/runs'),
                axios.get('http://localhost:8080/api/v1/production/workshops')
            ]);

            if (Array.isArray(rawRes.data)) {
                setRawMaterials(rawRes.data);
            }

            if (Array.isArray(finishedRes.data)) {
                setFinishedGoods(finishedRes.data);
            }

            if (Array.isArray(runsRes.data)) {
                setProductionRuns(runsRes.data);
            }

            if (Array.isArray(workshopsRes.data)) {
                setWorkshops(workshopsRes.data);
            }

            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Error fetching warehouse data:', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) {
                setTimeout(() => setRefreshing(false), 400);
            }
        }
    };

    useEffect(() => {
        fetchWarehouseData();
        const interval = setInterval(() => fetchWarehouseData(), 15000);
        return () => clearInterval(interval);
    }, []);

    // Color themes and icons for dynamic workshop sections
    const workshopThemePalette = [
        { border: 'border-teal-200', bg: 'bg-teal-50/40', badge: 'bg-teal-100 text-teal-800', icon: Shirt, colorTheme: 'teal' },
        { border: 'border-indigo-200', bg: 'bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-800', icon: Palette, colorTheme: 'indigo' },
        { border: 'border-amber-200', bg: 'bg-amber-50/40', badge: 'bg-amber-100 text-amber-800', icon: Hammer, colorTheme: 'amber' },
        { border: 'border-orange-200', bg: 'bg-orange-50/40', badge: 'bg-orange-100 text-orange-800', icon: Sparkles, colorTheme: 'orange' },
        { border: 'border-rose-200', bg: 'bg-rose-50/40', badge: 'bg-rose-100 text-rose-800', icon: Layers, colorTheme: 'rose' },
        { border: 'border-emerald-200', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800', icon: Building2, colorTheme: 'emerald' },
        { border: 'border-purple-200', bg: 'bg-purple-50/40', badge: 'bg-purple-100 text-purple-800', icon: Workflow, colorTheme: 'purple' }
    ];

    // Build dynamic metadata and section mapping across ALL active workshops
    const { productionSections, materialProductMapping } = useMemo(() => {
        const mapping = {};
        const sections = [];

        // Known default craft line recipes
        const defaultBoms = {
            'PRD-KURTI-01': [
                { matId: 1, recipeText: '2.5 Meters / Kurti', consumption: 2.5 },
                { matId: 2, recipeText: '4.0 Pieces / Kurti', consumption: 4.0 }
            ],
            'PRD-SAM-02': [
                { matId: 3, recipeText: '0.8 Kg / Stole', consumption: 0.8 },
                { matId: 4, recipeText: '0.5 Litres / Stole', consumption: 0.5 }
            ],
            'PRD-BAM-03': [
                { matId: 5, recipeText: '3.0 Stalks / Lamp', consumption: 3.0 },
                { matId: 6, recipeText: '0.25 Litres / Lamp', consumption: 0.25 }
            ],
            'PRD-DKR-04': [
                { matId: 7, recipeText: '0.5 Kg Scrap / Figurine', consumption: 0.5 },
                { matId: 8, recipeText: '0.2 Kg Wax / Figurine', consumption: 0.2 }
            ],
            'PRD-POT-05': [
                { matId: 9, recipeText: '2.0 Kg Clay / Vase', consumption: 2.0 },
                { matId: 10, recipeText: '0.1 Litres Pigment / Vase', consumption: 0.1 }
            ]
        };

        const activeWs = workshops.filter((w) => w.status === 'APPROVED_FOR_SALE');

        activeWs.forEach((ws, idx) => {
            const theme = workshopThemePalette[idx % workshopThemePalette.length];
            const SectionIcon = theme.icon;

            // Find matching product in finished goods stock
            const matchedGood = finishedGoods.find(
                (fg) => fg.product?.sku === ws.sku || fg.product?.name === ws.productName
            );
            const prodId = matchedGood?.product?.id || idx + 1;

            // Materials belonging to this workshop
            let sectionMats = [];
            const predefined = defaultBoms[ws.sku];

            if (predefined) {
                predefined.forEach((p) => {
                    const mat = rawMaterials.find((m) => m.id === p.matId);
                    if (mat) {
                        sectionMats.push(mat);
                        mapping[mat.id] = {
                            productId: prodId,
                            productName: ws.productName || ws.name,
                            productSku: ws.sku,
                            workshopName: ws.shortName || ws.name,
                            recipeText: p.recipeText,
                            consumptionPerUnit: p.consumption
                        };
                    }
                });
            }

            // Fallback: match by keywords in bomSummary or material name
            if (sectionMats.length === 0 && ws.bomSummary) {
                const summaryLower = ws.bomSummary.toLowerCase();
                rawMaterials.forEach((mat) => {
                    const matWords = mat.name.toLowerCase().split(/\s+/);
                    const isMatch = matWords.some((w) => w.length > 3 && summaryLower.includes(w));
                    if (isMatch && !mapping[mat.id]) {
                        sectionMats.push(mat);
                        mapping[mat.id] = {
                            productId: prodId,
                            productName: ws.productName || ws.name,
                            productSku: ws.sku,
                            workshopName: ws.shortName || ws.name,
                            recipeText: `Custom (${mat.unitOfMeasure})`,
                            consumptionPerUnit: 1.0
                        };
                    }
                });
            }

            // Clean Section Title
            let sectionTitle = `Section ${idx + 1}: ${ws.shortName || ws.name}`;
            if (ws.name && ws.name.includes('(')) {
                const sub = ws.name.match(/\((.*?)\)/)?.[1];
                if (sub) sectionTitle = `Section ${idx + 1}: ${sub} Line`;
            }

            sections.push({
                id: ws.id,
                title: sectionTitle,
                workshop: ws.shortName || ws.name,
                category: ws.category || 'Vocational Craft Studio',
                targetProduct: `${ws.productName || ws.name} (${ws.sku || 'PRD-WS'})`,
                productId: prodId,
                sku: ws.sku,
                bomSummary: ws.bomSummary,
                materials: sectionMats,
                themeBorder: theme.border,
                themeBg: theme.bg,
                themeBadge: theme.badge,
                icon: SectionIcon,
                calculateMaxUnits: (mats) => {
                    if (sectionMats.length === 0) return 0;
                    const ratios = sectionMats.map((m) => {
                        const rec = mapping[m.id]?.consumptionPerUnit || 1.0;
                        return Math.floor((m.currentStock || 0) / rec);
                    });
                    return Math.max(0, Math.min(...ratios));
                }
            });
        });

        // Map any leftover materials
        rawMaterials.forEach((m) => {
            if (!mapping[m.id]) {
                mapping[m.id] = {
                    productId: null,
                    productName: 'Vocational Production Materials',
                    recipeText: `1.0 ${m.unitOfMeasure} / Unit`,
                    consumptionPerUnit: 1.0
                };
            }
        });

        return { productionSections: sections, materialProductMapping: mapping };
    }, [workshops, rawMaterials, finishedGoods]);

    // Summary calculations
    const totalFinishedUnits = finishedGoods.reduce((sum, item) => sum + (item.availableStock || 0), 0);
    const totalFinishedValuation = finishedGoods.reduce(
        (sum, item) => sum + (item.availableStock || 0) * (item.product?.sellingPrice || 0),
        0
    );
    const lowStockRawCount = rawMaterials.filter(
        (mat) => Number(mat.currentStock) <= Number(mat.reorderLevel)
    ).length;

    // Filter raw materials (Flat View)
    const filterMaterial = (mat) => {
        const isLow = Number(mat.currentStock) <= Number(mat.reorderLevel);
        if (activeFilter === 'LOW') return isLow;
        if (activeFilter === 'ADEQUATE') return !isLow;
        return true;
    };

    // Search filter for Raw Materials / Sections
    const filteredSections = useMemo(() => {
        if (!rawSearch.trim()) return productionSections;
        const q = rawSearch.toLowerCase();
        return productionSections.filter((sec) =>
            sec.title.toLowerCase().includes(q) ||
            sec.workshop.toLowerCase().includes(q) ||
            sec.targetProduct.toLowerCase().includes(q) ||
            (sec.bomSummary && sec.bomSummary.toLowerCase().includes(q)) ||
            sec.materials.some((m) => m.name.toLowerCase().includes(q))
        );
    }, [productionSections, rawSearch]);

    const filteredFlatMaterials = useMemo(() => {
        let list = rawMaterials.filter(filterMaterial);
        if (rawSearch.trim()) {
            const q = rawSearch.toLowerCase();
            list = list.filter((m) =>
                m.name.toLowerCase().includes(q) ||
                (materialProductMapping[m.id]?.productName || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [rawMaterials, activeFilter, rawSearch, materialProductMapping]);

    // Pagination for Left Column
    const totalRawItems = viewMode === 'SECTIONS' ? filteredSections.length : filteredFlatMaterials.length;
    const currentRawPageSize = viewMode === 'SECTIONS' ? rawSectionPageSize : rawFlatPageSize;
    const totalRawPages = Math.max(1, Math.ceil(totalRawItems / currentRawPageSize));
    const paginatedSections = filteredSections.slice((rawPage - 1) * currentRawPageSize, rawPage * currentRawPageSize);
    const paginatedFlatMaterials = filteredFlatMaterials.slice((rawPage - 1) * currentRawPageSize, rawPage * currentRawPageSize);

    // Search filter for Finished Goods (Right Column)
    const filteredFinishedGoods = useMemo(() => {
        if (!finishedSearch.trim()) return finishedGoods;
        const q = finishedSearch.toLowerCase();
        return finishedGoods.filter((fg) => {
            const prod = fg.product || {};
            const matchingWs = workshops.find(
                (w) => w.sku === prod.sku || w.productName === prod.name
            );
            return (
                prod.name?.toLowerCase().includes(q) ||
                prod.sku?.toLowerCase().includes(q) ||
                prod.course?.name?.toLowerCase().includes(q) ||
                matchingWs?.name?.toLowerCase().includes(q) ||
                matchingWs?.shortName?.toLowerCase().includes(q) ||
                matchingWs?.category?.toLowerCase().includes(q) ||
                matchingWs?.bomSummary?.toLowerCase().includes(q)
            );
        });
    }, [finishedGoods, finishedSearch, workshops]);

    // Pagination for Finished Goods
    const totalFinishedPages = Math.max(1, Math.ceil(filteredFinishedGoods.length / finishedPageSize));
    const paginatedFinishedGoods = filteredFinishedGoods.slice(
        (finishedPage - 1) * finishedPageSize,
        finishedPage * finishedPageSize
    );

    const approvedRuns = productionRuns.filter((r) => r.status === 'APPROVED_FOR_SALE');

    // Open Restock Modal
    const handleOpenRestockModal = (material = null) => {
        const targetMat = material || rawMaterials[0] || null;
        setSelectedMaterialForRestock(targetMat);
        setRestockQty(targetMat ? Math.max(10, Math.ceil(targetMat.reorderLevel * 1.5)) : 25);
        setRestockCost(targetMat?.unitCost || '');
        setRestockSupplier('KISS Central Procurement Depo');
        setIsRestockModalOpen(true);
    };

    // Submit Restock to Backend API
    const handleConfirmRestock = async (e) => {
        e.preventDefault();
        if (!selectedMaterialForRestock) return;

        setIsSubmittingRestock(true);
        try {
            const qtyNum = parseFloat(restockQty);
            const costNum = restockCost ? parseFloat(restockCost) : selectedMaterialForRestock.unitCost;

            await axios.post(
                `http://localhost:8080/api/v1/production/raw-materials/${selectedMaterialForRestock.id}/restock?quantity=${qtyNum}&unitCost=${costNum}`
            );

            setNotificationMessage({
                type: 'success',
                text: `Inwarded +${qtyNum} ${selectedMaterialForRestock.unitOfMeasure} of "${selectedMaterialForRestock.name}" into warehouse inventory.`
            });

            setIsRestockModalOpen(false);
            await fetchWarehouseData();
        } catch (err) {
            console.error('Failed to restock material:', err);
            setNotificationMessage({
                type: 'error',
                text: err.response?.data?.message || 'Could not complete material restock.'
            });
        } finally {
            setIsSubmittingRestock(false);
        }
    };

    // Open Manual Finished Good Stock Adjustment Modal
    const handleOpenAdjustFinishedModal = (item) => {
        setSelectedFinishedGood(item);
        setAdjustQty(item.availableStock || 0);
        setIsAdjustFinishedModalOpen(true);
    };

    // Submit Finished Goods Audit Count
    const handleConfirmAdjustFinished = async (e) => {
        e.preventDefault();
        if (!selectedFinishedGood) return;

        setIsSubmittingAdjust(true);
        try {
            await axios.put(
                `http://localhost:8080/api/v1/inventory/finished-goods/${selectedFinishedGood.id}/adjust?quantity=${adjustQty}`
            );

            setNotificationMessage({
                type: 'success',
                text: `Audit stock count for "${selectedFinishedGood.product?.name}" updated to ${adjustQty} units.`
            });

            setIsAdjustFinishedModalOpen(false);
            await fetchWarehouseData();
        } catch (err) {
            console.error('Failed to adjust finished goods stock:', err);
            setNotificationMessage({
                type: 'error',
                text: 'Could not adjust finished stock audit count.'
            });
        } finally {
            setIsSubmittingAdjust(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Notification Toast */}
            {notificationMessage && (
                <div
                    className={`p-4 rounded-xl border flex items-center justify-between shadow-md transition-all ${
                        notificationMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-xs font-bold">
                        {notificationMessage.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                        )}
                        <span>{notificationMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setNotificationMessage(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* Banner with Live Indicator, Restock Shortcut & Refresh Button */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-[#006837] text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Dual Inventory & Dynamic Workshop BOM Mapping
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800">Dual Warehouse & Materials Inventory</h2>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Separated storage tracking with automated workshop sectioning: Raw Materials Store linked to Finished Goods and live inward restocking.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => fetchWarehouseData(true)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                        title="Sync live inventory with backend"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#006837]' : ''} />
                        <span className="hidden sm:inline">Refresh Sync</span>
                    </button>

                    <button
                        onClick={() => handleOpenRestockModal()}
                        className="bg-[#006837] hover:bg-[#004d28] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                        title="Inward fresh raw material stock"
                    >
                        <PlusCircle size={15} />
                        <span>Inward / Restock Material</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">Active Workshop Craft Lines</span>
                        <div className="p-2 bg-emerald-50 text-[#006837] rounded-lg">
                            <Workflow size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {productionSections.length}
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} /> Approved & mapped production studios
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">Raw Material SKUs</span>
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                            <Layers size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {rawMaterials.length}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={12} /> Refreshed at {lastUpdated}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">Raw Stock Threshold Alert</span>
                        <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-700 font-mono">
                        {lowStockRawCount}
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                        {lowStockRawCount > 0 ? 'Action needed: Inward supplies' : 'All raw stocks in safety range'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">Finished Stock Valuation</span>
                        <div className="p-2 bg-emerald-50 text-[#006837] rounded-lg">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-[#006837] font-mono">
                        ₹{totalFinishedValuation.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                        <Sparkles size={12} className="text-amber-500" /> {totalFinishedUnits} units ready for POS sale
                    </p>
                </div>
            </div>

            {/* Two Columns: Raw Material Store vs Finished Goods Warehouse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. RAW MATERIALS SECTION (Left Column) */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Warehouse size={18} className="text-[#006837]" />
                                    Raw Materials & Production Lines
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Track material stock grouped by workshop craft lines
                                </p>
                            </div>

                            {/* View Switcher: Sections vs Flat List */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                                <button
                                    onClick={() => { setViewMode('SECTIONS'); setRawPage(1); }}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                        viewMode === 'SECTIONS'
                                            ? 'bg-white text-[#006837] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Workshop Sections
                                </button>
                                <button
                                    onClick={() => { setViewMode('FLAT'); setRawPage(1); }}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                        viewMode === 'FLAT'
                                            ? 'bg-white text-[#006837] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Flat Inventory
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="space-y-2.5 mb-4">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={rawSearch}
                                    onChange={(e) => {
                                        setRawSearch(e.target.value);
                                        setRawPage(1);
                                    }}
                                    placeholder="Search materials, workshops, or craft lines (e.g. Bamboo, Cotton, Brass, Clay)..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#006837] focus:bg-white transition-all shadow-2xs"
                                />
                                {rawSearch && (
                                    <button
                                        onClick={() => { setRawSearch(''); setRawPage(1); }}
                                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {viewMode === 'FLAT' && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-500 font-semibold mr-1">Filter:</span>
                                    <button
                                        onClick={() => { setActiveFilter('ALL'); setRawPage(1); }}
                                        className={`px-2 py-0.5 rounded font-bold ${
                                            activeFilter === 'ALL'
                                                ? 'bg-slate-800 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        All ({rawMaterials.length})
                                    </button>
                                    <button
                                        onClick={() => { setActiveFilter('LOW'); setRawPage(1); }}
                                        className={`px-2 py-0.5 rounded font-bold ${
                                            activeFilter === 'LOW'
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                        }`}
                                    >
                                        Low Stock ({lowStockRawCount})
                                    </button>
                                    <button
                                        onClick={() => { setActiveFilter('ADEQUATE'); setRawPage(1); }}
                                        className={`px-2 py-0.5 rounded font-bold ${
                                            activeFilter === 'ADEQUATE'
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        Adequate ({rawMaterials.length - lowStockRawCount})
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                                Loading raw materials...
                            </div>
                        ) : viewMode === 'SECTIONS' ? (
                            /* =================================================== */
                            /* SECTION VIEW: GROUPED BY ACTIVE WORKSHOPS           */
                            /* =================================================== */
                            <div className="space-y-4">
                                {paginatedSections.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        No workshop sections found matching "{rawSearch}".
                                    </div>
                                ) : (
                                    paginatedSections.map((section) => {
                                        const SectionIcon = section.icon || Building2;
                                        const maxCapacity = section.calculateMaxUnits(section.materials);
                                        const hasLowStock = section.materials.some(
                                            (m) => Number(m.currentStock) <= Number(m.reorderLevel)
                                        );

                                        return (
                                            <div
                                                key={section.id}
                                                className={`p-4 rounded-xl border transition-all ${section.themeBorder} ${section.themeBg} space-y-3 shadow-2xs`}
                                            >
                                                {/* Section Header */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs text-[#006837]">
                                                            <SectionIcon size={16} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                                <span>{section.title}</span>
                                                            </h4>
                                                            <p className="text-[11px] text-slate-600">
                                                                Dedicated to: <strong className="text-slate-800">{section.targetProduct}</strong>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.themeBadge}`}>
                                                            {section.workshop}
                                                        </span>
                                                        <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
                                                            Capacity: ~{maxCapacity} Units
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Materials inside this Section */}
                                                <div className="space-y-2.5">
                                                    {section.materials.length === 0 ? (
                                                        <div className="p-3 bg-white/70 rounded-lg border border-slate-200 text-slate-500 text-xs text-center">
                                                            {section.bomSummary ? (
                                                                <span className="text-[11px]">BOM Kit: <strong>{section.bomSummary}</strong></span>
                                                            ) : (
                                                                <span>Standard vocational kit assigned.</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        section.materials.map((mat) => {
                                                            const isLow = Number(mat.currentStock) <= Number(mat.reorderLevel);
                                                            const meta = materialProductMapping[mat.id] || {};

                                                            return (
                                                                <div
                                                                    key={mat.id}
                                                                    className={`p-3 bg-white rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                                        isLow
                                                                            ? 'border-amber-300 shadow-2xs'
                                                                            : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                                                                    }`}
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-xs font-bold text-slate-900">{mat.name}</p>
                                                                            {isLow ? (
                                                                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                                                                    <AlertTriangle size={9} /> Low Stock!
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                                                                    <CheckCircle2 size={9} /> Adequate
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                                                                            <span className="font-semibold text-slate-700">
                                                                                BOM Recipe: {meta.recipeText || '1.0 unit'}
                                                                            </span>
                                                                            <span>•</span>
                                                                            <span>Min Reorder: {mat.reorderLevel} {mat.unitOfMeasure}</span>
                                                                            <span>•</span>
                                                                            <span>Cost: ₹{mat.unitCost?.toFixed(2)}</span>
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                                        <div className="text-right">
                                                                            <span className="text-sm font-black text-slate-900 font-mono">
                                                                                {mat.currentStock}{' '}
                                                                                <span className="text-xs font-normal text-slate-500">
                                                                                    {mat.unitOfMeasure}
                                                                                </span>
                                                                            </span>
                                                                        </div>

                                                                        <button
                                                                            onClick={() => handleOpenRestockModal(mat)}
                                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs ${
                                                                                isLow
                                                                                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                                                                                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-[#006837] text-slate-700 border border-slate-200'
                                                                            }`}
                                                                            title={`Inward fresh stock for ${mat.name}`}
                                                                        >
                                                                            <Plus size={12} />
                                                                            <span>{isLow ? 'Restock Now' : 'Restock'}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {hasLowStock && (
                                                    <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 p-2 rounded-lg flex items-center gap-1.5">
                                                        <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                                                        <span>
                                                            Notice: One or more materials in this craft line are below threshold. Inward stock using "+ Restock".
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            /* =================================================== */
                            /* FLAT VIEW: ALL RAW MATERIALS WITH METADATA TAGS     */
                            /* =================================================== */
                            <div className="space-y-3">
                                {paginatedFlatMaterials.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        No materials match your filter or search query.
                                    </div>
                                ) : (
                                    paginatedFlatMaterials.map((item) => {
                                        const isLow = Number(item.currentStock) <= Number(item.reorderLevel);
                                        const meta = materialProductMapping[item.id] || {};

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-3.5 rounded-xl border transition-all ${
                                                    isLow
                                                        ? 'bg-amber-50/50 border-amber-200'
                                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                                            <span className="text-[10px] font-bold bg-[#006837]/10 text-[#006837] px-2 py-0.5 rounded">
                                                                Feeds: {meta.productName || 'Craft Product'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Consumption: <strong className="text-slate-700">{meta.recipeText || 'BOM Item'}</strong> • Threshold: Min {item.reorderLevel} {item.unitOfMeasure} • Unit Cost: ₹{item.unitCost?.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-base font-black text-slate-900 font-mono">
                                                            {item.currentStock}{' '}
                                                            <span className="text-xs font-normal text-slate-500">
                                                                {item.unitOfMeasure}
                                                            </span>
                                                        </span>
                                                        <div className="mt-1 flex items-center justify-end gap-1.5">
                                                            {isLow ? (
                                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                                                    <AlertTriangle size={10} /> Low Stock
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                                                    <CheckCircle2 size={10} /> Adequate
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => handleOpenRestockModal(item)}
                                                                className="text-[10px] font-bold bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-[#006837] px-2 py-0.5 rounded transition-colors"
                                                            >
                                                                + Inward
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Pagination for Left Column */}
                        {totalRawPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/80 text-xs">
                                <span className="text-slate-500 text-[11px]">
                                    Showing {Math.min(1 + (rawPage - 1) * currentRawPageSize, totalRawItems)}–{Math.min(rawPage * currentRawPageSize, totalRawItems)} of {totalRawItems} {viewMode === 'SECTIONS' ? 'Sections' : 'Materials'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setRawPage((p) => Math.max(1, p - 1))}
                                        disabled={rawPage === 1}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    {Array.from({ length: totalRawPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setRawPage(i + 1)}
                                            className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-colors ${
                                                rawPage === i + 1
                                                    ? 'bg-[#006837] text-white'
                                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setRawPage((p) => Math.min(totalRawPages, p + 1))}
                                        disabled={rawPage === totalRawPages}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                        <Layers size={14} className="text-slate-500 shrink-0" />
                        <span>
                            Raw materials are deducted when workshops launch batches, and replenished via Central Procurement.
                        </span>
                    </div>
                </div>

                {/* 2. FINISHED GOODS WAREHOUSE (Right Column) */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Package size={18} className="text-[#006837]" />
                                    Finished Goods Stock (Ready for Sale)
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Admin-approved craft stock ready for POS billing and commercial dispatch
                                </p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck size={13} className="text-emerald-700" />
                                Quality Cleared
                            </span>
                        </div>

                        {/* Search Bar for Finished Goods */}
                        <div className="relative mb-3.5">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={finishedSearch}
                                onChange={(e) => {
                                    setFinishedSearch(e.target.value);
                                    setFinishedPage(1);
                                }}
                                placeholder="Search finished products by name, SKU, workshop, or category..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#006837] focus:bg-white transition-all shadow-2xs"
                            />
                            {finishedSearch && (
                                <button
                                    onClick={() => { setFinishedSearch(''); setFinishedPage(1); }}
                                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                                Loading finished goods inventory...
                            </div>
                        ) : paginatedFinishedGoods.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs">
                                No finished products match "{finishedSearch}".
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {paginatedFinishedGoods.map((item) => {
                                    const prod = item.product || {};
                                    const itemValuation = (item.availableStock || 0) * (prod.sellingPrice || 0);

                                    // Find matching workshop for this product
                                    const matchingWs = workshops.find(
                                        (w) => w.sku === prod.sku || w.productName === prod.name
                                    );

                                    // Find approved runs for this product
                                    const matchingRuns = approvedRuns.filter(
                                        (r) => r.product?.id === prod.id
                                    );

                                    // Raw material requirements recipe for this product
                                    const requiredMaterials = Object.values(materialProductMapping).filter(
                                        (m) => m.productId === prod.id
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-3"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-900">{prod.name}</p>
                                                        <span className="text-[10px] font-bold bg-[#006837]/10 text-[#006837] px-2 py-0.5 rounded font-mono">
                                                            {prod.sku}
                                                        </span>
                                                    </div>

                                                    {/* Workshop Studio & Category Badges */}
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Building2 size={10} className="text-amber-700" />
                                                            {matchingWs?.shortName || matchingWs?.name || prod.course?.name || 'Vocational Studio'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {matchingWs?.category || prod.course?.name || 'Handicrafts & Art'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                                                        <span className="text-[#006837] font-bold font-mono">
                                                            MRP: ₹{prod.sellingPrice?.toFixed(2)}
                                                        </span>
                                                        <span className="text-slate-400">•</span>
                                                        <span className="text-slate-600 font-semibold font-mono">
                                                            Valuation: ₹{itemValuation.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-baseline justify-end gap-1">
                                                        <span className="text-2xl font-black text-slate-900 font-mono">
                                                            {item.availableStock}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-500">
                                                            pcs
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        Buffer Safety: {item.reorderLevel || 5} pcs
                                                    </p>
                                                    <button
                                                        onClick={() => handleOpenAdjustFinishedModal(item)}
                                                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline mt-1 block"
                                                        title="Adjust physical audit count"
                                                    >
                                                        Audit Count
                                                    </button>
                                                </div>
                                            </div>

                                            {/* BOM Formula Badges: Displays which raw materials make this good */}
                                            {(matchingWs?.bomSummary || requiredMaterials.length > 0) && (
                                                <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                                        <Scissors size={11} className="text-teal-600" />
                                                        BOM Ingredients:
                                                    </span>
                                                    {matchingWs?.bomSummary ? (
                                                        <span className="bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                                            {matchingWs.bomSummary}
                                                        </span>
                                                    ) : (
                                                        requiredMaterials.map((rm, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                                            >
                                                                {rm.recipeText}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {/* Associated Approved Production Batches */}
                                            {matchingRuns.length > 0 && (
                                                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                                                    <span className="text-slate-500 font-medium">Approved Batches:</span>
                                                    {matchingRuns.map((r) => (
                                                        <span
                                                            key={r.id}
                                                            className="bg-white border border-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded shadow-2xs font-semibold text-[10px]"
                                                        >
                                                            {r.batchNumber} ({r.completedQuantity} pcs)
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination for Finished Goods */}
                        {totalFinishedPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/80 text-xs">
                                <span className="text-slate-500 text-[11px]">
                                    Showing {Math.min(1 + (finishedPage - 1) * finishedPageSize, filteredFinishedGoods.length)}–{Math.min(finishedPage * finishedPageSize, filteredFinishedGoods.length)} of {filteredFinishedGoods.length} Products
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setFinishedPage((p) => Math.max(1, p - 1))}
                                        disabled={finishedPage === 1}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    {Array.from({ length: totalFinishedPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFinishedPage(i + 1)}
                                            className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-colors ${
                                                finishedPage === i + 1
                                                    ? 'bg-[#006837] text-white'
                                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFinishedPage((p) => Math.min(totalFinishedPages, p + 1))}
                                        disabled={finishedPage === totalFinishedPages}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Real-Time Audit Trail */}
                    <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-blue-950">
                            <ShieldCheck size={14} className="text-blue-700" />
                            <span>Warehouse Restock & Refill Guide</span>
                        </div>
                        <p className="text-[11px] text-blue-800">
                            • <strong>Raw Material Empty / Low?</strong> Use the green <strong>"Inward / Restock Material"</strong> button above to purchase and log fresh supplies into the database.
                            <br />
                            • <strong>Finished Goods Low?</strong> Workshop trainees craft new batches under <strong>Production Management</strong>, and upon Admin quality approval, finished stock automatically credits here!
                        </p>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* 1. RESTOCK / INWARD RAW MATERIAL MODAL                     */}
            {/* ========================================================= */}
            {isRestockModalOpen && selectedMaterialForRestock && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <PlusCircle size={20} className="text-[#006837]" />
                                    Procure & Inward Raw Material
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Refill warehouse inventory when raw stock is low or empty
                                </p>
                            </div>
                            <button
                                onClick={() => setIsRestockModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmRestock} className="space-y-4">
                            {/* Material Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Select Raw Material to Restock
                                </label>
                                <select
                                    value={selectedMaterialForRestock.id}
                                    onChange={(e) => {
                                        const mat = rawMaterials.find((m) => m.id === Number(e.target.value));
                                        if (mat) {
                                            setSelectedMaterialForRestock(mat);
                                            setRestockCost(mat.unitCost || '');
                                        }
                                    }}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#006837]"
                                >
                                    {rawMaterials.map((mat) => (
                                        <option key={mat.id} value={mat.id}>
                                            {mat.name} (Current: {mat.currentStock} {mat.unitOfMeasure})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Current Status Card */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Current Stock in Warehouse:</span>
                                    <span className="font-black text-slate-900 font-mono text-sm">
                                        {selectedMaterialForRestock.currentStock} {selectedMaterialForRestock.unitOfMeasure}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Safety Buffer Threshold:</span>
                                    <span className="font-semibold text-slate-700">
                                        Min {selectedMaterialForRestock.reorderLevel} {selectedMaterialForRestock.unitOfMeasure}
                                    </span>
                                </div>
                                {materialProductMapping[selectedMaterialForRestock.id] && (
                                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/80">
                                        <span className="text-slate-500">Associated Finished Craft:</span>
                                        <span className="font-bold text-[#006837]">
                                            {materialProductMapping[selectedMaterialForRestock.id].productName}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Inward Quantity Input & Quick Chips */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Quantity to Inward / Add ({selectedMaterialForRestock.unitOfMeasure})
                                    </label>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                        New Total: <strong className="text-emerald-700">{Number(selectedMaterialForRestock.currentStock) + Number(restockQty || 0)} {selectedMaterialForRestock.unitOfMeasure}</strong>
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(e.target.value)}
                                    required
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006837]"
                                />
                                {/* Quick Chips */}
                                <div className="flex items-center gap-1.5 mt-2">
                                    {[10, 25, 50, 100].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setRestockQty(amt)}
                                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                                                Number(restockQty) === amt
                                                    ? 'bg-[#006837] text-white border-[#006837]'
                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            +{amt} {selectedMaterialForRestock.unitOfMeasure}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Supplier & Unit Cost */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Supplier / Source Depo
                                    </label>
                                    <input
                                        type="text"
                                        value={restockSupplier}
                                        onChange={(e) => setRestockSupplier(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Purchase Rate (₹ / {selectedMaterialForRestock.unitOfMeasure})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={restockCost}
                                        onChange={(e) => setRestockCost(e.target.value)}
                                        placeholder="Unit Cost"
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            {/* Simulation Impact Banner */}
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Production Impact:</span> Adding {restockQty} {selectedMaterialForRestock.unitOfMeasure} will safely exceed the minimum threshold and supply workshops with enough buffer for upcoming production runs.
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRestockModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingRestock || !restockQty || Number(restockQty) <= 0}
                                    className="bg-[#006837] hover:bg-[#004d28] disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    {isSubmittingRestock ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" /> Inwarding Stock...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} /> Confirm Inward & Restock
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. ADJUST FINISHED GOODS STOCK MODAL                       */}
            {/* ========================================================= */}
            {isAdjustFinishedModalOpen && selectedFinishedGood && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <Package size={18} className="text-[#006837]" />
                                    Physical Audit Stock Adjustment
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Update physical counted stock for {selectedFinishedGood.product?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAdjustFinishedModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmAdjustFinished} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Physical Counted Stock Quantity (Units)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={adjustQty}
                                    onChange={(e) => setAdjustQty(e.target.value)}
                                    required
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                * Note: In normal operations, finished goods are restocked by completing workshop production batches under <strong>Production Management</strong>. Use this only for physical stock audits or damage adjustments.
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdjustFinishedModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingAdjust}
                                    className="bg-[#006837] hover:bg-[#004d28] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    {isSubmittingAdjust ? 'Updating...' : 'Save Audit Count'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}