import React, { useState } from 'react';
import { X, AlertCircle, Loader2, ArrowRight, Package } from 'lucide-react';

export default function AdjustStockModal({
  isOpen,
  onClose,
  onSubmit,
  onAdjust,
  product,
}) {
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = onAdjust || onSubmit;

  if (!isOpen || !product) return null;

  const currentQty = product.quantity || 0;
  const parsedDelta = parseInt(delta, 10);
  const isValidDelta = !isNaN(parsedDelta) && parsedDelta !== 0;
  const resultingQty = isValidDelta ? currentQty + parsedDelta : currentQty;

  const quickAdjust = (amount) => {
    setDelta(String(amount));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidDelta) {
      setError('Please enter a valid non-zero adjustment amount (e.g. +10 or -2).');
      return;
    }

    if (resultingQty < 0) {
      setError(`Cannot reduce stock below 0. Maximum possible deduction is -${currentQty}.`);
      return;
    }

    setLoading(true);

    try {
      if (submitHandler) {
        await submitHandler(product.id, {
          delta: parsedDelta,
          note: note.trim() || undefined,
        });
      }
      setDelta('');
      setNote('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Reorder / Adjust Stock
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[240px]">
                {product.name} ({product.sku})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Transition Preview Banner */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Current</span>
            <span className="text-xl font-bold font-mono text-slate-900">{currentQty}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Adjustment</span>
            <span
              className={`text-xl font-bold font-mono ${
                !isValidDelta
                  ? 'text-slate-400'
                  : parsedDelta > 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {isValidDelta ? (parsedDelta > 0 ? `+${parsedDelta}` : parsedDelta) : '0'}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Resulting</span>
            <span
              className={`text-xl font-bold font-mono ${
                resultingQty < 0
                  ? 'text-rose-600 font-black'
                  : 'text-[#FF5722]'
              }`}
            >
              {resultingQty}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Adjustment Quantity (+ / -)
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. 10 or -2"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition"
              autoFocus
            />

            {/* Quick Adjustment Preset Buttons */}
            <div className="flex items-center space-x-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick presets:</span>
              {[
                { label: '+5', val: 5 },
                { label: '+10', val: 10 },
                { label: '+25', val: 25 },
                { label: '+50', val: 50 },
                { label: '-1', val: -1 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => quickAdjust(btn.val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason / PO Note <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Vendor shipment PO-8491 received"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValidDelta || resultingQty < 0}
              className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Stock Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
