const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. REWRITE ADMIN ORDERS UI exactly
const startToken = "{activeTab === 'profile' && profileView === 'all_orders' && (";
const endToken = "{activeTab === 'profile' && profileView === 'all_reviews' && (";

const startIndex = code.indexOf(startToken);
const endIndex = code.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
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
                          ✅ Tasdiqlash
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
          )}

          `;
  
  code = code.substring(0, startIndex) + newOrdersUI + code.substring(endIndex);
  console.log("Successfully replaced Admin Orders UI");
} else {
  console.log("Failed to find boundaries");
}

fs.writeFileSync('src/app/page.js', code);
