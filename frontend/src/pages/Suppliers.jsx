import React, { useState } from 'react';
import { Truck, Mail, Search } from 'lucide-react';

const SAMPLE_SUPPLIERS = [
  { id: 'SUP-01', name: 'Global Tech Components Ltd.', category: 'Electronics', contact: 'Alex Rivera', email: 'orders@globaltech.io', leadTime: '3-5 days', status: 'Active' },
  { id: 'SUP-02', name: 'Apex Logistics Freight & Supply', category: 'Warehousing', contact: 'Sarah Jenkins', email: 'supply@apexlogistics.com', leadTime: '2-4 days', status: 'Active' },
  { id: 'SUP-03', name: 'Pinnacle Ergonomics Manufacturing', category: 'Accessories', contact: 'David Zhao', email: 'sales@pinnacle.co', leadTime: '5-7 days', status: 'Active' },
  { id: 'SUP-04', name: 'EcoFiber Textiles & Apparel', category: 'Apparel', contact: 'Elena Rostova', email: 'elena@ecofiber.org', leadTime: '7-10 days', status: 'Active' },
];

export default function Suppliers() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_SUPPLIERS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Suppliers & Vendors
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your verified procurement partners, restocking lead times, and vendor contacts.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor name or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] border border-transparent text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#FF5722]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{supplier.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{supplier.id} &bull; {supplier.category}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {supplier.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Contact Person</span>
                <span className="font-bold text-slate-800">{supplier.contact}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Restock Lead Time</span>
                <span className="font-bold text-slate-800">{supplier.leadTime}</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2 text-slate-600 truncate mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
