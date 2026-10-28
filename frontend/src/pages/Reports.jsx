import React from 'react';
import { DollarSign, PieChart, BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Analytics & Financial Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit-ready reporting on stock valuation, profit margins, inventory turnover, and catalog velocity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inventory Asset Valuation</h3>
              <p className="text-xs text-slate-400">Total cost vs potential retail</p>
            </div>
          </div>
          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Retail Inventory Value:</span>
              <span className="font-bold font-mono text-slate-900">$284,592.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Wholesale Cost Basis:</span>
              <span className="font-bold font-mono text-slate-900">$138,420.00</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Projected Gross Margin:</span>
              <span className="font-bold font-mono text-emerald-600">51.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Turnover & Stock Velocity</h3>
              <p className="text-xs text-slate-400">Annual stock movement rate</p>
            </div>
          </div>
          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Average Turn Rate:</span>
              <span className="font-bold font-mono text-slate-900">4.8x / year</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Days of Inventory (DOH):</span>
              <span className="font-bold font-mono text-slate-900">24.2 days</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Stockout Risk Index:</span>
              <span className="font-bold font-mono text-amber-600">Low (2.4%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Category Share</h3>
              <p className="text-xs text-slate-400">Distribution by merchandise</p>
            </div>
          </div>
          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Consumer Electronics:</span>
              <span className="font-bold font-mono text-slate-900">58%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Apparel & Textiles:</span>
              <span className="font-bold font-mono text-slate-900">24%</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Accessories & Gear:</span>
              <span className="font-bold font-mono text-slate-900">18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
