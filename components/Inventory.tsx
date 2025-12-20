
import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, ImageIcon, Boxes, Tag } from 'lucide-react';
import { Product, Variation } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { CategoryManager } from './CategoryManager';

interface InventoryProps {
  products: Product[];
  variations: Variation[];
  categories: string[];
  onSelectProduct: (product: Product) => void;
  onAddProduct: (product: Product, variations: Variation[]) => void;
  onUpdateCategories: (categories: string[]) => void;
}

const ProductCard: React.FC<{ product: Product, stats: any, onSelect: () => void }> = ({ product, stats, onSelect }) => {
  const isOutOfStock = stats.totalStock === 0;
  const isLowStock = stats.totalStock < 10 && !isOutOfStock;

  return (
    <div 
      onClick={onSelect}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 cursor-pointer flex flex-col relative"
    >
      <div className="aspect-square sm:aspect-[4/3] bg-slate-50 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-300" size={32} /></div>
        )}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
          <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-white/50">{product.category}</span>
        </div>
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3">
          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm ${
            isOutOfStock ? 'bg-red-500 text-white' : isLowStock ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
          </span>
        </div>
      </div>
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
        <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock</span>
            <span className={`text-xs sm:text-base font-black ${isOutOfStock ? 'text-red-500' : 'text-slate-800'}`}>{stats.totalStock}</span>
          </div>
          <div className="h-5 sm:h-8 w-px bg-slate-100"></div>
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Variants</span>
            <span className="text-xs sm:text-base font-black text-slate-800">{stats.variationCount}</span>
          </div>
        </div>
        <div className="mt-auto pt-2.5 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Starting ₹</span>
            <span className="text-[10px] sm:text-sm font-black text-slate-900">₹{stats.minPrice}</span>
          </div>
          <div className="bg-slate-50 p-1 sm:p-2 rounded-lg sm:rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={14} className="sm:w-[18px] sm:h-[18px]" /></div>
        </div>
      </div>
    </div>
  );
};

export const Inventory: React.FC<InventoryProps> = ({ products, variations, categories, onSelectProduct, onAddProduct, onUpdateCategories }) => {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);

  const productStats = useMemo(() => {
    const stats = new Map();
    products.forEach(p => {
      const pVars = variations.filter(v => v.productId === p.id);
      const prices = pVars.map(v => v.sellingPrice);
      stats.set(p.id, {
        totalStock: pVars.reduce((sum, v) => sum + v.stock, 0),
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        variationCount: pVars.length
      });
    });
    return stats;
  }, [products, variations]);

  const filteredProducts = products.filter(p => {
    const mSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const mCat = filterCat === 'All' || p.category === filterCat;
    return mSearch && mCat;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Inventory Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your steel furniture collection</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setIsCatManagerOpen(true)} className="flex-1 sm:flex-none bg-white border border-slate-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Tag size={16} className="text-slate-400" /> Categories
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none bg-blue-600 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-30 space-y-3 bg-slate-50/80 backdrop-blur pb-2 sm:pb-4 pt-1">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-sm sm:text-base font-medium text-slate-800"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-linear-right">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${
                filterCat === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile grid-cols-2 to show 2 cards per row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} stats={productStats.get(p.id)} onSelect={() => onSelectProduct(p)} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 sm:py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl">
            <Boxes className="mx-auto text-slate-200 mb-4" size={48} sm:size={60} />
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">No items found</h3>
            <p className="text-xs sm:text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

      <ProductFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={onAddProduct} existingCategories={categories} />
      <CategoryManager isOpen={isCatManagerOpen} onClose={() => setIsCatManagerOpen(false)} categories={categories} onUpdateCategories={onUpdateCategories} />
    </div>
  );
};
