'use client';
import { useState, useEffect, useRef } from 'react';
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
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewInput, setReviewInput] = useState('');
  const reviewInputRef = useRef(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [tgUser, setTgUser] = useState(null);

  const [profileView, setProfileView] = useState('main'); 
  const [myOrders, setMyOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [supportText, setSupportText] = useState('');

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: yopiq, 1: malumotlar, 2: to'lov
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone1, setCheckoutPhone1] = useState('');
  const [checkoutPhone2, setCheckoutPhone2] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkUser();
    
    const interval = setInterval(() => {
      fetchProducts(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'profile') {
      setProfileView('main');
    }
  }, [activeTab]);

  const checkUser = () => {
    const check = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
          setTgUser(user);
          setCheckoutName(user.first_name + (user.last_name ? ' ' + user.last_name : ''));
        }
        
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
    
    try {
      const { data: productsData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      
      let reviewsData = [];
      try {
        const res = await supabase.from('reviews').select('*');
        if (res.data) reviewsData = res.data;
      } catch(e) {}
      
      if (productsData) {
        const combined = productsData.map(p => ({
          ...p,
          reviews: reviewsData.filter(r => r.product_id === p.id)
        }));
        setProducts(combined);
      }
    } catch (e) {
      console.error("Products error:", e);
    }
    
    if (showLoading) setLoading(false);
  };

  const fetchReviews = async (productId) => {
    try {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      if (data) setReviews(data);
    } catch(e) {}
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

    if (error) {
      alert("Xatolik (Yulduzcha SQL kodi yozilmagan bo'lishi mumkin): " + error.message);
    } else {
      setReviewInput('');
      fetchReviews(selectedProduct.id);
      fetchProducts(false);
      alert("Sharhingiz qoldirildi, rahmat!");
      if (profileView === 'reviews') loadMyReviews();
    }
  };

  const submitSupport = async () => {
    if (!supportText.trim()) return alert("Murojaat matnini yozing.");
    try {
      await supabase.from('messages').insert([{
        user_id: tgUser?.id?.toString() || 'anonymous',
        user_name: tgUser?.first_name || 'Mijoz',
        text: supportText
      }]);
      alert("Murojaatingiz yuborildi! Tez orada javob qaytaramiz.");
      setSupportText('');
      setProfileView('main');
    } catch (e) {
      alert("Jo'natishda xatolik (SQL kodi bajarilmagan bo'lishi mumkin): " + e.message);
    }
  };

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    if (num < 1000) {
      return "$" + num.toLocaleString('en-US');
    }
    return num.toLocaleString('ru-RU') + " so'm";
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

  const handleNextToPayment = () => {
    if (!checkoutName.trim() || !checkoutPhone1.trim() || !checkoutPhone2.trim()) {
      return alert("Iltimos, ism va har ikkala telefon raqamini to'ldiring!");
    }
    setCheckoutStep(2);
  };

  const handleFinalCheckout = async () => {
    if (!receiptFile) {
      return alert("Iltimos, to'lov chekini (skrinshot) yuklang!");
    }

    setIsSubmitting(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `receipt_${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images') // product_images dan vaqtincha foydalanamiz
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
      const receiptUrl = publicUrlData.publicUrl;

      const totalPrice = cart.reduce((sum, i) => sum + i.finalPrice, 0);
      const orderDetailsStr = cart.map(item => `- ${item.title} (Razmer: ${item.selectedSize || 'yoq'}, Narxi: ${formatPrice(item.finalPrice)})`).join('\n');
      const combinedPhone = `${checkoutPhone1}, Qo'shimcha: ${checkoutPhone2}`;

      await supabase.from('orders').insert([{
        user_id: tgUser?.id?.toString() || 'anonymous',
        user_name: checkoutName,
        phone: combinedPhone,
        product_details: cart,
        total_price: totalPrice,
        status: 'Kutilmoqda'
      }]);

      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || "5466728043").split(',');
      const message = `🛍 <b>Yangi Buyurtma (To'lov cheki bilan)!</b>\n\n👤 Mijoz: ${checkoutName}\n📱 Tel: ${combinedPhone}\n\n📦 <b>Mahsulotlar:</b>\n${orderDetailsStr}\n\n💰 Jami: <b>${formatPrice(totalPrice)}</b> (50% to'lov qilingan)`;

      for (const adminId of ADMIN_IDS) {
        if (adminId.trim()) {
          const formData = new FormData();
          formData.append('chat_id', adminId.trim());
          formData.append('photo', receiptFile);
          formData.append('caption', message);
          formData.append('parse_mode', 'HTML');
          
          fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
          }).catch(e => console.error(e));
        }
      }

      setCart([]);
      setCheckoutStep(0);
      setReceiptFile(null);
      setCheckoutSuccess(true);
      
      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveTab('profile');
        loadMyOrders();
      }, 3000);
    } catch (e) {
      alert("Xatolik yuz berdi: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMyOrders = async () => {
    setProfileView('orders');
    if (!tgUser) return;
    try {
      const { data } = await supabase.from('orders').select('*').eq('user_id', tgUser.id.toString()).order('created_at', { ascending: false });
      if (data) setMyOrders(data);
    } catch(e){}
  };

  const loadMyReviews = async () => {
    setProfileView('reviews');
    if (!tgUser) return;
    try {
      const { data } = await supabase.from('reviews').select('*, products(title, image_url)').eq('user_id', tgUser.id.toString()).order('created_at', { ascending: false });
      if (data) setMyReviews(data);
    } catch(e){}
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-purple-500 font-bold">Yuklanmoqda...</div>;

  if (checkoutSuccess) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-green-50 animate-fade-in px-6 text-center">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl shadow-xl shadow-green-200 mb-6 animate-bounce">
          ✓
        </div>
        <h1 className="text-4xl font-black text-green-600 mb-2">Qabul qilindi!</h1>
        <p className="text-gray-600 font-medium">Buyurtma muvaffaqiyatli rasmiylashtirildi. Tez orada bog'lanamiz.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden relative">
      
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-0.5">
            <span className="text-purple-600">Omni</span><span className="text-orange-500">Shop</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-medium">Xitoydan to'g'ridan-to'g'ri 🇨🇳</p>
        </div>
        
        {isAdmin && (
          <Link href="/admin" className="w-9 h-9 bg-purple-600 rounded-full shadow-md flex items-center justify-center text-white text-xl font-light hover:bg-purple-700 transition-colors pb-1">
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
                      <p className="font-bold text-purple-600 mt-1">{formatPrice(item.finalPrice)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cart_id)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500">
                      ✕
                    </button>
                  </div>
                ))}
                
                <div className="bg-white p-4 rounded-2xl shadow-sm mt-4 border-t-2 border-purple-50">
                  <div className="flex justify-between font-bold text-lg mb-4">
                    <span>Jami:</span>
                    <span>{formatPrice(cart.reduce((sum, i) => sum + i.finalPrice, 0))}</span>
                  </div>
                  <button onClick={() => setCheckoutStep(1)} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
                    Rasmiylashtirish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && profileView === 'main' && (
          <div className="p-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center mb-4">
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                {tgUser ? tgUser.first_name[0] : 'U'}
              </div>
              <h2 className="text-xl font-bold">{tgUser ? tgUser.first_name : 'Foydalanuvchi'}</h2>
              <p className="text-gray-500 text-sm">{tgUser ? '@'+(tgUser.username || '') : ''}</p>
            </div>

            <div className="space-y-2">
              <button onClick={loadMyOrders} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">📦 Buyurtmalarim</span>
                <span className="text-gray-400">›</span>
              </button>
              <button onClick={loadMyReviews} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">💬 Sharhlar</span>
                <span className="text-gray-400">›</span>
              </button>
              <button onClick={() => setProfileView('support')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                <span className="font-semibold text-gray-700">🎧 Sotuvchiga murojaat</span>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && profileView === 'support' && (
          <div className="p-4">
            <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
              <span>‹</span> Orqaga
            </button>
            <h2 className="text-xl font-bold mb-4">🎧 Sotuvchiga Murojaat</h2>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-4">Savollaringiz yoki takliflaringizni yozib qoldiring. Biz imkon qadar tezroq javob beramiz.</p>
              <textarea value={supportText} onChange={e => setSupportText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-purple-500 h-32 mb-3"
                placeholder="Xabaringizni yozing..."
              ></textarea>
              <button onClick={submitSupport} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
                Jo'natish
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && profileView === 'orders' && (
          <div className="p-4">
            <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
              <span>‹</span> Orqaga
            </button>
            <h2 className="text-xl font-bold mb-4">📦 Mening Buyurtmalarim</h2>
            
            {myOrders.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Sizda hali buyurtmalar yo'q.</p>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.status === 'Kutilmoqda' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-3 mb-3">
                      {order.product_details.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <img src={item.image_url} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                          <div className="flex-1">
                            <p className="text-sm font-bold leading-tight line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">Razmer: {item.selectedSize || 'yoq'}</p>
                          </div>
                          <button onClick={() => {
                            const prod = products.find(p => p.id === item.id);
                            if (prod) openProduct(prod);
                            else alert('Bu mahsulot hozirda sotuvda yo\'q');
                          }} className="text-xs font-bold text-purple-600 bg-purple-50 px-2 rounded-lg h-8 self-center border border-purple-100">
                            Sharh yozish
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-right font-bold text-gray-800">
                      Jami: {formatPrice(order.total_price)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && profileView === 'reviews' && (
          <div className="p-4">
            <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
              <span>‹</span> Orqaga
            </button>
            <h2 className="text-xl font-bold mb-4">💬 Sharhlar</h2>
            
            {myReviews.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Sizda hali sharhlar yo'q.</p>
            ) : (
              <div className="space-y-3">
                {myReviews.map(review => (
                  <div key={review.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={review.products?.image_url} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-bold leading-tight">{review.products?.title}</p>
                        <span className="text-yellow-500 text-xs">{'⭐'.repeat(review.rating || 5)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{review.text}</p>
                    {review.admin_reply && (
                      <div className="mt-2 ml-4 p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <p className="text-xs font-bold text-purple-600">Admin javobi:</p>
                        <p className="text-sm text-gray-700">{review.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-purple-600' : 'text-gray-400'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold">Asosiy</span>
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'cart' ? 'text-purple-600' : 'text-gray-400'}`}>
          <span className="text-2xl">🛒</span>
          {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
          <span className="text-[10px] font-bold">Savat</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>

      {/* CHECKOUT MODALS */}
      {checkoutStep === 1 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative">
            <button onClick={() => setCheckoutStep(0)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-bold mb-4">Rasmiylashtirish (1/2)</h2>
            <p className="text-gray-500 text-sm mb-4">Ma'lumotlaringizni kiriting:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Ism-familiya *</label>
                <input type="text" value={checkoutName} onChange={e=>setCheckoutName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-500" placeholder="Ali Valiyev" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Asosiy nomer *</label>
                <input type="tel" value={checkoutPhone1} onChange={e=>setCheckoutPhone1(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-500" placeholder="+998 90 123 45 67" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Qo'shimcha nomer *</label>
                <input type="tel" value={checkoutPhone2} onChange={e=>setCheckoutPhone2(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-500" placeholder="+998 90 765 43 21" />
              </div>
            </div>
            
            <button onClick={handleNextToPayment} className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-purple-200">
              Keyingi qadam
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 2 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative">
            <button onClick={() => setCheckoutStep(0)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-2xl font-bold mb-2">To'lov (2/2)</h2>
            <p className="text-red-500 font-bold text-sm mb-4">50% to'lov qilganingizdan keyin rasmiylashtiriladi.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Karta raqami (Kopiya qilish uchun bosing):</p>
              <div 
                onClick={() => { navigator.clipboard.writeText('4916990320547877'); alert("Kopiya qilindi!"); }}
                className="font-mono text-lg font-bold text-purple-700 cursor-pointer bg-purple-50 p-2 rounded-lg text-center active:scale-95 transition flex justify-center items-center gap-2"
              >
                4916 9903 2054 7877 <span className="text-xl">📋</span>
              </div>
              <p className="text-center font-bold text-sm mt-2">Mamadolimov Jo'rabek</p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 block mb-2">To'lov chekini yuklang (Skrinshot):</label>
              <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" />
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setCheckoutStep(1)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl active:scale-95 transition-transform">
                Orqaga
              </button>
              <button disabled={isSubmitting} onClick={handleFinalCheckout} className={`flex-1 ${isSubmitting ? 'bg-gray-400' : 'bg-green-500'} text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg`}>
                {isSubmitting ? 'Kuting...' : 'Jo\'natish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
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
                      <span className="text-purple-600">{formatPrice(selectedProduct.price_usd - (selectedProduct.price_usd * appliedPromo / 100))}</span>
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
                          className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${selectedSize === size ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
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
                      placeholder="Kodni kiriting" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-purple-500 uppercase" />
                    <button onClick={applyPromo} className="bg-black text-white px-5 py-2 rounded-xl font-bold active:scale-95 transition-transform">
                      Qo'llash
                    </button>
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="font-bold text-xl mb-4">Sharhlar ({reviews.length})</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                    <p className="text-sm font-bold mb-2">Baholang:</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRatingInput(star)} className="text-3xl focus:outline-none">
                          {star <= ratingInput ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea ref={reviewInputRef} value={reviewInput} onChange={e => setReviewInput(e.target.value)}
                      placeholder="Mahsulot haqida fikringiz..." className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-purple-500 h-24 mb-2"></textarea>
                    <button onClick={submitReview} className="w-full bg-purple-100 text-purple-700 font-bold py-2 rounded-xl">Jo'natish</button>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                      <p className="text-3xl mb-2">💬</p>
                      <p>Hozircha sharhlar yo'q.</p>
                      <button onClick={() => reviewInputRef.current?.focus()} className="mt-3 text-purple-600 font-bold">Sharh yozish</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-white border border-gray-100 p-3 rounded-xl">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">{r.user_name}</span>
                            <span className="text-yellow-500 text-xs">{'⭐'.repeat(r.rating || 5)}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{r.text}</p>
                          {r.admin_reply && (
                            <div className="mt-2 ml-4 p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                              <p className="text-xs font-bold text-purple-600">Admin javobi:</p>
                              <p className="text-sm text-gray-700">{r.admin_reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button onClick={addToCart} className="w-full bg-purple-600 text-white text-lg font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-purple-200">
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
