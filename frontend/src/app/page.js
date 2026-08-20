'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Checkout Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkAdmin();
  }, []);

  const checkAdmin = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '5466728043').split(',');
      if (tgUser && ADMIN_IDS.includes(tgUser.id.toString())) {
        setIsAdmin(true);
      }
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price_usd * item.quantity), 0);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      let uiCat = 'Barchasi';
      if (p.category === 'Men') uiCat = 'Erkaklar';
      if (p.category === 'Women') uiCat = 'Ayollar';
      if (p.category === 'Kids') uiCat = 'Bolalar';
      if (p.category === 'Accessories') uiCat = 'Aksessuarlar';

      const matchTab = activeTab === 'Barchasi' || uiCat === activeTab;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [products, activeTab, searchQuery]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!name || !phone || !receipt) return alert("Iltimos barcha maydonlarni to'ldiring!");
    
    setIsSubmitting(true);
    try {
      // 1. Upload receipt
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receipt);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      const receiptUrl = publicUrlData.publicUrl;

      // 2. Prepare Order Details
      let details = cart.map(item => `- ${item.title} x ${item.quantity} = $${(item.price_usd * item.quantity).toFixed(2)}`).join('\n');
      details += `\n\nJami Summa: $${totalAmount.toFixed(2)}`;
      details += `\nOldindan to'lov (50%): $${(totalAmount / 2).toFixed(2)}`;

      // 3. Notify Admins via API Route
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: details,
          receiptUrl,
          customerName: name,
          customerPhone: phone
        })
      });

      alert("Buyurtmangiz qabul qilindi! Adminlar tez orada aloqaga chiqishadi.");
      setCart([]);
      setShowCheckout(false);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi: " + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 font-sans relative">
      {/* Header (Shopify Style) */}
      <div className="bg-white px-5 pt-6 pb-4 sticky top-0 z-30 shadow-sm rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Do'kon <span className="text-xl">🛍️</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Xitoydan to'g'ridan-to'g'ri 🇨🇳</p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/admin" className="p-3 bg-indigo-100 rounded-full shadow-sm">
                ⚙️
              </Link>
            )}
            <button onClick={() => setShowSearch(!showSearch)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shadow-sm">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {showSearch && (
          <div className="mb-4 animate-fade-in-down">
            <input 
              type="text" 
              placeholder="Mahsulot qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 text-gray-900 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['Barchasi', 'Erkaklar', 'Ayollar', 'Bolalar', 'Aksessuarlar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-5 mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Mahsulot topilmadi 😕</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.description === 'OUT_OF_STOCK';
              const isNew = !isOutOfStock && (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) <= 3; // 3 days

              return (
                <div key={product.id} className={`bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-shadow relative group ${isOutOfStock ? 'opacity-75' : ''}`}>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                    {isOutOfStock && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">TUGAGAN</span>}
                    {isNew && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">YANGI</span>}
                  </div>

                  <button className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <div className="w-full h-40 bg-gray-50 rounded-2xl mb-3 overflow-hidden relative">
                    <img src={product.image_url} alt={product.title} className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`} />
                  </div>
                  <div className="px-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{product.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-gray-900">${product.price_usd}</span>
                      <button 
                        onClick={() => addToCart(product)} 
                        disabled={isOutOfStock}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors shadow-md ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}>
                        {isOutOfStock ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart & Checkout Trigger */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Jami Summa</p>
              <h2 className="text-2xl font-black text-gray-900">${totalAmount.toFixed(2)}</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-medium">{cart.length} xil mahsulot</p>
            </div>
          </div>
          
          <button onClick={() => setShowCheckout(true)} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex justify-center items-center gap-2">
            Xaridni rasmiylashtirish <span className="text-xl">💳</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 mb-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Buyurtma berish</h2>
              <button onClick={() => setShowCheckout(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">✕</button>
            </div>

            <div className="max-h-40 overflow-y-auto mb-4 bg-gray-50 p-3 rounded-2xl">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2 last:mb-0">
                  <span className="text-sm font-medium text-gray-800 truncate flex-1">{item.title}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-gray-200 rounded-full text-gray-700 font-bold">-</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-gray-200 rounded-full text-gray-700 font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl mb-6">
              <p className="text-sm text-blue-800 font-semibold mb-1">Diqqat! 50% oldindan to'lov talab etiladi.</p>
              <p className="text-sm text-blue-600">To'lanishi kerak: <span className="font-bold">${(totalAmount / 2).toFixed(2)}</span></p>
              <p className="text-xs text-blue-500 mt-1">Karta raqam: 8600 1234 5678 9012 (Admin)</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <input type="text" placeholder="Ism familiyangiz" required value={name} onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-100 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              
              <input type="tel" placeholder="Telefon raqam" required value={phone} onChange={e => setPhone(e.target.value)} 
                className="w-full bg-gray-100 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">To'lov kvitansiyasi (Chek rasmi)</label>
                <input type="file" accept="image/*" required onChange={e => setReceipt(e.target.files[0])} 
                  className="w-full bg-gray-100 rounded-xl p-3 outline-none text-gray-700 text-sm" />
              </div>

              <button type="submit" disabled={isSubmitting} 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 mt-4">
                {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtmani Yuborish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
