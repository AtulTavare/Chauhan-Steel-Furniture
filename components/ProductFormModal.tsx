import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle, Upload, Palette, ArrowRight, ArrowLeft } from 'lucide-react';
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

const STORAGE_KEY = 'product_form_temp';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingCategories 
}) => {
  // Load initial state from storage if available
  const savedData = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  const [step, setStep] = useState<1 | 2>(savedData?.step || 1); 
  
  // Step 1 State: Product Details
  const [productName, setProductName] = useState(savedData?.productName || '');
  const [category, setCategory] = useState(savedData?.category || '');
  const [productImage, setProductImage] = useState(savedData?.productImage || '');
  const productFileInputRef = useRef<HTMLInputElement>(null);
  
  // Step 2 State: Variations
  const [hasColors, setHasColors] = useState(savedData?.hasColors || false);
  const [variations, setVariations] = useState<TempVariation[]>(savedData?.variations || [
    { tempId: '1', name: 'Standard', stock: 0, purchasePrice: '', sellingPrice: '', image: '', color: '#000000' }
  ]);

  // Persist State Changes
  useEffect(() => {
    if (isOpen) {
      const data = {
        step,
        productName,
        category,
        productImage,
        hasColors,
        variations
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [step, productName, category, productImage, hasColors, variations, isOpen]);

  if (!isOpen) return null;

  // --- File Handling ---
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

  // --- Variation Logic ---
  const handleAddVariation = () => {
    setVariations([...variations, { 
      tempId: Date.now().toString(), 
      name: '', 
      stock: 0, 
      purchasePrice: '', 
      sellingPrice: '', 
      image: '',
      color: hasColors ? '#000000' : ''
    }]);
  };

  const handleRemoveVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  const updateVariation = (index: number, field: keyof TempVariation, value: string | number) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  // --- Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final Validation
    if (!productName || !category) {
      alert("Product Name and Category are required");
      return;
    }
    
    // Validate Variations
    for (const v of variations) {
      if (!v.name) {
        alert("All variations must have a name (e.g., Size, Grade).");
        return;
      }
      if (v.sellingPrice === '' || v.purchasePrice === '') {
        alert("Please enter both Purchase and Selling prices for all variations.");
        return;
      }
    }

    const newProductId = Date.now().toString();
    
    const newProduct: Product = {
      id: newProductId,
      name: productName,
      category,
      image: productImage || 'https://placehold.co/400x300?text=No+Image', 
      basePurchasePrice: Number(variations[0].purchasePrice) || 0, // Fallback for sorting
      baseSellingPrice: Number(variations[0].sellingPrice) || 0    // Fallback for sorting
    };

    const newVariations: Variation[] = variations.map((v, idx) => ({
      id: `${newProductId}_v${idx}`,
      productId: newProductId,
      name: v.name,
      stock: Number(v.stock) || 0,
      purchasePrice: Number(v.purchasePrice),
      sellingPrice: Number(v.sellingPrice),
      image: v.image || '',
      color: hasColors ? v.color : undefined
    }));

    onSave(newProduct, newVariations);
    handleCloseAndClear();
  };

  const handleCloseAndClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Reset State
    setStep(1);
    setProductName('');
    setCategory('');
    setProductImage('');
    setHasColors(false);
    setVariations([{ tempId: '1', name: 'Standard', stock: 0, purchasePrice: '', sellingPrice: '', image: '', color: '#000000' }]);
    onClose();
  };

  const handleNext = () => {
    if (productName && category) {
      setStep(2);
    } else {
      alert("Please enter Product Name and Category first.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {step === 1 ? 'Add New Product (1/2)' : 'Add Variations (2/2)'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {step === 1 ? 'Enter main product details' : 'Configure sizes, colors, and prices'}
            </p>
          </div>
          <button onClick={handleCloseAndClear} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="product-form" onSubmit={handleSubmit} className="h-full">
            
            {/* --- STEP 1: Product Details --- */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Product Name *</label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="e.g. SS Pipe 304"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Category *</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        list="categories"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        placeholder="Select or Type Category"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                      />
                      <datalist id="categories">
                        {existingCategories.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700">
                    <p className="font-semibold mb-1">Note:</p>
                    <p>Prices and stocks will be added in the next step for each variation individually.</p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Product Image (Optional)</label>
                  <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative hover:bg-slate-100 transition-colors group min-h-[200px]">
                    {productImage ? (
                      <>
                        <img src={productImage} alt="Preview" className="w-full h-full object-contain p-4 absolute inset-0" />
                        <button 
                          type="button"
                          onClick={() => setProductImage('')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md z-10 hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 pointer-events-none p-4">
                        <ImageIcon className="mx-auto mb-3 opacity-50" size={48} />
                        <span className="font-medium block">Click below to upload</span>
                        <span className="text-xs">Supports JPG, PNG</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button 
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="px-6 py-2 bg-white text-slate-700 rounded-lg font-medium transition-colors border border-slate-300 shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <Upload size={18} /> Choose Image
                    </button>
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

            {/* --- STEP 2: Variations --- */}
            {step === 2 && (
              <div className="space-y-6">
                
                {/* Options Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-600">
                     <AlertCircle size={20} className="text-blue-500" />
                     <p className="text-sm font-medium">Define sizes, types, and prices.</p>
                  </div>

                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-300 shadow-sm cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setHasColors(!hasColors)}>
                    <Palette size={18} className={hasColors ? "text-purple-600" : "text-slate-400"} />
                    <span className="text-sm font-medium text-slate-700 select-none">Enable Colors</span>
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hasColors ? 'bg-purple-600' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasColors ? 'translate-x-5' : 'translate-x-1'}`} />
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
                          <th className="p-3 w-32">Purchase ₹ <span className="text-red-500">*</span></th>
                          <th className="p-3 w-32">Selling ₹ <span className="text-red-500">*</span></th>
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
                                    onChange={(e) => handleFileChange(e, (base64) => updateVariation(idx, 'image', base64))}
                                  />
                               </div>
                            </td>
                            <td className="p-2 align-middle">
                              <input 
                                type="text" 
                                placeholder="e.g. 32mm, Large"
                                value={v.name}
                                onChange={e => updateVariation(idx, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                              />
                            </td>
                            {hasColors && (
                              <td className="p-2 align-middle">
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="color"
                                    value={v.color}
                                    onChange={e => updateVariation(idx, 'color', e.target.value)}
                                    className="h-9 w-9 p-0.5 border border-slate-300 rounded cursor-pointer shrink-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={v.color}
                                    onChange={e => updateVariation(idx, 'color', e.target.value)}
                                    className="w-full px-2 py-2 border border-slate-300 rounded text-xs"
                                    placeholder="#Hex"
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
                                onChange={e => updateVariation(idx, 'stock', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                              />
                            </td>
                            <td className="p-2 align-middle">
                              <input 
                                type="number" 
                                min="0"
                                placeholder="0.00"
                                value={v.purchasePrice}
                                onChange={e => updateVariation(idx, 'purchasePrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow text-slate-600"
                              />
                            </td>
                            <td className="p-2 align-middle">
                              <input 
                                type="number" 
                                min="0"
                                placeholder="0.00"
                                value={v.sellingPrice}
                                onChange={e => updateVariation(idx, 'sellingPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow font-semibold text-slate-800"
                              />
                            </td>
                            <td className="p-2 text-center align-middle">
                              <button 
                                type="button"
                                onClick={() => handleRemoveVariation(idx)}
                                disabled={variations.length === 1}
                                className="text-slate-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed p-2 rounded-full hover:bg-red-50 transition-colors"
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
                  onClick={handleAddVariation}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                >
                  <Plus size={20} /> Add Another Variation
                </button>
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
            <div>{/* Spacer */}</div>
          )}

          {step === 1 ? (
            <button 
              type="button" 
              onClick={handleNext}
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