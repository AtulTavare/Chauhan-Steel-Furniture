import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Truck, Receipt, BarChart3, Users, Package, Menu, X, LogOut, History } from 'lucide-react';
import { ViewState } from '../types';

// Hardcoded version to verify deployment
const APP_VERSION = "v1.0.2";

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewState) => {
    onChangeView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar - Hidden on Print */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-sm print:hidden">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Chauhan Steel<br />
            <span className="text-blue-600">Furniture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem 
            icon={Package} 
            label="Inventory" 
            isActive={activeView === 'INVENTORY' || activeView === 'PRODUCT_DETAIL'} 
            onClick={() => handleNavClick('INVENTORY')} 
          />
          <NavItem 
            icon={ShoppingCart} 
            label="New Bill (Sale)" 
            isActive={activeView === 'NEW_BILL'} 
            onClick={() => handleNavClick('NEW_BILL')} 
          />
          <NavItem 
            icon={Truck} 
            label="Store Purchase" 
            isActive={activeView === 'STORE_PURCHASE'} 
            onClick={() => handleNavClick('STORE_PURCHASE')} 
          />
          <NavItem 
            icon={History} 
            label="Order History" 
            isActive={activeView === 'HISTORY'} 
            onClick={() => handleNavClick('HISTORY')} 
          />
          <NavItem 
            icon={BarChart3} 
            label="Reports" 
            isActive={activeView === 'REPORTS'} 
            onClick={() => handleNavClick('REPORTS')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
           <button 
             onClick={onLogout}
             className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Logout</span>
           </button>
           
           <div className="bg-slate-100 rounded-lg p-3">
             <div className="flex justify-between items-center mb-1">
               <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
               <span className="text-[10px] font-mono text-slate-400">{APP_VERSION}</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm text-slate-700">System Online</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity print:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar - Hidden on Print */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Chauhan Steel
            </h1>
            <p className="text-xs text-slate-500">Menu</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem 
            icon={Package} 
            label="Inventory" 
            isActive={activeView === 'INVENTORY' || activeView === 'PRODUCT_DETAIL'} 
            onClick={() => handleNavClick('INVENTORY')} 
          />
          <NavItem 
            icon={ShoppingCart} 
            label="New Bill (Sale)" 
            isActive={activeView === 'NEW_BILL'} 
            onClick={() => handleNavClick('NEW_BILL')} 
          />
          <NavItem 
            icon={Truck} 
            label="Store Purchase" 
            isActive={activeView === 'STORE_PURCHASE'} 
            onClick={() => handleNavClick('STORE_PURCHASE')} 
          />
          <NavItem 
            icon={History} 
            label="Order History" 
            isActive={activeView === 'HISTORY'} 
            onClick={() => handleNavClick('HISTORY')} 
          />
          <NavItem 
            icon={BarChart3} 
            label="Reports" 
            isActive={activeView === 'REPORTS'} 
            onClick={() => handleNavClick('REPORTS')} 
          />
        </nav>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
          <button 
             onClick={onLogout}
             className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Logout</span>
           </button>
           <div className="flex items-center justify-between text-sm text-slate-500 px-2">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span>Online</span>
             </div>
             <span className="text-[10px] font-mono">{APP_VERSION}</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Mobile Header - Hidden on Print */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm print:hidden">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
             <Menu size={24} />
           </button>
           <h1 className="font-bold text-slate-800 text-lg">Chauhan Steel</h1>
           <div className="w-8"></div> {/* Spacer for alignment */}
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto bg-slate-50 w-full scroll-smooth print:bg-white print:overflow-visible">
          <div className="p-4 md:p-8 pb-32 max-w-7xl mx-auto min-h-full print:p-0 print:max-w-none print:min-h-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};