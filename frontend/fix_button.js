const fs = require('fs');
let c = fs.readFileSync('src/app/page.js', 'utf8');

const target = `<button onClick={loadAllMessages} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>`;

const replacement = `<button onClick={loadAllMessages} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 border border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><span className="text-xl">🎧</span> Mijozlar Murojaatlari (Javob)</span>
                  <span className="text-gray-400">➔</span>
                </button>
                <button onClick={() => window.location.href = '/admin.html#products'} className="w-full bg-purple-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:scale-95 border border-transparent mt-4">
                  <span className="font-bold text-lg flex items-center gap-2">👨‍💻 Tovar va Do'kon Boshqaruvi</span>
                  <span>➔</span>
                </button>`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/page.js', c);
console.log('Restored products button');
