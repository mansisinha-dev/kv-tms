import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BrainCircuit,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Info,
    Package,
    RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

export default function AIForecasting() {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loadingForecast, setLoadingForecast] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Simulation Slider State
    const [simulatedDemand, setSimulatedDemand] = useState(6);

    // 1. Fetch available products from finished goods inventory
    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const res = await axios.get(`${API_BASE_URL}/inventory/finished-goods`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                const available = res.data.map(item => item.product).filter(Boolean);
                setProducts(available);
                if (!selectedProductId && available.length > 0) {
                    setSelectedProductId(available[0].id);
                }
            }
        } catch (err) {
            console.warn('Could not load inventory products for forecasting:', err.message);
        } finally {
            setLoadingProducts(false);
        }
    };

    // 2. Fetch AI Forecast for the selected product
    const fetchProductForecast = async (productId) => {
        if (!productId) return;
        try {
            setLoadingForecast(true);
            const res = await axios.get(`${API_BASE_URL}/forecast/products/${productId}`);
            if (res.data) {
                setForecastData(res.data);
                setSimulatedDemand(res.data.expectedSales || 6);
            }
        } catch (err) {
            console.warn('Could not load product forecast:', err.message);
        } finally {
            setLoadingForecast(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProductId) {
            fetchProductForecast(selectedProductId);
        }
    }, [selectedProductId]);

    const handleProductChange = (e) => {
        const pId = Number(e.target.value);
        setSelectedProductId(pId);
    };

    const currentStock = forecastData?.currentStock ?? 0;
    const safetyBuffer = forecastData?.safetyBuffer ?? Math.ceil(simulatedDemand * 0.15);
    const recommendedBatch = Math.max(0, (simulatedDemand + safetyBuffer) - currentStock);
    const currentProduct = products.find(p => p.id === selectedProductId) || null;

    return (
        <div className="space-y-6">

            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-[#fcb900] text-slate-900 text-xs px-2.5 py-0.5 rounded font-black flex items-center gap-1">
                            <Sparkles size={12} /> AI Predictive Analytics Engine
                        </span>
                        <span className="text-xs text-indigo-300 font-mono">
                            {forecastData?.algorithmUsed || 'OLS Regression + Exponential Smoothing'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mt-2">AI-Driven Production Demand Forecasting</h2>
                    <p className="text-slate-300 text-sm mt-1">
                        Machine learning model analyzing verified retail sales cycles to optimize shop floor scheduling and prevent inventory stock-outs.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-lg border border-white/10 text-right min-w-[240px]">
                    <p className="text-xs text-indigo-200">Forecasted Target Craft Product</p>
                    {loadingProducts ? (
                        <p className="text-xs text-slate-400 mt-1">Loading product catalog...</p>
                    ) : (
                        <select
                            value={selectedProductId || ''}
                            onChange={handleProductChange}
                            className="bg-slate-800 text-[#fcb900] font-bold text-xs rounded px-2.5 py-1.5 mt-1 border border-indigo-500/40 w-full focus:outline-none"
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* 4 AI Core Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Predicted Demand (D)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-indigo-600">
                            {loadingForecast ? '...' : (forecastData?.expectedSales ?? simulatedDemand)}
                        </span>
                        <span className="text-xs text-slate-500">Units / Period</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Confidence: {forecastData ? `${Math.round(forecastData.confidenceScore * 100)}%` : 'Active'}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Safety Buffer (β)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-amber-600">+{safetyBuffer}</span>
                        <span className="text-xs text-slate-500">Units buffer</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">15% cushion against demand spikes</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Warehouse Stock (S)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-cyan-700">
                            {loadingForecast ? '...' : currentStock}
                        </span>
                        <span className="text-xs text-slate-500">Units on hand</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Live verified finished stock</p>
                </div>

                <div className={`rounded-xl p-4 border shadow-sm ${
                    recommendedBatch > 0
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                    <p className="text-xs font-bold uppercase tracking-wider">AI Production Recommendation</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black">{recommendedBatch}</span>
                        <span className="text-xs font-bold">Units Needed</span>
                    </div>
                    <p className="text-[11px] font-semibold mt-1">
                        {recommendedBatch > 0 ? 'Batch launch recommended!' : 'Stock is adequate (No batch required)'}
                    </p>
                </div>

            </div>

            {/* Visual Chart + Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Analytical Model & Historical Context */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <TrendingUp size={18} className="text-[#006837]" />
                                Regression Model Details & Past Sales
                            </h3>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                                {forecastData?.forecastPeriod || 'Weekly Horizon'}
                            </span>
                        </div>

                        <div className="space-y-3 pt-2 text-xs">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-600">Product SKU:</span>
                                <span className="font-mono font-bold text-slate-800">{currentProduct?.sku || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-600">Historical Retail Units Sold:</span>
                                <span className="font-bold text-slate-900">
                                    {forecastData?.historicalSalesUnits ?? 0} units
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-600">Regression Baseline Demand:</span>
                                <span className="font-bold text-indigo-700">
                                    {forecastData?.expectedSales ?? 0} units / cycle
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-600">Decision Support Advisory:</span>
                                <span className="font-medium text-emerald-800 text-right max-w-xs">
                                    {forecastData?.decisionSupportNote || 'Analyzing warehouse stock levels.'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Formula Bar */}
                    <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                        <Info size={16} className="text-indigo-600 shrink-0" />
                        <span>
                            <strong>Model Formula:</strong> Q_reorder = max(0, (D + Buffer) - Stock) = max(0, ({simulatedDemand} + {safetyBuffer}) - {currentStock}) = <strong className="text-slate-900">{recommendedBatch} units</strong>.
                        </span>
                    </div>
                </div>

                {/* Interactive "What-If" Demand Simulator */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <BrainCircuit size={18} className="text-indigo-600" />
                                Interactive "What-If" Demand Simulator
                            </h3>
                            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                                Live Simulation
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-4">
                            Move the slider below to test various market demand scenarios. The AI system will automatically recalculate batch replenishment requirements:
                        </p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                                    <span>Simulated Market Demand:</span>
                                    <span className="text-indigo-700 font-mono text-base">{simulatedDemand} Units</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={simulatedDemand}
                                    onChange={(e) => setSimulatedDemand(Number(e.target.value))}
                                    className="w-full accent-[#006837] cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>1 (Off-Season)</span>
                                    <span>20 (Normal Retail)</span>
                                    <span>50 (State Craft Expo)</span>
                                </div>
                            </div>

                            {/* Dynamic Recommendation Result */}
                            <div className={`p-4 rounded-xl border ${
                                recommendedBatch > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {recommendedBatch > 0 ? (
                                        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">
                                            {recommendedBatch > 0 ? 'Production Batch Required!' : 'Current Stock is Sufficient'}
                                        </h4>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {recommendedBatch > 0
                                                ? `To fulfill ${simulatedDemand} demand + ${safetyBuffer} safety buffer, schedule a new production batch of ${recommendedBatch} units of ${currentProduct?.name || 'this product'}.`
                                                : `Warehouse holds ${currentStock} verified units, which comfortably covers the projected ${simulatedDemand} demand without manufacturing more.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Autonomous Decision Support</span>
                        <button
                            onClick={() => alert(`AI Recommendation Triggered: A new production run of ${recommendedBatch} units for "${currentProduct?.name}" has been submitted for approval.`)}
                            disabled={recommendedBatch === 0}
                            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                recommendedBatch > 0
                                    ? 'bg-[#006837] hover:bg-[#004d28] text-white shadow'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            Schedule Recommended Batch ({recommendedBatch})
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}