import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Save, IndianRupee, User, Phone, Calendar, Search } from 'lucide-react';
import { Product, Variation, CartItem } from '../types';

interface TransactionFormProps {
  type: 'SALE' | 'PURCHASE';
  products: Product[];
  variations: Variation[];
  onSubmit: (data: any) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, products, variations, onSubmit }) => {
  const isSale = type === 'SALE';
  const storageKey = `tx_form_${type}`;

  // Helper to load initial state from localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load saved form data", e);
      return {};
    }
  };

  // Load once on mount (or when type changes due to key prop in App.tsx)
  const savedData = useMemo(() => loadSavedData(), [type]);

  // Header Info
  const [partyName, setPartyName] = useState(savedData.partyName || '');
  const [contactNo, setContactNo] = useState(savedData.contactNo || '');
  const [date, setDate] = useState(savedData.date || new Date().toISOString().split('T')[0]);
  
  // Cart Logic
  const [cart, setCart] = useState<CartItem[]>(savedData.cart || []);
  
  // Item Selection State (Not persisted as it's transient)
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariationId, setSelectedVariationId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [customRate, setCustomRate] = useState<number | ''>('');

  // Payment
  const [discount, setDiscount] = useState<number | ''>(savedData.discount !== undefined ? savedData.discount : '');
  const [amountReceived, setAmountReceived] = useState<number | ''>(savedData.amountReceived !== undefined ? savedData.amountReceived : '');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online' | 'Cheque' | 'Credit'>(savedData.paymentMode || 'Cash');

  // Persist State Changes
  useEffect(() => {
    const dataToSave = {
      partyName,
      contactNo,
      date,
      cart,
      discount,
      amountReceived,
      paymentMode
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [partyName, contactNo, date, cart, discount, amountReceived, paymentMode, storageKey]);

  // Derived State for Dropdowns
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const availableVariations = useMemo(() => {
    return variations.filter(v => v.productId === selectedProductId);
  }, [selectedProductId, variations]);

  const selectedVariation = variations.find(v => v.id === selectedVariationId);

  // Auto-fill rate when variation selected
  React.useEffect(() => {
    if (selectedVariation) {
      setCustomRate(isSale ? selectedVariation.sellingPrice : selectedVariation.purchasePrice);
    }
  }, [selectedVariationId, isSale]);

  // Calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const finalDiscount = Number(discount) || 0;
  const finalAmount = Math.max(0, cartTotal - finalDiscount);
  const pendingAmount = Math.max(0, finalAmount - (Number(amountReceived) || 0));

  // Handlers
  const addToCart = () => {
    if (!selectedProduct || !selectedVariation || !quantity || !customRate) return;

    const newItem: CartItem = {
      productId: selectedProduct.id,
      variationId: selectedVariation.id,
      productName: selectedProduct.name,
      variationName: selectedVariation.name,
      quantity: Number(quantity),
      rate: Number(customRate),
      total: Number(quantity) * Number(customRate)
    };

    setCart([...cart, newItem]);
    
    // Reset selection for next item
    setQuantity(1);
    // Keep product selected for faster entry, but reset variation
    setSelectedVariationId(''); 
    setCustomRate('');
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName) {
      alert(`Please enter ${isSale ? 'Customer' : 'Supplier'} Name`);
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const payload = {
      customerName: isSale ? partyName : undefined,
      supplierName: !isSale ? partyName : undefined,
      contactNo: isSale ? contactNo : undefined,
      date,
      items: cart,
      totalAmount: cartTotal,
      discount: finalDiscount,
      finalAmount: finalAmount,
      amountReceived: Number(amountReceived) || 0,
      amountPending: pendingAmount,
      paymentMode,
      type
    };

    onSubmit(payload);
    
    // Clear saved data on successful submit
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-slate-800">{isSale ? 'New Sales Bill' : 'New Purchase Entry'}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isSale ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
          {isSale ? 'Outbound' : 'Inbound'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* LEFT COLUMN: Input Form */}
        <div className="flex-1 space-y-6">
          
          {/* 1. Header Details */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <User size={18} /> {isSale ? 'Customer Details' : 'Supplier Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
                  {isSale ? 'Customer Name' : 'Supplier Name'} *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={isSale ? "Enter customer name" : "Enter supplier name"}
                />
              </div>
              
              {/* Added Contact No Field */}
              {isSale && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
                    Contact No
                  </label>
                  <div className="relative">
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                       type="tel"
                       value={contactNo}
                       onChange={e => setContactNo(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       placeholder="Mobile Number"
                     />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Date</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                     type="date"
                     value={date}
                     onChange={e => setDate(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Item Selection */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Plus size={18} /> Add Items
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Select Product</label>
                  <select 
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Variation</label>
                  <select 
                    value={selectedVariationId}
                    onChange={e => setSelectedVariationId(e.target.value)}
                    disabled={!selectedProductId}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="">-- Select Type --</option>
                    {availableVariations.map(v => (
                      <option key={v.id} value={v.id}>
                         {v.name} {v.color ? `(${v.color})` : ''} - Stock: {v.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={customRate}
                      onChange={e => setCustomRate(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addToCart}
                disabled={!selectedVariation || !quantity || !customRate}
                className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Add to Cart
              </button>
            </div>
          </div>

          {/* 3. Payment Details */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <IndianRupee size={18} /> Payment & Discount
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-red-600 font-medium"
                    placeholder="0"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Payment Mode</label>
                  <select 
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit (Udhaar)</option>
                  </select>
               </div>
               <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountReceived}
                    onChange={e => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-800 font-bold text-lg"
                    placeholder="0"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cart Summary */}
        <div className="lg:w-96 flex flex-col h-full space-y-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
               <h3 className="font-bold text-slate-700">Current Cart</h3>
               <p className="text-xs text-slate-500">{cart.length} items added</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100 group relative">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{item.productName}</div>
                    <div className="text-xs text-slate-500">{item.variationName}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.quantity} x ₹{item.rate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700">₹{item.total}</div>
                    <button 
                      onClick={() => removeFromCart(idx)}
                      className="text-red-400 hover:text-red-600 p-1 -mr-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Cart is empty.<br/>Add items to proceed.
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount</span>
                <span>- ₹{finalDiscount}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-500 pt-1">
                <span>Balance Due</span>
                <span className={pendingAmount > 0 ? "text-red-500" : "text-emerald-500"}>
                   ₹{pendingAmount}
                </span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={cart.length === 0}
                className="w-full py-4 mt-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <CheckCircle size={20} /> Complete {isSale ? 'Sale' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};