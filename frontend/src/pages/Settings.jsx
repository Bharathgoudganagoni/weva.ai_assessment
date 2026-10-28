import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ShieldCheck,
  Store,
} from 'lucide-react';

export default function Settings() {
  const { organization, updateOrganizationState } = useAuth();

  const [name, setName] = useState('');
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.settings.get();
        setSettingsData(res.data);
        setName(res.data.name);
        setDefaultThreshold(res.data.defaultLowStockThreshold);
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to load organization settings.',
        });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const parsedThreshold = parseInt(defaultThreshold, 10);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      setFeedback({
        type: 'error',
        message: 'Default low stock threshold must be a non-negative number.',
      });
      setSaving(false);
      return;
    }

    if (!name.trim()) {
      setFeedback({
        type: 'error',
        message: 'Organization name cannot be empty.',
      });
      setSaving(false);
      return;
    }

    try {
      const res = await api.settings.update({
        name: name.trim(),
        defaultLowStockThreshold: parsedThreshold,
      });

      updateOrganizationState(res.data);
      setSettingsData((prev) => ({ ...prev, ...res.data }));

      setFeedback({
        type: 'success',
        message: 'Settings updated successfully. All catalog reorder calculations have been refreshed.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-[#FF5722] rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Store & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure organization identity, tenant safety stock thresholds, and inventory automation rules.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Store Identity & Location</h2>
              <p className="text-xs text-slate-400">
                Visible across invoices, packing slips, and navigation header.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Organization / Store Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Retailers — Downtown Store"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Low Stock Alert Threshold
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={defaultThreshold}
                  onChange={(e) => setDefaultThreshold(e.target.value)}
                  className="w-28 px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm font-bold text-center focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
                  required
                />
                <span className="text-xs text-slate-500 font-medium">units remaining</span>
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-xl flex items-start space-x-3 text-xs text-slate-700">
            <Info className="w-4 h-4 text-[#FF5722] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">How Thresholds Work: </span>
              Products without an individual custom reorder threshold will automatically inherit this organization default (&le;{defaultThreshold} units). When stock reaches or dips below this level, they trigger high-priority alerts on the dashboard.
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Tenant Details Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Tenant Isolation Context</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active & Isolated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Tenant Organization ID</span>
              <span className="font-mono font-bold text-slate-800 break-all text-[11px] mt-0.5 block">
                {settingsData?.id || organization?.id || '—'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Database Storage Engine</span>
              <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">
                MySQL 8.0 (Prisma ORM Managed)
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
