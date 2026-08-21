const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// 1. FIX THEME FOR SETTINGS BUTTONS
code = code.replace(/bg-gray-100 text-slate-900 dark:text-white opacity-90/g, 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold');
code = code.replace(/text-slate-900 dark:text-white/g, 'text-black dark:text-white');
// Ensure bg-slate-50 is completely white in light mode
code = code.replace(/bg-slate-50/g, 'bg-white'); 
// But keep dark mode bg-slate-900 (which is #0F172A)
code = code.replace(/bg-white dark:bg-slate-900/g, 'bg-white dark:bg-slate-900'); 
// Any remaining bg-white that needs dark should be bg-white dark:bg-slate-900
code = code.replace(/\bbg-white(?!\s+dark:)/g, 'bg-white dark:bg-slate-900');


// 2. FIX loadMyOrders TO USE UUID
const oldLoadMyOrders = code.match(/const loadMyOrders = async \(\) => \{[\s\S]*?\} catch\(e\)\{\}\s*\};/);
if (oldLoadMyOrders) {
  const newLoadMyOrders = `const loadMyOrders = async () => {
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
  };`;
  code = code.replace(oldLoadMyOrders[0], newLoadMyOrders);
}

// 3. FIX handleFinalCheckout TO INCLUDE setCart([]) AND CALL loadMyOrders PROPERLY
const oldHandleCheckout = code.match(/const handleFinalCheckout = async \(\) => \{[\s\S]*?\} catch \(e\) \{/);
if (oldHandleCheckout) {
  let checkoutCode = oldHandleCheckout[0];
  checkoutCode = checkoutCode.replace(/setCheckoutStep\(0\);\s*setReceiptFile\(null\);\s*setCheckoutSuccess\(true\);/, `setCart([]);
      setCheckoutStep(0);
      setReceiptFile(null);
      setCheckoutSuccess(true);
      // Immediately load orders so UI updates
      loadMyOrders();`);
  code = code.replace(oldHandleCheckout[0], checkoutCode);
}

// 4. FIX CUSTOMER ORDERS UI (Mening Buyurtmalarim)
const oldMyOrdersUIStart = "{activeTab === 'profile' && profileView === 'orders' && (";
const oldMyOrdersUIEndToken = "{activeTab === 'profile' && profileView === 'reviews' && (";
const startIdx = code.indexOf(oldMyOrdersUIStart);
const endIdx = code.indexOf(oldMyOrdersUIEndToken);

if (startIdx !== -1 && endIdx !== -1) {
  const newMyOrdersUI = `{activeTab === 'profile' && profileView === 'orders' && (
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
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            {order.status === 'Tekshirilmoqda' ? '1. To\\'lov tekshirilmoqda / Qabul qilindi' : order.status}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          `;
  code = code.substring(0, startIdx) + newMyOrdersUI + code.substring(endIdx);
}

// 5. ENSURE ROOT HAS PURE WHITE IN LIGHT MODE
// We've already replaced bg-slate-50 with bg-white dark:bg-slate-900.
// Just ensuring the wrapper uses those explicit styles.

fs.writeFileSync('src/app/page.js', code);
console.log('Fixes complete');
