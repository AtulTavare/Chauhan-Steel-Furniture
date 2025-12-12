import React from 'react';
import { Printer, ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { Bill } from '../types';

interface BillReceiptProps {
  bill: Bill;
  onBack: () => void;
  onNewBill: () => void;
}

export const BillReceipt: React.FC<BillReceiptProps> = ({ bill, onBack, onNewBill }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100 p-4 pt-8">
      
      {/* Success Message & Actions (Hidden during print) */}
      <div className="w-full max-w-md mb-6 text-center print:hidden animate-scale-in">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bill Generated Successfully!</h2>
        <p className="text-slate-500 mb-6">Transaction has been saved to records.</p>
        
        <div className="flex gap-3 justify-center mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Dashboard
          </button>
          <button 
            onClick={onNewBill}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} /> New Bill
          </button>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all font-bold flex items-center justify-center gap-2 active:scale-95"
        >
          <Printer size={20} /> Print Thermal Receipt
        </button>
      </div>

      {/* Receipt Preview Area */}
      <div className="print:absolute print:top-0 print:left-0 print:w-full print:m-0 print:bg-white">
        
        {/* The Receipt Itself */}
        <div className="bg-white p-6 shadow-2xl w-[80mm] min-h-[100mm] mx-auto text-slate-900 font-mono text-sm leading-tight print:shadow-none print:w-full print:p-2 relative overflow-hidden">
          
          {/* Decorative jagged edge (Visual only) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800/5 print:hidden"></div>

          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-wider mb-1">Chauhan Steel</h1>
            <p className="font-bold text-xs uppercase text-slate-600 tracking-wide">Furniture & Fabrication</p>
            <div className="text-[10px] mt-2 text-slate-500 font-sans">
              <p>Main Market Road, City Center</p>
              <p>GSTIN: 29ABCDE1234F1Z5</p>
              <p>Ph: +91 98765 43210</p>
            </div>
          </div>

          {/* Bill Info */}
          <div className="flex justify-between text-xs mb-3 font-sans">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase">Bill No</span>
              <span className="font-bold">#{bill.id.slice(-6)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-slate-500 text-[10px] uppercase">Date</span>
              <span className="font-bold">{new Date(bill.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-4 text-xs font-sans">
            <span className="text-slate-500 text-[10px] uppercase block">Customer Name</span>
            <p className="font-bold text-sm border-b border-dashed border-slate-300 pb-1 uppercase">{bill.customerName}</p>
            {bill.contactNo && (
              <p className="text-xs text-slate-600 mt-1">Ph: {bill.contactNo}</p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-1 w-[45%]">Item</th>
                <th className="text-center py-1 w-[15%]">Qty</th>
                <th className="text-right py-1 w-[20%]">Rate</th>
                <th className="text-right py-1 w-[20%]">Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-300">
              {bill.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-1 align-top">
                     <div className="font-bold truncate">{item.productName}</div>
                     <div className="text-[10px] text-slate-500 truncate">{item.variationName}</div>
                  </td>
                  <td className="py-2 text-center align-top">{item.quantity}</td>
                  <td className="py-2 text-right align-top">{item.rate}</td>
                  <td className="py-2 text-right align-top font-bold">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-slate-800 pt-2 space-y-1 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{bill.totalAmount}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>- ₹{bill.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg mt-2 border-t border-dashed border-slate-300 pt-2">
              <span>TOTAL</span>
              <span>₹{bill.finalAmount}</span>
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-dashed border-slate-300">
               <span>Payment: {bill.paymentMode}</span>
               <span>Paid: ₹{bill.amountReceived}</span>
            </div>
            {bill.amountPending > 0 && (
              <div className="flex justify-between font-bold text-xs mt-1 text-slate-800">
                <span>Balance Due:</span>
                <span>₹{bill.amountPending}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[10px] text-slate-500 font-sans">
            <p className="font-bold mb-1">*** THANK YOU ***</p>
            <p>For your business!</p>
            <p className="mt-2 text-[9px] opacity-70">Powered by Infinity Innovations</p>
          </div>
        </div>
      </div>
    </div>
  );
};