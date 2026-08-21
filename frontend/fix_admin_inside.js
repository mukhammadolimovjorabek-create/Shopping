const fs = require('fs');

let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Add new state variables for Admin
const stateInsertion = `const [supportText, setSupportText] = useState('');`;
const adminStates = `
  const [supportText, setSupportText] = useState('');
  
  // ADMIN STATES
  const [allOrders, setAllOrders] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  const loadAllOrders = async () => {
    setProfileView('all_orders');
    const { data } = await supabase.from('orders').select('*, products(title, image_url), users(first_name, username)').order('created_at', { ascending: false });
    if(data) setAllOrders(data);
  };

  const loadAllReviews = async () => {
    setProfileView('all_reviews');
    const { data } = await supabase.from('reviews').select('*, users(first_name, username)').not('product_id', 'is', null).order('created_at', { ascending: false });
    if(data) setAllReviews(data);
  };

  const loadAllMessages = async () => {
    setProfileView('all_messages');
    const { data } = await supabase.from('reviews').select('*, users(first_name, username)').is('product_id', null).order('created_at', { ascending: false });
    if(data) setAllMessages(data);
  };

  const submitReply = async (userId, reviewId, text) => {
    if(!text) return;
    try {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: userId, text: "👨‍💻 Admindan javob:\\n\\n" + text })
      });
      alert("Javob yuborildi!");
      setReplyTexts({...replyTexts, [reviewId]: ''});
    } catch(e) {
      alert("Xatolik: " + e.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    loadAllOrders();
  };
`;
code = code.replace(stateInsertion, adminStates);

// 2. Fix Admin Buttons (change window.location.href to setProfileView)
const oldAdminButtons = `{isAdmin ? (
              <div className="space-y-2">
                <button onClick={() => window.location.href = '/admin.html#orders'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> Barcha Mijozlar Buyurtmalari</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin.html#reviews'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> Mijozlar Sharhlari (Javob berish)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin.html#messages'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin.html#products'} className="w-full bg-purple-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:scale-95 border border-transparent mt-4">
                  <span className="font-bold text-lg flex items-center gap-2">👨‍💻 Tovar va Do'kon Boshqaruvi</span>
                  <span>➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700 mt-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            ) : (`;

const newAdminButtons = `{isAdmin ? (
              <div className="space-y-2">
                <button onClick={loadAllOrders} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> Barcha Mijozlar Buyurtmalari</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={loadAllReviews} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> Mijozlar Sharhlari (Javob berish)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={loadAllMessages} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700 mt-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            ) : (`;

code = code.replace(oldAdminButtons, newAdminButtons);

// 3. Add Admin Views Rendering
const settingsViewStart = `{activeTab === 'profile' && profileView === 'settings' && (`;

const adminViews = `
          {activeTab === 'profile' && profileView === 'all_orders' && (
            <div className="p-4 pb-20">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-xl font-bold mb-4 dark:text-white">📦 Barcha Buyurtmalar</h2>
              <div className="space-y-4">
                {allOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-2">Mijoz: <b>{order.users?.first_name || 'Noma\\'lum'}</b> (@{order.users?.username || ''})</p>
                    <div className="flex gap-3 mb-3 border-b pb-3 dark:border-gray-700">
                      {order.products?.image_url && <img src={order.products.image_url} className="w-16 h-16 object-cover rounded-lg" />}
                      <div>
                        <p className="font-bold dark:text-white text-sm line-clamp-2">{order.products?.title}</p>
                        <p className="text-xs text-gray-500">O'lcham: {order.size || '-'}</p>
                        <p className="font-bold text-purple-600">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                      </div>
                    </div>
                    {order.latitude && order.longitude && (
                      <a href={\`https://yandex.com/maps/?pt=\${order.longitude},\${order.latitude}&z=18&l=map\`} target="_blank" className="text-blue-500 text-sm mb-3 block underline">📍 Lokatsiyani xaritada ochish</a>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <select 
                        value={order.status || 'Tekshirilmoqda'} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
                      >
                        <option value="Tekshirilmoqda">Tekshirilmoqda</option>
                        <option value="Qabul qilindi">Qabul qilindi</option>
                        <option value="Xitoy omborida">Xitoy omborida</option>
                        <option value="Yo'lda">Yo'lda</option>
                        <option value="Toshkentda">Toshkentda</option>
                        <option value="Yetkazib berildi">Yetkazib berildi</option>
                        <option value="Bekor qilindi">Bekor qilindi</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && profileView === 'all_reviews' && (
            <div className="p-4 pb-20">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-xl font-bold mb-4 dark:text-white">💬 Mijozlar Sharhlari</h2>
              <div className="space-y-4">
                {allReviews.map(r => (
                  <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="font-bold dark:text-white">{r.users?.first_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.content}</p>
                    <div className="mt-3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Javob yozish..." 
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2 dark:text-white"
                        value={replyTexts[r.id] || ''}
                        onChange={(e) => setReplyTexts({...replyTexts, [r.id]: e.target.value})}
                      />
                      <button onClick={() => submitReply(r.user_id, r.id, replyTexts[r.id])} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold">Yuborish</button>
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
                  <div key={m.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="font-bold dark:text-white">{m.users?.first_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{m.content}</p>
                    <div className="mt-3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Javob yozish..." 
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2 dark:text-white"
                        value={replyTexts[m.id] || ''}
                        onChange={(e) => setReplyTexts({...replyTexts, [m.id]: e.target.value})}
                      />
                      <button onClick={() => submitReply(m.user_id, m.id, replyTexts[m.id])} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold">Yuborish</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
`;
code = code.replace(settingsViewStart, adminViews + '\n          ' + settingsViewStart);


// 4. Background Fix
// Change `<div data-theme={theme} className="omni-app flex flex-col h-screen text-gray-900 dark:text-gray-100 font-sans overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0a] transition-colors">`
// To explicit dark mode injection class
const oldBgStr = `className="omni-app flex flex-col h-screen text-gray-900 dark:text-gray-100 font-sans overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0a] transition-colors"`;
const newBgStr = `className={\`omni-app flex flex-col h-screen text-gray-900 dark:text-gray-100 font-sans overflow-hidden relative \${theme === 'dark' ? 'dark bg-black' : 'bg-white'} transition-colors\`}`;
code = code.replace(oldBgStr, newBgStr);

const oldBgStr2 = `className="omni-app flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 items-center justify-center p-6 text-center animate-fade-in"`;
const newBgStr2 = `className={\`omni-app flex flex-col h-screen items-center justify-center p-6 text-center animate-fade-in \${theme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-gray-900'}\`}`;
code = code.replace(oldBgStr2, newBgStr2);

fs.writeFileSync('src/app/page.js', code);
console.log("SUCCESS!");
