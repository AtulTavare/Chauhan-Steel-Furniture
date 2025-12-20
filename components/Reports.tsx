import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Bill, Purchase, Product, Variation } from '../types';
import { TrendingUp, AlertTriangle, Wallet, ArrowDownRight, ArrowUpRight, Receipt, Package, ShoppingBag, Users } from 'lucide-react';

interface ReportsProps {
  bills: Bill[];
  purchases: Purchase[];
  products: Product[];
  variations: Variation[];
}

export const Reports: React.FC<ReportsProps> = ({ bills, purchases, products, variations }) => {
  const totalSales = bills.reduce((acc, b) => acc + b.finalAmount, 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPendingIn = bills.reduce((acc, b) => acc + b.amountPending, 0);
  const totalPendingOut = purchases.reduce((acc, p) => acc + p.amountPending, 0);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => ({
    date: date.slice(5),
    sales: bills.filter(b => b.date === date).reduce((sum, b) => sum + b.finalAmount, 0)
  }));

  const lowStockItems = variations.filter(v => v.stock < 10).map(v => {
    const p = products.find(p => p.id === v.productId);
    return { name: p?.name || 'Unknown', spec: v.name, stock: v.stock };
  }).slice(0, 8);

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
          <p className="text-slate-500 font-medium">Real-time performance analytics for Chauhan Steel</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Live Sync Active</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[minmax(120px,auto)]">
        
        {/* Metric: Total Sales */}
        <div className="md:col-span-3 bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Revenue</span>
          </div>
          <div className="relative z-10 mt-8">
            <p className="text-4xl font-black tracking-tighter">₹{(totalSales/1000).toFixed(1)}k</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Total Sales to Date</p>
          </div>
        </div>

        {/* Metric: Total Purchases */}
        <div className="md:col-span-3 bg-amber-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-amber-100 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShoppingBag size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Spend</span>
          </div>
          <div className="relative z-10 mt-8">
            <p className="text-4xl font-black tracking-tighter">₹{(totalPurchases/1000).toFixed(1)}k</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Material Procurement</p>
          </div>
        </div>

        {/* Sales Chart Hero */}
        <div className="md:col-span-6 md:row-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">Weekly Velocity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">7-Day Sales Trend</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Last Updated: Just Now
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Bar dataKey="sales" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={32}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === salesData.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="md:col-span-3 bg-rose-50 rounded-[2.5rem] p-6 border border-rose-100 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Receivable</span>
          </div>
          <div className="mt-8">
            <p className="text-3xl font-black tracking-tighter text-rose-600">₹{totalPendingIn.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mt-1">Pending from Customers</p>
          </div>
        </div>

        {/* Pending Payables */}
        <div className="md:col-span-3 bg-slate-900 rounded-[2.5rem] p-6 text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-slate-800 text-slate-400 rounded-xl">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Payable</span>
          </div>
          <div className="mt-8">
            <p className="text-3xl font-black tracking-tighter text-white">₹{totalPendingOut.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Pending to Suppliers</p>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="md:col-span-4 md:row-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-none">Watchlist</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Critical Stock Levels</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-all">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-xs font-black text-slate-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{item.spec}</p>
                </div>
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-xs font-black text-red-600">{item.stock}</span>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center">
                <Package className="text-slate-100 mb-2" size={48} />
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Inventory Healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Table (Bento Style Wide) */}
        <div className="md:col-span-8 md:row-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">Sales Journal</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latest 5 Transactions</p>
            </div>
            <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View All Records</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="p-6">Transaction ID</th>
                  <th className="p-6">Client</th>
                  <th className="p-6 text-right">Net Total</th>
                  <th className="p-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.slice().reverse().slice(0, 5).map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-mono text-[10px] font-bold text-slate-400">CH-TX-{bill.id.slice(-6)}</td>
                    <td className="p-6">
                      <p className="text-xs font-black text-slate-900 leading-none">{bill.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{bill.date}</p>
                    </td>
                    <td className="p-6 text-right">
                      <p className="text-sm font-black text-slate-900">₹{bill.finalAmount.toLocaleString()}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        bill.amountPending > 0 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {bill.amountPending > 0 ? 'Partial' : 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};