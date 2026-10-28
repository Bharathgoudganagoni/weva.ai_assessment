import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SAMPLE_ORDERS = [
  { id: 'ORD-9821', customer: 'Nexus Electronics Corp', items: 12, total: 2450.00, status: 'Completed', date: '2026-10-27' },
  { id: 'ORD-9820', customer: 'Horizon Retail Partners', items: 4, total: 580.00, status: 'Processing', date: '2026-10-27' },
  { id: 'ORD-9819', customer: 'Apex Logistics Distribution', items: 28, total: 4920.00, status: 'Shipped', date: '2026-10-26' },
  { id: 'ORD-9818', customer: 'Urban Living Supplies', items: 7, total: 1140.00, status: 'Completed', date: '2026-10-25' },
  { id: 'ORD-9817', customer: 'Pacific Commercial Co.', items: 16, total: 3200.00, status: 'Completed', date: '2026-10-24' },
  { id: 'ORD-9816', customer: 'Beacon Tech Ventures', items: 2, total: 398.00, status: 'Processing', date: '2026-10-23' },
];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = SAMPLE_ORDERS.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    if (filter === 'completed') return matchSearch && o.status === 'Completed';
    if (filter === 'processing') return matchSearch && o.status === 'Processing';
    if (filter === 'shipped') return matchSearch && o.status === 'Shipped';
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orders & Shipments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor incoming merchant orders, stock fulfillment, and carrier dispatch status.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] border border-transparent text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#FF5722]/20"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-bold">
          {['all', 'processing', 'shipped', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                filter === tab
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FBFBFC] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer / Merchant</th>
                <th className="px-6 py-3.5 text-center">Items</th>
                <th className="px-6 py-3.5 text-right">Total</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">
                    {order.items} units
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : order.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
