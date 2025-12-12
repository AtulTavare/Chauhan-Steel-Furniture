import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bill, Purchase, Product, Variation } from '../types';
import { TrendingUp, AlertTriangle, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface ReportsProps {
  bills: Bill[];
  purchases: Purchase[];
  products: Product[];
  variations: Variation[];
}

export const Reports: React.FC<ReportsProps> = ({ bills, purchases, products, variations }) => {
  
  // Calculate Stats
  const totalSales = bills.reduce((acc, b) => acc + b.finalAmount, 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPendingFromCustomers = bills.reduce((acc, b) => acc + b.amountPending, 0);
  const totalPendingToSuppliers = purchases.reduce((acc, p) => acc + p.amountPending, 0);

  // Chart Data: Last 7 days sales
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => ({
    date: date.slice(5), // MM-DD
    sales: bills.filter(b => b.date === date).reduce((sum, b) => sum + b.finalAmount, 0)
  }));

  // Low Stock Items
  const lowStockItems = variations.filter(v => v.stock < 10).map(v => {
    const p = products.find(p => p.id === v.productId);
    return { name: `${p?.name} - ${v.name}`, stock: v.stock };
  });

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800">Business Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0"><TrendingUp size={20} /></div>
            <span className="text-slate-500 font-medium text-sm md:text-base">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalSales.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0"><Wallet size={20} /></div>
            <span className="text-slate-500 font-medium text-sm md:text-base">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalPurchases.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0"><ArrowDownRight size={20} /></div>
            <span className="text-slate-500 font-medium text-sm md:text-base">Pending (In)</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalPendingFromCustomers.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0"><ArrowUpRight size={20} /></div>
            <span className="text-slate-500 font-medium text-sm md:text-base">Pending (Out)</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalPendingToSuppliers.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-72 md:h-96 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4 text-sm md:text-base">Sales Trends (Last 7 Days)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-72 md:h-96 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <AlertTriangle className="text-red-500" size={18} /> Low Stock Alerts
          </h3>
          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-sm relative border-collapse">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold bg-slate-50">Item Name</th>
                  <th className="p-2 text-right text-xs md:text-sm font-semibold bg-slate-50">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-2 text-slate-700 text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{item.name}</td>
                    <td className="p-2 text-right font-bold text-red-600 text-xs md:text-sm">{item.stock}</td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-slate-400 text-sm">All stock levels are healthy!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-700 mb-4 text-sm md:text-base">Recent Sales</h3>
        
        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-full inline-block align-middle px-4 md:px-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-2 whitespace-nowrap text-xs md:text-sm">ID</th>
                  <th className="py-2 pr-2 whitespace-nowrap text-xs md:text-sm">Customer</th>
                  <th className="py-2 pr-2 whitespace-nowrap text-xs md:text-sm">Date</th>
                  <th className="py-2 pr-2 text-right whitespace-nowrap text-xs md:text-sm">Total</th>
                  <th className="py-2 pr-2 text-right whitespace-nowrap text-xs md:text-sm">Pending</th>
                  <th className="py-2 text-center whitespace-nowrap text-xs md:text-sm">Mode</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice().reverse().slice(0, 5).map(bill => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-2 font-mono text-slate-400 text-xs md:text-sm">#{bill.id.slice(-4)}</td>
                    <td className="py-3 pr-2 font-medium text-slate-800 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{bill.customerName}</td>
                    <td className="py-3 pr-2 text-slate-600 text-xs md:text-sm whitespace-nowrap">{bill.date}</td>
                    <td className="py-3 pr-2 text-right font-medium text-xs md:text-sm">₹{bill.finalAmount}</td>
                    <td className={`py-3 pr-2 text-right text-xs md:text-sm ${bill.amountPending > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                      {bill.amountPending > 0 ? `₹${bill.amountPending}` : '-'}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] md:text-xs text-slate-600 whitespace-nowrap">{bill.paymentMode}</span>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No sales records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};