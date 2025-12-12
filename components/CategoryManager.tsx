import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
}) => {
  const [newCat, setNewCat] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      onUpdateCategories([...categories, newCat]);
      setNewCat('');
    }
  };

  const handleDelete = (catToDelete: string) => {
    if (confirm(`Delete category "${catToDelete}"?`)) {
      onUpdateCategories(categories.filter(c => c !== catToDelete));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Tag size={20} /> Manage Categories
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New Category Name..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={!newCat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                <span className="font-medium text-slate-700">{cat}</span>
                <button 
                  onClick={() => handleDelete(cat)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-slate-400 py-4">No categories added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};