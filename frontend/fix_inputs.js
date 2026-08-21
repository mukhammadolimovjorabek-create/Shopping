const fs = require('fs');

let c = fs.readFileSync('src/app/page.js', 'utf8');

c = c.replace(/className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-500"/g,
'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-xl outline-none focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

c = c.replace(/className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-purple-500"/g,
'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

c = c.replace(/className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-purple-500"/g,
'className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

// And promo input
c = c.replace(/className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm uppercase"/g,
'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm uppercase text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

fs.writeFileSync('src/app/page.js', c);
console.log('Fixed inputs');
