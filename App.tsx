import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
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

const App = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('INVENTORY');
  
  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  // Selection State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastBill, setLastBill] = useState<Bill | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const auth = localStorage.getItem('chauhan_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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
        console.error("Failed to load data:", err);
        setError(err.message || "Failed to load inventory data. Check connection and database tables.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load Data
  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // --- HELPER MAPPERS FOR REALTIME DATA ---
  // These convert raw DB snake_case to App camelCase
  const mapRealtimeProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    category: p.category,
    image: p.image,
    basePurchasePrice: p.base_purchase_price,
    baseSellingPrice: p.base_selling_price
  });

  const mapRealtimeVariation = (v: any): Variation => ({
    id: v.id,
    productId: v.product_id,
    name: v.name,
    stock: v.stock,
    purchasePrice: v.purchase_price,
    sellingPrice: v.selling_price,
    image: v.image,
    color: v.color
  });

  const mapRealtimeBill = (b: any): Bill => ({
    id: b.id,
    customerName: b.customer_name,
    date: b.date,
    items: b.items,
    totalAmount: b.total_amount,
    discount: b.discount,
    finalAmount: b.final_amount,
    amountReceived: b.amount_received,
    amountPending: b.amount_pending,
    paymentMode: b.payment_mode,
    type: 'SALE'
  });

  const mapRealtimePurchase = (p: any): Purchase => ({
    id: p.id,
    supplierName: p.supplier_name,
    date: p.date,
    items: p.items,
    totalAmount: p.total_amount,
    amountPaid: p.amount_paid,
    amountPending: p.amount_pending,
    paymentMode: p.payment_mode,
    type: 'PURCHASE'
  });

  // --- REAL-TIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("Subscribing to real-time updates...");
    const channel = supabase.channel('app-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newItem = mapRealtimeProduct(payload.new);
          setProducts(prev => prev.some(p => p.id === newItem.id) ? prev : [...prev, newItem]);
        } else if (payload.eventType === 'UPDATE') {
          const newItem = mapRealtimeProduct(payload.new);
          setProducts(prev => prev.map(p => p.id === newItem.id ? { ...p, ...newItem } : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'variations' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newItem = mapRealtimeVariation(payload.new);
          setVariations(prev => prev.some(v => v.id === newItem.id) ? prev : [...prev, newItem]);
        } else if (payload.eventType === 'UPDATE') {
          const newItem = mapRealtimeVariation(payload.new);
          setVariations(prev => prev.map(v => v.id === newItem.id ? { ...v, ...newItem } : v));
        } else if (payload.eventType === 'DELETE') {
          setVariations(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newItem = mapRealtimeBill(payload.new);
          setBills(prev => prev.some(b => b.id === newItem.id) ? prev : [...prev, newItem]);
        } else if (payload.eventType === 'UPDATE') {
          const newItem = mapRealtimeBill(payload.new);
          setBills(prev => prev.map(b => b.id === newItem.id ? { ...b, ...newItem } : b));
        } else if (payload.eventType === 'DELETE') {
          setBills(prev => prev.filter(b => b.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newItem = mapRealtimePurchase(payload.new);
          setPurchases(prev => prev.some(p => p.id === newItem.id) ? prev : [...prev, newItem]);
        } else if (payload.eventType === 'UPDATE') {
          const newItem = mapRealtimePurchase(payload.new);
          setPurchases(prev => prev.map(p => p.id === newItem.id ? { ...p, ...newItem } : p));
        } else if (payload.eventType === 'DELETE') {
          setPurchases(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
         try {
           const updatedCats = await dataService.fetchCategories();
           setCategories(updatedCats);
         } catch(e) { console.error("Error syncing categories", e); }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Real-time connection established.');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Auth Handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chauhan_auth');
  };

  // Data Handlers
  const handleAddProduct = async (newProduct: Product, newVariations: Variation[]) => {
    // Optimistic Update
    setProducts(prev => [...prev, newProduct]);
    setVariations(prev => [...prev, ...newVariations]);

    try {
      await dataService.addProduct(newProduct, newVariations);
    } catch (e: any) {
      console.error("Save failed:", e);
      alert(`Save failed: ${e.message}`);
      // Revert on fail could be added here, but keeping it simple
    }
  };

  const handleUpdateVariation = async (updatedVar: Variation) => {
    // Optimistic
    setVariations(prev => prev.map(v => v.id === updatedVar.id ? updatedVar : v));
    
    try {
      await dataService.updateVariation(updatedVar);
    } catch (e: any) {
      console.error(e);
      alert(`Update failed: ${e.message}`);
    }
  };

  const handleAddVariation = async (newVar: Variation) => {
    setVariations(prev => [...prev, newVar]);
    
    try {
      await dataService.addVariation(newVar);
    } catch (e: any) {
      console.error(e);
      alert(`Add failed: ${e.message}`);
    }
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    // Determine if added or removed
    if (newCategories.length > categories.length) {
      // Added
      const added = newCategories.find(c => !categories.includes(c));
      if (added) {
        try {
          // Optimistic
          setCategories(newCategories);
          await dataService.addCategory(added);
        } catch (e: any) {
           console.error(e);
           alert(`Category save failed: ${e.message}`);
           return; 
        }
      }
    } else {
      // Removed
      const removed = categories.find(c => !newCategories.includes(c));
      if (removed) {
        try {
           // Optimistic
           setCategories(newCategories);
           await dataService.deleteCategory(removed);
        } catch (e: any) {
           console.error(e);
           alert(`Category delete failed: ${e.message}`);
           return;
        }
      }
    }
  };

  const handleCreateSale = async (billData: any) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      ...billData
    };

    // Calculate updated stock locally for optimistic UI
    const updatedVars = [...variations];
    const affectedVars: Variation[] = [];

    billData.items.forEach((item: any) => {
      const vIndex = updatedVars.findIndex(v => v.id === item.variationId);
      if(vIndex > -1) {
        updatedVars[vIndex] = { 
          ...updatedVars[vIndex], 
          stock: updatedVars[vIndex].stock - item.quantity 
        };
        affectedVars.push(updatedVars[vIndex]);
      }
    });

    // Optimistic UI updates
    setBills(prev => [...prev, newBill]);
    setVariations(updatedVars);
    
    try {
      await dataService.createBill(newBill, affectedVars);
      setLastBill(newBill); // Set the bill for receipt
      setView('BILL_RECEIPT'); // Show Receipt
    } catch (e: any) {
      alert(`Failed to save bill to database: ${e.message}`);
      console.error("Bill Save Error:", e);
      // In a real app, we would revert the optimistic updates here
    }
  };

  const handleCreatePurchase = async (purchaseData: any) => {
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      ...purchaseData
    };

    // Add Stock
    const updatedVars = [...variations];
    const affectedVars: Variation[] = [];

    purchaseData.items.forEach((item: any) => {
      const vIndex = updatedVars.findIndex(v => v.id === item.variationId);
      if(vIndex > -1) {
        updatedVars[vIndex] = {
          ...updatedVars[vIndex],
          stock: updatedVars[vIndex].stock + item.quantity,
          purchasePrice: item.rate // Update latest purchase price
        };
        affectedVars.push(updatedVars[vIndex]);
      }
    });

    setPurchases(prev => [...prev, newPurchase]);
    setVariations(updatedVars);

    try {
      await dataService.createPurchase(newPurchase, affectedVars);
      setView('INVENTORY');
    } catch (e: any) {
      alert(`Failed to save purchase: ${e.message}`);
      console.error(e);
    }
  };

  // View Routing
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
          <Loader2 className="animate-spin mb-3 text-blue-600" size={40} />
          <p className="font-medium animate-pulse">Loading Inventory...</p>
        </div>
      );
    }

    if (error) {
       return (
         <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
               <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} />
               </div>
               <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
               <p className="text-slate-500 mb-6 text-sm">{error}</p>
               
               <div className="bg-slate-50 p-3 rounded-lg text-xs text-left text-slate-600 mb-6 font-mono overflow-auto max-h-32 border border-slate-200">
                 Tip: Run the SQL script provided in the instructions to create the correct tables.
               </div>

               <button 
                  onClick={loadData}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
               >
                  <RefreshCcw size={18} /> Retry Connection
               </button>
            </div>
         </div>
       );
    }

    switch (view) {
      case 'INVENTORY':
        return (
          <Inventory 
            products={products} 
            variations={variations}
            categories={categories}
            onSelectProduct={(p) => { setSelectedProduct(p); setView('PRODUCT_DETAIL'); }}
            onAddProduct={handleAddProduct}
            onUpdateCategories={handleUpdateCategories}
          />
        );
      case 'PRODUCT_DETAIL':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct}
            variations={variations.filter(v => v.productId === selectedProduct.id)}
            onBack={() => setView('INVENTORY')}
            onUpdateVariation={handleUpdateVariation}
            onAddVariation={handleAddVariation}
          />
        ) : <div className="p-4">Select a product</div>;
      case 'NEW_BILL':
        return (
          <TransactionForm 
            key="sale-form"
            type="SALE"
            products={products}
            variations={variations}
            onSubmit={handleCreateSale}
          />
        );
      case 'STORE_PURCHASE':
        return (
          <TransactionForm 
            key="purchase-form"
            type="PURCHASE"
            products={products}
            variations={variations}
            onSubmit={handleCreatePurchase}
          />
        );
      case 'HISTORY':
        return (
          <OrderHistory 
            bills={bills}
            purchases={purchases}
          />
        );
      case 'REPORTS':
        return (
          <Reports 
            bills={bills}
            purchases={purchases}
            products={products}
            variations={variations}
          />
        );
      case 'BILL_RECEIPT':
        return lastBill ? (
          <BillReceipt 
            bill={lastBill}
            onBack={() => setView('REPORTS')}
            onNewBill={() => setView('NEW_BILL')}
          />
        ) : <div className="p-10 text-center">No bill generated</div>;
      default:
        return <div className="p-10 text-center">Coming Soon</div>;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // If we are authenticated but in error/loading state, we render full screen content
  if (error || isLoading) {
     return renderContent();
  }

  return (
    <Layout activeView={view} onChangeView={setView} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;