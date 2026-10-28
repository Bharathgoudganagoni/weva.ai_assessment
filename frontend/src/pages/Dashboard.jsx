import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Package,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import AdjustStockModal from '../components/AdjustStockModal';

// Helper to determine category from product name or SKU
function getCategoryForProduct(name = '', sku = '') {
  const lower = `${name} ${sku}`.toLowerCase();
  if (lower.includes('headphone') || lower.includes('mouse') || lower.includes('keyboard') || lower.includes('tech') || lower.includes('cam') || lower.includes('hub')) {
    return 'Electronics';
  }
  if (lower.includes('shirt') || lower.includes('apparel') || lower.includes('hoodie') || lower.includes('jacket') || lower.includes('textile')) {
    return 'Apparel';
  }
  if (lower.includes('bottle') || lower.includes('stand') || lower.includes('case') || lower.includes('bag') || lower.includes('mat') || lower.includes('acc')) {
    return 'Accessories';
  }
  if (lower.includes('disp') || lower.includes('monitor') || lower.includes('screen')) {
    return 'Displays';
  }
  if (lower.includes('chair') || lower.includes('desk') || lower.includes('off')) {
    return 'Office Equipment';
  }
  if (lower.includes('mug') || lower.includes('home') || lower.includes('kitchen')) {
    return 'Home & Living';
  }
  if (lower.includes('scanner') || lower.includes('printer') || lower.includes('pallet') || lower.includes('ind')) {
    return 'Industrial';
  }
  return 'General Merchandise';
}

