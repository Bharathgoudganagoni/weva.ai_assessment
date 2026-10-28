import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Package } from 'lucide-react';

function getInitialFormData(product) {
  if (!product) {
    return {
      name: '',
      sku: '',
      description: '',
      quantity: '0',
      costPrice: '',
      sellingPrice: '',
      lowStockThreshold: '',
    };
  }
  return {
    name: product.name || '',
    sku: product.sku || '',
    description: product.description || '',
    quantity: product.quantity !== undefined ? String(product.quantity) : '0',
    costPrice: product.costPrice !== null && product.costPrice !== undefined ? String(product.costPrice) : '',
    sellingPrice: product.sellingPrice !== null && product.sellingPrice !== undefined ? String(product.sellingPrice) : '',
    lowStockThreshold: product.lowStockThreshold !== null && product.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : '',
  };
}

function ProductModalContent({
  onClose,
  onSubmit,
  product = null,
  defaultThreshold = 5,
}) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setError('Product SKU is required.');
      return;
    }

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity on hand must be a positive number or zero.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description.trim() || null,
        quantity: qty,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
        lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold, 10) : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Live profit margin calculation
  const costNum = parseFloat(formData.costPrice);
  const sellNum = parseFloat(formData.sellingPrice);
  const hasMargin = !isNaN(costNum) && !isNaN(sellNum) && sellNum > 0;
  const marginDollar = hasMargin ? (sellNum - costNum).toFixed(2) : null;
  const marginPercent = hasMargin ? (((sellNum - costNum) / sellNum) * 100).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 sm:p-7 text-left max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Edit Product SKU' : 'Add New Inventory Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing ? 'Update catalog details and reorder levels' : 'Configure pricing, quantities, and reorder alerts'}
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

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                SKU Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. FURN-EOC-01"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 font-mono text-sm uppercase focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide brief product specs, material, or vendor info..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Quantity on Hand <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
              />
            </div>
          </div>

          {/* Reorder Threshold */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Reorder Point / Low Stock Threshold
              </label>
              <span className="text-[11px] text-slate-400">
                Org Default: &le;{defaultThreshold}
              </span>
            </div>
            <input
              type="number"
              name="lowStockThreshold"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              placeholder={`Leave blank to inherit default (${defaultThreshold})`}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F4F5F7] border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition"
            />
          </div>

          {/* Margin Preview Pill */}
          {hasMargin && (
            <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Estimated Gross Profit:</span>
              <span className="font-bold text-emerald-600 font-mono">
                +${marginDollar} ({marginPercent}%)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save Product Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  defaultThreshold = 5,
}) {
  if (!isOpen) return null;

  return (
    <ProductModalContent
      key={product ? product.id : 'new'}
      onClose={onClose}
      onSubmit={onSubmit}
      product={product}
      defaultThreshold={defaultThreshold}
    />
  );
}
