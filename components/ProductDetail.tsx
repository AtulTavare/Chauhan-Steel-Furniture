
import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Edit2, PackagePlus, X, Upload, ImageIcon, CheckCircle2, AlertTriangle, ChevronRight, Camera } from 'lucide-react';
import { Product, Variation } from '../types';

interface ProductDetailProps {
  product: Product;
  variations: Variation[];
  onBack: () => void;
  onUpdateVariation: (v: Variation) => void;
  onAddVariation: (v: Variation) => void;
  onUpdateProduct: (p: Product) => void;
}

const VariationCard: React.FC<{ variation: Variation, onUpdateStock: () => void, onEdit: () => void }> = ({ variation, onUpdateStock, onEdit }) => {
  const isOutOfStock = variation.stock === 0;
  const isLowStock = variation.stock < 10 && !isOutOfStock;

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col relative">
      <div className="aspect-square sm:aspect-[4/3] bg-slate-50 relative overflow-hidden">
        {variation.image ? (
          <img src={variation.image} alt={variation.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-300" size={32} /></div>
        )}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
          <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-white/50">{variation.name}</span>
        </div>
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3">
          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm ${
            isOutOfStock ? 'bg-red-500 text-white' : isLowStock ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {variation.stock} Left
          </span>
        </div>
        {variation.color && (
          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-sm border border-white/50">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-slate-200" style={{backgroundColor: variation.color}}></div>
            <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600">{variation.color}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-1">{variation.name}</h3>
          <button onClick={onEdit} className="p-1 sm:p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
        </div>
        <div className="mt-auto pt-2 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selling</span>
            <span className="text-xs sm:text-sm font-black text-blue-600">₹{variation.sellingPrice}</span>
          </div>
          <button 
            onClick={onUpdateStock}
            className="bg-slate-900 text-white p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-95 shrink-0"
          >
            <PackagePlus size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, variations, onBack, onUpdateVariation, onAddVariation, onUpdateProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<Variation | null>(null);
  const [formData, setFormData] = useState<Partial<Variation>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAdjVar, setStockAdjVar] = useState<Variation | null>(null);
  const [stockAdjMode, setStockAdjMode] = useState<'ADD' | 'SET'>('ADD');
  const [stockAdjValue, setStockAdjValue] = useState<number | ''>('');

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProduct({ ...product, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) return;
    if (editingVar) onUpdateVariation({ ...editingVar, ...formData } as Variation);
    else onAddVariation({ id: Date.now().toString(), productId: product.id, ...formData } as Variation);
    setIsModalOpen(false);
  };

  const openModal = (v?: Variation) => {
    if (v) { setEditingVar(v); setFormData(v); }
    else { setEditingVar(null); setFormData({ name: '', stock: 0, purchasePrice: product.basePurchasePrice, sellingPrice: product.baseSellingPrice }); }
    setIsModalOpen(true);
  };

  const handleStockSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjVar || stockAdjValue === '') return;
    let newStock = stockAdjMode === 'ADD' ? stockAdjVar.stock + Number(stockAdjValue) : Number(stockAdjValue);
    onUpdateVariation({ ...stockAdjVar, stock: Math.max(0, newStock) });
    setIsStockModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors group">
        <div className="p-2 bg-white border rounded-lg sm:rounded-xl group-hover:border-blue-500 transition-all"><ArrowLeft size={16} sm:size={18} /></div> <span className="text-sm">Back</span>
      </button>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div className="md:w-1/3 aspect-video md:aspect-auto bg-slate-50 relative group">
          {product.image ? (
            <img src={product.image} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={48} sm:size={64} /></div>
          )}
          <button 
            onClick={() => productImgInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black uppercase tracking-widest text-[10px] sm:text-xs gap-2"
          >
            <Camera size={20} sm:size={24} /> Change Product Image
          </button>
          <input ref={productImgInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageChange} />
          <div className="absolute top-4 left-4">
            <span className="bg-white/95 px-3 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl border border-blue-50">{product.category}</span>
          </div>
        </div>
        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-5xl font-black text-slate-900 leading-none mb-3 sm:mb-6">{product.name}</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-relaxed mb-6 sm:mb-8">Manage the specific sizes, weights, and finishes for this product line. Each variation tracks its own stock and pricing.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100"><span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 block mb-1">Total Stock</span><span className="text-lg sm:text-2xl font-black text-slate-900">{variations.reduce((s, v) => s + v.stock, 0)}</span></div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100"><span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 block mb-1">Variants</span><span className="text-lg sm:text-2xl font-black text-slate-900">{variations.length}</span></div>
          </div>
        </div>
      </div>

      <div className="pt-4 sm:pt-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">Variations <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500"></div></h3>
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95 transition-all">
            <Plus size={16} sm:size={18} /> Add New
          </button>
        </div>

        {/* grid-cols-2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {variations.map(v => (
            <VariationCard 
              key={v.id} 
              variation={v} 
              onUpdateStock={() => { setStockAdjVar(v); setStockAdjValue(''); setIsStockModalOpen(true); }} 
              onEdit={() => openModal(v)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl animate-scale-in my-8">
            <div className="p-5 sm:p-6 border-b flex justify-between items-center">
              <h3 className="text-lg sm:text-2xl font-black">{editingVar ? 'Update Specs' : 'New Spec'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} sm:size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 sm:mb-2">Variation Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-slate-50 border rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base" placeholder="e.g. 19mm, Large" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 sm:mb-2">Purchase ₹</label>
                  <input type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-slate-50 border rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 sm:mb-2">Selling ₹</label>
                  <input type="number" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-2xl font-black text-blue-600 text-sm sm:text-base" />
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 border rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center relative shrink-0">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={20} sm:size={24} />}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                </div>
                <div className="flex-1">
                  <label className="block text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 sm:mb-2">Color Label / Hex</label>
                  <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-50 border rounded-xl sm:rounded-2xl text-xs sm:text-sm" placeholder="#000000 or Silver" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && stockAdjVar && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-sm p-6 sm:p-8 animate-scale-in">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div><h3 className="text-xl sm:text-2xl font-black">Stock Control</h3><p className="text-blue-600 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">{stockAdjVar.name}</p></div>
              <button onClick={() => setIsStockModalOpen(false)} className="p-2"><X size={20} sm:size={24} /></button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <button onClick={() => setStockAdjMode('ADD')} className={`flex-1 py-2.5 sm:py-3 text-[8px] sm:text-[10px] font-black uppercase rounded-lg sm:rounded-xl transition-all ${stockAdjMode === 'ADD' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Add/Sub</button>
              <button onClick={() => setStockAdjMode('SET')} className={`flex-1 py-2.5 sm:py-3 text-[8px] sm:text-[10px] font-black uppercase rounded-lg sm:rounded-xl transition-all ${stockAdjMode === 'SET' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Manual Set</button>
            </div>
            <input autoFocus type="number" value={stockAdjValue} onChange={e => setStockAdjValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full py-6 sm:py-8 text-4xl sm:text-5xl font-black text-center bg-slate-50 border-2 rounded-2xl sm:rounded-3xl outline-none focus:border-blue-500 transition-all mb-6 sm:mb-8" placeholder="0" />
            <button onClick={handleStockSave} className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base shadow-xl active:scale-95 transition-all"><CheckCircle2 size={20} sm:size={24} /> Confirm Change</button>
          </div>
        </div>
      )}
    </div>
  );
};
