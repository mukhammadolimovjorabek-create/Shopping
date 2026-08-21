const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. UPDATE loadAllOrders TO FETCH MORE FIELDS
code = code.replace(
  /select\('\*, products\(title, image_url\), users\(first_name, username\)'\)/g,
  "select('*, products(title, image_url), users(first_name, username, phone_number, full_name)')"
);

// 2. UPDATE handleFinalCheckout message and format
// We can use a regex replacement to grab the old message template block and replace it.
code = code.replace(
  /const message = `🛍.*?`;/s,
  `const message = \`🚨 <b>Yangi Buyurtma!</b>\\n👤 Mijoz: \${checkoutName} \${tgUser?.username ? '(@' + tgUser.username + ')' : ''}\\n📞 Tel: \${combinedPhone}\\n🛍 Tovar: \\n\${orderDetailsStr}\\n💰 50% To'lov: \${formatPrice(totalPrice)}\\n🖼 Chek rasmi biriktirilgan\\n\\n[ ⚙️ Admin Paneldan ko'rish ]\`;`
);

// 3. REWRITE THE ADMIN ORDERS UI
const oldOrdersUIStart = "{activeTab === 'profile' && profileView === 'all_orders' && (";
const oldOrdersUIEndMatch = code.match(/\{activeTab === 'profile' && profileView === 'all_orders' && \([\s\S]*?\}\)\}\s*<\/div>\s*<\/div>\s*\)\}/);

if (oldOrdersUIEndMatch) {
  const newOrdersUI = `{activeTab === 'profile' && profileView === 'all_orders' && (
            <div className="p-4 pb-20 bg-slate-50 dark:bg-slate-900 min-h-screen">
              <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                <span>←</span> Orqaga
              </button>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">📦 Barcha Buyurtmalar</h2>
              <div className="space-y-6">
                {allOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-black p-5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">👤 Mijoz ma'lumotlari</h3>
                      <p className="text-sm text-slate-900 dark:text-white">Ism: <b>{order.users?.full_name || order.users?.first_name || 'Noma\\'lum'}</b> {order.users?.username ? \`(@\${order.users.username})\` : ''}</p>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">Tel: <b>{order.users?.phone_number || '-'}</b></p>
                    </div>

                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">🛍 Tovar ma'lumotlari</h3>
                      <div className="flex gap-4">
                        {order.products?.image_url && <img src={order.products.image_url} className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />}
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white text-md line-clamp-2">{order.products?.title}</p>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">O'lcham (Size): <b>{order.size || '-'}</b></p>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">Rang: <b>{order.color || '-'}</b></p>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">Soni: <b>{order.quantity || 1} ta</b></p>
                          <p className="font-extrabold text-purple-600 mt-2 text-lg">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">🕒 Vaqt va To'lov</h3>
                      <p className="text-sm text-slate-900 dark:text-white mb-2">Sana: <b>{new Date(order.created_at).toLocaleString('ru-RU')}</b></p>
                      {order.receipt_image_url ? (
                        <div className="mt-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">50% To'lov cheki:</p>
                          <a href={order.receipt_image_url} target="_blank">
                            <img src={order.receipt_image_url} className="w-32 h-auto rounded-lg border border-slate-300 dark:border-slate-700 hover:opacity-80 transition" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-red-500 font-bold mt-2">To'lov cheki yo'q!</p>
                      )}
                      {order.latitude && order.longitude && (
                        <a href={\`https://yandex.com/maps/?pt=\${order.longitude},\${order.latitude}&z=18&l=map\`} target="_blank" className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-3 inline-block underline">📍 Mijoz lokatsiyasini xaritada ochish</a>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">⚙️ Boshqaruv (Status)</h3>
                      <select 
                        value={order.status || 'Tekshirilmoqda'} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl p-3 outline-none mb-3"
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
                        <button onClick={() => updateOrderStatus(order.id, 'Qabul qilindi')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition active:scale-95 shadow-sm">
                          ✅ 50% To'lovni tasdiqlash
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'Bekor qilindi')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition active:scale-95 shadow-sm">
                          ❌ Bekor qilish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}`;
  code = code.replace(oldOrdersUIEndMatch[0], newOrdersUI);
} else {
  console.log("oldOrdersUIEndMatch NOT FOUND");
}

// 4. FIX THEMES (Globally replacing text-gray-xxx and bg-gray-xxx appropriately)
code = code.replace(/text-gray-500/g, 'text-slate-900 dark:text-white opacity-90');
code = code.replace(/text-gray-600/g, 'text-slate-900 dark:text-white');
code = code.replace(/text-gray-700/g, 'text-slate-900 dark:text-white font-semibold');
code = code.replace(/text-gray-900/g, 'text-slate-900 dark:text-white font-bold');
code = code.replace(/text-gray-800/g, 'text-slate-900 dark:text-white');
code = code.replace(/text-black/g, 'text-slate-900 dark:text-white');
code = code.replace(/text-gray-400/g, 'text-slate-500 dark:text-slate-400');

code = code.replace(/className="bg-white px-4 py-3 flex justify-between/g, 'className="bg-white dark:bg-slate-900 px-4 py-3 flex justify-between');
code = code.replace(/bg-gray-50/g, 'bg-slate-50 dark:bg-slate-900');
code = code.replace(/bg-white/g, 'bg-white dark:bg-slate-900');

// Fix explicit hardcoded headers
code = code.replace(/theme === 'dark' \? 'dark bg-black' : 'bg-white'/g, "theme === 'dark' ? 'dark bg-slate-900' : 'bg-white'");
code = code.replace(/theme === 'dark' \? 'dark bg-black text-white' : 'bg-white text-gray-900'/g, "theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-white text-slate-900'");

fs.writeFileSync('src/app/page.js', code);
console.log('Script completed');
