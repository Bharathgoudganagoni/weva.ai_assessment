import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(product.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 text-left">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Delete Product SKU?
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{product.name}"</span> (SKU: <span className="font-mono text-orange-600 font-bold">{product.sku}</span>)?
            </p>
            <p className="text-xs text-rose-600 mt-2 font-medium">
              This action permanently removes the SKU from your catalog.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