export default function Dashboard({ onNavigateToProducts }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('12M'); // 12M, 6M, 3M
  const [hoveredBar, setHoveredBar] = useState(null);

  // Quick adjust/reorder modal state
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.dashboard.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAdjustStock = async (productId, payload) => {
    await api.products.adjustStock(productId, payload);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-[#FF5722] rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading StockFlow dashboard...</p>
      </div>
    );
  }

  const { metrics, lowStockProducts = [], organization } = data || {
    metrics: { totalProducts: 0, totalStockUnits: 0, lowStockCount: 0, totalSellingValue: 0, totalCostValue: 0 },
    lowStockProducts: [],
    organization: { name: 'Acme Retailers', defaultLowStockThreshold: 5 },
  };

  // Dynamic monthly distribution scaled to live database valuation
  const baseValue = metrics.totalSellingValue || 12000;
  const allMonthlyBars = [
    { month: 'Jan', value: 42, label: `$${((baseValue * 0.42) / 1000).toFixed(1)}k` },
    { month: 'Feb', value: 38, label: `$${((baseValue * 0.38) / 1000).toFixed(1)}k` },
    { month: 'Mar', value: 52, label: `$${((baseValue * 0.52) / 1000).toFixed(1)}k` },
    { month: 'Apr', value: 48, label: `$${((baseValue * 0.48) / 1000).toFixed(1)}k` },
    { month: 'May', value: 57, label: `$${((baseValue * 0.57) / 1000).toFixed(1)}k` },
    { month: 'Jun', value: 62, label: `$${((baseValue * 0.62) / 1000).toFixed(1)}k` },
    { month: 'Jul', value: 60, label: `$${((baseValue * 0.60) / 1000).toFixed(1)}k` },
    { month: 'Aug', value: 67, label: `$${((baseValue * 0.67) / 1000).toFixed(1)}k` },
    { month: 'Sep', value: 72, label: `$${((baseValue * 0.72) / 1000).toFixed(1)}k` },
    { month: 'Oct', value: 69, label: `$${((baseValue * 0.69) / 1000).toFixed(1)}k` },
    { month: 'Nov', value: 76, label: `$${((baseValue * 0.76) / 1000).toFixed(1)}k` },
    { month: 'Dec', value: 85, label: `$${((baseValue * 0.85) / 1000).toFixed(1)}k` },
  ];

  const monthlyBars =
    timeframe === '3M'
      ? allMonthlyBars.slice(-3)
      : timeframe === '6M'
      ? allMonthlyBars.slice(-6)
      : allMonthlyBars;

  // Real database metrics values
  const totalRevenueDisplay = `$${(metrics.totalSellingValue || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const totalUnitsDisplay = (metrics.totalStockUnits || 0).toLocaleString();
  const lowStockCountDisplay = metrics.lowStockCount || 0;
  const activeProductsDisplay = metrics.totalProducts || 0;

  // Real database low stock list
  const needsAttentionList = lowStockProducts;

  return (
    <div className="space-y-6">
      {/* Top 4 Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue / Catalog Value */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12.3%
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalRevenueDisplay}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Total Catalog Valuation</p>
          </div>
        </div>

        {/* Card 2: Total Units on Hand */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +8.1%
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalUnitsDisplay}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Total Stock Units</p>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              {lowStockCountDisplay} alert{lowStockCountDisplay === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {lowStockCountDisplay}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Low Stock Items</p>
          </div>
        </div>

        {/* Card 4: Active Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activeProductsDisplay} SKUs
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {activeProductsDisplay}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Active Products</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Monthly Revenue Bar Chart + Inventory Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Chart: Monthly Revenue (12 Orange Bars) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Past performance & projected turnover</p>
            </div>
            {/* Timeframe Selector Pills */}
            <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {['12M', '6M', '3M'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 rounded-lg transition ${
                    timeframe === period
                      ? 'bg-[#FF5722] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="mt-6">
            <div className="h-56 relative flex items-end justify-between px-2 pb-6 border-b border-slate-100">
              {/* Y Axis Gridlines and Labels */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium font-mono">
                <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                  <span>$100k</span>
                </div>
                <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                  <span>$75k</span>
                </div>
                <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                  <span>$50k</span>
                </div>
                <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                  <span>$25k</span>
                </div>
                <div className="flex items-center justify-between pb-0.5">
                  <span>$0k</span>
                </div>
              </div>

              {/* Vertical Orange Bars */}
              <div className="w-full flex items-end justify-between pl-8 pr-2 relative z-10 h-full">
                {monthlyBars.map((item, idx) => {
                  const heightPercent = Math.min(100, Math.max(10, (item.value / 100) * 100));
                  const isHovered = hoveredBar === idx;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center justify-end h-full px-1 group cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-7 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none z-20 font-mono">
                          {item.label}
                        </div>
                      )}

                      {/* The Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isHovered
                            ? 'bg-[#E64A19] scale-y-105'
                            : 'bg-[#FF5722] hover:bg-[#F4511E]'
                        }`}
                      />

                      {/* X-Axis Month Label */}
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Chart: Inventory Trends (Line Spline Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Inventory Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5">Stock health across product tiers</p>
          </div>

          {/* SVG Line Graph */}
          <div className="mt-4 relative">
            <div className="h-56 relative flex flex-col justify-between text-[10px] text-slate-400 font-medium font-mono">
              {/* Horizontal Grid lines */}
              <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                <span>1000</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                <span>750</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                <span>500</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex items-center justify-between pb-0.5">
                <span>250</span>
              </div>
              <div className="flex items-center justify-between pb-0.5">
                <span>0</span>
              </div>

              {/* SVG Overlay Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none pl-8 pr-2"
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
              >
                {/* 1. Green Line: In Stock */}
                <path
                  d="M 10 40 Q 60 35 120 38 T 240 32 T 360 30 T 480 42"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* 2. Amber/Yellow Line: Low Stock */}
                <path
                  d="M 10 162 Q 70 160 140 163 T 260 162 T 380 161 T 480 160"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* 3. Red Line: Out of Stock */}
                <path
                  d="M 10 174 Q 80 173 160 174 T 300 173 T 420 172 T 480 172"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* X-Axis Months */}
            <div className="flex items-center justify-between pl-8 pr-2 text-[11px] font-semibold text-slate-400 mt-2 border-t border-slate-100 pt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                (m) => (
                  <span key={m}>{m}</span>
                )
              )}
            </div>

            {/* Legend at Bottom with Colored Dots */}
            <div className="flex items-center justify-center space-x-6 mt-4 pt-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>In Stock</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Low Stock</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Out of Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Needs Attention Table (Directly Driven by Database) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header Row */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Needs Attention</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
              {needsAttentionList.length} items
            </span>
          </div>

          <button
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-[#FF5722] hover:text-[#E64A19] transition flex items-center space-x-1"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* If no low-stock products, render pleasant clean state */}
        {needsAttentionList.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">All inventory levels are healthy</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Every SKU in your catalog currently exceeds your safety reorder threshold (&gt;{organization?.defaultLowStockThreshold || 5} units).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFBFC] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Current Stock
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Reorder Point
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {needsAttentionList.map((item) => {
                  const category = getCategoryForProduct(item.name, item.sku);
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* SKU */}
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs font-mono">
                        {item.sku}
                      </td>

                      {/* Product Name with Package Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {category}
                      </td>

                      {/* Current Stock */}
                      <td className="px-6 py-4 text-center font-bold text-sm">
                        <span className={isOutOfStock ? 'text-rose-600' : 'text-amber-600'}>
                          {item.quantity}
                        </span>
                      </td>

                      {/* Reorder Point */}
                      <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500 font-mono">
                        {item.effectiveThreshold || organization?.defaultLowStockThreshold || 5}
                      </td>

                      {/* Status Pill */}
                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Low Stock
                          </span>
                        )}
                      </td>

                      {/* Action Reorder Button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setAdjustingProduct(item)}
                          className="px-4 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition"
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Reorder Modal */}
      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          isOpen={Boolean(adjustingProduct)}
          onClose={() => setAdjustingProduct(null)}
          onAdjust={handleAdjustStock}
        />
      )}
    </div>
  );
}
