import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Plus, Edit2, PackagePlus, X, AlertCircle, 
  Upload, Image as ImageIcon, Box, DollarSign, Layers,
  CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Product, Variation } from '../types';

interface ProductDetailProps {
  product: Product;
  variations: Variation[];
  onBack: () => void;
  onUpdateVariation: (v: Variation) => void;
  onAddVariation: (v: Variation) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  variations, 
  onBack,
  onUpdateVariation,
  onAddVariation
}) => {
  // --- STATE MANAGEMENT (MODALS) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<Variation | null>(null);
  const [formData, setFormData] = useState<Partial<Variation>>({
    name: '', stock: 0, purchasePrice: 0, sellingPrice: 0, image: '', color: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAdjVar, setStockAdjVar] = useState<Variation | null>(null);
  const [stockAdjMode, setStockAdjMode] = useState<'ADD' | 'SET'>('ADD');
  const [stockAdjValue, setStockAdjValue] = useState<number | ''>('');

  // --- STATS CALCULATION ---
  const totalStock = variations.reduce((acc, v) => acc + v.stock, 0);
  const stockValue = variations.reduce((acc, v) => acc + (v.stock * v.purchasePrice), 0);
  const potentialRevenue = variations.reduce((acc, v) => acc + (v.stock * v.sellingPrice), 0);

  // --- HELPERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLERS ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) return;

    if (editingVar) {
      onUpdateVariation({ ...editingVar, ...formData } as Variation);
    } else {
      onAddVariation({
        id: Date.now().toString(),
        productId: product.id,
        ...formData
      } as Variation);
    }
    setIsModalOpen(false);
    setEditingVar(null);
    setFormData({ name: '', stock: 0, purchasePrice: 0, sellingPrice: 0, image: '', color: '' });
  };

  const openModal = (v?: Variation) => {
    if (v) {
      setEditingVar(v);
      setFormData(v);
    } else {
      setEditingVar(null);
      setFormData({ 
        name: '', stock: 0, 
        purchasePrice: product.basePurchasePrice || 0, 
        sellingPrice: product.baseSellingPrice || 0, 
        image: '', color: ''
      });
    }
    setIsModalOpen(true);
  };

  const openStockModal = (v: Variation) => {
    setStockAdjVar(v);
    setStockAdjMode('ADD');
    setStockAdjValue('');
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setStockAdjVar(null);
    setStockAdjValue('');
  };

  const handleStockSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjVar || stockAdjValue === '') return;
    const val = Number(stockAdjValue);
    let newStock = stockAdjVar.stock;
    if (stockAdjMode === 'ADD') newStock += val;
    else newStock = val;
    if (newStock < 0) newStock = 0;
    onUpdateVariation({ ...stockAdjVar, stock: newStock });
    closeStockModal();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-fade-in">
      
      {/* Top Nav */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
           <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Inventory</span>
              <ChevronRight size={14}/>
              <span>{product.category}</span>
           </div>
           <h1 className="text-xl font-bold text-slate-800">Product Details</h1>
        </div>
      </div>

      {/* Hero / Overview Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/3 lg:w-1/4 h-64 md:h-auto bg-slate-100 relative group border-b md:border-b-0 md:border-r border-slate-100">
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-200 uppercase tracking-wide">
                    {product.category}
                  </span>
               </div>
            </div>

            {/* Info & Stats */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">
               <h2 className="text-3xl font-bold text-slate-800 mb-2">{product.name}</h2>
               <p className="text-slate-500 mb-6">Manage stock levels, pricing, and variations for this product.</p>

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-auto">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Box size={18} />
                        <span className="text-xs font-bold uppercase">Total Stock</span>
                     </div>
                     <span className="text-2xl font-black text-slate-800">{totalStock}</span>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                     <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Layers size={18} />
                        <span className="text-xs font-bold uppercase">Variations</span>
                     </div>
                     <span className="text-2xl font-black text-slate-800">{variations.length}</span>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                     <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <DollarSign size={18} />
                        <span className="text-xs font-bold uppercase">Stock Value</span>
                     </div>
                     <span className="text-2xl font-black text-slate-800">₹{(stockValue/1000).toFixed(1)}k</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Variations Section */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               Available Variations
               <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">{variations.length}</span>
            </h3>
            <button 
               onClick={() => openModal()}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
            >
               <Plus size={18} /> Add Variation
            </button>
         </div>

         {/* Variations Grid List */}
         <div className="grid grid-cols-1 gap-4">
            {variations.map((variation) => (
               <div key={variation.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-4 group">
                  
                  {/* Variation Image */}
                  <div className="w-full md:w-20 h-32 md:h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative">
                     {variation.image ? (
                        <img src={variation.image} alt={variation.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <ImageIcon size={24} />
                        </div>
                     )}
                     {variation.stock < 5 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg">
                           <AlertTriangle size={12} />
                        </div>
                     )}
                  </div>

                  {/* Variation Details */}
                  <div className="flex-1 w-full text-center md:text-left">
                     <h4 className="font-bold text-lg text-slate-800">{variation.name}</h4>
                     {variation.color && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-sm text-slate-500">
                           <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor: variation.color}}></div>
                           <span>{variation.color}</span>
                        </div>
                     )}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto px-4 md:px-0 border-t md:border-0 border-slate-100 pt-3 md:pt-0">
                     <div className="text-left md:text-right">
                        <div className="text-xs text-slate-400 uppercase font-medium">Selling Price</div>
                        <div className="text-lg font-bold text-slate-900">₹{variation.sellingPrice}</div>
                     </div>
                     <div className="text-right hidden md:block mt-1">
                        <div className="text-[10px] text-slate-400 uppercase">Purchase</div>
                        <div className="text-sm font-medium text-slate-600">₹{variation.purchasePrice}</div>
                     </div>
                  </div>

                  {/* Mobile Only Purchase Price Row */}
                  <div className="flex md:hidden justify-between w-full px-4 text-sm text-slate-500">
                     <span>Purchase Price</span>
                     <span>₹{variation.purchasePrice}</span>
                  </div>

                  {/* Stock & Actions */}
                  <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3 md:gap-6 md:pl-6 md:border-l border-slate-100 mt-2 md:mt-0">
                     
                     {/* Stock Display */}
                     <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Stock</span>
                        <div className={`text-xl font-black ${variation.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                           {variation.stock}
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex gap-2 w-full md:w-auto">
                        <button 
                           onClick={() => openStockModal(variation)}
                           className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                           <PackagePlus size={16} /> Adjust
                        </button>
                        <button 
                           onClick={() => openModal(variation)}
                           className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
                        >
                           <Edit2 size={16} />
                        </button>
                     </div>
                  </div>

               </div>
            ))}

            {variations.length === 0 && (
               <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertCircle className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No variations yet</h3>
                  <p className="text-slate-500 mb-6">Add sizes or colors to start tracking stock.</p>
                  <button onClick={() => openModal()} className="text-blue-600 font-medium hover:underline">
                     Add your first variation
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Add/Edit Variation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingVar ? 'Edit Variation' : 'New Variation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Variation Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="e.g. 32mm, Large, Red"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Color (Optional)</label>
                 <div className="flex gap-2">
                   <input 
                     type="color"
                     value={formData.color || '#000000'}
                     onChange={e => setFormData({...formData, color: e.target.value})}
                     className="h-10 w-10 p-1 border border-slate-300 rounded cursor-pointer shrink-0"
                   />
                   <input 
                      type="text" 
                      placeholder="#HEX or Name"
                      value={formData.color || ''}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Variation Image</label>
                <div className="flex gap-2 items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                     {formData.image ? (
                        <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                     ) : (
                        <ImageIcon className="text-slate-300" size={24} />
                     )}
                  </div>
                  <div className="flex-1">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-300 flex items-center gap-2 mb-1"
                    >
                      <Upload size={14} /> Upload Image
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {formData.image && (
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, image: ''})}
                         className="text-xs text-red-500 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.purchasePrice}
                      onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                      className="w-full pl-6 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.sellingPrice}
                      onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                      className="w-full pl-6 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {!editingVar && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Stock Adjustment Modal */}
      {isStockModalOpen && stockAdjVar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Adjust Stock</h3>
                <p className="text-xs text-slate-500">{stockAdjVar.name}</p>
              </div>
              <button onClick={closeStockModal} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStockSave} className="p-6">
              <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setStockAdjMode('ADD')}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                    stockAdjMode === 'ADD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Add / Remove
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjMode('SET')}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                    stockAdjMode === 'SET' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Set Total
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {stockAdjMode === 'ADD' ? 'Enter Quantity' : 'Enter New Total Stock'}
                </label>
                <input
                  autoFocus
                  type="number"
                  value={stockAdjValue}
                  onChange={(e) => setStockAdjValue(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-4 py-4 text-2xl font-bold text-center border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  placeholder={stockAdjMode === 'ADD' ? "+ / -" : "0"}
                />
                {stockAdjMode === 'ADD' && (
                  <p className="text-xs text-center text-slate-400 mt-2">Use negative (e.g., -5) to reduce stock</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Resulting Stock</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">{stockAdjVar.stock}</span>
                  <ChevronRight size={16} className="text-slate-300" />
                  <span className="font-bold text-xl text-blue-600">
                    {stockAdjValue !== '' ? (
                      stockAdjMode === 'ADD' 
                        ? Math.max(0, stockAdjVar.stock + Number(stockAdjValue)) 
                        : Math.max(0, Number(stockAdjValue))
                    ) : '-'}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} /> Update Stock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};