'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockCount, setStockCount] = useState('10');
  const [deliveryTime, setDeliveryTime] = useState('Ertaga');
  const [sizes, setSizes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoPercent, setPromoPercent] = useState('');
  const [category, setCategory] = useState('Men');
  const [imageFile, setImageFile] = useState(null);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // products, orders, reviews, messages
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [replyText, setReplyText] = useState({});

  const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '5466728043').split(',');

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser && ADMIN_IDS.includes(tgUser.id.toString())) {
          setIsAdmin(true);
          fetchAllData();
        } else if (process.env.NODE_ENV === 'development') {
          setIsAdmin(true);
          fetchAllData();
        }
      } else if (process.env.NODE_ENV === 'development') {
        setIsAdmin(true);
        fetchAllData();
      }
      setLoading(false);
    };
    check();
    setTimeout(check, 500);
    setTimeout(check, 1500);
  }, []);

  const fetchAllData = () => {
    fetchProducts();
    fetchOrders();
    fetchReviews();
    fetchMessages();
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, users(full_name, phone_number), products(title)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase.from('reviews').select('*, products(title)').order('created_at', { ascending: false });
      if (data) setReviews(data);
    } catch(e){}
  };

  const fetchMessages = async () => {
    try {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (data) setMessages(data);
    } catch(e){}
  };

  const submitReply = async (table, id) => {
    const text = replyText[id];
    if (!text) return;
    try {
      await supabase.from(table).update({ admin_reply: text }).eq('id', id);
      alert("Javob saqlandi!");
      if (table === 'reviews') fetchReviews();
      if (table === 'messages') fetchMessages();
    } catch(e) {
      alert("SQL Xatoligi (admin_reply kolonkasi yo'q bo'lishi mumkin): " + e.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      fetchOrders();
      alert("Holat yangilandi!");
    } catch (e) {
      alert("Xatolik: " + e.message);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!title || !price) {
      setMessage('Xatolik: Nomi va narxi kiritilishi shart!');
      return;
    }
    if (!editingProductId && !imageFile) {
      setMessage('Xatolik: Yangi mahsulot uchun rasm kiritilishi shart!');
      return;
    }
    
    setUploading(true);
    setMessage('');

    try {
      let finalImageUrl = existingImageUrl;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const productData = {
        title,
        price_usd: parseFloat(price) || 0,
        original_price: originalPrice ? parseFloat(originalPrice) : 0,
        stock_count: stockCount ? parseInt(stockCount) : 1,
        delivery_time: deliveryTime || 'Ertaga',
        sizes: sizes || '',
        promo_code: promoCode || '',
        promo_percent: promoPercent ? parseInt(promoPercent) : 0,
        category,
        image_url: finalImageUrl,
        description: null,
        weight_kg: 0
      };

      if (editingProductId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProductId);
        if (error) throw error;
        setMessage('Mahsulot muvaffaqiyatli yangilandi!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        setMessage('Mahsulot muvaffaqiyatli qo\'shildi!');
      }

      setTitle(''); setPrice(''); setOriginalPrice(''); setSizes(''); setPromoCode(''); setPromoPercent(''); setImageFile(null);
      setEditingProductId(null);
      setExistingImageUrl('');
      fetchProducts();
    } catch (error) {
      setMessage('Xatolik yuz berdi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (product) => {
    setEditingProductId(product.id);
    setTitle(product.title || '');
    setPrice(product.price_usd?.toString() || '');
    setOriginalPrice(product.original_price?.toString() || '');
    setStockCount(product.stock_count?.toString() || '');
    setDeliveryTime(product.delivery_time || '');
    setSizes(product.sizes || '');
    setPromoCode(product.promo_code || '');
    setPromoPercent(product.promo_percent?.toString() || '');
    setCategory(product.category || 'Men');
    setExistingImageUrl(product.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelEditing = () => {
    setEditingProductId(null);
    setTitle(''); setPrice(''); setOriginalPrice(''); setSizes(''); setPromoCode(''); setPromoPercent(''); setImageFile(null);
    setExistingImageUrl('');
  };

  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) return;
    
    try {
      await supabase.from('products').delete().eq('id', id);
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('product_images').remove([fileName]);
      }
      fetchProducts();
    } catch (error) {
      alert('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleToggleStock = async (id, currentDesc) => {
    try {
      const newDesc = currentDesc === 'OUT_OF_STOCK' ? null : 'OUT_OF_STOCK';
      await supabase.from('products').update({ description: newDesc }).eq('id', id);
      fetchProducts();
    } catch (error) {
      alert('Xatolik yuz berdi: ' + error.message);
    }
  };

  const handleToggleNew = async (id, currentWeight) => {
    try {
      const newWeight = currentWeight === 1 ? 0 : 1;
      await supabase.from('products').update({ weight_kg: newWeight }).eq('id', id);
      fetchProducts();
    } catch (error) {
      alert('Xatolik yuz berdi: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Tekshirilmoqda...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-400 font-bold">Sizga ruxsat yo'q! Kiring: Telegram.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel 🛠️</h1>
        <Link href="/" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Do'konga qaytish</Link>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          📦 Mahsulotlar
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          🛒 Buyurtmalar
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Yangi mahsulot qo'shish</h2>
        
        {message && (
          <div className={`p-3 rounded-xl mb-4 ${message.includes('Xatolik') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mahsulot nomi</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Masalan: Nike Air Max" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sotuv narxi</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Masalan: 53000" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Eski narxi (ustiga chizilgan)</label>
              <input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Masalan: 150000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Qoldiq (Soni)</label>
              <input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nechta bor?" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Yetkazib berish (Matn)</label>
              <input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Razmerlar (vergul bilan ajrating)</label>
            <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Masalan: 39, 40, 41, 42" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Promokod (Majburiy emas)</label>
              <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Promokod chegirmasi (%)</label>
              <input type="number" value={promoPercent} onChange={e => setPromoPercent(e.target.value)} 
                className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Kategoriya</label>
            <select value={category} onChange={e => setCategory(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Men">Erkaklar (Men)</option>
              <option value="Women">Ayollar (Women)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Mahsulot rasmi {editingProductId && "(Rasmni o'zgartirish uchun yangisini tanlang)"}
            </label>
            {editingProductId && existingImageUrl && (
              <img src={existingImageUrl} className="h-20 object-contain mb-2 rounded-lg" alt="Joriy rasm" />
            )}
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} 
              className="w-full bg-gray-700 rounded-xl p-2 text-white outline-none" {...(!editingProductId && { required: true })} />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={uploading} 
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50">
              {uploading ? 'Yuklanmoqda...' : (editingProductId ? "O'zgarishlarni Saqlash" : "Qo'shish")}
            </button>
            {editingProductId && (
              <button type="button" onClick={cancelEditing} 
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
                Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Barcha Mahsulotlar ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 relative flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-gray-600" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{p.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <p>Sotuv: <span className="text-blue-400 font-bold">{p.price_usd}</span></p>
                      <p>Eski: <span className="line-through">{p.original_price}</span></p>
                      <p>Qoldiq: <span className="text-green-400 font-bold">{p.stock_count}</span></p>
                    </div>
                    {p.promo_code && (
                      <p className="text-xs text-purple-400 mt-1">🎟 Promokod: {p.promo_code} (-{p.promo_percent}%)</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => startEditing(p)} className="flex-1 min-w-[100px] bg-blue-600/20 text-blue-400 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-bold text-sm">
                    Tahrirlash
                  </button>
                  <button onClick={() => handleToggleNew(p.id, p.weight_kg)} className="flex-1 min-w-[100px] bg-green-600/20 text-green-400 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-bold text-sm">
                    {p.weight_kg === 1 ? 'Eski (Oddiy)' : 'Yangi qilish'}
                  </button>
                  <button onClick={() => handleDelete(p.id, p.image_url)} className="flex-1 min-w-[100px] bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600 hover:text-white transition font-bold text-sm">
                    O'chirish
                  </button>
                  <button onClick={() => handleToggleStock(p.id, p.description)} className="flex-1 min-w-[100px] bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition font-bold text-sm">
                    {p.description === 'OUT_OF_STOCK' ? 'Sotuvga qaytarish' : 'Tugadi'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">🛒 Buyurtmalar ro'yxati</h2>
          {orders.length === 0 ? (
            <p className="text-gray-400">Hozircha buyurtmalar yo'q.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">👤 {order.users?.full_name || 'Noma\'lum'}</h3>
                    <p className="text-sm text-gray-400 mt-1">📱 {order.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">🕒 {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400 mb-2">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg outline-none ${order.status === 'Tekshirilmoqda' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}
                    >
                      <option value="Kutilmoqda" className="bg-gray-800 text-white">Kutilmoqda</option>
                      <option value="To'lov qabul qilindi" className="bg-gray-800 text-white">To'lov qabul qilindi</option>
                      <option value="Yetkazilmoqda - Bugun" className="bg-gray-800 text-white">Yetkazilmoqda - Bugun</option>
                      <option value="Yetkazilmoqda - Ertaga" className="bg-gray-800 text-white">Yetkazilmoqda - Ertaga</option>
                      <option value="Yetkazib berildi" className="bg-gray-800 text-white">Yetkazib berildi</option>
                      <option value="Bekor qilindi" className="bg-gray-800 text-white">Bekor qilindi</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Mahsulotlar:</h4>
                  {order.product_details.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-gray-700/50 p-2 rounded-xl">
                      <img src={item.image_url} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          Razmer: {item.selectedSize || 'yoq'} | Narxi: {item.finalPrice.toLocaleString('ru-RU')} so'm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">⭐ Mijozlar sharhlari</h2>
          {reviews.length === 0 ? <p className="text-gray-400">Sharhlar yo'q.</p> : (
            reviews.map(r => (
              <div key={r.id} className="bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-700">
                <p className="font-bold text-yellow-500 mb-1">{'⭐'.repeat(r.rating || 5)}</p>
                <p className="text-sm text-gray-400 mb-2">👤 {r.user_name || r.users?.full_name || 'Noma\'lum'} | 📦 {r.products?.title}</p>
                <p className="text-white mb-4 bg-gray-700/50 p-3 rounded-xl">{r.text}</p>
                
                <div className="flex gap-2">
                  <input type="text" placeholder="Javobingiz..." value={replyText[r.id] || r.admin_reply || ''} onChange={e => setReplyText({...replyText, [r.id]: e.target.value})} className="flex-1 bg-gray-700 rounded-lg p-2 outline-none focus:border-yellow-500 border border-transparent" />
                  <button onClick={() => submitReply('reviews', r.id)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold">Javob berish</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">🎧 Mijozlar murojaatlari</h2>
          {messages.length === 0 ? <p className="text-gray-400">Murojaatlar yo'q.</p> : (
            messages.map(m => (
              <div key={m.id} className="bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">👤 {m.user_name || m.users?.full_name || 'Noma\'lum'}</p>
                <p className="text-white mb-4 bg-gray-700/50 p-3 rounded-xl">{m.text}</p>
                
                <div className="flex gap-2">
                  <input type="text" placeholder="Javobingiz..." value={replyText[m.id] || m.admin_reply || ''} onChange={e => setReplyText({...replyText, [m.id]: e.target.value})} className="flex-1 bg-gray-700 rounded-lg p-2 outline-none focus:border-purple-500 border border-transparent" />
                  <button onClick={() => submitReply('messages', m.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Javob berish</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
