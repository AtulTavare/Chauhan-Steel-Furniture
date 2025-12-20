
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Inventory } from './components/Inventory';
import { ProductDetail } from './components/ProductDetail';
import { TransactionForm } from './components/TransactionForm';
import { Reports } from './components/Reports';
import { OrderHistory } from './components/OrderHistory';
import { Login } from './components/Login';
import { BillReceipt } from './components/BillReceipt';
import { dataService } from './services/dataService';
import { supabase } from './supabaseClient';
import { Product, Variation, Bill, Purchase, ViewState } from './types';
import { Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';

const INACTIVITY_LIMIT = 3600000; // 1 hour

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('INVENTORY');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastBill, setLastBill] = useState<Bill | null>(null);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('chauhan_auth');
    localStorage.removeItem('chauhan_last_activity');
  }, []);

  const handleLogin = () => {
    localStorage.setItem('chauhan_last_activity', Date.now().toString());
    setIsAuthenticated(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('chauhan_last_activity');
      if (lastActivity) {
        const diff = Date.now() - parseInt(lastActivity, 10);
        if (diff > INACTIVITY_LIMIT) {
          handleLogout();
          alert("Session expired due to inactivity. Please login again.");
        }
      }
    };
    const resetTimer = () => localStorage.setItem('chauhan_last_activity', Date.now().toString());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));
    const interval = setInterval(checkInactivity, 30000);
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      clearInterval(interval);
    };
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    const auth = localStorage.getItem('chauhan_auth');
    if (auth === 'true') {
      const last = localStorage.getItem('chauhan_last_activity');
      if (last && Date.now() - parseInt(last, 10) > INACTIVITY_LIMIT) handleLogout();
      else setIsAuthenticated(true);
    }
  }, [handleLogout]);

  const loadData = async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dataService.fetchAllData();
        setProducts(data.products);
        setVariations(data.variations);
        setBills(data.bills);
        setPurchases(data.purchases);
        setCategories(data.categories);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => { loadData(); }, [isAuthenticated]);

  const handleUpdateProduct = async (p: Product) => {
    setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
    if (selectedProduct?.id === p.id) setSelectedProduct(p);
    try {
      await dataService.updateProduct(p);
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const handleAddProduct = async (newProduct: Product, newVariations: Variation[]) => {
    setProducts(prev => [...prev, newProduct]);
    setVariations(prev => [...prev, ...newVariations]);
    try {
      await dataService.addProduct(newProduct, newVariations);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    }
  };

  const handleUpdateVariation = async (updatedVar: Variation) => {
    setVariations(prev => prev.map(v => v.id === updatedVar.id ? updatedVar : v));
    try {
      await dataService.updateVariation(updatedVar);
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const handleAddVariation = async (newVar: Variation) => {
    setVariations(prev => [...prev, newVar]);
    try {
      await dataService.addVariation(newVar);
    } catch (e: any) {
      alert(`Add failed: ${e.message}`);
    }
  };

  const handleUpdateCategories = async (newCats: string[]) => {
    if (newCats.length > categories.length) {
      const added = newCats.find(c => !categories.includes(c));
      if (added) {
        setCategories(newCats);
        await dataService.addCategory(added);
      }
    } else {
      const removed = categories.find(c => !newCats.includes(c));
      if (removed) {
        setCategories(newCats);
        await dataService.deleteCategory(removed);
      }
    }
  };

  const handleCreateSale = async (billData: any) => {
    const newBill: Bill = { id: Date.now().toString(), ...billData };
    const updatedVars = [...variations];
    const affectedVars: Variation[] = [];
    billData.items.forEach((item: any) => {
      const idx = updatedVars.findIndex(v => v.id === item.variationId);
      if (idx > -1) {
        updatedVars[idx] = { ...updatedVars[idx], stock: updatedVars[idx].stock - item.quantity };
        affectedVars.push(updatedVars[idx]);
      }
    });
    setBills(prev => [...prev, newBill]);
    setVariations(updatedVars);
    try {
      await dataService.createBill(newBill, affectedVars);
      setLastBill(newBill);
      setView('BILL_RECEIPT');
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    }
  };

  const handleCreatePurchase = async (purchaseData: any) => {
    const newPurchase: Purchase = { id: Date.now().toString(), ...purchaseData };
    const updatedVars = [...variations];
    const affectedVars: Variation[] = [];
    purchaseData.items.forEach((item: any) => {
      const idx = updatedVars.findIndex(v => v.id === item.variationId);
      if (idx > -1) {
        updatedVars[idx] = { ...updatedVars[idx], stock: updatedVars[idx].stock + item.quantity, purchasePrice: item.rate };
        affectedVars.push(updatedVars[idx]);
      }
    });
    setPurchases(prev => [...prev, newPurchase]);
    setVariations(updatedVars);
    try {
      await dataService.createPurchase(newPurchase, affectedVars);
      setView('INVENTORY');
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    }
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mb-3 text-blue-600" size={40} />
        <p className="font-medium">Loading Inventory...</p>
      </div>
    );
    if (error) return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <button onClick={loadData} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            <RefreshCcw size={18} /> Retry
          </button>
        </div>
      </div>
    );
    switch (view) {
      case 'INVENTORY':
        return <Inventory products={products} variations={variations} categories={categories} onSelectProduct={(p) => { setSelectedProduct(p); setView('PRODUCT_DETAIL'); }} onAddProduct={handleAddProduct} onUpdateCategories={handleUpdateCategories} />;
      case 'PRODUCT_DETAIL':
        return selectedProduct ? <ProductDetail product={selectedProduct} variations={variations.filter(v => v.productId === selectedProduct.id)} onBack={() => setView('INVENTORY')} onUpdateVariation={handleUpdateVariation} onAddVariation={handleAddVariation} onUpdateProduct={handleUpdateProduct} /> : null;
      case 'NEW_BILL':
        return <TransactionForm type="SALE" products={products} variations={variations} onSubmit={handleCreateSale} />;
      case 'STORE_PURCHASE':
        return <TransactionForm type="PURCHASE" products={products} variations={variations} onSubmit={handleCreatePurchase} />;
      case 'HISTORY':
        return <OrderHistory bills={bills} purchases={purchases} />;
      case 'REPORTS':
        return <Reports bills={bills} purchases={purchases} products={products} variations={variations} />;
      case 'BILL_RECEIPT':
        return lastBill ? <BillReceipt bill={lastBill} onBack={() => setView('REPORTS')} onNewBill={() => setView('NEW_BILL')} /> : null;
      default:
        return null;
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;
  return <Layout activeView={view} onChangeView={setView} onLogout={handleLogout}>{renderContent()}</Layout>;
};

export default App;
