'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [imageFile, setImageFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [products, setProducts] = useState([]);
  
  const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '').split(',');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser && ADMIN_IDS.includes(tgUser.id.toString())) {
        setIsAdmin(true);
        fetchProducts();
      } else if (process.env.NODE_ENV === 'development') {
        setIsAdmin(true);
        fetchProducts();
      }
    } else if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
      fetchProducts();
    }
    setLoading(false);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!title || !price || !imageFile) {
      setMessage('Iltimos, barcha maydonlarni to\'ldiring!');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('products')
        .insert([{
          title,
          price_usd: parseFloat(price),
          weight_kg: 0, // default weight
          category,
          image_url: imageUrl
        }]);

      if (dbError) throw dbError;

      setMessage('Mahsulot muvaffaqiyatli qo\'shildi! ✅');
      setTitle('');
      setPrice('');
      setImageFile(null);
      fetchProducts(); // refresh list
    } catch (error) {
      console.error(error);
      setMessage('Xatolik yuz berdi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) return;
    
    try {
      // 1. O'chirish (Baza)
      await supabase.from('products').delete().eq('id', id);
      
      // 2. Rasmni o'chirish (Storage)
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('product_images').remove([fileName]);
      }
      
      fetchProducts();
    } catch (error) {
      alert('O\'chirishda xatolik: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Tekshirilmoqda...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-400 font-bold">Sizga ruxsat yo'q!</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Admin Panel 🛠️</h1>
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Yangi mahsulot qo'shish</h2>
        
        {message && (
          <div className={`p-3 rounded-xl mb-4 ${message.includes('Xatolik') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mahsulot nomi</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Masalan: Nike Air Max" />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Narxi ($)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Masalan: 45.99" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Kategoriya</label>
            <select value={category} onChange={e => setCategory(e.target.value)} 
              className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Men">Erkaklar (Men)</option>
              <option value="Women">Ayollar (Women)</option>
              <option value="Kids">Bolalar (Kids)</option>
              <option value="Accessories">Aksessuarlar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Mahsulot rasmi</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} 
              className="w-full bg-gray-700 rounded-xl p-2 text-white outline-none" />
          </div>

          <button type="submit" disabled={uploading} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50">
            {uploading ? 'Yuklanmoqda...' : 'Mahsulotni Saqlash'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Barcha Mahsulotlar ({products.length})</h2>
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-gray-600" />
                <div>
                  <p className="font-bold text-sm">{p.title}</p>
                  <p className="text-xs text-gray-400">${p.price_usd} • {p.category}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(p.id, p.image_url)} 
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                🗑️ O'chirish
              </button>
            </div>
          ))}
          {products.length === 0 && <p className="text-gray-400 text-sm">Hozircha mahsulotlar yo'q</p>}
        </div>
      </div>
    </div>
  );
}
