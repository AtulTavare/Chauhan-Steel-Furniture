import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle, Upload, Palette, ArrowRight, ArrowLeft, ChevronDown, Check, Layers, Box, DollarSign } from 'lucide-react';
import { Product, Variation } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, variations: Variation[]) => void;
  existingCategories: string[];
}

interface TempVariation {
  tempId: string;
  name: string;
  stock: number | '';
  purchasePrice: number | '';
  sellingPrice: number | '';
  image: string;
  color: string;
}

const STORAGE_KEY = 'product_form_v3_draft';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingCategories 
}) => {
  // --- STATE ---
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic Info
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [productImage, setProductImage] = useState('');

  // Step 2: Inventory Mode
  const [isMultiVariation, setIsMultiVariation] = useState(false);
  
  // Step 2A: Simple Product Data
  const [simpleStock, setSimpleStock] = useState<number | ''>('');
  const [simplePurchasePrice, setSimplePurchasePrice] = useState<number | ''>('');
  const [simpleSellingPrice, setSimpleSellingPrice] = useState<number | ''>('');

  // Step 2B: Multi-Variation Data
  const [hasColors, setHasColors] = useState(false);
  const [variations, setVariations] = useState<TempVariation[]>([
    { tempId: '1', name: 'Standard', stock: 0, purchasePrice: '', sellingPrice: '', image: '', color: '#000000' }
  ]);

  // UI Helpers
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const catWrapperRef = useRef<HTMLDivElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // --- PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setProductName(data.productName || '');
          setCategory(data.category || '');
          setProductImage(data.productImage || '');
          setStep(data.step || 1);
          setIsMultiVariation(data.isMultiVariation || false);
          setSimpleStock(data.simpleStock ?? '');
          setSimplePurchasePrice(data.simplePurchasePrice ?? '');
          setSimpleSellingPrice(data.simpleSellingPrice ?? '');
          setHasColors(data.hasColors || false);
          if (data.variations) setVariations(data.variations);
        } catch (e) { console.error("Failed to load draft", e); }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const data = {
        step, productName, category, productImage,
        isMultiVariation, simpleStock, simplePurchasePrice, simpleSellingPrice,
        hasColors, variations
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [step, productName, category, productImage, isMultiVariation, simpleStock, simplePurchasePrice, simpleSellingPrice, hasColors, variations, isOpen]);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catWrapperRef.current && !catWrapperRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => onSuccess(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCloseAndClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Reset defaults
    setStep(1);
    setProductName('');
    setCategory('');
    setProductImage('');
    setIsMultiVariation(false);
    setSimpleStock('');
    setSimplePurchasePrice('');
    setSimpleSellingPrice('');
    setHasColors(false);
    setVariations([{ tempId: '1', name: 'Standard', stock: 0, purchasePrice: '', sellingPrice: '', image: '', color: '#000000' }]);
    onClose();
  };

  const handleNextStep = () => {
    if (!productName.trim()) {
      alert("Please enter a Product Name.");
      return;
    }
    if (!category.trim()) {
      alert("Please select or create a Category.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProductId = Date.now().toString();
    const newProduct: Product = {
      id: newProductId,
      name: productName,
      category,
      image: productImage || 'https://placehold.co/400x300?text=No+Image',
      basePurchasePrice: 0,
      baseSellingPrice: 0
    };

    let finalVariations: Variation[] = [];

    if (!isMultiVariation) {
      // SIMPLE PRODUCT LOGIC
      if (simplePurchasePrice === '' || simpleSellingPrice === '') {
        alert("Please enter Purchase and Selling prices.");
        return;
      }
      
      newProduct.basePurchasePrice = Number(simplePurchasePrice);
      newProduct.baseSellingPrice = Number(simpleSellingPrice);

      finalVariations = [{
        id: `${newProductId}_v1`,
        productId: newProductId,
        name: 'Standard', 
        stock: Number(simpleStock) || 0,
        purchasePrice: Number(simplePurchasePrice),
        sellingPrice: Number(simpleSellingPrice),
        image: productImage || '', 
      }];
    } else {
      // MULTI-VARIATION LOGIC
      // Validation
      if (variations.length === 0) {
        alert("Please add at least one variation.");
        return;
      }
      for (const v of variations) {
        if (!v.name) {
          alert("All variations must have a name (e.g. Size, Type).");
          return;
        }
        if (v.sellingPrice === '' || v.purchasePrice === '') {
          alert(`Please enter prices for variation "${v.name}".`);
          return;
        }
      }

      // Set base prices from first variation for sorting
      newProduct.basePurchasePrice = Number(variations[0].purchasePrice) || 0;
      newProduct.baseSellingPrice = Number(variations[0].sellingPrice) || 0;

      finalVariations = variations.map((v, idx) => ({
        id: `${newProductId}_v${idx}`,
        productId: newProductId,
        name: v.name,
        stock: Number(v.stock) || 0,
        purchasePrice: Number(v.purchasePrice),
        sellingPrice: Number(v.sellingPrice),
        image: v.image || '',
        color: hasColors ? v.color : undefined
      }));
    }

    onSave(newProduct, finalVariations);
    handleCloseAndClear();
  };

  // Switch Logic: Copy data when toggling modes for better UX
  const toggleMode = (enableMulti: boolean) => {
    setIsMultiVariation(enableMulti);
    if (enableMulti) {
      // Switching TO Multi: Copy simple data to first variation if valid
      if (simplePurchasePrice !== '' || simpleSellingPrice !== '') {
        const firstVar = { ...variations[0] };
        firstVar.purchasePrice = simplePurchasePrice;
        firstVar.sellingPrice = simpleSellingPrice;
        firstVar.stock = simpleStock === '' ? 0 : simpleStock;
        // Keep name as 'Standard' or maybe user wants to change it
        setVariations([firstVar]);
      }
    } else {
      // Switching TO Simple: Copy first variation data back to simple fields
      if (variations.length > 0) {
        const v = variations[0];
        setSimplePurchasePrice(v.purchasePrice);
        setSimpleSellingPrice(v.sellingPrice);
        setSimpleStock(v.stock === '' ? '' : v.stock);
      }
    }
  };

  // Filter Categories
  const filteredCategories = existingCategories.filter(c => 
    c.toLowerCase().includes(category.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header with Progress */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {step === 1 ? 'Step 1: Product Details' : 'Step 2: Inventory & Pricing'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {step === 1 ? 'Basic information and categorization' : 'Set prices, stock levels, and variations'}
              </p>
            </div>
            <button onClick={handleCloseAndClear} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className={`h-2 rounded-full flex-1 transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-2 rounded-full flex-1 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="product-form" onSubmit={handleSubmit} className="h-full">
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Left Col: Inputs */}
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                        <input 
                          autoFocus
                          type="text" 
                          value={productName}
                          onChange={e => setProductName(e.target.value)}
                          placeholder="e.g. Executive Chair, SS Pipe"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-slate-800 font-medium"
                        />
                      </div>

                      <div ref={catWrapperRef} className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={category}
                            onChange={e => { setCategory(e.target.value); setShowCatDropdown(true); }}
                            onFocus={() => setShowCatDropdown(true)}
                            placeholder="Select or Type..."
                            className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCatDropdown(!showCatDropdown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>
                        
                        {/* Custom Dropdown */}
                        {showCatDropdown && (
                          <div className="absolute z-20 w-full bg-white shadow-xl border border-slate-200 rounded-lg mt-1 max-h-56 overflow-y-auto animate-fade-in">
                            {filteredCategories.map(c => (
                              <button 
                                key={c}
                                type="button" 
                                onClick={() => { setCategory(c); setShowCatDropdown(false); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 border-b border-slate-50 last:border-0 transition-colors"
                              >
                                {c}
                              </button>
                            ))}
                            {filteredCategories.length === 0 && category.trim() !== '' && (
                               <div 
                                  onClick={() => { setCategory(category); setShowCatDropdown(false); }}
                                  className="px-4 py-3 text-sm text-blue-600 bg-blue-50 font-medium flex items-center gap-2 cursor-pointer hover:bg-blue-100"
                               >
                                 <Plus size={16} /> Create new category "{category}"
                               </div>
                            )}
                            {filteredCategories.length === 0 && category.trim() === '' && (
                               <div className="px-4 py-3 text-sm text-slate-400 text-center italic">
                                 Start typing to create or select...
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                   </div>

                   {/* Right Col: Image */}
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                      <div 
                        onClick={() => productFileInputRef.current?.click()}
                        className="w-full aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-all group overflow-hidden"
                      >
                        {productImage ? (
                          <>
                            <img src={productImage} alt="Preview" className="w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white font-medium flex items-center gap-2">
                                <Upload size={18} /> Change Image
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-slate-400 p-4">
                            <ImageIcon className="mx-auto mb-3 opacity-50" size={48} />
                            <span className="font-medium block text-slate-600">Click to upload image</span>
                            <span className="text-xs">Supports JPG, PNG (Max 2MB)</span>
                          </div>
                        )}
                      </div>
                      
                      {productImage && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setProductImage(''); }}
                          className="mt-2 text-sm text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove Image
                        </button>
                      )}
                      
                      <input 
                        ref={productFileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setProductImage)}
                      />
                   </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing & Variations */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 2. Mode Selector */}
                <div className="bg-slate-50 p-2 rounded-xl flex border border-slate-200">
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      !isMultiVariation
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Box size={18} /> Simple Product (Single Price)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isMultiVariation 
                        ? 'bg-white text-purple-600 shadow-sm border border-slate-100' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Layers size={18} /> With Variations (Sizes/Colors)
                  </button>
                </div>

                {/* 2A. Simple Product Form */}
                {!isMultiVariation && (
                  <div className="bg-white rounded-xl space-y-6">
                    <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                       <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                         <DollarSign size={20} /> Pricing & Stock
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purchase Price <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                              <input 
                                type="number"
                                min="0"
                                required={!isMultiVariation}
                                value={simplePurchasePrice}
                                onChange={e => setSimplePurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selling Price <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                              <input 
                                type="number"
                                min="0"
                                required={!isMultiVariation}
                                value={simpleSellingPrice}
                                onChange={e => setSimpleSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800 text-lg"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opening Stock</label>
                            <input 
                              type="number"
                              min="0"
                              value={simpleStock}
                              onChange={e => setSimpleStock(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                              placeholder="0"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* 2B. Variations Form */}
                {isMultiVariation && (
                  <div className="space-y-4">
                     {/* Toolbar */}
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-slate-700">Variations List</h3>
                       
                       <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setHasColors(!hasColors)}>
                        <Palette size={16} className={hasColors ? "text-purple-600" : "text-slate-400"} />
                        <span className="text-sm font-medium text-slate-700 select-none">Enable Colors</span>
                        <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${hasColors ? 'bg-purple-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${hasColors ? 'translate-x-4' : 'translate-x-1'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[800px]">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs tracking-wider">
                            <tr>
                              <th className="p-3 text-center w-16">Img</th>
                              <th className="p-3">Variation Name <span className="text-red-500">*</span></th>
                              {hasColors && <th className="p-3 w-32">Color</th>}
                              <th className="p-3 w-24">Stock</th>
                              <th className="p-3 w-32">Purchase ₹</th>
                              <th className="p-3 w-32">Selling ₹</th>
                              <th className="p-3 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variations.map((v, idx) => (
                              <tr key={v.tempId} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="p-2 text-center align-middle">
                                   <div className="relative w-10 h-10 mx-auto bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer group-hover:shadow-sm">
                                      {v.image ? (
                                        <img src={v.image} alt="var" className="w-full h-full object-cover" />
                                      ) : (
                                        <Upload size={14} className="text-slate-300" />
                                      )}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        title="Upload variation image"
                                        onChange={(e) => handleFileChange(e, (base64) => {
                                           const updated = [...variations];
                                           updated[idx] = { ...updated[idx], image: base64 };
                                           setVariations(updated);
                                        })}
                                      />
                                   </div>
                                </td>
                                <td className="p-2 align-middle">
                                  <input 
                                    type="text" 
                                    placeholder="e.g. XL, 32mm"
                                    value={v.name}
                                    onChange={e => {
                                       const updated = [...variations];
                                       updated[idx] = { ...updated[idx], name: e.target.value };
                                       setVariations(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </td>
                                {hasColors && (
                                  <td className="p-2 align-middle">
                                    <div className="flex gap-2 items-center">
                                      <input 
                                        type="color"
                                        value={v.color}
                                        onChange={e => {
                                           const updated = [...variations];
                                           updated[idx] = { ...updated[idx], color: e.target.value };
                                           setVariations(updated);
                                        }}
                                        className="h-9 w-9 p-0.5 border border-slate-300 rounded cursor-pointer shrink-0"
                                      />
                                    </div>
                                  </td>
                                )}
                                <td className="p-2 align-middle">
                                  <input 
                                    type="number" 
                                    min="0"
                                    placeholder="0"
                                    value={v.stock}
                                    onChange={e => {
                                       const updated = [...variations];
                                       updated[idx] = { ...updated[idx], stock: e.target.value };
                                       setVariations(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                                  />
                                </td>
                                <td className="p-2 align-middle">
                                  <input 
                                    type="number" 
                                    min="0"
                                    placeholder="0.00"
                                    value={v.purchasePrice}
                                    onChange={e => {
                                       const updated = [...variations];
                                       updated[idx] = { ...updated[idx], purchasePrice: e.target.value };
                                       setVariations(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                                  />
                                </td>
                                <td className="p-2 align-middle">
                                  <input 
                                    type="number" 
                                    min="0"
                                    placeholder="0.00"
                                    value={v.sellingPrice}
                                    onChange={e => {
                                       const updated = [...variations];
                                       updated[idx] = { ...updated[idx], sellingPrice: e.target.value };
                                       setVariations(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 outline-none font-semibold"
                                  />
                                </td>
                                <td className="p-2 text-center align-middle">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                       if (variations.length > 1) {
                                          setVariations(variations.filter((_, i) => i !== idx));
                                       }
                                    }}
                                    disabled={variations.length === 1}
                                    className="text-slate-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed p-2"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setVariations([...variations, { 
                        tempId: Date.now().toString(), 
                        name: '', stock: 0, purchasePrice: '', sellingPrice: '', image: '', color: hasColors ? '#000000' : ''
                      }])}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                    >
                      <Plus size={20} /> Add Another Variation
                    </button>
                  </div>
                )}
              </div>
            )}

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center sticky bottom-0 z-10">
          {step === 2 ? (
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-white font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
             // Placeholder for spacing when no back button
            <div></div>
          )}

          {step === 1 ? (
            <button 
              type="button" 
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-slate-300"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              type="submit" 
              form="product-form"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95"
            >
              <Save size={20} /> Save Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
};