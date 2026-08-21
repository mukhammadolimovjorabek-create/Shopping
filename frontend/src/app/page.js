'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState('uz');
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const l = localStorage.getItem('omni_lang') || 'uz';
      const t = localStorage.getItem('omni_theme') || 'light';
      setLang(l);
      setTheme(t);
    }
  }, []);
  const changeLang = (newLang) => { setLang(newLang); if (typeof window !== 'undefined') localStorage.setItem('omni_lang', newLang); };
  const changeTheme = (newTheme) => { setTheme(newTheme); if (typeof window !== 'undefined') localStorage.setItem('omni_theme', newTheme); };
  const tr = (text) => {
    const dict = {
      "XTD": { ru: "Прямо из Китая", en: "Direct from China", uz: "Xitoydan to'g'ridan-to'g'ri" },
      "Savatingiz": { ru: "Ваша корзина", en: "Your Cart", uz: "Savatingiz" },
      "Savat bo'sh": { ru: "Корзина пуста", en: "Cart is empty", uz: "Savat bo'sh" },
      "Jami:": { ru: "Итого:", en: "Total:", uz: "Jami:" },
      "Rasmiylashtirish": { ru: "Оформить заказ", en: "Checkout", uz: "Rasmiylashtirish" },
      "Buyurtmalarim": { ru: "Мои заказы", en: "My Orders", uz: "Buyurtmalarim" },
      "Sharhlar": { ru: "Отзывы", en: "Reviews", uz: "Sharhlar" },
      "Murojaatlarim": { ru: "Мои обращения", en: "My Requests", uz: "Murojaatlarim" },
      "Sozlamalar": { ru: "Настройки", en: "Settings", uz: "Sozlamalar" },
      "Orqaga": { ru: "Назад", en: "Back", uz: "Orqaga" },
      "Tilni o'zgartirish": { ru: "Изменить язык", en: "Change Lang", uz: "Tilni o'zgartirish" },
      "Mavzuni o'zgartirish": { ru: "Изменить тему", en: "Change Theme", uz: "Mavzuni o'zgartirish" },
      "Yorug'": { ru: "Светлая", en: "Light", uz: "Yorug'" },
      "Qorong'i": { ru: "Тёмная", en: "Dark", uz: "Qorong'i" },
      "Asosiy": { ru: "Главная", en: "Home", uz: "Asosiy" },
      "Savat": { ru: "Корзина", en: "Cart", uz: "Savat" },
      "Profil": { ru: "Профиль", en: "Profile", uz: "Profil" },
      "Sotuvda: Mavjud": { ru: "В наличии: Доступно", en: "In Stock: Available", uz: "Sotuvda: Mavjud" },
      "Yetkazib berish sanasi:": { ru: "Дата доставки:", en: "Delivery date:", uz: "Yetkazib berish sanasi:" },
      "O'lchamni tanlang:": { ru: "Выберите размер:", en: "Select size:", uz: "O'lchamni tanlang:" },
      "Promokod": { ru: "Промокод", en: "Promo Code", uz: "Promokod" },
      "Qo'llash": { ru: "Применить", en: "Apply", uz: "Qo'llash" },
      "Qabul qilindi!": { ru: "Принято!", en: "Accepted!", uz: "Qabul qilindi!" },
      "To'lov (1/2)": { ru: "Оплата (1/2)", en: "Payment (1/2)", uz: "To'lov (1/2)" },
      "To'lov (2/2)": { ru: "Оплата (2/2)", en: "Payment (2/2)", uz: "To'lov (2/2)" },
      "Jo'natish": { ru: "Отправить", en: "Send", uz: "Jo'natish" },
      "Sharhlar": { ru: "Отзывы", en: "Reviews", uz: "Sharhlar" },
      "Foydalanuvchi": { ru: "Пользователь", en: "User", uz: "Foydalanuvchi" },
      "Ismingiz va familiyangiz": { ru: "Ваше имя и фамилия", en: "Your full name", uz: "Ismingiz va familiyangiz" },
      "Do'konni ochish": { ru: "Открыть магазин", en: "Open Shop", uz: "Do'konni ochish" }
    };
    if (!dict[text] || !dict[text][lang]) return text;
    return dict[text][lang];
  };

  const [cart, setCart] = useState([]);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [onboardName, setOnboardName] = useState('');
  const [hasOnboarded, setHasOnboarded] = useState(true);
  const [profileName, setProfileName] = useState('Foydalanuvchi');
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(false);
  
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
  
  // ADMIN STATES
  const [allOrders, setAllOrders] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  const loadAllOrders = async () => {
    setProfileView('all_orders');
    try {
      const { data: ordersData, error } = await supabase.from('orders').select('*, products(title, image_url)').order('created_at', { ascending: false });
      if (error) {
        console.error("Orders Error:", error);
        alert("Buyurtmalarni yuklashda xato: " + error.message);
        return;
      }
      if (ordersData) {
        const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];
        let usersData = [];
        if (userIds.length > 0) {
          const { data: uData } = await supabase.from('users').select('id, first_name, username, phone_number, full_name, telegram_id').in('id', userIds);
          if (uData) usersData = uData;
        }
        const merged = ordersData.map(o => ({ ...o, users: usersData.find(u => u.id === o.user_id) || null }));
        setAllOrders(merged);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const loadAllReviews = async () => {
    setProfileView('all_reviews');
    try {
      const { data: revData } = await supabase.from('reviews').select('*, products(title, image_url)').not('product_id', 'is', null).order('created_at', { ascending: false });
      if (revData) {
        const userIds = [...new Set(revData.map(r => r.user_id).filter(Boolean))];
        let usersData = [];
        if (userIds.length > 0) {
          // Some old user_ids might be strings (telegram_id), but since we fixed it to UUID, we filter properly
          // Let's just fetch all users for safety or skip user merge if it fails
          const { data: uData } = await supabase.from('users').select('id, first_name, username');
          if (uData) usersData = uData;
        }
        const merged = revData.map(r => ({ ...r, users: usersData.find(u => u.id === r.user_id || u.telegram_id?.toString() === r.user_id?.toString()) || null }));
        setAllReviews(merged);
      }
    } catch(e) {}
  };

  const loadAllMessages = async () => {
    setProfileView('all_messages');
    try {
      const { data: msgData } = await supabase.from('reviews').select('*').is('product_id', null).order('created_at', { ascending: false });
      if (msgData) {
        const { data: uData } = await supabase.from('users').select('id, first_name, username');
        const merged = msgData.map(r => ({ ...r, users: uData?.find(u => u.id === r.user_id || u.telegram_id?.toString() === r.user_id?.toString()) || null }));
        setAllMessages(merged);
      }
    } catch(e) {}
  };

  const submitReply = async (userId, reviewId, text) => {
    if(!text) return;
    try {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: userId, text: "👨‍💻 Admindan javob:\n\n" + text })
      });
      alert("Javob yuborildi!");
      setReplyTexts({...replyTexts, [reviewId]: ''});
    } catch(e) {
      alert("Xatolik: " + e.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, customerTelegramId) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    
    // Yuborish (Notification to customer)
    if (customerTelegramId && (newStatus === 'Qabul qilindi' || newStatus === 'Bekor qilindi')) {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      let msg = newStatus === 'Qabul qilindi' ? "✅ Sizning buyurtmangiz tasdiqlandi va qabul qilindi!" : "❌ Kechirasiz, buyurtmangiz bekor qilindi.";
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: customerTelegramId, text: msg })
      }).then(res => {
        if(!res.ok) alert("Xabar yuborishda xato: " + res.status);
      }).catch(e => alert("Xabar yuborib bo'lmadi: " + e));
    } else if (!customerTelegramId) {
      alert("Mijozning Telegram ID si topilmadi!");
    }
    
    loadAllOrders();
  };


  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: yopiq, 1: malumotlar, 2: to'lov
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone1, setCheckoutPhone1] = useState('');
  const [location, setLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
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
          
          const sName = localStorage.getItem(`omni_name_${user.id}`);
          const sAvatar = localStorage.getItem(`omni_avatar_${user.id}`);
          
          if (!sName) {
            setHasOnboarded(false); // majburiy so'rov
          } else {
            setProfileName(sName);
            setCheckoutName(sName);
          }
          
          setProfileAvatar(sAvatar || null);
          setNewProfileName(sName || user.first_name);
        }
        
        const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || '5466728043,8402070900').split(',');
        setIsAdmin(true);
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
    if (ratingInput === 0) {
      alert("Iltimos, avval yulduzchalarni tanlab baho bering.");
      return;
    }

    let { error } = await supabase.from('reviews').insert([{
      product_id: selectedProduct.id,
      user_id: tgUser?.id?.toString() || 'anonymous',
      user_name: profileName || 'Mijoz',
      text: reviewInput,
      likes: ratingInput,
        rating: ratingInput
    }]);

    if (error && error.message.includes('rating')) {
      const fallback = await supabase.from('reviews').insert([{
        product_id: selectedProduct.id,
        user_id: tgUser?.id?.toString() || 'anonymous',
        user_name: profileName || 'Mijoz',
        text: reviewInput
      }]);
      error = fallback.error;
    }

    if (error) {
      alert("Kechirasiz, sharhni jo'natishda xatolik yuz berdi.");
    } else {
      setReviewInput('');
      setRatingInput(0);
      fetchReviews(selectedProduct.id);
      fetchProducts(false);
      alert("Sharhingiz qabul qilindi!");
      if (profileView === 'reviews') loadMyReviews();
    }
  };

  const submitSupport = async () => {
    if (!supportText.trim()) return alert("Murojaat matnini yozing.");
    try {
      await supabase.from('messages').insert([{
        user_id: tgUser?.id?.toString() || 'anonymous',
        user_name: profileName || 'Mijoz',
        text: supportText
      }]);
      alert("Murojaatingiz yuborildi! Tez orada javob qaytaramiz.");
      setSupportText('');
      setProfileView('main');
    } catch (e) {
      alert("Jo'natishda xatolik yuz berdi.");
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
    const validRatings = productReviews.map(r => r.rating || r.likes || 0).filter(r => r > 0);
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
    if (!promoInput.trim()) {
      setPromoError(true);
      return;
    }
    if (selectedProduct.promo_code && promoInput.toUpperCase() === selectedProduct.promo_code.toUpperCase()) {
      setAppliedPromo(selectedProduct.promo_percent);
      setPromoError(false);
      alert(`Promokod qabul qilindi! ${selectedProduct.promo_percent}% chegirma qo'llandi.`);
    } else {
      setPromoError(true);
      alert("Bu promokod xato yoki eskirgan!");
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

  const isValidPhone = (phone) => {
    const p = phone.trim();
    if (p.startsWith('+998') && p.length === 13) return true;
    if (!p.startsWith('+') && p.length === 9 && !isNaN(p)) return true;
    return false;
  };

  const handleNextToPayment = () => {
    if (!checkoutName.trim() || !checkoutPhone1.trim() || !checkoutPhone2.trim()) {
      return alert("Iltimos, ism va har ikkala telefon raqamini to'ldiring!");
    }
    if (!isValidPhone(checkoutPhone1) || !isValidPhone(checkoutPhone2)) {
      return alert("Telefon raqami noto'g'ri! Faqat quyidagi formatlarda kiriting:\n+998901234567 (13 ta belgi) yoki\n901234567 (9 ta belgi)");
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

      // Upsert user to get UUID
      const { data: userRow, error: uErr } = await supabase.from('users').upsert({ 
        telegram_id: tgUser?.id || Math.floor(Math.random() * 1000000000), 
        full_name: checkoutName, 
        phone_number: combinedPhone 
      }, { onConflict: 'telegram_id' }).select('*').single();
      
      if (userRow) {
        const ordersToInsert = cart.map(item => ({
          user_id: userRow.id,
          product_id: item.id,
          size: item.selectedSize || '-',
          color: '-',
          total_price_uzs: item.finalPrice,
          pre_payment_amount_uzs: 0,
          status: 'Tekshirilmoqda',
          receipt_image_url: receiptUrl,
          latitude: location?.lat || null,
          longitude: location?.lng || null
        }));
        const { error: oErr } = await supabase.from('orders').insert(ordersToInsert);
        if (oErr) console.error("Order Insert Error:", oErr);
      }

      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || "5466728043,8402070900").split(',');
      const message = `🚨 <b>Yangi Buyurtma!</b>\n👤 Mijoz: ${checkoutName} ${tgUser?.username ? '(@' + tgUser.username + ')' : ''}\n📞 Tel: ${combinedPhone}\n🛍 Tovar: \n${orderDetailsStr}\n💰 50% To'lov: ${formatPrice(totalPrice)}\n🖼 Chek rasmi biriktirilgan\n\n✅ Buyurtma profilingizdagi 'Barcha Mijozlar Buyurtmalari' bo'limiga tushdi.`;

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

      // Stock qisqartirish va ogohlantirish yuborish
      for (const item of cart) {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
          const newStock = (prod.stock_count || 1) - 1;
          await supabase.from('products').update({ stock_count: newStock }).eq('id', item.id);
          
          if (newStock <= 10 && newStock >= 0) {
            for (const adminId of ADMIN_IDS) {
              if (adminId.trim()) {
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: adminId.trim(),
                    text: `⚠️ <b>Omborda tovar kam qoldi!</b>\n\n📦 Mahsulot: <b>${prod.title}</b>\n📉 Qoldiq: Atigi <b>${newStock} ta</b> qoldi.`,
                    parse_mode: 'HTML'
                  })
                }).catch(e => console.error(e));
              }
            }
          }
        }
      }

      setCart([]);
      setCheckoutStep(0);
      setReceiptFile(null);
      setCheckoutSuccess(true);
      // Immediately load orders so UI updates
      loadMyOrders();
        fetchProducts(false);
      
      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveTab('profile');
        loadMyOrders();
        fetchProducts(false);
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
      const { data: userRow } = await supabase.from('users').select('id').eq('telegram_id', tgUser.id).single();
      if (userRow) {
        const { data } = await supabase.from('orders').select('*, products(title, image_url)').eq('user_id', userRow.id).order('created_at', { ascending: false });
        if (data) setMyOrders(data);
      } else {
        setMyOrders([]);
      }
    } catch(e){
      console.error(e);
    }
  };

  const loadMyReviews = async () => {
    setProfileView('reviews');
    if (!tgUser) return;
    try {
      const { data } = await supabase.from('reviews').select('*, products(title, image_url)').eq('user_id', tgUser.id.toString()).order('created_at', { ascending: false });
      if (data) setMyReviews(data);
    } catch(e){}
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900 text-purple-500 font-bold">Yuklanmoqda...</div>;

  const handleOnboard = () => {
    if (!onboardName.trim()) return alert("Iltimos, ismingizni kiriting");
    if (tgUser) {
      localStorage.setItem(`omni_name_${tgUser.id}`, onboardName);
      setProfileName(onboardName);
      setCheckoutName(onboardName);
      setNewProfileName(onboardName);
    }
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return (
      <div data-theme={theme} className={`omni-app flex flex-col h-screen items-center justify-center p-6 text-center animate-fade-in ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-white dark:bg-slate-900 text-black dark:text-white font-bold'}`}>
        <h1 className="text-3xl font-extrabold mb-2 text-black dark:text-white font-bold"><span className="text-purple-600">Omni</span><span className="text-orange-500">Shop</span> ga xush kelibsiz!</h1>
        <p className="text-black dark:text-white opacity-90 mb-8 font-medium">Xaridlarni boshlashdan oldin, iltimos ism-familiyangizni kiriting:</p>
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 dark:border-gray-700">
          <input 
            type="text" 
            placeholder={tr("Ismingiz va familiyangiz")} 
            value={onboardName}
            onChange={(e) => setOnboardName(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-800 dark:border-gray-700 bg-transparent rounded-xl p-4 text-center font-bold text-lg mb-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-black dark:text-white font-bold dark:text-white"
          />
          <button 
            onClick={handleOnboard}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-transform"
          >
            Do'konni ochish
          </button>
        </div>
      </div>
    );
  }

  const handleProfileSave = () => {
    if (tgUser) {
      localStorage.setItem(`omni_name_${tgUser.id}`, newProfileName);
    }
    setProfileName(newProfileName);
    setIsEditingProfile(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('product_images').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
      const url = publicUrlData.publicUrl;
      if (url && tgUser) {
        localStorage.setItem(`omni_avatar_${tgUser.id}`, url);
        setProfileAvatar(url);
      }
    } catch (e) {
      alert("Rasm yuklashda xatolik yuz berdi.");
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-green-50 animate-fade-in px-6 text-center">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl shadow-xl shadow-green-200 mb-6 animate-bounce">
          ✓
        </div>
        <h1 className="text-4xl font-black text-green-600 mb-2">{tr("Qabul qilindi!")}</h1>
        <p className="text-black dark:text-white font-medium">Buyurtma muvaffaqiyatli rasmiylashtirildi. Tez orada bog'lanamiz.</p>
      </div>
    );
  }

  return (
    <div data-theme={theme} className={`omni-app flex flex-col h-screen text-black dark:text-white font-bold dark:text-gray-100 font-sans overflow-hidden relative ${theme === 'dark' ? 'dark bg-black' : 'bg-white dark:bg-slate-900'} transition-colors`}>
      
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-1.5">
            <span>
              <span className="text-purple-600">Omni</span><span className="text-orange-500">Shop</span>
            </span>
            <span className="text-xl">🛍️</span>
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-black dark:text-white opacity-90 font-medium mt-0.5">
            {tr("XTD")}
            <img src="https://flagcdn.com/w20/cn.png" srcSet="https://flagcdn.com/w40/cn.png 2x" alt="CN" className="w-4 h-auto shadow-sm rounded-sm" />
            <img src="https://flagcdn.com/w20/uz.png" srcSet="https://flagcdn.com/w40/uz.png 2x" alt="UZ" className="w-4 h-auto shadow-sm rounded-sm" />
          </div>
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
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 relative ${isOutOfStock ? 'opacity-50' : 'active:scale-95 transition-transform'}`}>
                  
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
                      <p className="text-slate-500 dark:text-slate-400 line-through decoration-red-400/70 italic font-medium text-[11px] leading-tight">{formatPrice(p.original_price)}</p>
                    )}
                    <p className="text-sm font-extrabold text-black dark:text-white font-bold leading-tight">{formatPrice(p.price_usd)}</p>
                    <p className="text-xs text-black dark:text-white mt-1 line-clamp-2 leading-snug">{p.title}</p>
                    
                    <div className="mt-2 flex flex-col gap-1 items-start">
                      <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ★ {avgRating}
                      </span>
                      {p.delivery_time && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yetkazib berish sanasi: <br/><b className="text-black dark:text-white">{p.delivery_time}</b></span>
                      )}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white dark:bg-slate-900/60 flex items-center justify-center rounded-2xl">
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
            <h2 className="text-xl font-bold mb-4">{tr("Savatingiz")} ({cart.length})</h2>
            {cart.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
                <p className="text-4xl mb-2">🛒</p>
                <p>{tr("Savat bo'sh")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cart_id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm flex gap-3 relative">
                    <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm leading-tight">{item.title}</p>
                      {item.selectedSize && <p className="text-xs text-black dark:text-white opacity-90 mt-1">O'lcham: {item.selectedSize}</p>}
                      <p className="font-bold text-purple-600 mt-1">{formatPrice(item.finalPrice)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cart_id)} className="absolute top-2 right-2 p-2 text-slate-500 dark:text-slate-400 hover:text-red-500">
                      ✕
                    </button>
                  </div>
                ))}
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm mt-4 border-t-2 border-purple-50">
                  <div className="flex justify-between font-bold text-lg mb-4">
                    <span>{tr("Jami:")}</span>
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
          <div className="p-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm text-center relative">
              <label className="w-24 h-24 mx-auto mb-3 block relative cursor-pointer">
                {profileAvatar ? (
                   <img src={profileAvatar} className="w-full h-full rounded-full object-cover shadow-md border-2 border-purple-100" />
                ) : (
                   <div className="w-full h-full bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                     {profileName.charAt(0)}
                   </div>
                )}
                <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-lg border border-slate-200 dark:border-slate-800 text-sm">
                  📷
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>

              {isEditingProfile ? (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} className="border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-center outline-none focus:border-purple-500" />
                  <button onClick={handleProfileSave} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Saqlash</button>
                </div>
              ) : (
                <div className="mt-2">
                  <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    {profileName} 
                    <button onClick={() => setIsEditingProfile(true)} className="text-slate-500 dark:text-slate-400 hover:text-purple-600 text-lg">✏️</button>
                  </h2>
                  <p className="text-black dark:text-white opacity-90 text-sm">{tgUser ? '@'+(tgUser.username || '') : ''}</p>
                </div>
              )}
            </div>

            {isAdmin ? (
              <div className="space-y-2">
                <button onClick={loadAllOrders} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> Barcha Mijozlar Buyurtmalari</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={loadAllReviews} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> Mijozlar Sharhlari (Javob berish)</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={loadAllMessages} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin.html#products'} className="w-full bg-purple-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:scale-95 border border-transparent mt-4">
                  <span className="font-bold text-lg flex items-center gap-2">👨‍💻 Tovar va Do'kon Boshqaruvi</span>
                  <span>➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700 mt-4">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setProfileView('orders'); loadMyOrders();
        fetchProducts(false); }} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> {tr("Buyurtmalarim")}</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('reviews'); loadMyReviews(); }} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> {tr("Sharhlar")}</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('support'); loadMyMessages(); }} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> {tr("Murojaatlarim")}</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-gray-700">
                  <span className="font-semibold text-black dark:text-white font-semibold dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> {tr("Sozlamalar")}</span>
                  <span className="text-slate-500 dark:text-slate-400">➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        
          {activeTab === 'profile' && profileView === 'all_orders' && (
            <div className="p-4 pb-20 bg-white dark:bg-slate-900 min-h-screen">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">📦 Barcha Buyurtmalar</h2>
              <div className="space-y-6">
                {allOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-black p-5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-black dark:text-white mb-2">👤 Mijoz ma'lumotlari</h3>
                      <p className="text-sm text-black dark:text-white">Ism: <b>{order.users?.full_name || order.users?.first_name || 'Noma\'lum'}</b> {order.users?.username ? `(@${order.users.username})` : ''}</p>
                      <p className="text-sm text-black dark:text-white mt-1">Tel: <b>{order.users?.phone_number || '-'}</b></p>
                    </div>

                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-black dark:text-white mb-2">🛍 Tovar ma'lumotlari</h3>
                      <div className="flex gap-4">
                        {order.products?.image_url && <img src={order.products.image_url} className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />}
                        <div className="flex-1">
                          <p className="font-bold text-black dark:text-white text-md line-clamp-2">{order.products?.title}</p>
                          <p className="text-sm text-black dark:text-white mt-1">O'lcham (Size): <b>{order.size || '-'}</b></p>
                          <p className="text-sm text-black dark:text-white mt-1">Rang: <b>{order.color || '-'}</b></p>
                          <p className="text-sm text-black dark:text-white mt-1">Soni: <b>{order.quantity || 1} ta</b></p>
                          <p className="font-extrabold text-purple-600 mt-2 text-lg">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-black dark:text-white mb-2">🕒 Vaqt va To'lov</h3>
                      <p className="text-sm text-black dark:text-white mb-2">Sana: <b>{new Date(order.created_at).toLocaleString('ru-RU')}</b></p>
                      {order.receipt_image_url ? (
                        <div className="mt-2">
                          <p className="text-sm font-bold text-black dark:text-white mb-1">50% To'lov cheki:</p>
                          <a href={order.receipt_image_url} target="_blank">
                            <img src={order.receipt_image_url} className="w-32 h-auto rounded-lg border border-slate-300 dark:border-slate-700 hover:opacity-80 transition" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-red-500 font-bold mt-2">To'lov cheki yo'q!</p>
                      )}
                      {order.latitude && order.longitude && (
                        <a href={`https://yandex.com/maps/?pt=${order.longitude},${order.latitude}&z=18&l=map`} target="_blank" className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-3 inline-block underline">📍 Mijoz lokatsiyasini xaritada ochish</a>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-black dark:text-white mb-3">⚙️ Boshqaruv (Status)</h3>
                      <select 
                        value={order.status || 'Tekshirilmoqda'} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value, order.users?.telegram_id)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white font-bold rounded-xl p-3 outline-none mb-3"
                      >
                        <option value="Tekshirilmoqda">Tekshirilmoqda</option>
                        <option value="Qabul qilindi">1. Qabul qilindi</option>
                        <option value="Xitoy omborida">2. Xitoy omborida</option>
                        <option value="Yo'lda">3. Yo'lda</option>
                        <option value="Toshkentda">4. Toshkentda</option>
                        <option value="Yetkazib berildi">Yetkazib berildi</option>
                        <option value="Bekor qilindi">Bekor qilindi</option>
                      </select>
                      
                      <div className="flex gap-2">
                        <button onClick={() => updateOrderStatus(order.id, 'Qabul qilindi', order.users?.telegram_id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition active:scale-95 shadow-sm">
                          ✅ Tasdiqlash
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'Bekor qilindi', order.users?.telegram_id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition active:scale-95 shadow-sm">
                          ❌ Bekor qilish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && profileView === 'all_reviews' && (
              <div className="p-4 pb-20 bg-white dark:bg-slate-900 min-h-screen">
                <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                  <span>←</span> Orqaga
                </button>
                <h2 className="text-xl font-bold mb-4 text-black dark:text-white">💬 Mijozlar Sharhlari</h2>
                <div className="space-y-4">
                  {allReviews.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      
                      <div className="flex justify-between mb-2">
                        <p className="font-bold text-black dark:text-white text-lg">{r.users?.first_name || r.user_name || 'Mijoz'}</p>
                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating || r.likes || 5)}</span>
                      </div>
                      
                      {r.products && (
                        <div className="flex items-center gap-2 mb-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                          <img src={r.products.image_url} className="w-8 h-8 object-cover rounded" />
                          <span className="text-xs font-bold text-black dark:text-white">{r.products.title}</span>
                        </div>
                      )}

                      <p className="text-sm text-black dark:text-white bg-slate-100 dark:bg-slate-900 p-3 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">{r.text}</p>
                      
                      {r.admin_reply && (
                        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Sizning javobingiz:</p>
                          <p className="text-sm text-black dark:text-white">{r.admin_reply}</p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          placeholder={r.admin_reply ? "Javobni o'zgartirish..." : "Javob yozish..."}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm rounded-lg p-2 text-black dark:text-white outline-none focus:border-purple-500"
                          value={replyTexts[r.id] || ''}
                          onChange={(e) => setReplyTexts({...replyTexts, [r.id]: e.target.value})}
                        />
                        <button onClick={() => submitReply(r.id, r.user_id)} className="bg-purple-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-purple-700 transition">
                          Yuborish
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

          {activeTab === 'profile' && profileView === 'all_messages' && (
            <div className="p-4 pb-20">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-xl font-bold mb-4 dark:text-white">🎧 Mijozlar Murojaatlari</h2>
              <div className="space-y-4">
                {allMessages.map(m => (
                  <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-black dark:text-white text-lg mb-1">{m.users?.first_name || m.user_name || 'Mijoz'}</p>
                    <p className="text-sm text-black dark:text-white bg-slate-100 dark:bg-slate-900 p-3 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">{m.text}</p>
                    
                    {m.admin_reply && (
                      <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Sizning javobingiz:</p>
                        <p className="text-sm text-black dark:text-white">{m.admin_reply}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder={m.admin_reply ? "Javobni o'zgartirish..." : "Javob yozish..."}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm rounded-lg p-2 text-black dark:text-white outline-none focus:border-purple-500"
                        value={replyTexts[m.id] || ''}
                        onChange={(e) => setReplyTexts({...replyTexts, [m.id]: e.target.value})}
                      />
                      <button onClick={() => submitReply(m.id, m.user_id)} className="bg-purple-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-purple-700 transition">
                        Yuborish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && profileView === 'settings' && (
          <div className="p-4 pb-10">
            <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
              <span>‹</span> Orqaga
            </button>
            <h2 className="text-xl font-bold mb-4">⚙️ {tr("Sozlamalar")}</h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-black dark:text-white mb-3">🌐 {tr("Tilni o'zgartirish")}</h3>
              <div className="flex gap-2">
                <button onClick={() => changeLang('uz')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'uz' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold'}`}>🇺🇿 O'zbekcha</button>
   <button onClick={() => changeLang('ru')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'ru' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold'}`}>🇷🇺 Русский</button>
   <button onClick={() => changeLang('en')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold'}`}>🇬🇧 English</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-black dark:text-white mb-3">🎨 {tr("Mavzuni o'zgartirish")}</h3>
              <div className="flex gap-2">
                <button onClick={() => changeTheme('light')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold'}`}>☀️ {tr("Yorug'")}</button>
   <button onClick={() => changeTheme('dark')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold'}`}>🌙 {tr("Qorong'i")}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && profileView === 'support' && (
          <div className="p-4">
            <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
              <span>‹</span> Orqaga
            </button>
            <h2 className="text-xl font-bold mb-4">🎧 Sotuvchiga Murojaat</h2>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-black dark:text-white mb-4">Savollaringiz yoki takliflaringizni yozib qoldiring. Biz imkon qadar tezroq javob beramiz.</p>
              <textarea value={supportText} onChange={e => setSupportText(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 h-32 mb-3"
                placeholder="Xabaringizni yozing..."
              ></textarea>
              <button onClick={submitSupport} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
                Jo'natish
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && profileView === 'orders' && (
            <div className="p-4 pb-20 bg-white dark:bg-slate-900 min-h-screen">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">📦 Mening Buyurtmalarim</h2>
              
              {myOrders.length === 0 ? (
                <p className="text-black dark:text-white opacity-90 text-center mt-10">Sizda hali buyurtmalar yo'q.</p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                      
                      <div className="flex gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                        {order.products?.image_url && <img src={order.products.image_url} className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />}
                        <div className="flex-1">
                          <p className="font-bold text-black dark:text-white text-md line-clamp-2">{order.products?.title}</p>
                          <p className="text-sm text-black dark:text-white mt-1">O'lcham: <b>{order.size || '-'}</b></p>
                          <p className="text-sm text-black dark:text-white mt-1">Rang: <b>{order.color || '-'}</b></p>
                          <p className="font-extrabold text-purple-600 mt-2 text-lg">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Sana:</span>
                          <span className="text-sm text-black dark:text-white font-bold">{new Date(order.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Holati:</span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${order.status === 'Qabul qilindi' || order.status === '1. Qabul qilindi' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'}`}>
                              {order.status === 'Tekshirilmoqda' ? '1. To\'lov tekshirilmoqda' : order.status}
                            </span>
                        </div>
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
              <p className="text-black dark:text-white opacity-90 text-center mt-10">Sizda hali sharhlar yo'q.</p>
            ) : (
              <div className="space-y-3">
                {myReviews.map(review => (
                  <div key={review.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={review.products?.image_url} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-bold leading-tight">{review.products?.title}</p>
                        <span className="text-yellow-500 text-xs">{'⭐'.repeat(review.rating || 5)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-black dark:text-white font-semibold bg-white dark:bg-slate-900 p-2 rounded-lg">{review.text}</p>
                    {review.admin_reply && (
                      <div className="mt-2 ml-4 p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <p className="text-xs font-bold text-purple-600">Admin javobi:</p>
                        <p className="text-sm text-black dark:text-white font-semibold">{review.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="absolute bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-purple-600' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold">{tr("Asosiy")}</span>
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'cart' ? 'text-purple-600' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="text-2xl">🛒</span>
          {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
          <span className="text-[10px] font-bold">{tr("Savat")}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-purple-600' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold">{tr("Profil")}</span>
        </button>
      </div>

      {/* CHECKOUT MODALS */}
      {checkoutStep === 1 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative">
            <button onClick={() => setCheckoutStep(0)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-black dark:text-white">✕</button>
            <h2 className="text-2xl font-bold mb-4">Rasmiylashtirish (1/2)</h2>
            <p className="text-black dark:text-white opacity-90 text-sm mb-4">Ma'lumotlaringizni kiriting:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-black dark:text-white mb-1 block">Ism-familiya *</label>
                <input type="text" value={checkoutName} onChange={e=>setCheckoutName(e.target.value)} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 border border-slate-300 dark:border-slate-700 dark:border-gray-600 p-3 rounded-xl outline-none focus:border-purple-500 text-black dark:text-white font-bold dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Ali Valiyev" />
              </div>
              <div>
                <label className="text-xs font-bold text-black dark:text-white mb-1 block">Asosiy nomer *</label>
                <input type="tel" value={checkoutPhone1} onChange={e=>setCheckoutPhone1(e.target.value)} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 border border-slate-300 dark:border-slate-700 dark:border-gray-600 p-3 rounded-xl outline-none focus:border-purple-500 text-black dark:text-white font-bold dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="+998 90 123 45 67" />
              </div>
              <div>
                <label className="text-xs font-bold text-black dark:text-white mb-1 block">Qo'shimcha nomer *</label>
                <input type="tel" value={checkoutPhone2} onChange={e=>setCheckoutPhone2(e.target.value)} className="w-full bg-white dark:bg-slate-900 dark:bg-gray-800 border border-slate-300 dark:border-slate-700 dark:border-gray-600 p-3 rounded-xl outline-none focus:border-purple-500 text-black dark:text-white font-bold dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="+998 90 765 43 21" />
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative">
            <button onClick={() => setCheckoutStep(0)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-black dark:text-white">✕</button>
            <h2 className="text-2xl font-bold mb-2">{tr("To'lov (2/2)")}</h2>
            <p className="text-red-500 font-bold text-sm mb-4">50% to'lov qilganingizdan keyin rasmiylashtiriladi.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-black dark:text-white opacity-90 mb-1">Karta raqami (Kopiya qilish uchun bosing):</p>
              <div 
                onClick={() => { navigator.clipboard.writeText('4916990320547877'); alert("Kopiya qilindi!"); }}
                className="font-mono text-lg font-bold text-purple-700 cursor-pointer bg-purple-50 p-2 rounded-lg text-center active:scale-95 transition flex justify-center items-center gap-2"
              >
                4916 9903 2054 7877 <span className="text-xl">📋</span>
              </div>
              <p className="text-center font-bold text-sm mt-2">Mamadolimov Jo'rabek</p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-black dark:text-white font-semibold block mb-2">To'lov chekini yuklang (Skrinshot):</label>
              <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none" />
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setCheckoutStep(1)} className="flex-1 bg-gray-200 text-black dark:text-white font-semibold font-bold py-4 rounded-2xl active:scale-95 transition-transform">
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
          <div className="bg-white dark:bg-slate-900 w-full h-[90%] rounded-t-3xl flex flex-col relative animate-slide-up overflow-hidden">
            
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
                      <span className="text-slate-500 dark:text-slate-400 line-through decoration-red-400/70 italic font-medium text-sm">{formatPrice(selectedProduct.original_price)}</span>
                    </>
                  )}
                </div>
                
                <h2 className="text-3xl font-extrabold text-black dark:text-white font-bold mb-2">
                  {appliedPromo ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-purple-600">{formatPrice(selectedProduct.price_usd - (selectedProduct.price_usd * appliedPromo / 100))}</span>
                    </div>
                  ) : (
                    formatPrice(selectedProduct.price_usd)
                  )}
                </h2>
                <h3 className="text-lg text-black dark:text-white font-semibold leading-snug">{selectedProduct.title}</h3>
                
                <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">Qoldiq: <strong className="text-black dark:text-white">{selectedProduct.stock_count} ta</strong></span>
                  <span className="text-sm text-black dark:text-white">{tr("Yetkazib berish sanasi:")} <strong className="text-black dark:text-white">{selectedProduct.delivery_time}</strong></span>
                </div>

                {selectedProduct.sizes && selectedProduct.sizes.trim() !== '' && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-3 text-black dark:text-white">{tr("O'lchamni tanlang:")}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProduct.sizes.split(',').map(size => size.trim()).map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${selectedSize === size ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-slate-200 dark:border-slate-800 text-black dark:text-white hover:border-slate-300 dark:border-slate-700'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-bold mb-3 text-black dark:text-white">{tr("Promokod")}</h4>
                  <div className="flex gap-2">
                    <input type="text" value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError(false); }}
                      placeholder="Kodni kiriting" 
                      className={`flex-1 border-2 ${promoError ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-600' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'} rounded-xl px-4 py-2 outline-none uppercase transition-colors`} />
                    <button onClick={applyPromo} className="bg-black text-white px-5 py-2 rounded-xl font-bold active:scale-95 transition-transform">
                      Qo'llash
                    </button>
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="font-bold text-xl mb-4">Sharhlar ({reviews.length})</h4>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-4">
                    <p className="text-sm font-bold mb-2">Baholang:</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRatingInput(star)} className="text-3xl focus:outline-none">
                          {star <= ratingInput ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea ref={reviewInputRef} value={reviewInput} onChange={e => setReviewInput(e.target.value)}
                      placeholder="Mahsulot haqida fikringiz..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 h-24 mb-2"></textarea>
                    <button onClick={submitReview} className="w-full bg-purple-100 text-purple-700 font-bold py-2 rounded-xl">{tr("Jo'natish")}</button>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center text-black dark:text-white opacity-90 py-6">
                      <p className="text-3xl mb-2">💬</p>
                      <p>Hozircha sharhlar yo'q.</p>
                      <button onClick={() => reviewInputRef.current?.focus()} className="mt-3 text-purple-600 font-bold">Sharh yozish</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">{r.user_name}</span>
                            <span className="text-yellow-500 text-xs">{'⭐'.repeat(r.rating || 5)}</span>
                          </div>
                          <p className="text-black dark:text-white text-sm">{r.text}</p>
                          {r.admin_reply && (
                            <div className="mt-2 ml-4 p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                              <p className="text-xs font-bold text-purple-600">Admin javobi:</p>
                              <p className="text-sm text-black dark:text-white font-semibold">{r.admin_reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button onClick={addToCart} className="w-full bg-purple-600 text-white text-lg font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-purple-200">
                Savatga qo'shish
              </button>
            </div>
            
          </div>
        </div>
      )}
      
      <style jsx global>{`
      [data-theme='dark'].omni-app {
        background-color: #0f172a !important;
        color: #f8fafc !important;
      }
      [data-theme='dark'] .bg-white dark:bg-slate-900,
      [data-theme='dark'] .bg-white dark:bg-slate-900,
      [data-theme='dark'] .bg-gray-100 {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        color: #f8fafc !important;
      }
      [data-theme='dark'] .text-black dark:text-white font-bold,
      [data-theme='dark'] .text-black dark:text-white,
      [data-theme='dark'] .text-black dark:text-white font-semibold,
      [data-theme='dark'] .text-black dark:text-white,
      [data-theme='dark'] .text-black dark:text-white opacity-90 {
        color: #cbd5e1 !important;
      }
      [data-theme='dark'] .text-black dark:text-white {
        color: #ffffff !important;
      }
      [data-theme='dark'] input,
      [data-theme='dark'] textarea {
        background-color: #0f172a !important;
        color: #ffffff !important;
        border-color: #475569 !important;
      }
      [data-theme='dark'] button.bg-white dark:bg-slate-900 {
        background-color: #1e293b !important;
      }
      [data-theme='dark'] .border-slate-200 dark:border-slate-800,
      [data-theme='dark'] .border-slate-200 dark:border-slate-800 {
        border-color: #334155 !important;
      }
      [data-theme='dark'] .bg-purple-50 {
        background-color: #1e1b4b !important;
      }
      [data-theme='dark'] .text-purple-600 {
        color: #a78bfa !important;
      }
      [data-theme='dark'] .bg-purple-600 {
        background-color: #8b5cf6 !important;
      }
      [data-theme='dark'] .bg-green-50 {
        background-color: #064e3b !important;
      }
      [data-theme='dark'] .text-green-600 {
        color: #34d399 !important;
      }

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
