import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShoppingCart,
    Receipt,
    CheckCircle2,
    AlertCircle,
    User,
    Calendar,
    Printer,
    ShieldCheck,
    RefreshCw,
    Phone,
    MapPin,
    PackageCheck,
    Plus,
    Minus,
    Eye,
    Edit3,
    Truck,
    X,
    Save,
    Clock,
    Trash2,
    Mail,
    QrCode,
    FileText,
    Building
} from 'lucide-react';

export default function SalesPOS({ onNavigateTab }) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Order Booking Form state
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [dispatchDate, setDispatchDate] = useState(todayStr);
    const [quantity, setQuantity] = useState(1);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [orderError, setOrderError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orders, setOrders] = useState([]);

    // View Order Modal state
    const [viewOrder, setViewOrder] = useState(null);

    // Edit Order Modal state
    const [editOrder, setEditOrder] = useState(null);
    const [editForm, setEditForm] = useState({
        customerName: '',
        customerContact: '',
        customerEmail: '',
        customerAddress: '',
        dispatchDate: '',
        quantity: 1
    });
    const [editError, setEditError] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    // Fetch finished goods stock & orders from backend
    const fetchPOSData = async () => {
        try {
            const [stockRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/inventory/finished-goods'),
                axios.get('http://localhost:8080/api/v1/sales/orders')
            ]);

            if (Array.isArray(stockRes.data) && stockRes.data.length > 0) {
                setInventoryItems(stockRes.data);
                // Default select first product that has positive availableStock
                if (!selectedProductId || !stockRes.data.some(i => i.product?.id === Number(selectedProductId))) {
                    const inStockItem = stockRes.data.find(i => (i.availableStock || 0) > 0);
                    const defaultItem = inStockItem || stockRes.data[0];
                    if (defaultItem?.product?.id) {
                        setSelectedProductId(String(defaultItem.product.id));
                    }
                }
            }

            if (Array.isArray(ordersRes.data)) {
                // Map backend order structure for UI
                const formattedOrders = ordersRes.data.map(ord => {
                    const isDispatched = ord.status === 'DISPATCHED';
                    return {
                        rawId: ord.id,
                        id: ord.orderNumber || `ORD-${ord.id}`,
                        customer: ord.customer?.name || 'Customer',
                        customerContact: ord.customer?.contactNumber || '',
                        customerEmail: ord.customer?.email || '',
                        customerAddress: ord.customer?.address || '',
                        item: ord.items?.map(it => `${it.product?.name || 'Craft'} × ${it.quantity}`).join(', ') || 'Craft Products',
                        itemsList: ord.items || [],
                        qty: ord.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 1,
                        total: ord.totalAmount || 0,
                        unitPrice: ord.items?.[0]?.unitPrice || 0,
                        date: ord.orderDate ? new Date(ord.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
                        orderDateTime: ord.orderDate ? new Date(ord.orderDate).toLocaleString('en-GB') : 'Just now',
                        dispatchDate: ord.dispatchDate || '',
                        dispatchedAt: ord.dispatchedAt ? new Date(ord.dispatchedAt).toLocaleString('en-GB') : null,
                        status: ord.status || 'CONFIRMED',
                        isDispatched: isDispatched
                    };
                });
                // Sort descending so newest order appears at the top
                formattedOrders.reverse();
                setOrders(formattedOrders);

                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('invoice') === '1' && formattedOrders.length > 0) {
                    setViewOrder(formattedOrders[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching POS inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPOSData();
    }, []);

    // Currently selected product
    const currentItem = inventoryItems.find(
        (i) => i.product && String(i.product.id) === String(selectedProductId)
    );
    const currentProduct = currentItem?.product || null;
    const availableStock = currentItem?.availableStock || 0;
    const unitPrice = currentProduct?.sellingPrice || 0;

    // Smooth quantity stepper handlers
    const handleQuantityDelta = (delta) => {
        if (availableStock <= 0) return;
        const currentVal = Number(quantity) || 1;
        const next = Math.max(1, Math.min(availableStock, currentVal + delta));
        setQuantity(next);
        setOrderError('');
    };

    const handleManualQuantityChange = (e) => {
        if (availableStock <= 0) return;
        const val = e.target.value;
        if (val === '') {
            setQuantity('');
            return;
        }
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        if (num > availableStock) {
            setQuantity(availableStock);
            setOrderError(`Quantity capped to maximum available warehouse stock (${availableStock} units).`);
        } else if (num < 1) {
            setQuantity(1);
            setOrderError('');
        } else {
            setQuantity(num);
            setOrderError('');
        }
    };

    const handleQuantityBlur = () => {
        if (availableStock <= 0) return;
        if (quantity === '' || Number(quantity) < 1) {
            setQuantity(1);
        } else if (Number(quantity) > availableStock) {
            setQuantity(availableStock);
        }
    };

    // Responsive quantity used for total calculations
    const activeQty = availableStock <= 0 ? 0 : Math.max(1, Math.min(availableStock, Number(quantity) || 1));

    // Place new order
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setOrderError('');
        setOrderSuccess(null);

        const orderQty = activeQty;

        if (!currentProduct) {
            setOrderError('Please select a valid finished product.');
            return;
        }

        if (availableStock <= 0) {
            setOrderError(`"${currentProduct.name}" is currently out of stock. Await new production batch clearance.`);
            return;
        }

        if (orderQty > availableStock) {
            setOrderError(
                `Validation Failed: Requested quantity (${orderQty}) exceeds available warehouse stock (${availableStock} units).`
            );
            return;
        }

        if (!dispatchDate) {
            setOrderError('Please select a scheduled dispatch date before confirming the order.');
            return;
        }

        setSubmitting(true);

        const payload = {
            customerName: customerName.trim(),
            customerContact: customerContact.trim() || '9876543210',
            customerEmail: customerEmail.trim() || 'pos@kiss.ac.in',
            customerAddress: customerAddress.trim() || 'Bhubaneswar Campus',
            dispatchDate: dispatchDate,
            items: [
                {
                    productId: currentProduct.id,
                    quantity: orderQty
                }
            ]
        };

        try {
            const res = await axios.post('http://localhost:8080/api/v1/sales/orders', payload);
            const created = res.data;

            const newOrder = {
                rawId: created.id,
                id: created.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
                customer: customerName,
                customerContact: customerContact,
                customerEmail: customerEmail,
                customerAddress: customerAddress,
                item: `${currentProduct.name} × ${orderQty}`,
                itemsList: created.items || [],
                qty: orderQty,
                unitPrice: unitPrice,
                total: orderQty * unitPrice,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                orderDateTime: new Date().toLocaleString('en-GB'),
                dispatchDate: dispatchDate,
                dispatchedAt: null,
                status: 'CONFIRMED',
                isDispatched: false
            };

            setOrderSuccess(newOrder);
            setOrders(prev => [newOrder, ...prev]);
            setQuantity(1);

            // Re-fetch live inventory so warehouse and POS stocks are in sync
            await fetchPOSData();
        } catch (err) {
            console.error('Failed to process POS order:', err);
            const msg = err.response?.data?.message || err.message || 'Could not complete sales booking.';
            setOrderError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Open Edit Order Modal
    const handleOpenEdit = (ord) => {
        if (ord.isDispatched) return;
        setEditOrder(ord);
        setEditForm({
            customerName: ord.customer || '',
            customerContact: ord.customerContact || '',
            customerEmail: ord.customerEmail || '',
            customerAddress: ord.customerAddress || '',
            dispatchDate: ord.dispatchDate || todayStr,
            quantity: ord.qty || 1
        });
        setEditError('');
    };

    // Save Edited Order
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editOrder) return;
        setEditError('');
        setSavingEdit(true);

        try {
            const payload = {
                customerName: editForm.customerName.trim(),
                customerContact: editForm.customerContact.trim(),
                customerEmail: editForm.customerEmail.trim(),
                customerAddress: editForm.customerAddress.trim(),
                dispatchDate: editForm.dispatchDate,
                quantity: Number(editForm.quantity) || editOrder.qty
            };

            await axios.put(`http://localhost:8080/api/v1/sales/orders/${editOrder.rawId}`, payload);
            setEditOrder(null);
            await fetchPOSData();
        } catch (err) {
            console.error('Failed to update order:', err);
            const msg = err.response?.data?.message || err.message || 'Could not update order.';
            setEditError(msg);
        } finally {
            setSavingEdit(false);
        }
    };

    // Dispatch Order
    const handleDispatchOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to mark this order as DISPATCHED? Once dispatched, order details cannot be edited or cancelled.')) {
            return;
        }

        setDispatching(true);
        try {
            await axios.put(`http://localhost:8080/api/v1/sales/orders/${orderId}/dispatch`);
            setEditOrder(null);
            await fetchPOSData();
        } catch (err) {
            console.error('Failed to dispatch order:', err);
            const msg = err.response?.data?.message || err.message || 'Could not dispatch order.';
            alert(msg);
        } finally {
            setDispatching(false);
        }
    };

    // Cancel and Delete Order (Allowed only before dispatch, restores warehouse stock)
    const handleCancelOrder = async (ord) => {
        if (ord.isDispatched) {
            alert('Cannot cancel an order that has already been dispatched.');
            return;
        }

        const confirmMsg = `Are you sure you want to cancel and delete Order "${ord.id}"?\n\n` +
            `• Customer: ${ord.customer}\n` +
            `• Item: ${ord.item}\n` +
            `• Notice: The items (${ord.qty} units) will be automatically returned to the warehouse stock, and the order will be permanently deleted from the database.`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/v1/sales/orders/${ord.rawId}`);
            // Remove from local frontend orders list immediately
            setOrders(prev => prev.filter(o => o.rawId !== ord.rawId));
            if (editOrder && editOrder.rawId === ord.rawId) {
                setEditOrder(null);
            }
            if (viewOrder && viewOrder.rawId === ord.rawId) {
                setViewOrder(null);
            }
            // Re-fetch POS data so warehouse stock is synchronized
            await fetchPOSData();
        } catch (err) {
            console.error('Failed to cancel order:', err);
            const msg = err.response?.data?.message || err.message || 'Could not cancel order.';
            alert(msg);
        }
    };

    return (
        <div className="space-y-6">

            {/* Banner */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            Live POS & Commercial Dispatch
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800">Sales Order & Billing Terminal</h2>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Commercial dispatch with automatic warehouse stock deduction, customer invoicing, and pre-dispatch order modification.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={fetchPOSData}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Refresh live catalog and stock"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Sync Stock</span>
                    </button>
                    {onNavigateTab && (
                        <>
                            <button
                                onClick={() => onNavigateTab('qa-defects')}
                                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="Log customer defective product return or exchange"
                            >
                                <AlertCircle size={14} className="text-amber-600" />
                                <span>Defective Return / Exchange</span>
                            </button>
                            <button
                                onClick={() => onNavigateTab('feedback-hub')}
                                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006837] border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="Record customer product quality rating & review"
                            >
                                <ShieldCheck size={14} className="text-[#006837]" />
                                <span>Buyer Quality Reviews</span>
                            </button>
                        </>
                    )}
                    <div className="bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-lg text-rose-900 text-xs font-semibold flex items-center gap-2">
                        <ShoppingCart size={16} className="text-rose-600" />
                        <span>POS Counter #1</span>
                    </div>
                </div>
            </div>

            {/* Grid: Order Booking Form vs Quick Bill Receipt */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Order Creation Form */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <ShoppingCart size={18} className="text-[#006837]" />
                                New Customer Order Booking
                            </h3>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <ShieldCheck size={12} className="text-emerald-600" />
                                Admin-approved finished goods cleared for POS sale
                            </p>
                        </div>
                        <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-mono">
                            Stock Available: <strong className="text-[#006837]">{availableStock} Units</strong>
                        </span>
                    </div>

                    {orderError && (
                        <div className="mb-4 p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-lg text-xs flex items-center gap-2 font-semibold">
                            <AlertCircle size={16} className="shrink-0 text-rose-600" />
                            <span>{orderError}</span>
                        </div>
                    )}

                    {orderSuccess && (
                        <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl text-xs space-y-2 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                                    <span>Commercial Order {orderSuccess.id} Confirmed!</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewOrder(orderSuccess)}
                                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                    title="View printable official tax invoice"
                                >
                                    <Receipt size={13} className="text-[#006837]" /> View & Print Tax Invoice
                                </button>
                            </div>
                            <p className="text-slate-700 pl-6">
                                Product: <strong>{orderSuccess.item}</strong> | Customer: <strong>{orderSuccess.customer}</strong>
                            </p>
                            <p className="text-indigo-800 font-semibold pl-6">
                                Scheduled Dispatch Date: <strong>{orderSuccess.dispatchDate}</strong>
                            </p>
                            <div className="pl-6 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                                <span className="text-[#006837] font-bold text-sm">
                                    Total Invoice: ₹{orderSuccess.total?.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-emerald-800 font-mono">
                                    5% GST Included (CGST 2.5%: ₹{((orderSuccess.total / 1.05) * 0.025).toFixed(2)} | SGST 2.5%: ₹{((orderSuccess.total / 1.05) * 0.025).toFixed(2)})
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                        {/* Customer Information */}
                        <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <User size={13} className="text-slate-500" /> Customer Details
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Customer / Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    placeholder="e.g. KISS Tribal Craft Exhibition"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <Phone size={11} className="text-slate-400" /> Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        value={customerContact}
                                        onChange={(e) => setCustomerContact(e.target.value)}
                                        required
                                        placeholder="10-digit mobile number"
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <Mail size={11} className="text-slate-400" /> Customer Email
                                    </label>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                    <MapPin size={11} className="text-slate-400" /> Delivery / Billing Address
                                </label>
                                <input
                                    type="text"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Campus Pavilion or Delivery City"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>
                        </div>

                        {/* Dispatch Date Selection */}
                        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200/80">
                            <label className="block text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                                <Calendar size={14} className="text-indigo-600" />
                                Scheduled Dispatch Date
                            </label>
                            <input
                                type="date"
                                value={dispatchDate}
                                min={todayStr}
                                onChange={(e) => setDispatchDate(e.target.value)}
                                required
                                className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-2xs"
                            />
                            <p className="text-[11px] text-indigo-700 mt-1">
                                Specify expected delivery/handover date before confirming the order.
                            </p>
                        </div>

                        {/* Dynamic Product Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <PackageCheck size={14} className="text-[#006837]" /> Select Finished Product
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                    Showing Admin-Approved Products
                                </span>
                            </label>

                            <select
                                value={selectedProductId}
                                onChange={(e) => {
                                    setSelectedProductId(e.target.value);
                                    setQuantity(1);
                                    setOrderError('');
                                }}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#006837] shadow-2xs"
                            >
                                {inventoryItems.map((item) => {
                                    const isOutOfStock = (item.availableStock || 0) <= 0;
                                    return (
                                        <option key={item.product?.id} value={item.product?.id}>
                                            {item.product?.name} ({item.product?.sku}) — ₹{item.product?.sellingPrice?.toFixed(2)} [{isOutOfStock ? 'OUT OF STOCK (0 pcs)' : `In Stock: ${item.availableStock} pcs`}]
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Product Selected Spec Card */}
                            {currentProduct && (
                                <div className="mt-2.5 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900">{currentProduct.name}</p>
                                            <span className="text-[10px] font-bold bg-[#006837]/15 text-[#006837] px-2 py-0.5 rounded font-mono">
                                                {currentProduct.sku}
                                            </span>
                                            {availableStock <= 0 && (
                                                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-mono">
                                                    Out of Stock (0)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {currentProduct.description || currentProduct.course?.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-[#006837] text-base font-mono">
                                            ₹{unitPrice.toFixed(2)}
                                        </span>
                                        <p className="text-[10px] text-slate-500">Unit Price</p>
                                    </div>
                                </div>
                            )}

                            {/* Out of Stock Notice Banner */}
                            {availableStock <= 0 && currentProduct && (
                                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Finished Goods Stock Depleted (0 units in warehouse)</p>
                                        <p className="text-[11px] text-amber-800 mt-0.5">
                                            This commercial product is currently sold out. To replenish inventory for POS billing, schedule a production run in <strong>Production Management</strong> and request University Admin clearance.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Quantity Stepper with Clean Manual Typing (no arrow spinners) */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Order Quantity
                                </label>
                                <span className="text-[11px] text-slate-500 font-mono">
                                    Max Warehouse Clearance: <strong className={availableStock > 0 ? "text-slate-800" : "text-rose-600"}>{availableStock} units</strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityDelta(-1)}
                                        disabled={Number(quantity) <= 1 || availableStock <= 0}
                                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors border-r"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        max={Math.max(1, availableStock)}
                                        disabled={availableStock <= 0}
                                        value={availableStock <= 0 ? 0 : quantity}
                                        onChange={handleManualQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-20 text-center text-sm font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityDelta(1)}
                                        disabled={Number(quantity) >= availableStock || availableStock <= 0}
                                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors border-l"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 text-right text-xs text-slate-500">
                                    {availableStock <= 0 ? (
                                        <span className="text-rose-600 font-bold">Sold Out • Restock via Production</span>
                                    ) : (
                                        <span>{Math.max(0, availableStock - activeQty)} units will remain in warehouse</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Price & GST Calculation */}
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-amber-900 block">Total Invoice Payable (Incl. 5% GST):</span>
                                    <span className="text-[11px] text-amber-700">
                                        {activeQty} unit(s) @ ₹{unitPrice.toFixed(2)} each
                                    </span>
                                </div>
                                <span className="text-2xl font-black text-[#006837] font-mono">
                                    ₹{(activeQty * unitPrice).toFixed(2)}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-amber-200/70 grid grid-cols-3 gap-2 text-[10px] text-amber-900 font-mono">
                                <div>
                                    <span className="text-amber-700 block font-sans">Taxable Base:</span>
                                    <span>₹{((activeQty * unitPrice) / 1.05).toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-amber-700 block font-sans">CGST (2.5%):</span>
                                    <span>₹{(((activeQty * unitPrice) / 1.05) * 0.025).toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-amber-700 block font-sans">SGST (2.5%):</span>
                                    <span>₹{(((activeQty * unitPrice) / 1.05) * 0.025).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || availableStock <= 0}
                            className="w-full bg-[#006837] hover:bg-[#004d28] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw size={15} className="animate-spin" />
                                    Processing POS Order...
                                </>
                            ) : availableStock <= 0 ? (
                                <>
                                    <AlertCircle size={16} /> Item Out of Stock — Awaiting Production Clearance
                                </>
                            ) : (
                                <>
                                    <Receipt size={16} /> Confirm Order & Generate Invoice
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* 2. Order History & Revenue Ledger */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <Receipt size={18} className="text-indigo-600" />
                                    Recent Sales Orders & Receipts
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Real-time ledger of completed commercial dispatch invoices
                                </p>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-full">
                                Total Orders: {orders.length}
                            </span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                No sales orders booked yet. Place an order to generate the first commercial invoice!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                                {orders.map((ord, idx) => {
                                    const isDispatched = ord.status === 'DISPATCHED';

                                    return (
                                        <div
                                            key={ord.id || idx}
                                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:border-slate-300 transition-colors space-y-2.5"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900">{ord.customer}</p>
                                                        {isDispatched ? (
                                                            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <CheckCircle2 size={11} className="text-slate-600" /> DISPATCHED
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Clock size={11} className="text-amber-700" /> AWAITING DISPATCH
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                                                        Invoice: {ord.id} • Placed: {ord.date}
                                                    </p>
                                                    <p className="text-slate-700 font-medium mt-1">
                                                        Item: <span className="font-semibold">{ord.item}</span>
                                                    </p>
                                                    {ord.dispatchDate && (
                                                        <p className="text-indigo-700 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                                                            <Calendar size={11} className="text-indigo-600" /> Sched. Dispatch: {ord.dispatchDate}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-base font-black text-[#006837] font-mono">
                                                        ₹{ord.total?.toFixed(2)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{ord.qty} Unit(s)</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons: View, Edit & Cancel Order */}
                                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewOrder(ord)}
                                                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                                                >
                                                    <Eye size={13} className="text-indigo-600" />
                                                    <span>View Details</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(ord)}
                                                    disabled={isDispatched}
                                                    title={isDispatched ? "Order is already dispatched and cannot be edited" : "Edit order details before dispatch"}
                                                    className={`px-2.5 py-1.5 border rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs ${
                                                        isDispatched
                                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                                            : 'bg-emerald-50 hover:bg-emerald-100 text-[#006837] border-emerald-300'
                                                    }`}
                                                >
                                                    <Edit3 size={13} className={isDispatched ? 'text-slate-400' : 'text-[#006837]'} />
                                                    <span>{isDispatched ? 'Dispatched (Locked)' : 'Edit Order'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelOrder(ord)}
                                                    disabled={isDispatched}
                                                    title={isDispatched ? "Dispatched orders cannot be cancelled" : "Cancel order and return items to warehouse stock"}
                                                    className={`px-2.5 py-1.5 border rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs ${
                                                        isDispatched
                                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                                                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                                                    }`}
                                                >
                                                    <Trash2 size={13} className={isDispatched ? 'text-slate-300' : 'text-rose-600'} />
                                                    <span>Cancel Order</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3.5 bg-slate-100 rounded-xl text-xs text-slate-700 flex justify-between items-center border border-slate-200">
                        <span className="font-semibold">Cumulative Sales Revenue:</span>
                        <span className="font-black text-[#006837] text-base font-mono">
                            ₹{orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toFixed(2)}
                        </span>
                    </div>
                </div>

            </div>

            {/* VIEW ORDER DETAILS MODAL (OFFICIAL GST TAX INVOICE) */}
            {viewOrder && (() => {
                const totalAmt = Number(viewOrder.total) || 0;
                const taxableBase = totalAmt / 1.05;
                const cgstAmt = taxableBase * 0.025;
                const sgstAmt = taxableBase * 0.025;
                const totalGst = totalAmt - taxableBase;

                return (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-6">
                            
                            {/* University & Vocational Center Header */}
                            <div className="border-b-2 border-slate-800 pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#006837] text-white flex items-center justify-center font-black text-sm shadow-xs">
                                            KISS
                                        </div>
                                        <div>
                                            <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                                                KALINGA INSTITUTE OF SOCIAL SCIENCES (KISS)
                                            </h2>
                                            <p className="text-[11px] text-slate-600 font-medium">
                                                Vocational Production & Commercial Sales Center (Campus-10, Bhubaneswar)
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                GSTIN: <strong>21AAATK9876Q1Z2</strong> &bull; State Code: <strong>21 (Odisha)</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setViewOrder(null)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                                    <span className="font-bold text-[#006837] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                                        <FileText size={13} /> Commercial Tax Invoice / Retail Bill
                                    </span>
                                    <span className="font-mono text-slate-500 text-[11px]">
                                        Ref: <strong>{viewOrder.id}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Order & Dispatch Status Badge */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                <div>
                                    <span className="text-slate-500 font-medium block text-[11px]">Dispatch & Handover Status</span>
                                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                                        {viewOrder.status === 'DISPATCHED' ? (
                                            <span className="text-emerald-700 flex items-center gap-1">
                                                <CheckCircle2 size={14} className="text-emerald-600" /> Dispatched / Delivered to Client
                                            </span>
                                        ) : (
                                            <span className="text-amber-700 flex items-center gap-1">
                                                <Clock size={14} className="text-amber-600" /> Awaiting Packaging & Showroom Handover
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-500 font-medium block text-[11px]">Scheduled Handover</span>
                                    <span className="font-bold text-indigo-700 font-mono text-xs">
                                        {viewOrder.dispatchDate || 'Immediate'}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information Card */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                <p className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                    <User size={12} className="text-slate-400" /> Billed To (Buyer / Organization)
                                </p>
                                <p className="font-bold text-slate-900 text-sm">{viewOrder.customer}</p>
                                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-0.5">
                                    <p className="flex items-center gap-1">
                                        <Phone size={11} className="text-slate-400" /> {viewOrder.customerContact || 'N/A'}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <Mail size={11} className="text-slate-400" /> {viewOrder.customerEmail || 'pos@kiss.ac.in'}
                                    </p>
                                </div>
                                <p className="flex items-center gap-1 text-slate-600">
                                    <MapPin size={11} className="text-slate-400" /> {viewOrder.customerAddress || 'Campus Pavilion, Bhubaneswar'}
                                </p>
                            </div>

                            {/* Order Item List Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 text-slate-700 border-b">
                                        <tr>
                                            <th className="py-2 px-3">Item Description & Trade</th>
                                            <th className="py-2 px-2 text-center">Qty</th>
                                            <th className="py-2 px-2 text-right">Unit Rate</th>
                                            <th className="py-2 px-3 text-right">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewOrder.itemsList && viewOrder.itemsList.length > 0 ? (
                                            viewOrder.itemsList.map((it, i) => (
                                                <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50">
                                                    <td className="py-2 px-3">
                                                        <span className="font-bold text-slate-800">{it.product?.name || 'Craft Product'}</span>
                                                        <span className="block text-[10px] text-slate-400 font-mono">
                                                            {it.product?.sku || 'VOC-PRD'} &bull; HSN: 6204/9701
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 text-center font-bold">{it.quantity}</td>
                                                    <td className="py-2 px-2 text-right font-mono">₹{it.unitPrice?.toFixed(2)}</td>
                                                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{it.subtotal?.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="py-2 px-3">
                                                    <span className="font-semibold text-slate-800">{viewOrder.item}</span>
                                                    <span className="block text-[10px] text-slate-400 font-mono">
                                                        Vocational Production Division &bull; HSN: 6204/9701
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-center font-bold">{viewOrder.qty}</td>
                                                <td className="py-2 px-2 text-right font-mono">₹{viewOrder.unitPrice?.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{viewOrder.total?.toFixed(2)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Official Indian GST Breakdown & Summary */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Taxable Value (Before GST):</span>
                                    <span className="font-mono font-semibold">₹{taxableBase.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Central GST (CGST @ 2.5%):</span>
                                    <span className="font-mono">₹{cgstAmt.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>State GST (SGST @ 2.5%):</span>
                                    <span className="font-mono">₹{sgstAmt.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 pb-1 border-b border-slate-200">
                                    <span className="font-medium">Total Tax (5% GST):</span>
                                    <span className="font-mono font-bold text-slate-800">₹{totalGst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-slate-900">
                                    <div>
                                        <span className="font-black text-sm block">Net Amount Invoiced:</span>
                                        <span className="text-[10px] text-slate-500">Booked on {viewOrder.orderDateTime || viewOrder.date}</span>
                                    </div>
                                    <span className="text-xl font-black text-[#006837] font-mono">
                                        ₹{totalAmt.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Simulated Barcode & Verification Footer */}
                            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
                                <div className="space-y-1">
                                    <div className="font-mono tracking-widest text-[11px] text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 font-bold select-all inline-block">
                                        ||| | |||| | ||| || ||||| | ||| {viewOrder.id}
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        100% of proceeds support tribal apprentice stipends under Earn-While-You-Learn.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Authorized Signatory</span>
                                    <span className="text-[11px] font-bold text-[#006837]">KISS Production Cell</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2">
                                {!viewOrder.isDispatched ? (
                                    <button
                                        type="button"
                                        onClick={() => handleCancelOrder(viewOrder)}
                                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14} className="text-rose-600" /> Cancel Order
                                    </button>
                                ) : <div />}

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Printer size={14} /> Print Tax Invoice
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewOrder(null)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* EDIT ORDER MODAL (Active only till not dispatched) */}
            {editOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-start border-b pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Edit3 size={18} className="text-[#006837]" />
                                    <h3 className="font-bold text-slate-800 text-lg">Modify Order Details</h3>
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">Editing: {editOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setEditOrder(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {editError && (
                            <div className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-lg text-xs flex items-center gap-2 font-semibold">
                                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                                <span>{editError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Customer / Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.customerName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                                    required
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.customerContact}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, customerContact: e.target.value }))}
                                        required
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Customer Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.customerEmail}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Delivery / Billing Address
                                </label>
                                <input
                                    type="text"
                                    value={editForm.customerAddress}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                        <Calendar size={12} className="text-indigo-600" /> Scheduled Dispatch Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dispatchDate}
                                        min={todayStr}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dispatchDate: e.target.value }))}
                                        required
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Quantity (Pieces)
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        value={editForm.quantity}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                                        required
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#006837] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>

                            {/* Mark as Dispatched Action Box */}
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center mt-2">
                                <div>
                                    <p className="font-bold text-amber-900 flex items-center gap-1">
                                        <Truck size={14} className="text-amber-700" /> Dispatch Clearance
                                    </p>
                                    <p className="text-[10px] text-amber-800">
                                        Marking as dispatched permanently locks this order from further edits or cancellation.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDispatchOrder(editOrder.rawId)}
                                    disabled={dispatching}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                                >
                                    <Truck size={13} />
                                    {dispatching ? 'Dispatching...' : 'Mark Dispatched'}
                                </button>
                            </div>

                            {/* Modal Footer with Cancel Order & Save */}
                            <div className="flex items-center justify-between gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => handleCancelOrder(editOrder)}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                                >
                                    <Trash2 size={13} />
                                    Cancel & Delete
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditOrder(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingEdit}
                                        className="px-4 py-2 bg-[#006837] hover:bg-[#004d28] disabled:bg-slate-300 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                    >
                                        <Save size={14} />
                                        {savingEdit ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}