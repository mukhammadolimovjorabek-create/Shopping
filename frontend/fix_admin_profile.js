const fs = require('fs');

// --- 1. Fix src/app/page.js (Main Profile Buttons) ---
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

const oldProfileButtons = `<div className="space-y-2">
                <button onClick={() => { setProfileView('orders'); loadMyOrders(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">📦</span> Buyurtmalarim</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('reviews'); loadMyReviews(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">💬</span> Sharhlar</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('support'); loadMyMessages(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">🎧</span> Murojaatlarim</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>`;

// We'll replace it with a conditional rendering based on isAdmin.
const newProfileButtons = `{isAdmin ? (
              <div className="space-y-2">
                <button onClick={() => window.location.href = '/admin#orders'} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">📦</span> Barcha Mijozlar Buyurtmalari</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#reviews'} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">💬</span> Mijozlar Sharhlari (Javob berish)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#messages'} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#products'} className="w-full bg-purple-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:scale-95 border border-transparent mt-4">
                  <span className="font-bold text-lg flex items-center gap-2">👨‍💻 Tovar va Do'kon Boshqaruvi</span>
                  <span>➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 mt-4">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setProfileView('orders'); loadMyOrders(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">📦</span> Buyurtmalarim</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('reviews'); loadMyReviews(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">💬</span> Sharhlar</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('support'); loadMyMessages(); }} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">🎧</span> Murojaatlarim</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            )}`;

pageContent = pageContent.replace(oldProfileButtons, newProfileButtons);
fs.writeFileSync('src/app/page.js', pageContent);

// --- 2. Fix src/app/admin/page.js (Admin Tabs & Hash reading) ---
let adminContent = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Add hash reading
const oldUseEffectAdmin = `useEffect(() => {
    fetchData();
  }, []);`;

const newUseEffectAdmin = `useEffect(() => {
    fetchData();
    const hash = window.location.hash.replace('#', '');
    if (['products', 'orders', 'reviews', 'messages'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);`;
adminContent = adminContent.replace(oldUseEffectAdmin, newUseEffectAdmin);

// Fix Admin Tabs UI
const oldAdminTabs = `<div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('products')} className={\`flex-1 py-3 rounded-xl font-bold transition \${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            🛍️ Mahsulotlar
          </button>
          <button onClick={() => setActiveTab('orders')} className={\`flex-1 py-3 rounded-xl font-bold transition \${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            📦 Buyurtmalar
          </button>
        </div>`;

const newAdminTabs = `<div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTab('products')} className={\`flex-1 min-w-[140px] py-3 rounded-xl font-bold transition \${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            🛍️ Mahsulotlar
          </button>
          <button onClick={() => setActiveTab('orders')} className={\`flex-1 min-w-[140px] py-3 rounded-xl font-bold transition \${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            📦 Buyurtmalar
          </button>
          <button onClick={() => setActiveTab('reviews')} className={\`flex-1 min-w-[140px] py-3 rounded-xl font-bold transition \${activeTab === 'reviews' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            💬 Sharhlar
          </button>
          <button onClick={() => setActiveTab('messages')} className={\`flex-1 min-w-[140px] py-3 rounded-xl font-bold transition \${activeTab === 'messages' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}\`}>
            🎧 Murojaatlar
          </button>
        </div>`;

adminContent = adminContent.replace(oldAdminTabs, newAdminTabs);

// Make sure users name is correctly resolved in reviews/messages
adminContent = adminContent.replace(/\{r\.user_name\}/g, "{r.user_name || r.users?.full_name || 'Noma\\'lum'}");
adminContent = adminContent.replace(/\{m\.user_name\}/g, "{m.user_name || m.users?.full_name || 'Noma\\'lum'}");

fs.writeFileSync('src/app/admin/page.js', adminContent);

console.log("Admin profile flow fixed!");
