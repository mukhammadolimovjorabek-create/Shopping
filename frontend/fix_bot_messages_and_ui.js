const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Add telegram_id to loadAllOrders
pageCode = pageCode.replace(
  /select\('id, first_name, username, phone_number, full_name'\)/,
  "select('id, first_name, username, phone_number, full_name, telegram_id')"
);

// 2. Update updateOrderStatus function
const updateStatusRegex = /const updateOrderStatus = async \(orderId, newStatus\) => \{[\s\S]*?loadAllOrders\(\);\s*\};/;
const newUpdateStatus = `const updateOrderStatus = async (orderId, newStatus, customerTelegramId) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    
    // Yuborish (Notification to customer)
    if (customerTelegramId && (newStatus === 'Qabul qilindi' || newStatus === 'Bekor qilindi')) {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      let msg = newStatus === 'Qabul qilindi' ? "✅ Sizning buyurtmangiz tasdiqlandi va qabul qilindi!" : "❌ Kechirasiz, buyurtmangiz bekor qilindi.";
      fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: customerTelegramId, text: msg })
      }).catch(e => console.log(e));
    }
    
    loadAllOrders();
  };`;
pageCode = pageCode.replace(updateStatusRegex, newUpdateStatus);

// 3. Update the buttons calling updateOrderStatus
pageCode = pageCode.replace(
  /updateOrderStatus\(order\.id, e\.target\.value\)/g,
  "updateOrderStatus(order.id, e.target.value, order.users?.telegram_id)"
);
pageCode = pageCode.replace(
  /updateOrderStatus\(order\.id, 'Qabul qilindi'\)/g,
  "updateOrderStatus(order.id, 'Qabul qilindi', order.users?.telegram_id)"
);
pageCode = pageCode.replace(
  /updateOrderStatus\(order\.id, 'Bekor qilindi'\)/g,
  "updateOrderStatus(order.id, 'Bekor qilindi', order.users?.telegram_id)"
);


// 4. Admin All Messages display
// Find where all_messages maps
const messagesRegex = /\{allMessages\.map\(m => \([\s\S]*?\}\)\}/;
if (pageCode.match(messagesRegex)) {
  const newMessagesCode = `{allMessages.map(m => (
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
                ))}`;
  pageCode = pageCode.replace(messagesRegex, newMessagesCode);
}

// 5. Update settings card background (Theme fix in React)
pageCode = pageCode.replace(/bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm mb-4 border border-slate-200 dark:border-slate-800/g, "bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4 border border-slate-200 dark:border-slate-700");


fs.writeFileSync('src/app/page.js', pageCode);

// Now update admin/page.js
let adminCode = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Add originalStock state
adminCode = adminCode.replace(
  /const \[stockCount, setStockCount\] = useState\('10'\);/,
  "const [stockCount, setStockCount] = useState('10');\n  const [originalStock, setOriginalStock] = useState('10');"
);

adminCode = adminCode.replace(
  /setStockCount\(product\.stock_count\?\.toString\(\) \|\| ''\);/,
  "setStockCount(product.stock_count?.toString() || '');\n      setOriginalStock(product.original_stock?.toString() || '');"
);

// Add to productObj
adminCode = adminCode.replace(
  /stock_count: parseInt\(stockCount\),/,
  "stock_count: parseInt(stockCount),\n      original_stock: parseInt(originalStock) || parseInt(stockCount),"
);

// Add input field in JSX
const stockInputRegex = /<label className="block text-sm text-gray-400 mb-1">Qoldiq soni<\/label>[\s\S]*?<\/div>/;
if (adminCode.match(stockInputRegex)) {
  const newInputs = `<label className="block text-sm text-gray-400 mb-1">Qoldiq soni (Sotuvdagi)</label>
                <input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} 
                  className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Qolgan" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Umumiy tovarlar soni (Boshlang'ich)</label>
                <input type="number" value={originalStock} onChange={e => setOriginalStock(e.target.value)} 
                  className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Umumiy keltirilgan" />
              </div>`;
  adminCode = adminCode.replace(stockInputRegex, newInputs);
}

fs.writeFileSync('src/app/admin/page.js', adminCode);

console.log("Done");
