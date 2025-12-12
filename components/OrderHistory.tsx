import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { Bill, Purchase } from '../types';

interface OrderHistoryProps {
  bills: Bill[];
  purchases: Purchase[];
}

type Tab = 'SALES' | 'PURCHASES';

export const OrderHistory: React.FC<OrderHistoryProps> = ({ bills, purchases }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SALES');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const filteredData = useMemo(() => {
    let data: any[] = activeTab === 'SALES' ? bills : purchases;

    // Filter by Search Text (Name or ID)
    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(item => 
        (activeTab === 'SALES' ? (item as Bill).customerName : (item as Purchase).supplierName).toLowerCase().includes(lower) ||
        item.id.includes(lower)
      );
    }

    // Filter by Date
    if (startDate) {
      data = data.filter(item => item.date >= startDate);
    }
    if (endDate) {
      data = data.filter(item => item.date <= endDate);
    }

    // Filter by Payment Mode
    if (paymentFilter !== 'All') {
      data = data.filter(item => item.paymentMode === paymentFilter);
    }

    // Sort by Date Descending
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTab, bills, purchases, searchText, startDate, endDate, paymentFilter]);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const resetFilters = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setPaymentFilter('All');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200 rounded-lg self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('SALES'); setExpandedRow(null); }}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'SALES' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sales History
          </button>
          <button
            onClick={() => { setActiveTab('PURCHASES'); setExpandedRow(null); }}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'PURCHASES' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Purchase History
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'SALES' ? "Search Customer..." : "Search Supplier..."}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="All">All Modes</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
          </select>
          <button 
            onClick={resetFilters}
            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4">Date</th>
                <th className="p-4">{activeTab === 'SALES' ? 'Customer Name' : 'Supplier Name'}</th>
                <th className="p-4 text-center">Mode</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-right">Pending</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(item => (
                <React.Fragment key={item.id}>
                  <tr 
                    onClick={() => toggleExpand(item.id)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${expandedRow === item.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="p-4 text-center text-slate-400">
                      {expandedRow === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                    <td className="p-4 text-slate-600">{item.date}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {activeTab === 'SALES' ? (item as Bill).customerName : (item as Purchase).supplierName}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">
                        {item.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">
                      ₹{activeTab === 'SALES' ? (item as Bill).finalAmount : (item as Purchase).totalAmount}
                    </td>
                    <td className={`p-4 text-right font-medium ${item.amountPending > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {item.amountPending > 0 ? `₹${item.amountPending}` : '-'}
                    </td>
                    <td className="p-4 text-center">
                       {item.amountPending > 0 ? (
                         <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                           Partial
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                           Paid
                         </span>
                       )}
                    </td>
                  </tr>
                  
                  {/* Expandable Row Content */}
                  {expandedRow === item.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={7} className="p-4 pl-12">
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-slate-700 mb-3 border-b pb-2 flex justify-between">
                            <span>Order Items</span>
                            <span className="text-xs font-normal text-slate-400">ID: {item.id}</span>
                          </h4>
                          <table className="w-full text-sm">
                            <thead className="text-slate-500 bg-slate-50">
                              <tr>
                                <th className="p-2 text-left">Product</th>
                                <th className="p-2 text-left">Variation</th>
                                <th className="p-2 text-center">Qty</th>
                                <th className="p-2 text-right">Rate</th>
                                <th className="p-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {item.items.map((cartItem: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-2 font-medium text-slate-700">{cartItem.productName}</td>
                                  <td className="p-2 text-slate-600">{cartItem.variationName}</td>
                                  <td className="p-2 text-center">{cartItem.quantity}</td>
                                  <td className="p-2 text-right">₹{cartItem.rate}</td>
                                  <td className="p-2 text-right font-medium">₹{cartItem.total}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="border-t border-slate-200">
                               <tr>
                                 <td colSpan={4} className="p-2 text-right text-slate-500 font-medium">Total</td>
                                 <td className="p-2 text-right font-bold text-slate-800">
                                   ₹{activeTab === 'SALES' ? (item as Bill).totalAmount : (item as Purchase).totalAmount}
                                 </td>
                               </tr>
                               {activeTab === 'SALES' && (item as Bill).discount > 0 && (
                                 <tr>
                                   <td colSpan={4} className="p-2 text-right text-slate-500">Discount</td>
                                   <td className="p-2 text-right text-red-500">- ₹{(item as Bill).discount}</td>
                                 </tr>
                               )}
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};