import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [searchGlobal, setSearchGlobal] = useState('');

  // Trigger to automatically open Add Product modal when navigating from Dashboard
  const [openAddTrigger, setOpenAddTrigger] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shadow-sm">
          <Loader2 className="w-6 h-6 text-[#FF5722] animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Loading StockFlow workspace...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login or Signup
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateToSignup={() => setAuthView('signup')} />;
  }

  // Logged in -> Show App with Layout
  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      searchGlobal={searchGlobal}
      setSearchGlobal={setSearchGlobal}
    >
      {currentTab === 'dashboard' && (
        <Dashboard
          onNavigateToProducts={() => setCurrentTab('products')}
          onNavigateToSettings={() => setCurrentTab('settings')}
          onOpenAddProduct={() => {
            setCurrentTab('products');
            setOpenAddTrigger(true);
          }}
        />
      )}

      {currentTab === 'products' && (
        <Products
          openAddModalTrigger={openAddTrigger}
          onResetAddTrigger={() => setOpenAddTrigger(false)}
          initialFilter="all"
        />
      )}

      {currentTab === 'inventory' && (
        <Products
          openAddModalTrigger={openAddTrigger}
          onResetAddTrigger={() => setOpenAddTrigger(false)}
          initialFilter="lowStock"
        />
      )}

      {currentTab === 'orders' && <Orders />}

      {currentTab === 'suppliers' && <Suppliers />}

      {currentTab === 'reports' && <Reports />}

      {currentTab === 'settings' && <Settings />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
