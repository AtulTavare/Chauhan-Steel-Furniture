
import { supabase } from '../supabaseClient';
import { Product, Variation, Bill, Purchase } from '../types';

// --- DEMO DATA CONSTANTS ---
const DEMO_CATEGORIES = [
  'Raw Material', 'Chairs', 'Tables', 'Wardrobes', 'Office Furniture', 'Home Utility', 'Home Furniture'
];

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', name: 'SS Round Pipe 202', category: 'Raw Material', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=SS+Pipe', basePurchasePrice: 120, baseSellingPrice: 180 },
  { id: 'p2', name: 'SS Square Pipe 304', category: 'Raw Material', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Square+Pipe', basePurchasePrice: 250, baseSellingPrice: 320 },
  { id: 'p3', name: 'Executive Office Chair', category: 'Chairs', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Office+Chair', basePurchasePrice: 2500, baseSellingPrice: 4500 },
  { id: 'p4', name: 'Visitor Staff Chair', category: 'Chairs', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Visitor+Chair', basePurchasePrice: 1200, baseSellingPrice: 2200 },
  { id: 'p5', name: 'Steel Almirah (Triveni)', category: 'Wardrobes', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Almirah', basePurchasePrice: 6000, baseSellingPrice: 9500 },
  { id: 'p6', name: 'Folding Dining Table', category: 'Tables', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Folding+Table', basePurchasePrice: 1500, baseSellingPrice: 2400 },
  { id: 'p7', name: 'SS 3-Seater Bench', category: 'Office Furniture', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Waiting+Bench', basePurchasePrice: 3500, baseSellingPrice: 5800 },
  { id: 'p8', name: 'Center Table (Fancy)', category: 'Tables', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Center+Table', basePurchasePrice: 2800, baseSellingPrice: 4500 },
  { id: 'p9', name: 'Shoe Rack', category: 'Home Utility', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Shoe+Rack', basePurchasePrice: 800, baseSellingPrice: 1500 },
  { id: 'p10', name: 'Queen Size SS Bed', category: 'Home Furniture', image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=SS+Bed', basePurchasePrice: 5000, baseSellingPrice: 8500 },
];

const DEMO_VARIATIONS: Variation[] = [
  { id: 'v1', productId: 'p1', name: '19mm (3/4 inch)', stock: 500, purchasePrice: 120, sellingPrice: 180, color: '#C0C0C0' },
  { id: 'v2', productId: 'p1', name: '25mm (1 inch)', stock: 300, purchasePrice: 180, sellingPrice: 250, color: '#C0C0C0' },
  { id: 'v3', productId: 'p2', name: '1x1 inch', stock: 200, purchasePrice: 250, sellingPrice: 320, color: '#A9A9A9' },
  { id: 'v4', productId: 'p2', name: '1.5x1.5 inch', stock: 150, purchasePrice: 380, sellingPrice: 480, color: '#A9A9A9' },
  { id: 'v5', productId: 'p3', name: 'High Back (Black)', stock: 15, purchasePrice: 2500, sellingPrice: 4500, color: '#000000' },
  { id: 'v6', productId: 'p3', name: 'High Back (Brown)', stock: 8, purchasePrice: 2500, sellingPrice: 4500, color: '#8B4513' },
  { id: 'v7', productId: 'p4', name: 'Mesh Back Standard', stock: 40, purchasePrice: 1200, sellingPrice: 2200, color: '#000000' },
  { id: 'v8', productId: 'p5', name: '6x3 ft Mirror Door', stock: 5, purchasePrice: 6000, sellingPrice: 9500, color: '#708090' },
  { id: 'v9', productId: 'p5', name: '6x4 ft Full Safe', stock: 3, purchasePrice: 8000, sellingPrice: 12500, color: '#8B4513' },
  { id: 'v10', productId: 'p6', name: '4x2 ft Plywood Top', stock: 20, purchasePrice: 1500, sellingPrice: 2400, color: '#DEB887' },
  { id: 'v11', productId: 'p6', name: '4x2 ft SS Top', stock: 12, purchasePrice: 2200, sellingPrice: 3500, color: '#C0C0C0' },
  { id: 'v12', productId: 'p7', name: 'Perforated Steel', stock: 10, purchasePrice: 3500, sellingPrice: 5800, color: '#C0C0C0' },
  { id: 'v13', productId: 'p7', name: 'Cushion Seat', stock: 4, purchasePrice: 4500, sellingPrice: 7200, color: '#000080' },
  { id: 'v14', productId: 'p8', name: 'Glass Top Gold', stock: 8, purchasePrice: 2800, sellingPrice: 4500, color: '#FFD700' },
  { id: 'v15', productId: 'p9', name: '4 Layer Steel', stock: 25, purchasePrice: 800, sellingPrice: 1500, color: '#C0C0C0' },
  { id: 'v16', productId: 'p9', name: '5 Layer Steel', stock: 15, purchasePrice: 1000, sellingPrice: 1800, color: '#C0C0C0' },
  { id: 'v17', productId: 'p10', name: '5x6 ft Pipe Frame', stock: 2, purchasePrice: 5000, sellingPrice: 8500, color: '#C0C0C0' },
  { id: 'v18', productId: 'p10', name: '6x6 ft Heavy Duty', stock: 2, purchasePrice: 7000, sellingPrice: 12000, color: '#C0C0C0' },
];

const seedDemoData = async () => {
  const categoryInserts = DEMO_CATEGORIES.map(name => ({ name }));
  await supabase.from('categories').insert(categoryInserts);

  const productInserts = DEMO_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    image: p.image,
    base_purchase_price: p.basePurchasePrice,
    base_selling_price: p.baseSellingPrice
  }));
  await supabase.from('products').insert(productInserts);

  const variationInserts = DEMO_VARIATIONS.map(v => ({
    id: v.id,
    product_id: v.productId,
    name: v.name,
    stock: v.stock,
    purchase_price: v.purchasePrice,
    selling_price: v.sellingPrice,
    image: v.image,
    color: v.color
  }));
  await supabase.from('variations').insert(variationInserts);
};

const mapProductFromDB = (p: any): Product => ({
  id: p.id,
  name: p.name,
  category: p.category,
  image: p.image,
  basePurchasePrice: p.base_purchase_price,
  baseSellingPrice: p.base_selling_price
});

const mapVariationFromDB = (v: any): Variation => ({
  id: v.id,
  productId: v.product_id,
  name: v.name,
  stock: v.stock,
  purchasePrice: v.purchase_price,
  sellingPrice: v.selling_price,
  image: v.image,
  color: v.color
});

const mapBillFromDB = (b: any): Bill => ({
  id: b.id,
  customerName: b.customer_name,
  contactNo: b.contact_no,
  date: b.date,
  items: b.items,
  totalAmount: b.total_amount,
  discount: b.discount,
  finalAmount: b.final_amount,
  amountReceived: b.amount_received,
  amountPending: b.amount_pending,
  paymentMode: b.payment_mode,
  type: 'SALE'
});

const mapPurchaseFromDB = (p: any): Purchase => ({
  id: p.id,
  supplierName: p.supplier_name,
  date: p.date,
  items: p.items,
  totalAmount: p.total_amount,
  amountPaid: p.amount_paid,
  amountPending: p.amount_pending,
  paymentMode: p.payment_mode,
  type: 'PURCHASE'
});

export const dataService = {
  fetchAllData: async (retryCount = 0): Promise<{
    products: Product[];
    variations: Variation[];
    bills: Bill[];
    purchases: Purchase[];
    categories: string[];
  }> => {
    const [
      { data: products, error: pError },
      { data: variations, error: vError },
      { data: bills, error: bError },
      { data: purchases, error: purError },
      { data: categoriesData, error: cError }
    ] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('variations').select('*'),
      supabase.from('bills').select('*'),
      supabase.from('purchases').select('*'),
      supabase.from('categories').select('*')
    ]);

    if (pError) throw new Error(`Products Load Error: ${pError.message}`);
    if (vError) throw new Error(`Variations Load Error: ${vError.message}`);
    if (bError) throw new Error(`Bills Load Error: ${bError.message}`);
    if (purError) throw new Error(`Purchases Load Error: ${purError.message}`);

    if ((!products || products.length === 0) && (!categoriesData || categoriesData?.length === 0)) {
      if (retryCount > 0) return { products: [], variations: [], bills: [], purchases: [], categories: [] };
      try {
        await seedDemoData();
        return dataService.fetchAllData(1);
      } catch (e: any) {
        return { products: [], variations: [], bills: [], purchases: [], categories: DEMO_CATEGORIES };
      }
    }

    return {
      products: products?.map(mapProductFromDB) || [],
      variations: variations?.map(mapVariationFromDB) || [],
      bills: bills?.map(mapBillFromDB) || [],
      purchases: purchases?.map(mapPurchaseFromDB) || [],
      categories: categoriesData ? categoriesData.map((c: any) => c.name) : []
    };
  },

  updateProduct: async (p: Product) => {
    const dbProduct = {
      name: p.name,
      category: p.category,
      image: p.image,
      base_purchase_price: p.basePurchasePrice,
      base_selling_price: p.baseSellingPrice
    };
    const { error } = await supabase.from('products').update(dbProduct).eq('id', p.id);
    if (error) throw new Error(error.message);
  },

  addProduct: async (product: Product, newVariations: Variation[]) => {
    const dbProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      base_purchase_price: product.basePurchasePrice,
      base_selling_price: product.baseSellingPrice
    };
    const { error: pError } = await supabase.from('products').insert(dbProduct);
    if (pError) throw new Error(pError.message);

    if (newVariations.length > 0) {
      const dbVariations = newVariations.map(v => ({
        id: v.id,
        product_id: v.productId,
        name: v.name,
        stock: v.stock,
        purchase_price: v.purchasePrice,
        selling_price: v.sellingPrice,
        image: v.image,
        color: v.color
      }));
      const { error: vError } = await supabase.from('variations').insert(dbVariations);
      if (vError) throw new Error(vError.message);
    }
  },

  addVariation: async (v: Variation) => {
    const dbVariation = {
      id: v.id,
      product_id: v.productId,
      name: v.name,
      stock: v.stock,
      purchase_price: v.purchasePrice,
      selling_price: v.sellingPrice,
      image: v.image,
      color: v.color
    };
    const { error } = await supabase.from('variations').insert(dbVariation);
    if (error) throw new Error(error.message);
  },

  updateVariation: async (v: Variation) => {
    const dbVariation = {
      name: v.name,
      stock: v.stock,
      purchase_price: v.purchasePrice,
      selling_price: v.sellingPrice,
      image: v.image,
      color: v.color
    };
    const { error } = await supabase.from('variations').update(dbVariation).eq('id', v.id);
    if (error) throw new Error(error.message);
  },

  createBill: async (bill: Bill, updatedVariations: Variation[]) => {
    const dbBill = {
      id: bill.id,
      customer_name: bill.customerName,
      contact_no: bill.contactNo,
      date: bill.date,
      items: bill.items,
      total_amount: bill.totalAmount,
      discount: bill.discount,
      final_amount: bill.finalAmount,
      amount_received: bill.amountReceived,
      amount_pending: bill.amountPending,
      payment_mode: bill.paymentMode,
      type: 'SALE'
    };
    const { error: bError } = await supabase.from('bills').insert(dbBill);
    if (bError) throw new Error("DB Error: " + bError.message);

    for (const v of updatedVariations) {
      await supabase.from('variations').update({ stock: v.stock }).eq('id', v.id);
    }
  },

  createPurchase: async (purchase: Purchase, updatedVariations: Variation[]) => {
    const dbPurchase = {
      id: purchase.id,
      supplier_name: purchase.supplierName,
      date: purchase.date,
      items: purchase.items,
      total_amount: purchase.totalAmount,
      amount_paid: purchase.amountPaid,
      amount_pending: purchase.amountPending,
      payment_mode: purchase.paymentMode,
      type: 'PURCHASE'
    };
    const { error: pError } = await supabase.from('purchases').insert(dbPurchase);
    if (pError) throw new Error("DB Error: " + pError.message);

    for (const v of updatedVariations) {
      await supabase.from('variations').update({ stock: v.stock, purchase_price: v.purchasePrice }).eq('id', v.id);
    }
  },

  addCategory: async (categoryName: string) => {
    const { error } = await supabase.from('categories').insert({ name: categoryName });
    if (error) throw new Error(error.message);
  },

  deleteCategory: async (categoryName: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', categoryName);
    if (error) throw new Error(error.message);
  },

  fetchCategories: async () => {
    const { data, error } = await supabase.from('categories').select('name');
    if (error) throw new Error(error.message);
    return data ? data.map((c: any) => c.name) : [];
  }
};
