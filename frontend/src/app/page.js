'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [tgUser, setTgUser] = useState(null);

  useEffect(() => {
    fetchProducts();
    checkUser();
    
    // Auto-Refresh (Realtime) har 3 soniyada
    const interval = setInterval(() => {
      fetchProducts(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkUser = () => {
    const check = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) setTgUser(user);
        
        const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '5466728043').split(',');
        if (user && ADMIN_IDS.includes(user.id.toString())) {
          setIsAdmin(true);
        }
      }
    };
    check();
    setTimeout(check, 500);
  };

  const fetchProducts = async (showLoading = true) => {
    if (showLoading && products.length === 0) setLoading(true);
    // Fetch products along with their reviews to calculate average ratings
    const { data } = await supabase.from('products').select('*, reviews(rating)').order('created_at', { ascending: false });
    if (data) setProducts(data);
    if (showLoading) setLoading(false);
  };

  const fetchReviews = async (productId) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const submitReview = async () => {
    if (!reviewInput.trim()) return alert("Iltimos, sharh matnini yozing.");
    
    const { error } = await supabase.from('reviews').insert([{
      product_id: selectedProduct.id,
      user_id: tgUser?.id?.toString() || 'anonymous',
      user_name: tgUser?.first_name || 'Mijoz',
      text: reviewInput,
      rating: ratingInput
    }]);

    if (!error) {
      setReviewInput('');
      fetchReviews(selectedProduct.id);
      fetchProducts(false); // Update averages on home page
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('ru-RU') + " so'm";
  };

  const calculateDiscount = (original, current) => {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const getAverageRating = (productReviews) => {
    if (!productReviews || productReviews.length === 0) return 0;
    const validRatings = productReviews.map(r => r.rating || 0).filter(r => r > 0);
    if (validRatings.length === 0) return 0;
    const sum = validRatings.reduce((a, b) => a + b, 0);
    return (sum / validRatings.length).toFixed(1);
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize('');
    setPromoInput('');
    setAppliedPromo(null);
    fetchReviews(product.id);
  };

  const applyPromo = () => {
    if (selectedProduct.promo_code && promoInput.toUpperCase() === selectedProduct.promo_code.toUpperCase()) {
      setAppliedPromo(selectedProduct.promo_percent);
      alert(`Promokod qabul qilindi! ${selectedProduct.promo_percent}% chegirma qo'llandi.`);
    } else {
      alert("Promokod xato yoki muddati o'tgan!");
      setAppliedPromo(null);
    }
  };

  const addToCart = () => {
    if (selectedProduct.sizes && selectedProduct.sizes.trim() !== '' && !selectedSize) {
      alert("Iltimos, o'lchamni tanlang!");
      return;
    }
    
    let finalPrice = selectedProduct.price_usd;
    if (appliedPromo) {
      finalPrice = finalPrice - (finalPrice * (appliedPromo / 100));
    }

    const cartItem = {
      ...selectedProduct,
      cart_id: Math.random().toString(),
      selectedSize,
      finalPrice
    };

    setCart([...cart, cartItem]);
    alert("Savatga qo'shildi!");
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cart_id !== cartId));
  };

  const checkout = async () => {
    if (cart.length === 0) return alert("Savatingiz bo'sh!");
    alert("Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.");
    setCart([]);
    setActiveTab('home');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-500 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-1">
            Omni<span className="text-black">Shop</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-medium">Xitoydan to'g'ridan-to'g'ri 🇨🇳</p>
        </div>
        
        {isAdmin && (
          <Link href="/admin" className="w-9 h-9 bg-indigo-500 rounded-full shadow-md flex items-center justify-center text-white text-xl font-light hover:bg-indigo-600 transition-colors pb-1">
            +
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 relative">
        
        {activeTab === 'home' && (
          <div className="p-4 grid grid-cols-2 gap-3">
            {products.map(p => {
              const isOutOfStock = p.description === 'OUT_OF_STOCK' || p.stock_count <= 0;
              const discount = calculateDiscount(p.original_price, p.price_usd);
              const avgRating = getAverageRating(p.reviews);
              
              return (
                <div key={p.id} onClick={() => !isOutOfStock && openProduct(p)} 
                  className={`bg-white rounded-2xl p-2 shadow-sm border border-gray-100 relative ${isOutOfStock ? 'opacity-50' : 'active:scale-95 transition-transform'}`}>
                  
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        -{discount}% ↓
                      </span>
                    )}
                    {p.title.includes('Yangi') && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        YANGI
                      </span>
                    )}
                  </div>

                  <img src={p.image_url} alt={p.title} className="w-full h-36 object-cover rounded-xl bg-gray-100" />
                  
                  <div className="mt-2 px-1">
                    {discount > 0 && (
                      <p className="text-gray-400 line-through text-[11px] leading-tight">{formatPrice(p.original_price)}</p>
                    )}
                    <p className="text-sm font-extrabold text-gray-900 leading-tight">{formatPrice(p.price_usd)}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-snug">{p.title}</p>
                    
                    <div className="mt-2 flex items-center gap-1">
                      <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        ★ {avgRating}
                      </span>
                      <span className="text-[10px] text-gray-400">{p.delivery_time}</span>
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12">
                          TUGAGAN
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Savatingiz ({cart.length})</h2>
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <p className="text-4xl mb-2">🛒</p>
                <p>Savat bo'sh</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cart_id} className="bg-white p-3 rounded-2xl shadow-sm flex gap-3 relative">
                    <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm leading-tight">{item.title}</p>
                      {item.selectedSize && <p className="text-xs text-gray-500 mt-1">O'lcham: {item.selectedSize}</p>}
                      <p className="font-bold text-indigo-600 mt-1">{formatPrice(item.finalPrice)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cart_id)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500">
                      ✕
                    </button>
                  </div>
                ))}
                
                <div className="bg-white p-4 rounded-2xl shadow-sm mt-4 border-t-2 border-indigo-50">
                  <div className="flex justify-between font-bold text-lg mb-4">
                    <span>Jami:</span>
                    <span>{formatPrice(cart.reduce((sum, i) => sum + i.finalPrice, 0))}</span>
                  </div>
                  <button onClick={checkout} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
                    Rasmiylashtirish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center mb-4">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                {tgUser ? tgUser.first_name[0] : 'U'}
              </div>
              <h2 className="text-xl font-bold">{tgUser ? tgUser.first_name : 'Foydalanuvchi'}</h2>
              <p className="text-gray-500 text-sm">{tgUser ? '@'+(tgUser.username || '') : ''}</p>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">📦 Buyurtmalarim</span>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">💬 Sharhlarim</span>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">🎧 Sotuvchiga murojaat</span>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold">Asosiy</span>
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'cart' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-2xl">🛒</span>
          {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
          <span className="text-[10px] font-bold">Savat</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end">
          <div className="bg-white w-full h-[90%] rounded-t-3xl flex flex-col relative animate-slide-up overflow-hidden">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center backdrop-blur-md">
              ✕
            </button>

            <div className="flex-1 overflow-y-auto pb-24">
              <img src={selectedProduct.image_url} className="w-full h-80 object-cover bg-gray-100" />
              
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  {selectedProduct.original_price > selectedProduct.price_usd && (
                    <>
                      <span className="text-red-500 text-sm font-bold bg-red-100 px-2 py-0.5 rounded-md">
                        -{calculateDiscount(selectedProduct.original_price, selectedProduct.price_usd)}% ↓
                      </span>
                      <span className="text-gray-400 line-through text-sm">{formatPrice(selectedProduct.original_price)}</span>
                    </>
                  )}
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  {appliedPromo ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-indigo-600">{formatPrice(selectedProduct.price_usd - (selectedProduct.price_usd * appliedPromo / 100))}</span>
                    </div>
                  ) : (
                    formatPrice(selectedProduct.price_usd)
                  )}
                </h2>
                <h3 className="text-lg text-gray-700 leading-snug">{selectedProduct.title}</h3>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-gray-600">Qoldiq: <strong className="text-black">{selectedProduct.stock_count} ta</strong></span>
                  <span className="text-sm text-gray-600">Yetkazish: <strong className="text-black">{selectedProduct.delivery_time}</strong></span>
                </div>

                {selectedProduct.sizes && selectedProduct.sizes.trim() !== '' && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-3 text-gray-800">O'lchamni tanlang:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProduct.sizes.split(',').map(size => size.trim()).map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${selectedSize === size ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-bold mb-3 text-gray-800">Promokod</h4>
                  <div className="flex gap-2">
                    <input type="text" value={promoInput} onChange={e => setPromoInput(e.target.value)}
                      placeholder="Kodni kiriting" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 uppercase" />
                    <button onClick={applyPromo} className="bg-black text-white px-5 py-2 rounded-xl font-bold active:scale-95 transition-transform">
                      Qo'llash
                    </button>
                  </div>
                </div>

                {/* YULDUZCHA VA SHARHLAR */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-bold text-xl mb-4">Sharhlar ({reviews.length})</h4>
                  
                  {/* Sharh yozish */}
                  <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                    <p className="text-sm font-bold mb-2">Baholang:</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRatingInput(star)} className="text-3xl focus:outline-none">
                          {star <= ratingInput ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewInput} onChange={e => setReviewInput(e.target.value)}
                      placeholder="Mahsulot haqida fikringiz..." className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 h-24 mb-2"></textarea>
                    <button onClick={submitReview} className="w-full bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl">Jo'natish</button>
                  </div>

                  {/* Sharhlar ro'yxati */}
                  {reviews.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">Hali sharhlar yo'q. Birinchi bo'lib yozing!</div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-white border border-gray-100 p-3 rounded-xl">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">{r.user_name}</span>
                            <span className="text-yellow-500 text-xs">{'⭐'.repeat(r.rating || 5)}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button onClick={addToCart} className="w-full bg-indigo-600 text-white text-lg font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-indigo-200">
                Savatga qo'shish
              </button>
            </div>
            
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
