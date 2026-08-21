const fs = require('fs');
let adminContent = fs.readFileSync('src/app/admin/page.js', 'utf8');

adminContent = adminContent.replace(
  /const \{ data \} = await supabase.from\('orders'\).select\('\*'\).order\('created_at', \{ ascending: false \}\);/g,
  "const { data } = await supabase.from('orders').select('*, users(full_name, phone_number), products(title)').order('created_at', { ascending: false });"
);

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

const oldSelectOptions = `<option value="Kutilmoqda">⏳ Kutilmoqda</option>
                      <option value="Yetkazilmoqda">🚚 Yetkazilmoqda</option>
                      <option value="Yakunlandi">✅ Yakunlandi</option>`;
const newSelectOptions = `<option value="Tekshirilmoqda">⏳ Tekshirilmoqda</option>
                      <option value="Qabul qilindi">📦 Qabul qilindi</option>
                      <option value="Xitoy omborida">🇨🇳 Xitoy omborida</option>
                      <option value="Yo'lda">🚚 Yo'lda</option>
                      <option value="Toshkentda">🇺🇿 Toshkentda</option>
                      <option value="Bekor qilindi">❌ Bekor qilindi</option>`;
adminContent = adminContent.replace(oldSelectOptions, newSelectOptions);

const oldProductMap = `{order.product_details.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">O'lcham: {item.selectedSize || 'yoq'}</p>
                      </div>
                      <p className="text-purple-400 font-bold">{item.finalPrice.toLocaleString('ru-RU')} so'm</p>
                    </div>
                  ))}`;

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
console.log('Fixed admin/page.js correctly!');
