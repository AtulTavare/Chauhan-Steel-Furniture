import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronRight, Package, AlertTriangle, Settings, Tag, Image as ImageIcon } from 'lucide-react';
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

export const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  variations, 
  categories,
  onSelectProduct, 
  onAddProduct,
  onUpdateCategories
}) => {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);

  // Derive inventory stats per product
  const productStats = useMemo(() => {
    const stats = new Map<string, { totalStock: number, minPrice: number, maxPrice: number, variationCount: number }>();
    
    products.forEach(p => {
      const pVars = variations.filter(v => v.productId === p.id);
      const totalStock = pVars.reduce((sum, v) => sum + v.stock, 0);
      const prices = pVars.map(v => v.sellingPrice);
      
      stats.set(p.id, {
        totalStock,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        variationCount: pVars.length
      });
    });
    return stats;
  }, [products, variations]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const filterCategories = ['All', ...categories];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
          <p className="text-slate-500">Manage your furniture stock and prices</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCatManagerOpen(true)}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors font-medium"
          >
            <Tag size={18} />
            Manage Categories
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm active:scale-95 font-medium"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 sticky top-0 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {filterCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterCat === cat 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List View (Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-24 text-center">Image</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                <th className="px-6 py-4 text-center">Variations</th>
                <th className="px-6 py-4 text-right">Price Range</th>
                <th className="px-6 py-4 text-right">Total Stock</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const stat = productStats.get(product.id) || { totalStock: 0, minPrice: 0, maxPrice: 0, variationCount: 0 };
                const isLowStock = stat.totalStock < 10;

                return (
                  <tr 
                    key={product.id} 
                    onClick={() => onSelectProduct(product)}
                    className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative flex items-center justify-center">
                        {product.image ? (
                           <img 
                             src={product.image} 
                             alt={product.name} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                           />
                        ) : (
                           <ImageIcon className="text-slate-300" size={24} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-800 text-base">{product.name}</div>
                      <div className="text-xs text-slate-400 mt-1 sm:hidden">{product.category}</div>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <span className="text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 text-sm">
                         {stat.variationCount} types
                       </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="font-semibold text-slate-700">
                        ₹{stat.minPrice.toLocaleString()} - ₹{stat.maxPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className={`inline-flex flex-col items-end`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isLowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {stat.totalStock} units
                        </span>
                        {isLowStock && <span className="text-[10px] text-red-500 mt-1 font-medium">Low Stock</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-300">
                      <ChevronRight size={20} className="group-hover:text-blue-500 transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50">
            <Package className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-slate-600">No products found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search or add a new product.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <ProductFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={onAddProduct}
        existingCategories={categories}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={isCatManagerOpen}
        onClose={() => setIsCatManagerOpen(false)}
        categories={categories}
        onUpdateCategories={onUpdateCategories}
      />
    </div>
  );
};