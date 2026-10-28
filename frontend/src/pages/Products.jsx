import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Search,
  Plus,
  Package,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import ProductModal from '../components/ProductModal';
import AdjustStockModal from '../components/AdjustStockModal';
import DeleteModal from '../components/DeleteModal';

function getCategoryForProduct(name = '', sku = '') {
  const lower = `${name} ${sku}`.toLowerCase();
  if (lower.includes('headphone') || lower.includes('mouse') || lower.includes('keyboard') || lower.includes('tech') || lower.includes('monitor') || lower.includes('hub')) {
    return 'Electronics';
  }
  if (lower.includes('shirt') || lower.includes('apparel') || lower.includes('hoodie') || lower.includes('jacket')) {
    return 'Apparel';
  }
  if (lower.includes('bottle') || lower.includes('stand') || lower.includes('case') || lower.includes('bag') || lower.includes('acc')) {
    return 'Accessories';
  }
  if (lower.includes('disp') || lower.includes('screen')) {
    return 'Displays';
  }
  return 'General';
}

function exportProductsToCsv(productList) {
  const headers = [
    'Name',
    'SKU',
    'Category',
    'Description',
    'Quantity',
    'Status',
    'Cost Price',
    'Selling Price',
    'Reorder Threshold',
    'Last Updated By',
    'Last Updated At',
  ];

  const rows = productList.map((p) => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.sku || '').replace(/"/g, '""')}"`,
    `"${getCategoryForProduct(p.name, p.sku)}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
    p.quantity,
    p.quantity === 0 ? 'Out of Stock' : p.isLowStock ? 'Low Stock' : 'Healthy',
    p.costPrice !== null ? p.costPrice : '',
    p.sellingPrice !== null ? p.sellingPrice : '',
    p.effectiveThreshold,
    `"${(p.lastUpdatedBy || '').replace(/"/g, '""')}"`,
    `"${new Date(p.updatedAt).toISOString()}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const dateStr = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `stockflow-inventory-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Products({ openAddModalTrigger, onResetAddTrigger, initialFilter = 'all' }) {
  const [products, setProducts] = useState([]);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(initialFilter); // all, lowStock, healthy, outOfStock
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  }, []);

  const fetchProducts = useCallback(async (searchQuery = search) => {
    try {
      setLoading(true);
      const res = await api.products.getAll({ search: searchQuery });
      setProducts(res.data);
      setDefaultThreshold(res.defaultThreshold || 5);
    } catch (err) {
      showFeedback('error', err.message || 'Failed to fetch inventory catalog.');
    } finally {
      setLoading(false);
    }
  }, [search, showFeedback]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle external trigger from dashboard "+ Add Product" button
  useEffect(() => {
    if (openAddModalTrigger) {
      setEditingProduct(null);
      setIsProductModalOpen(true);
      if (onResetAddTrigger) onResetAddTrigger();
    }
  }, [openAddModalTrigger, onResetAddTrigger]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchProducts(val);
  };

  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      const res = await api.products.update(editingProduct.id, formData);
      showFeedback('success', `Product "${res.data.name}" updated successfully.`);
    } else {
      const res = await api.products.create(formData);
      showFeedback('success', `Product "${res.data.name}" (${res.data.sku}) added to catalog.`);
    }
    fetchProducts();
  };

  const handleAdjustStock = async (productId, payload) => {
    const res = await api.products.adjustStock(productId, payload);
    showFeedback('success', res.message);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId) => {
    const res = await api.products.delete(productId);
    showFeedback('success', res.message);
    fetchProducts();
  };

  const handleExportCsv = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      showFeedback('error', 'No products available to export.');
      return;
    }
    exportProductsToCsv(filteredProducts);
    showFeedback('success', `Exported ${filteredProducts.length} product(s) to CSV.`);
  };

  // Filter products by tab
  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'lowStock') return p.isLowStock;
    if (activeFilter === 'outOfStock') return p.quantity === 0;
    if (activeFilter === 'healthy') return !p.isLowStock && p.quantity > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your SKU catalog, live warehouse quantities, and automatic reorder alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
            title="Export filtered products to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] border border-transparent text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#FF5722]/20 transition"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                fetchProducts('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-bold">
          {[
            { id: 'all', label: `All (${products.length})` },
            { id: 'lowStock', label: `Low Stock (${products.filter((p) => p.isLowStock).length})` },
            { id: 'healthy', label: `Healthy (${products.filter((p) => !p.isLowStock && p.quantity > 0).length})` },
            { id: 'outOfStock', label: `Out of Stock (${products.filter((p) => p.quantity === 0).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                activeFilter === tab.id
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => fetchProducts()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition ml-1"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF5722] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-400">Loading catalog items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5722] mx-auto flex items-center justify-center mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search
                ? `No products matched the search query "${search}". Try searching for another term.`
                : 'Your catalog is currently empty. Click "Add Product" to create your first item.'}
            </p>
            {!search && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-sm transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBFBFC] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3.5">SKU</th>
                  <th scope="col" className="px-6 py-3.5">Product Name</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Stock on Hand</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Cost</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Price</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Reorder Point</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const category = getCategoryForProduct(p.name, p.sku);
                  const isOutOfStock = p.quantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* SKU */}
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs font-mono">
                        {p.sku}
                      </td>

                      {/* Product Name with Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-sm block">
                              {p.name}
                            </span>
                            {p.description && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                                {p.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {category}
                      </td>

                      {/* Stock on Hand */}
                      <td className="px-6 py-4 text-center font-bold text-sm">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-600'
                              : p.isLowStock
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }
                        >
                          {p.quantity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            Out of Stock
                          </span>
                        ) : p.isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-4 text-right text-xs font-semibold text-slate-500 font-mono">
                        {p.costPrice !== null ? `$${p.costPrice.toFixed(2)}` : '—'}
                      </td>

                      {/* Selling Price */}
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 font-mono">
                        {p.sellingPrice !== null ? `$${p.sellingPrice.toFixed(2)}` : '—'}
                      </td>

                      {/* Reorder Point */}
                      <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500 font-mono">
                        {p.effectiveThreshold}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Reorder / Adjust */}
                          <button
                            onClick={() => setAdjustingProduct(p)}
                            className="px-3 py-1 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold shadow-sm transition"
                            title="Reorder or Adjust Stock"
                          >
                            Reorder
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          product={editingProduct}
          defaultThreshold={defaultThreshold}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSaveProduct}
        />
      )}

      {/* Adjust Stock / Reorder Modal */}
      {adjustingProduct && (
        <AdjustStockModal
          isOpen={Boolean(adjustingProduct)}
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onAdjust={handleAdjustStock}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <DeleteModal
          isOpen={Boolean(deletingProduct)}
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  );
}
