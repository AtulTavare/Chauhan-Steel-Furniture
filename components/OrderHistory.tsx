import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Filter, Receipt, Download, ShoppingBag, Truck, CreditCard, Banknote, MoreVertical } from 'lucide-react';
import { Bill, Purchase } from '../types';

interface OrderHistoryProps {
  bills: Bill[];
  purchases: Purchase[];
}

type Tab = 'SALES' | 'PURCHASES';

export const OrderHistory: React.FC<OrderHistoryProps> = ({ bills, purchases }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SALES');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const filteredData = useMemo(() => {
    let data: any[] = activeTab === 'SALES' ? bills : purchases;
    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(item => 
        (activeTab === 'SALES' ? (item as Bill).customerName : (item as Purchase).supplierName).toLowerCase().includes(lower) ||
        item.id.includes(lower)
      );
    }
    if (startDate) data = data.filter(item => item.date >= startDate);
    if (endDate) data = data.filter(item => item.date <= endDate);
    if (paymentFilter !== 'All') data = data.filter(item => item.paymentMode === paymentFilter);
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTab, bills, purchases, searchText, startDate, endDate, paymentFilter]);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'Online': return <CreditCard size={14} />;
      case 'Cash': return <Banknote size={14} />;
      default: return <Receipt size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-none">Journal</h2>
          <p className="text-slate-500 font-medium mt-2">Browse and audit every business transaction</p>
        </div>
        
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('SALES'); setExpandedRow(null); }}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'SALES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Sales
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('PURCHASES'); setExpandedRow(null); }}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'PURCHASES' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
             <div className="flex items-center justify-center gap-2">
              <Truck size={16} /> Purchase
            </div>
          </button>
        </div>
      </div>

      {/* Modern Filter Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 flex flex-col md:flex-row gap-2 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'SALES' ? 'customers' : 'suppliers'}...`}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-medium text-slate-800"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <div className="relative shrink-0">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pl-9 pr-3 py-3 bg-slate-50/50 rounded-2xl border border-transparent text-xs font-bold text-slate-600 focus:bg-white outline-none" />
          </div>
          <div className="relative shrink-0">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pl-9 pr-3 py-3 bg-slate-50/50 rounded-2xl border border-transparent text-xs font-bold text-slate-600 focus:bg-white outline-none" />
          </div>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-4 py-3 bg-slate-50/50 rounded-2xl border border-transparent text-xs font-black uppercase tracking-widest text-slate-600 focus:bg-white outline-none cursor-pointer">
            <option value="All">All Modes</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
      </div>

      {/* Main Records Area */}
      <div className="space-y-4">
        {filteredData.map(item => (
          <div 
            key={item.id} 
            className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
              expandedRow === item.id ? 'border-blue-400 shadow-xl shadow-blue-900/5 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Header / Summary Card */}
            <div 
              onClick={() => toggleExpand(item.id)}
              className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  activeTab === 'SALES' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {activeTab === 'SALES' ? <ShoppingBag size={20} /> : <Truck size={20} />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 leading-none truncate max-w-[200px] sm:max-w-none">
                    {activeTab === 'SALES' ? (item as Bill).customerName : (item as Purchase).supplierName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    ID: TX-{item.id.slice(-6)} <span className="h-1 w-1 rounded-full bg-slate-300"></span> {item.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex flex-col sm:items-end">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Amount</span>
                   <span className="text-lg font-black text-slate-900 leading-none">₹{(activeTab === 'SALES' ? (item as Bill).finalAmount : (item as Purchase).totalAmount).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                    item.amountPending > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {item.amountPending > 0 ? <CreditCard size={12} /> : <Receipt size={12} />}
                    {item.amountPending > 0 ? 'Pending' : 'Settled'}
                  </span>
                  <div className={`p-2 rounded-xl transition-all ${expandedRow === item.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Receipt Detail */}
            {expandedRow === item.id && (
              <div className="p-6 border-t border-slate-50 bg-slate-50/30 animate-scale-in">
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-inner overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Receipt size={120} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Transaction Details</h5>
                      <p className="text-xl font-black text-slate-900">Order Manifest</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-100"><Download size={18} /></button>
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-slate-100"><MoreVertical size={18} /></button>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-50">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Rate</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    
                    {item.items.map((cartItem: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 items-center py-2">
                        <div className="col-span-6">
                          <p className="text-xs font-black text-slate-800">{cartItem.productName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{cartItem.variationName}</p>
                        </div>
                        <div className="col-span-2 text-center text-xs font-bold text-slate-600">{cartItem.quantity}</div>
                        <div className="col-span-2 text-right text-xs font-bold text-slate-600">₹{cartItem.rate}</div>
                        <div className="col-span-2 text-right text-xs font-black text-slate-900">₹{cartItem.total}</div>
                      </div>
                    ))}

                    <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col items-end gap-2">
                      <div className="flex justify-between w-full max-w-[240px] text-xs font-bold text-slate-400">
                        <span className="uppercase tracking-widest">Subtotal</span>
                        <span>₹{activeTab === 'SALES' ? (item as Bill).totalAmount : (item as Purchase).totalAmount}</span>
                      </div>
                      {activeTab === 'SALES' && (item as Bill).discount > 0 && (
                        <div className="flex justify-between w-full max-w-[240px] text-xs font-bold text-rose-500">
                          <span className="uppercase tracking-widest">Discount Applied</span>
                          <span>- ₹{(item as Bill).discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between w-full max-w-[240px] pt-2 border-t border-slate-200 mt-2">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">Grand Total</span>
                        <span className="text-xl font-black text-blue-600">₹{(activeTab === 'SALES' ? (item as Bill).finalAmount : (item as Purchase).totalAmount).toLocaleString()}</span>
                      </div>
                      <div className="w-full max-w-[240px] flex justify-between items-center mt-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-white rounded-lg text-slate-400 shadow-sm border border-slate-100">
                            {getPaymentIcon(item.paymentMode)}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.paymentMode}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Receipt className="mx-auto text-slate-100 mb-4" size={64} />
            <h3 className="text-xl font-black text-slate-800">No records found</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 text-sm">We couldn't find any transactions matching your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};