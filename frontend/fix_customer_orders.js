const fs = require('fs');

// --- 1. Fix Admin Links ---
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');
pageContent = pageContent.split("window.location.href = '/admin#").join("window.location.href = '/admin.html#");
pageContent = pageContent.split("window.location.href = '/admin'").join("window.location.href = '/admin.html'");

// Fix supabase select for customer orders
pageContent = pageContent.replace(/await supabase\.from\('orders'\)\.select\('\*'\)/g, "await supabase.from('orders').select('*, products(title, image_url)')");

// --- 2. Add Telegram Notification on Checkout ---
const oldCheckoutEnd = `setCart([]);
        setCheckoutStep(0);
        setReceiptFile(null);
        alert(tr("Buyurtmangiz qabul qilindi!"));`;

const newCheckoutEnd = `
        // Notify Admins via Telegram directly
        try {
          const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
          const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || "5466728043").split(',');
          
          let msgText = \`📦 <b>Yangi Buyurtma!</b>\\n\\n\`;
          msgText += \`👤 Mijoz: \${checkoutName}\\n\`;
          msgText += \`📞 Tel 1: \${checkoutPhone1}\\n\`;
          if (checkoutPhone2) msgText += \`📞 Tel 2: \${checkoutPhone2}\\n\`;
          if (location) msgText += \`📍 Lokatsiya: <a href="https://yandex.com/maps/?pt=\${location.lng},\${location.lat}&z=18&l=map">Xaritada ko'rish</a>\\n\`;
          
          msgText += \`\\n🛒 <b>Mahsulotlar:</b>\\n\`;
          cart.forEach(item => {
            msgText += \`➖ \${item.title} (O'lcham: \${item.selectedSize || '-'}) - \${Number(item.finalPrice).toLocaleString('ru-RU')} so'm\\n\`;
          });
          msgText += \`\\n💰 <b>Jami:</b> \${Number(totalPrice).toLocaleString('ru-RU')} so'm\`;

          for (const adminId of ADMIN_IDS) {
            if (!adminId.trim()) continue;
            if (receiptUrl) {
              await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendPhoto\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: adminId.trim(), photo: receiptUrl, caption: msgText, parse_mode: 'HTML' })
              });
            } else {
              await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: adminId.trim(), text: msgText, parse_mode: 'HTML', disable_web_page_preview: true })
              });
            }
          }
        } catch(e) { console.error("Telegram xabarnoma xatosi:", e); }

        setCart([]);
        setCheckoutStep(0);
        setReceiptFile(null);
        alert(tr("Buyurtmangiz qabul qilindi!"));`;

pageContent = pageContent.replace(oldCheckoutEnd, newCheckoutEnd);

// --- 3. Improve Customer Orders View (Buyurtmalarim) ---
// Find how myOrders is currently rendered.
const oldCustomerOrderRender = `{myOrders.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Sizda hali buyurtmalar yo'q.</p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                        <span className={\`text-xs font-bold px-2 py-1 rounded-lg \${order.status === 'Yetkazilmoqda' ? 'bg-blue-100 text-blue-600' : order.status === 'Yakunlandi' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}\`}>
                          {order.status || 'Kutilmoqda'}
                        </span>
                      </div>
                      
                      {order.product_details && order.product_details.map((item, i) => (
                        <div key={i} className="flex gap-3 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
                          <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">O'lcham: {item.selectedSize || 'yoq'}</p>
                            <p className="text-purple-600 font-bold mt-1">{item.finalPrice.toLocaleString('ru-RU')} so'm</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}`;

const newCustomerOrderRender = `{myOrders.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Sizda hali buyurtmalar yo'q.</p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">🕒 {new Date(order.created_at).toLocaleDateString('ru-RU')} {new Date(order.created_at).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className={\`text-xs font-bold px-2 py-1 rounded-lg \${order.status === 'Qabul qilindi' ? 'bg-blue-100 text-blue-600' : order.status === 'Xitoy omborida' ? 'bg-purple-100 text-purple-600' : order.status === 'Yo\\'lda' ? 'bg-orange-100 text-orange-600' : order.status === 'Toshkentda' ? 'bg-green-100 text-green-600' : order.status === 'Bekor qilindi' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}\`}>
                          {order.status || 'Tekshirilmoqda'}
                        </span>
                      </div>
                      
                      <div className="flex gap-3 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
                        {order.products?.image_url && <img src={order.products.image_url} alt="Product" className="w-16 h-16 object-cover rounded-xl" />}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{order.products?.title || 'Mahsulot'}</h4>
                          <p className="text-xs text-gray-500 mt-1">O'lcham: {order.size || '-'}</p>
                          <p className="text-purple-600 font-bold mt-1">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                        </div>
                      </div>
                      
                      {order.latitude && order.longitude && (
                         <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                           📍 Yetkazib berish manzili belgilangan
                         </div>
                      )}
                      
                    </div>
                  ))}
                </div>
              )}`;

pageContent = pageContent.replace(oldCustomerOrderRender, newCustomerOrderRender);
fs.writeFileSync('src/app/page.js', pageContent);
console.log("SUCCESS applying fixes!");
