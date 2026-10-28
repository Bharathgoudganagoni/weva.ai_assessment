import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  LayoutGrid,
  Package,
  Warehouse,
  ShoppingBag,
  Truck,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Store,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function Layout({
  currentTab,
  setCurrentTab,
  searchGlobal = '',
  setSearchGlobal = () => {},
  lowStockAlertCount = 0,
  children,
}) {
  const { user, organization, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutGrid },
    { name: 'Products', id: 'products', icon: Package },
    { name: 'Inventory', id: 'inventory', icon: Warehouse },
    { name: 'Orders', id: 'orders', icon: ShoppingBag },
    { name: 'Suppliers', id: 'suppliers', icon: Truck },
    { name: 'Reports', id: 'reports', icon: FileText },
    { name: 'Settings', id: 'settings', icon: SettingsIcon },
  ];

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JD';

  const orgDisplayName = organization?.name || 'Downtown Store';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF5722] flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            StockFlow
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#FF5722] text-white font-bold flex items-center justify-center text-xs">
            {userInitials}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 flex-col justify-between bg-white border-r border-slate-200/90 p-5 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full md:flex hidden'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo - StockFlow Orange Cube */}
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center shadow-md shadow-orange-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                StockFlow
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'inventory' && currentTab === 'inventory');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF5722] text-white shadow-sm shadow-orange-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.id === 'inventory' && lowStockAlertCount > 0 && (
                    <span
                      className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-[#FF5722]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lowStockAlertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#FF5722] text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {userInitials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-xs text-slate-500 truncate">{orgDisplayName}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar Matching Reference Image */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchGlobal}
              onChange={(e) => setSearchGlobal(e.target.value)}
              placeholder="Search products, orders, SKUs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] border border-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#FF5722]/20 transition"
            />
          </div>

          {/* Right Header Actions: Store Switcher, Notification, User Pill */}
          <div className="flex items-center space-x-3">
            {/* Store Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition"
              >
                <Store className="w-3.5 h-3.5 text-[#FF5722]" />
                <span className="max-w-[130px] truncate">{orgDisplayName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {storeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Current Location
                  </div>
                  <div className="px-3 py-2 flex items-center space-x-2 bg-orange-50/70 text-slate-900 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>{orgDisplayName}</span>
                  </div>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setStoreDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Manage Locations & Org</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell with alert dot */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {lowStockAlertCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5722] ring-2 ring-white" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800">Alerts & Notifications</span>
                    <span className="text-[10px] bg-orange-100 text-[#FF5722] px-1.5 py-0.5 rounded-full font-bold">
                      {lowStockAlertCount} active
                    </span>
                  </div>
                  <div className="py-2.5 space-y-2">
                    {lowStockAlertCount > 0 ? (
                      <div className="flex items-start space-x-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/50">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">
                            {lowStockAlertCount} Items Need Attention
                          </p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Stock levels are below reorder threshold.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-2">
                        All inventory levels are healthy!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setNotificationOpen(false);
                    }}
                    className="w-full text-center text-[11px] font-semibold text-[#FF5722] hover:underline pt-1"
                  >
                    View Low Stock Alerts
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar Circle */}
            <div
              className="w-8 h-8 rounded-full bg-[#FF5722] text-white font-bold flex items-center justify-center text-xs shadow-sm cursor-pointer select-none"
              title={user?.email}
              onClick={() => setCurrentTab('settings')}
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
