const fs = require('fs');

// --- Fix frontend/src/app/page.js ---
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Text changes
pageContent = pageContent.replace(/\"Sharhlarim\": \{ ru: \"Мои отзывы\", en: \"My Reviews\", uz: \"Sharhlarim\" \}/g, '"Sharhlar": { ru: "Отзывы", en: "Reviews", uz: "Sharhlar" }');
pageContent = pageContent.replace(/>💬 \{tr\("Sharhlarim"\)\}</g, '>💬 {tr("Sharhlar")}<');

pageContent = pageContent.replace(/\"Sotuvchiga murojaat\": \{ ru: \"Связаться с продавцом\", en: \"Contact Seller\", uz: \"Sotuvchiga murojaat\" \}/g, '"Murojaatlarim": { ru: "Мои обращения", en: "My Requests", uz: "Murojaatlarim" }');
pageContent = pageContent.replace(/>🎧 \{tr\("Sotuvchiga murojaat"\)\}</g, '>🎧 {tr("Murojaatlarim")}<');

// 2. Review rating -> likes
pageContent = pageContent.replace(/rating: ratingInput/g, 'likes: ratingInput');

// 3. Checkout DB insert fix
const oldCheckoutStr = /await supabase\.from\('orders'\)\.insert\(\[\{\s*user_id: tgUser\?\.id\?\.toString\(\) \|\| 'anonymous',\s*user_name: checkoutName,\s*phone: combinedPhone,\s*product_details: cart,\s*total_price: totalPrice,\s*status: 'Kutilmoqda'\s*\}\]\);/m;

const newCheckoutStr = `// Upsert user to get UUID
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
          receipt_image_url: receiptUrl
        }));
        const { error: oErr } = await supabase.from('orders').insert(ordersToInsert);
        if (oErr) console.error("Order Insert Error:", oErr);
      }`;

pageContent = pageContent.replace(oldCheckoutStr, newCheckoutStr);
fs.writeFileSync('src/app/page.js', pageContent);

// --- Fix frontend/src/app/admin/page.js ---
let adminContent = fs.readFileSync('src/app/admin/page.js', 'utf8');

// 1. Fetch query
adminContent = adminContent.replace(
  /const \{ data \} = await supabase.from\('orders'\).select\('\*'\).order\('created_at', \{ ascending: false \}\);/g,
  "const { data } = await supabase.from('orders').select('*, users(full_name, phone_number), products(title)').order('created_at', { ascending: false });"
);

// 2. Render orders - Just using string replace on smaller identifiable chunks
adminContent = adminContent.replace(
  /👤 \{order\.user_name\}/g,
  "👤 {order.users?.full_name || 'Noma\\'lum'}"
);
adminContent = adminContent.replace(
  /📞 \{order\.phone\}/g,
  "📞 {order.users?.phone_number || 'Noma\\'lum'}"
);
adminContent = adminContent.replace(
  /\{order\.total_price\.toLocaleString\('ru-RU'\)\}/g,
  "{Number(order.total_price_uzs).toLocaleString('ru-RU')}"
);
adminContent = adminContent.replace(
  /order\.status === 'Kutilmoqda'/g,
  "order.status === 'Tekshirilmoqda'"
);

// Replace the <select> options
const oldSelectOptions = /<option value="Kutilmoqda">⏳ Kutilmoqda<\/option>\s*<option value="Yetkazilmoqda">🚚 Yetkazilmoqda<\/option>\s*<option value="Yakunlandi">✅ Yakunlandi<\/option>/m;
const newSelectOptions = `<option value="Tekshirilmoqda">⏳ Tekshirilmoqda</option>
                      <option value="Qabul qilindi">📦 Qabul qilindi</option>
                      <option value="Xitoy omborida">🇨🇳 Xitoy omborida</option>
                      <option value="Yo'lda">🚚 Yo'lda</option>
                      <option value="Toshkentda">🇺🇿 Toshkentda</option>
                      <option value="Bekor qilindi">❌ Bekor qilindi</option>`;
adminContent = adminContent.replace(oldSelectOptions, newSelectOptions);

// Replace the mapping of product_details
const oldProductMap = /\{order\.product_details\.map\(\(item, idx\) => \([\s\S]*?\}\)\}/m;
const newProductMap = `<div className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-white font-medium">{order.products?.title || 'Mahsulot'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">O'lcham: {order.size}</p>
                      </div>
                      <p className="text-purple-400 font-bold">{Number(order.total_price_uzs).toLocaleString('ru-RU')} so'm</p>
                    </div>
                {order.receipt_image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Chek rasmi:</p>
                    <img src={order.receipt_image_url} alt="Receipt" className="w-full h-auto rounded-lg" />
                  </div>
                )}`;
adminContent = adminContent.replace(oldProductMap, newProductMap);

fs.writeFileSync('src/app/admin/page.js', adminContent);

console.log("Files updated successfully!");
