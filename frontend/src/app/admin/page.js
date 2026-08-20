'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Erkaklar');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '5466728043').split(',');

  useEffect(() => {
    // Check if user is admin via Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser && ADMIN_IDS.includes(tgUser.id.toString())) {
        setIsAdmin(true);
      } else if (process.env.NODE_ENV === 'development') {
        // Fallback for local testing
        setIsAdmin(true);
      }
    } else if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!title || !price || !imageFile) {
      setMessage('Iltimos, barcha maydonlarni to\'ldiring!');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // 1. Upload Image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;

      // 3. Insert into database
      const { error: dbError } = await supabase
        .from('products')
        .insert([{
          title,
          price: parseFloat(price),
          category,
          image_url: imageUrl
        }]);

      if (dbError) throw dbError;

      setMessage('Mahsulot muvaffaqiyatli qo\'shildi! ✅');
      setTitle('');
      setPrice('');
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setMessage('Xatolik yuz berdi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Tekshirilmoqda...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-400 font-bold">Sizga ruxsat yo'q! Kiring: Telegram.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Admin Panel 🛠️</h1>
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
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
              <option value="Erkaklar">Erkaklar</option>
              <option value="Ayollar">Ayollar</option>
              <option value="Bolalar">Bolalar</option>
              <option value="Aksessuarlar">Aksessuarlar</option>
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
    </div>
  );
}
