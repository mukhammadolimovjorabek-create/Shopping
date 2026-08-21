const fs = require('fs');
let content = fs.readFileSync('src/app/page.js', 'utf8');

// Find the start of the buttons block
const regex = /<div className="space-y-2">[\s\S]*?<button onClick={\(\) => setProfileView\('settings'\)}[\s\S]*?<\/button>\s*<\/div>/;

const newButtons = `{isAdmin ? (
              <div className="space-y-2">
                <button onClick={() => window.location.href = '/admin#orders'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> Barcha Mijozlar Buyurtmalari</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#reviews'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> Mijozlar Sharhlari (Javob berish)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#messages'} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin#products'} className="w-full bg-purple-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:scale-95 border border-transparent mt-4">
                  <span className="font-bold text-lg flex items-center gap-2">👨‍💻 Tovar va Do'kon Boshqaruvi</span>
                  <span>➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700 mt-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> Sozlamalar</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setProfileView('orders'); loadMyOrders(); }} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">📦</span> {tr("Buyurtmalarim")}</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('reviews'); loadMyReviews(); }} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">💬</span> {tr("Sharhlar")}</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => { setProfileView('support'); loadMyMessages(); }} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> {tr("Murojaatlarim")}</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => setProfileView('settings')} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">⚙️</span> {tr("Sozlamalar")}</span>
                  <span className="text-gray-400">➔</span>
                </button>
              </div>
            )}`;

if (regex.test(content)) {
  content = content.replace(regex, newButtons);
  fs.writeFileSync('src/app/page.js', content);
  console.log("SUCCESS: Replaced profile buttons!");
} else {
  console.log("FAILED to find profile buttons with regex");
}
