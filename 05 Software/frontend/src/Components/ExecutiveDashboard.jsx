import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    GraduationCap,
    Scissors,
    Factory,
    Package,
    TrendingUp,
    Coins,
    CheckCircle,
    BrainCircuit,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function ExecutiveDashboard({ onNavigateToForecast }) {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        traineesCount: 0,
        tradesCount: 0,
        activeBatchesCount: 0,
        latestBatchCode: 'None Active',
        finishedStockCount: 0,
        salesRevenue: 0,
        unitsSold: 0,
        earnWhileLearnTotal: 0,
        recentRuns: []
    });

    const fetchExecutiveData = async () => {
        setLoading(true);
        try {
            const [traineesRes, coursesRes, runsRes, stockRes, ordersRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/academics/trainees`),
                axios.get(`${API_BASE_URL}/academics/courses/detailed`),
                axios.get(`${API_BASE_URL}/production/runs`),
                axios.get(`${API_BASE_URL}/inventory/finished-goods`),
                axios.get(`${API_BASE_URL}/sales/orders`)
            ]);

            const trainees = traineesRes.status === 'fulfilled' && Array.isArray(traineesRes.value.data) ? traineesRes.value.data : [];
            const courses = coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data) ? coursesRes.value.data : [];
            const runs = runsRes.status === 'fulfilled' && Array.isArray(runsRes.value.data) ? runsRes.value.data : [];
            const finished = stockRes.status === 'fulfilled' && Array.isArray(stockRes.value.data) ? stockRes.value.data : [];
            const orders = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];

            const activeBatches = runs.filter(r => r.status === 'IN_PROGRESS');
            const totalStock = finished.reduce((acc, item) => acc + (item.availableStock || item.stockOnHand || 0), 0);
            const totalRevenue = orders.reduce((acc, ord) => acc + (ord.totalAmount || 0), 0);
            const totalUnitsSold = orders.reduce((acc, ord) => acc + (ord.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0), 0);

            // Calculate total earn-while-learn incentives from completed batches
            const completedRuns = runs.filter(r => r.status === 'APPROVED_FOR_SALE' || r.status === 'COMPLETED');
            const calculatedIncentives = completedRuns.reduce((acc, r) => acc + ((r.completedQuantity || r.targetQuantity || 0) * (r.incentivePerUnit || 75)), 0);

            setMetrics({
                traineesCount: trainees.length,
                tradesCount: courses.length,
                activeBatchesCount: activeBatches.length,
                latestBatchCode: activeBatches[0]?.batchCode || runs[0]?.batchCode || 'None Active',
                finishedStockCount: totalStock,
                salesRevenue: totalRevenue,
                unitsSold: totalUnitsSold,
                earnWhileLearnTotal: calculatedIncentives,
                recentRuns: runs.slice(0, 3)
            });
        } catch (err) {
            console.error('Error fetching executive dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutiveData();
    }, []);

    const stats = [
        {
            title: 'Enrolled Trainees',
            value: String(metrics.traineesCount),
            sub: `${metrics.traineesCount} Registered Scholars`,
            icon: GraduationCap,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'border-teal-200'
        },
        {
            title: 'Vocational Trades',
            value: String(metrics.tradesCount),
            sub: 'Curriculum Offerings',
            icon: Scissors,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200'
        },
        {
            title: 'Active Batches',
            value: String(metrics.activeBatchesCount),
            sub: metrics.latestBatchCode,
            icon: Factory,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        },
        {
            title: 'Finished Stock',
            value: String(metrics.finishedStockCount),
            sub: 'Units in Warehouse',
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        {
            title: 'Sales Revenue',
            value: `₹${metrics.salesRevenue.toLocaleString('en-IN')}`,
            sub: `${metrics.unitsSold} Units Sold`,
            icon: TrendingUp,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
        },
        {
            title: 'Earn While Learn',
            value: `₹${metrics.earnWhileLearnTotal.toLocaleString('en-IN')}`,
            sub: 'Disbursed to Scholars',
            icon: Coins,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-200'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#006837] to-[#004d28] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="bg-[#fcb900] text-slate-900 text-xs font-bold px-2.5 py-1 rounded">
                        Closed-Loop Vocational Lifecycle
                    </span>
                    <h2 className="text-2xl font-bold mt-2">Executive Operations Overview</h2>
                    <p className="text-green-100 text-sm mt-1">
                        Real-time synchronization across Training, Production, Dual Inventory, Sales & "Earn While Learn" Incentives.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchExecutiveData}
                        title="Refresh Live Metrics"
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg border border-white/20 transition flex items-center justify-center"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin text-[#fcb900]" : "text-white"} />
                    </button>
                    <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-lg border border-white/20 text-right">
                        <p className="text-xs text-green-200">Current Academic Term</p>
                        <p className="text-lg font-bold text-[#fcb900]">Autumn 2026</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                        <div key={idx} className={`bg-white rounded-xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-shadow flex items-center justify-between`}>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.title}</p>
                                <h3 className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                                <Icon size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Closed Loop Status & AI Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="text-[#006837]" size={18} />
                            Active Production & Lifecycle Pipeline
                        </h3>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                            Operational
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                                01
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-slate-800">Vocational Training Curriculum</p>
                                    <span className="text-xs font-semibold text-teal-700">{metrics.traineesCount} Scholars Active</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Enrolled scholars mastering hands-on craft in practical studios with continuous rubric assessments.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                02
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-slate-800">Batch Production: {metrics.latestBatchCode}</p>
                                    <span className="text-xs font-semibold text-emerald-600">{metrics.activeBatchesCount} Active Runs</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Bill of Materials allocated from Raw Store. Finished artisan batches submitted to University Administration for sale clearance.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                                03
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-slate-800">Earn While Learn Incentives</p>
                                    <span className="text-xs font-semibold text-rose-700">₹{metrics.earnWhileLearnTotal.toLocaleString('en-IN')} Earned</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Incentive allowance released to enrolled scholars upon quality verification and commercial batch clearance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Forecasting Mini Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                            <h3 className="font-bold flex items-center gap-2 text-[#fcb900]">
                                <BrainCircuit size={18} />
                                AI Forecasting Engine
                            </h3>
                            <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700">
                                OLS + Smoothing
                            </span>
                        </div>

                        <p className="text-xs text-slate-300">
                            Predictive production recommendation across commercial artisan lines:
                        </p>

                        <div className="mt-4 bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Total Warehouse Stock:</span>
                                <span className="font-bold text-cyan-400">{metrics.finishedStockCount} Units</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Total Units Dispatched:</span>
                                <span className="font-bold text-emerald-400">{metrics.unitsSold} Units</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Active Production Runs:</span>
                                <span className="font-bold text-amber-400">{metrics.activeBatchesCount} Batches</span>
                            </div>
                            <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                                <span className="font-bold text-[#fcb900]">Stock Status:</span>
                                <span className="font-extrabold text-[#fcb900]">
                                    {metrics.finishedStockCount > 0 ? `${metrics.finishedStockCount} Units Available` : 'Replenishment Needed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Predictive Model</span>
                        <button
                            onClick={onNavigateToForecast}
                            className="text-[#fcb900] hover:underline flex items-center gap-1 font-semibold"
                        >
                            View Forecast <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}